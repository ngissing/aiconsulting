import { Request, Response } from 'express';
import openAIService from '../services/openAIService';

class PolicyController {
  public async generatePolicy(req: Request, res: Response): Promise<void> {
    try {
      const quizResponses = req.body.quizResponses;

      if (!quizResponses || typeof quizResponses !== 'object' || Object.keys(quizResponses).length === 0) {
        res.status(400).json({ error: 'Invalid or empty quizResponses provided.' });
        return;
      }

      const generatedContent = await openAIService.generatePolicyContent(quizResponses);

      if (generatedContent && generatedContent.startsWith('Error:')) {
        // Distinguish service-level errors (like API key missing) from OpenAI API call errors
        if (generatedContent.includes('OpenAI API key not configured')) {
            res.status(500).json({ error: 'Policy generation service not configured.', details: generatedContent });
        } else {
            res.status(500).json({ error: 'Failed to generate policy content from OpenAI.', details: generatedContent });
        }
        return;
      }
      
      if (!generatedContent) {
        res.status(500).json({ error: 'Failed to generate policy content, no content returned.' });
        return;
      }

      res.status(200).json({ policyContent: generatedContent });
    } catch (error: any) {
      console.error('Error in PolicyController.generatePolicy:', error.message);
      res.status(500).json({ error: 'Internal server error while generating policy.', details: error.message });
    }
  }
}

export default new PolicyController();