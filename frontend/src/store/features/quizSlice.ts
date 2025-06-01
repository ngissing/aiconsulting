import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { QuizState, Question, QuizResponse } from '../../types/quiz.types';
import { determineNextQuestionIndex, determinePreviousQuestionIndex } from '../../lib/quizNavigation';
// Define a type for the quiz responses payload to the API
type QuizResponsesPayload = Record<number, QuizResponse>;

const initialState: QuizState = {
  sessionId: '',
  quizId: '',
  title: '',
  currentQuestionIndex: 0,
  questions: [],
  responses: {},
  activeQuestionPath: [],
  progress: 0,
  isComplete: false,
  startTime: undefined,
  endTime: undefined,
  validationErrors: {},
  metadata: {},
  generatedPolicyContent: null,
  isGeneratingPolicy: false,
  policyGenerationError: null,
};

// Helper function to calculate progress
const calculateProgress = (currentQuestionIndex: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  // Progress based on the number of questions *visited* or *answered*
  // For simplicity, let's base it on the index of the current question.
  // Add 1 because index is 0-based.
  return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
};

// Async thunk for generating policy
export const generatePolicyForQuiz = createAsyncThunk(
  'quiz/generatePolicy',
  async (quizResponses: QuizResponsesPayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/policy/generate', { // Assuming backend runs on the same host or proxy is set up
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizResponses }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || `Failed to generate policy: ${response.statusText}`);
      }
      const data = await response.json();
      return data.policyContent;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An unknown error occurred while generating policy.');
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    startQuiz: (
      state,
      action: PayloadAction<{ quizId: string; questions: Question[]; title?: string; sessionId?: string }>
    ) => {
      state.quizId = action.payload.quizId;
      state.questions = action.payload.questions;
      state.title = action.payload.title || '';
      state.sessionId = action.payload.sessionId || crypto.randomUUID();
      state.currentQuestionIndex = 0;
      state.responses = {};
      state.activeQuestionPath = state.questions.length > 0 ? [state.questions[0].id] : [];
      state.progress = calculateProgress(0, state.questions.length);
      state.isComplete = false;
      state.startTime = Date.now();
      state.endTime = undefined;
      state.validationErrors = {};
    },
    answerQuestion: (
      state,
      action: PayloadAction<{ questionId: number; response: QuizResponse }>
    ) => {
      state.responses[action.payload.questionId] = action.payload.response;
      // Potentially clear validation errors for this question
      if (state.validationErrors[action.payload.questionId]) {
        delete state.validationErrors[action.payload.questionId];
      }
    },
    // Navigation logic will be more complex and might need to be handled by a thunk
    // or have more sophisticated logic here to evaluate conditionalLogic
    navigateToNextQuestion: (state) => {
      const nextIndex = determineNextQuestionIndex(state.currentQuestionIndex, state.questions, state.responses);
      if (nextIndex === -1) {
        state.isComplete = true;
        state.endTime = Date.now();
        state.progress = 100;
      } else if (nextIndex >= 0 && nextIndex < state.questions.length) {
        state.currentQuestionIndex = nextIndex;
        state.progress = calculateProgress(nextIndex, state.questions.length);
        const nextQuestionId = state.questions[nextIndex].id;
        // Ensure activeQuestionPath reflects the actual path taken, including skips
        // This logic might need refinement based on how conditional skips affect the path.
        // For now, if we jump, we clear the path beyond the current point and add the new one.
        const lastVisitedId = state.activeQuestionPath[state.activeQuestionPath.length -1];
        const lastVisitedIndex = state.questions.findIndex(q => q.id === lastVisitedId);

        if (lastVisitedIndex !== undefined && nextIndex > lastVisitedIndex) {
            // Standard forward movement or a forward skip
            if (!state.activeQuestionPath.includes(nextQuestionId)) {
                 state.activeQuestionPath.push(nextQuestionId);
            }
        } else {
            // This case implies a skip to a question that might be "before" the end of a previously longer path
            // or a complex jump. We might need to truncate and rebuild path.
            // For simplicity, if we skip to a question already in path, truncate to it.
            // Otherwise, treat as a new branch.
            const existingPathIndex = state.activeQuestionPath.indexOf(nextQuestionId);
            if (existingPathIndex !== -1) {
                state.activeQuestionPath = state.activeQuestionPath.slice(0, existingPathIndex + 1);
            } else {
                // This is a jump to a question not previously in this direct path segment.
                // We might need a more sophisticated way to handle path reconstruction for complex jumps.
                // For now, we'll just add it. This could be an issue if jumping "backwards" into an unvisited branch.
                state.activeQuestionPath.push(nextQuestionId);
            }
        }

      }
    },
    navigateToPreviousQuestion: (state) => {
      const prevIndex = determinePreviousQuestionIndex(state.currentQuestionIndex, state.activeQuestionPath, state.questions);
      if (prevIndex !== -1) {
        state.currentQuestionIndex = prevIndex;
        state.progress = calculateProgress(prevIndex, state.questions.length);
        // activeQuestionPath is managed by determinePreviousQuestionIndex implicitly by going back in the recorded path
        // However, the current `determinePreviousQuestionIndex` uses `activeQuestionPath` to find the ID,
        // then finds the index in `questions`. The path itself should be truncated if we go back.
        const currentQuestionIdInPath = state.questions[prevIndex].id;
        const indexOfCurrentInPath = state.activeQuestionPath.lastIndexOf(currentQuestionIdInPath);
        if (indexOfCurrentInPath !== -1) {
            state.activeQuestionPath = state.activeQuestionPath.slice(0, indexOfCurrentInPath + 1);
        }

      }
    },
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => { // Kept for direct setting if needed
      if (action.payload >= 0 && action.payload < state.questions.length) {
        state.currentQuestionIndex = action.payload;
        state.progress = calculateProgress(action.payload, state.questions.length);
        const currentQuestionId = state.questions[action.payload].id;
        if (!state.activeQuestionPath.includes(currentQuestionId)) {
           state.activeQuestionPath.push(currentQuestionId);
        } else {
            // If navigating to a question already in path, truncate path up to that question
            const existingPathIndex = state.activeQuestionPath.indexOf(currentQuestionId);
            if (existingPathIndex !== -1) {
                state.activeQuestionPath = state.activeQuestionPath.slice(0, existingPathIndex + 1);
            }
        }
      }
    },
    setQuizComplete: (state) => {
      state.isComplete = true;
      state.endTime = Date.now();
      state.progress = 100;
    },
    loadQuizFromStorage: (state, action: PayloadAction<QuizState | undefined>) => {
      if (action.payload) {
        return { ...state, ...action.payload };
      }
    },
    updateValidationError: (
      state,
      action: PayloadAction<{ questionId: number; errors: string[] }>
    ) => {
      state.validationErrors[action.payload.questionId] = action.payload.errors;
    },
    clearValidationErrors: (state, action: PayloadAction<{ questionId: number }>) => {
      if (state.validationErrors[action.payload.questionId]) {
        delete state.validationErrors[action.payload.questionId];
      }
    },
    resetQuiz: () => {
      return initialState;
    },
    updateActiveQuestionPath: (state, action: PayloadAction<number[]>) => {
        state.activeQuestionPath = action.payload;
    },
    setGeneratedPolicyContent: (state, action: PayloadAction<string | null>) => {
      state.generatedPolicyContent = action.payload;
      state.policyGenerationError = null; // Clear error on new content
    },
    setPolicyGenerationError: (state, action: PayloadAction<string | null>) => {
      state.policyGenerationError = action.payload;
    },
    setPolicyGenerationStatus: (state, action: PayloadAction<boolean>) => {
      state.isGeneratingPolicy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePolicyForQuiz.pending, (state) => {
        state.isGeneratingPolicy = true;
        state.policyGenerationError = null;
      })
      .addCase(generatePolicyForQuiz.fulfilled, (state, action: PayloadAction<string>) => {
        state.isGeneratingPolicy = false;
        state.generatedPolicyContent = action.payload;
      })
      .addCase(generatePolicyForQuiz.rejected, (state, action) => {
        state.isGeneratingPolicy = false;
        state.policyGenerationError = action.payload as string || 'Failed to generate policy.';
      });
  },
});

export const {
  startQuiz,
  answerQuestion,
  navigateToNextQuestion,
  navigateToPreviousQuestion,
  setCurrentQuestionIndex,
  setQuizComplete,
  loadQuizFromStorage,
  updateValidationError,
  clearValidationErrors,
  resetQuiz,
  updateActiveQuestionPath,
  setGeneratedPolicyContent,
  setPolicyGenerationError,
  setPolicyGenerationStatus,
} = quizSlice.actions;

export default quizSlice.reducer;