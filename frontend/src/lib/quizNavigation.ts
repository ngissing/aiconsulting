import { QuizState, Question, Condition, ConditionalLogic, QuizResponse } from '../types/quiz.types';

/**
 * Evaluates a single condition against the current quiz responses.
 */
export const evaluateCondition = (condition: Condition, responses: Record<number, QuizResponse>): boolean => {
  const responseToConditionQuestion = responses[condition.questionId];

  switch (condition.operator) {
    case 'equals':
      // Handle array responses for checkboxes, simple value for others
      if (Array.isArray(responseToConditionQuestion)) {
        return Array.isArray(condition.value) 
          ? responseToConditionQuestion.length === condition.value.length && responseToConditionQuestion.every(v => condition.value?.includes(v))
          : responseToConditionQuestion.includes(condition.value);
      }
      return responseToConditionQuestion === condition.value;
    case 'notEquals':
      if (Array.isArray(responseToConditionQuestion)) {
         return Array.isArray(condition.value)
          ? responseToConditionQuestion.length !== condition.value.length || !responseToConditionQuestion.every(v => condition.value?.includes(v))
          : !responseToConditionQuestion.includes(condition.value);
      }
      return responseToConditionQuestion !== condition.value;
    case 'contains': // For text or array of selections
      if (typeof responseToConditionQuestion === 'string' && typeof condition.value === 'string') {
        return responseToConditionQuestion.includes(condition.value);
      }
      if (Array.isArray(responseToConditionQuestion) && condition.value !== undefined) {
        return responseToConditionQuestion.includes(condition.value);
      }
      return false;
    case 'greaterThan':
      return typeof responseToConditionQuestion === 'number' && typeof condition.value === 'number' && responseToConditionQuestion > condition.value;
    case 'lessThan':
      return typeof responseToConditionQuestion === 'number' && typeof condition.value === 'number' && responseToConditionQuestion < condition.value;
    case 'answered':
      return responseToConditionQuestion !== undefined && responseToConditionQuestion !== null && responseToConditionQuestion !== '';
    case 'notAnswered':
      return responseToConditionQuestion === undefined || responseToConditionQuestion === null || responseToConditionQuestion === '';
    default:
      return false;
  }
};

/**
 * Evaluates if all conditions in a ConditionalLogic object are met.
 */
export const evaluateConditionalLogic = (
  logic: ConditionalLogic,
  responses: Record<number, QuizResponse>
): boolean => {
  // Assuming AND logic for conditions for now
  return logic.conditions.every(condition => evaluateCondition(condition, responses));
};

/**
 * Determines the next question index based on current state and conditional logic.
 * Returns -1 if quiz should complete or no next question is found.
 */
export const determineNextQuestionIndex = (
  currentIndex: number,
  questions: Question[],
  responses: Record<number, QuizResponse>
): number => {
  if (currentIndex >= questions.length - 1) {
    return -1; // End of quiz
  }

  const currentQuestion = questions[currentIndex];

  // Check for 'skipTo' conditional logic on the current question
  if (currentQuestion.conditionalLogic) {
    for (const logic of currentQuestion.conditionalLogic) {
      if (logic.action === 'skipTo' && logic.targetQuestionId !== undefined && evaluateConditionalLogic(logic, responses)) {
        const targetIndex = questions.findIndex(q => q.id === logic.targetQuestionId);
        if (targetIndex !== -1) {
          return targetIndex;
        }
      }
    }
  }

  // Default: move to the next question in sequence, skipping hidden ones
  let nextIndex = currentIndex + 1;
  while (nextIndex < questions.length) {
    const nextQuestion = questions[nextIndex];
    let isHidden = false;
    if (nextQuestion.conditionalLogic) {
      for (const logic of nextQuestion.conditionalLogic) {
        if (logic.action === 'hide' && evaluateConditionalLogic(logic, responses)) {
          isHidden = true;
          break;
        }
      }
    }
    if (!isHidden) {
      return nextIndex;
    }
    nextIndex++;
  }

  return -1; // End of quiz if all subsequent questions are hidden
};


/**
 * Determines the previous question index based on the active question path.
 * This is simpler as it typically just goes back in the path.
 * More complex logic could be added if "unskipping" is required.
 */
export const determinePreviousQuestionIndex = (
    currentIndex: number,
    activeQuestionPath: number[], // Array of question IDs in the order they were visited
    questions: Question[]
  ): number => {
    if (currentIndex <= 0) return -1; // Already at the first question
  
    const currentQuestionIdInPath = questions[currentIndex].id;
    const indexOfCurrentInPath = activeQuestionPath.lastIndexOf(currentQuestionIdInPath);

    if (indexOfCurrentInPath > 0) {
        const previousQuestionIdInPath = activeQuestionPath[indexOfCurrentInPath - 1];
        const previousQuestionArrayIndex = questions.findIndex(q => q.id === previousQuestionIdInPath);
        if (previousQuestionArrayIndex !== -1) {
            return previousQuestionArrayIndex;
        }
    }
  
    // Fallback if path logic is tricky or not fully representative (should ideally not happen)
    // This fallback just goes to the literal previous question, ignoring skip logic.
    // A more robust solution would ensure activeQuestionPath is always the source of truth for navigation.
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
        // Basic check to prevent going to a question that might now be hidden
        // This part of "previous" logic can get very complex if questions can become hidden
        // after being visited. For now, we assume a simpler model.
        const prevQuestion = questions[prevIndex];
        let isHidden = false;
        if (prevQuestion.conditionalLogic) {
          for (const logic of prevQuestion.conditionalLogic) {
            if (logic.action === 'hide' && evaluateConditionalLogic(logic, {} /* responses might not be relevant for future-hiding */)) {
              // This is tricky: should we re-evaluate based on current responses or original?
              // For simplicity, let's assume if it *could* be hidden, we might skip.
              // A truly robust "previous" needs to remember the exact path taken.
              // The activeQuestionPath is intended for this.
            }
          }
        }
        if (!isHidden) return prevIndex;
        prevIndex--;
    }
    return -1; 
  };