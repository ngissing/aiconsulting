import OpenAI from 'openai';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import crypto from 'crypto'; // For hashing cache key if needed, starting simple

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis successfully.'));

interface QuizResponses {
  [key: string]: any;
}

const CACHE_EXPIRATION_SECONDS = 3600; // 1 hour
const MIN_VALID_CONTENT_LENGTH = 50; // Minimum characters for content to be considered valid
const MAX_USER_INFO_LENGTH = 2000; // Max characters for the user info part of the prompt

// Common short error phrases to check against in validation
const COMMON_ERROR_SUBSTRINGS = [
  "i cannot fulfill this request",
  "i am unable to proceed",
  "request could not be completed",
  "an error occurred",
  "unable to generate",
  "content policy violation", // Example, if OpenAI API might return this
];

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set. OpenAI Service will not function.');
    }
    redisClient.ping().catch(err => console.error("Failed to ping Redis on startup:", err));
  }

  private generateCacheKey(quizResponses: QuizResponses): string {
    const sortedKeys = Object.keys(quizResponses).sort();
    const deterministicObject: Record<string, any> = {};
    for (const key of sortedKeys) {
      deterministicObject[key] = quizResponses[key];
    }
    const stringified = JSON.stringify(deterministicObject);
    return `policy_gen_cache:${stringified}`;
  }

  private constructPrompt(quizResponses: QuizResponses): string {
    const questionIdToLabel: Record<string, string> = {
      '1': 'User Full Name',
      '2': 'User Favorite Color',
      '3': 'Example Quiz Rating (1-5)',
    };
    let userInfo = "Key user-provided information:\n";
    let hasUserInfo = false;
    for (const key in quizResponses) {
      const label = questionIdToLabel[key] || `Response to Question ${key}`;
      let responseValue = quizResponses[key];
      if (typeof responseValue === 'object' && responseValue !== null) {
        if ('text' in responseValue) responseValue = responseValue.text;
        else if ('value' in responseValue) responseValue = responseValue.value;
        else responseValue = JSON.stringify(responseValue);
      } else if (responseValue === undefined || responseValue === null || responseValue === '') {
        responseValue = '(Not answered)';
      }
      userInfo += `- ${label}: ${responseValue}\n`;
      hasUserInfo = true;
    }
    if (!hasUserInfo) userInfo = "No specific user information provided.\n";

    if (userInfo.length > MAX_USER_INFO_LENGTH) {
      userInfo = userInfo.substring(0, MAX_USER_INFO_LENGTH - 3) + "...";
      console.warn(`User info part of the prompt was truncated. Original length: ${userInfo.length + 3 - MAX_USER_INFO_LENGTH}`);
    }

    const policyType = "a general company policy document";
    let prompt = `Please generate ${policyType}. The document should be professional, clear, and comprehensive.\n\n`;
    prompt += userInfo;
    prompt += "\nConsider standard sections such as Introduction, Scope, Definitions, Responsibilities, and specific clauses relevant to the user-provided information.\n";
    prompt += "The tone should be formal and authoritative.\n";
    prompt += "Ensure the output is well-formatted Markdown.\n";
    return prompt;
  }

  private getFallbackContent(quizResponses: QuizResponses, errorDetails?: string): string {
    const knownCompanyNameKeys = ['companyName', 'organizationName', '1'];
    let companyIdentifier = 'your company';
    for (const key of knownCompanyNameKeys) {
        if (quizResponses[key]) {
            let val = quizResponses[key];
            if (typeof val === 'object' && val !== null && 'text' in val) companyIdentifier = val.text;
            else if (typeof val === 'object' && val !== null && 'value' in val) companyIdentifier = String(val.value);
            else if (typeof val === 'string' && val.trim() !== '') companyIdentifier = val;
            break; 
        }
    }
    let fallback = `# Policy Document (Fallback)\n\n`;
    fallback += `We encountered an issue generating a customized policy for ${companyIdentifier} at this time. `;
    if (errorDetails) fallback += `(Details: ${errorDetails})\n\n`;
    else fallback += `\n\n`;
    fallback += `Please find below a generic template. We recommend reviewing this carefully and consulting with a legal professional if necessary.\n\n`;
    fallback += `## 1. Introduction\n\nThis document outlines the general policies and procedures for ${companyIdentifier}.\n\n`;
    fallback += `## 2. Scope\n\nThese policies apply to all employees, contractors, and stakeholders of ${companyIdentifier}.\n\n`;
    fallback += `*(Further generic sections would follow here.)*\n\n`;
    fallback += `**Disclaimer**: This is a fallback template. For a policy tailored to your needs, please try again later or contact support.`;
    return fallback;
  }

  private isValidContent(content: string | null | undefined): content is string {
    if (typeof content !== 'string' || content.trim().length < MIN_VALID_CONTENT_LENGTH) {
      return false;
    }
    // Check for common short error phrases
    const lowerCaseContent = content.toLowerCase();
    for (const errorPhrase of COMMON_ERROR_SUBSTRINGS) {
      if (lowerCaseContent.includes(errorPhrase)) {
        console.warn(`Content validation failed due to presence of error phrase: "${errorPhrase}"`);
        return false;
      }
    }
    return true;
  }

  public async generatePolicyContent(quizResponses: QuizResponses): Promise<string | null> {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured.');
      return this.getFallbackContent(quizResponses, 'OpenAI API service not configured.');
    }

    const cacheKey = this.generateCacheKey(quizResponses);

    try {
      if (redisClient.status === 'ready') {
        const cachedContent = await redisClient.get(cacheKey);
        if (cachedContent) {
          console.log('Serving from cache:', cacheKey);
          if (this.isValidContent(cachedContent)) return cachedContent;
          console.warn('Cached content failed validation, attempting regeneration:', cacheKey);
        }
      } else {
        console.warn('Redis not ready, skipping cache check.');
      }
    } catch (cacheError: any) {
      console.error('Redis GET error:', cacheError.message);
    }

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] OpenAI API Call Triggered. Cache Key (for context): ${cacheKey}.`);
    const promptToOpenAI = this.constructPrompt(quizResponses);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates policy document sections.' },
          { role: 'user', content: promptToOpenAI },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const generatedContent = completion.choices[0]?.message?.content;

      if (this.isValidContent(generatedContent)) {
        if (redisClient.status === 'ready') {
          try {
            await redisClient.set(cacheKey, generatedContent, 'EX', CACHE_EXPIRATION_SECONDS);
            console.log('Content cached:', cacheKey);
          } catch (cacheSetError: any) {
            console.error('Redis SET error:', cacheSetError.message);
          }
        }
        return generatedContent;
      } else {
        let contentLengthToLog: string | number = 'N/A';
        if (typeof generatedContent === 'string') {
          const strContent = generatedContent as string; 
          contentLengthToLog = strContent.length;
        }
        console.warn('OpenAI API returned invalid or too short content. Length:', contentLengthToLog, 'Prompt:', promptToOpenAI);
        return this.getFallbackContent(quizResponses, 'AI failed to generate valid content.');
      }
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error.message);
      if (error.response) {
        console.error('OpenAI API Error Response Data:', error.response.data);
        console.error('OpenAI API Error Response Status:', error.response.status);
      }
      return this.getFallbackContent(quizResponses, error.message || 'OpenAI API request failed.');
    }
  }
}

export default new OpenAIService();