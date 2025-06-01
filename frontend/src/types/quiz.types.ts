export type QuestionType =
  | 'multiple-choice'
  | 'checkbox'
  | 'text'
  | 'textarea'
  | 'file'
  | 'rating'
  | 'date'
  | 'number';

export interface Option {
  id: string | number;
  text: string;
  value: string | number;
  imageUrl?: string; // Optional image for an option
}

export interface ValidationRule {
  type:
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'pattern' // Regex pattern
    | 'min' // For number/rating/date
    | 'max' // For number/rating/date
    | 'fileType' // e.g., 'image/jpeg', 'application/pdf'
    | 'maxFileSize'; // In bytes
  value?: string | number | RegExp;
  message: string; // Custom error message
}

export interface Condition {
  questionId: number; // ID of the question this condition depends on
  operator:
    | 'equals'
    | 'notEquals'
    | 'contains' // For text or array of selections
    | 'greaterThan'
    | 'lessThan'
    | 'answered' // Checks if the question was answered
    | 'notAnswered'; // Checks if the question was not answered
  value?: any; // The value to compare against the answer of questionId
}

export interface ConditionalLogic {
  action: 'show' | 'hide' | 'skipTo'; // Action to take if conditions are met
  targetQuestionId?: number; // Target question to show/hide or skip to
  conditions: Condition[]; // All conditions must be met (AND logic)
  // Could add 'conditionOperator: 'AND' | 'OR'' for more complex scenarios
}

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  description?: string; // Optional additional description or instructions
  options?: Option[]; // For 'multiple-choice', 'checkbox'
  placeholder?: string; // For 'text', 'textarea', 'number'
  min?: number; // For 'rating', 'number'
  max?: number; // For 'rating', 'number'
  step?: number; // For 'rating', 'number'
  validationRules?: ValidationRule[];
  conditionalLogic?: ConditionalLogic[]; // A question might have multiple conditional rules
  dependencies?: number[]; // IDs of questions that must be answered before this one is active
  imageUrl?: string; // Optional image for the question itself
}

export type QuizResponse = any; // Can be string, number, string[], File, Date etc.

export interface QuizState {
  sessionId: string;
  quizId: string; // Identifier for the specific quiz being taken
  title?: string; // Title of the quiz
  currentQuestionIndex: number;
  questions: Question[];
  responses: Record<number, QuizResponse>; // Keyed by question ID
  activeQuestionPath: number[]; // Sequence of question IDs presented to the user
  progress: number; // Percentage, 0-100
  isComplete: boolean;
  startTime?: number; // Timestamp
  endTime?: number; // Timestamp
  validationErrors: Record<number, string[]>; // Keyed by question ID
  metadata?: Record<string, any>; // For any other quiz-specific metadata

  // Fields for policy generation
  generatedPolicyContent: string | null;
  isGeneratingPolicy: boolean;
  policyGenerationError: string | null;
}

// Example of a more specific response type if needed, can be expanded
export type AnswerPayload =
  | { type: 'multiple-choice'; value: string | number }
  | { type: 'checkbox'; value: (string | number)[] }
  | { type: 'text'; value: string }
  | { type: 'textarea'; value: string }
  | { type: 'file'; value: File | null }
  | { type: 'rating'; value: number }
  | { type: 'date'; value: string | Date | null } // ISO string or Date object
  | { type: 'number'; value: number | null };