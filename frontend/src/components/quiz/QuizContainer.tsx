import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  startQuiz,
  answerQuestion,
  // setCurrentQuestionIndex, // Will use new navigation actions
  navigateToNextQuestion, // Added
  navigateToPreviousQuestion, // Added
  setQuizComplete,
  // loadQuizFromStorage, // For session persistence later
  updateValidationError,
  // clearValidationErrors, // For validation logic later
  generatePolicyForQuiz, // Added
} from '../../store/features/quizSlice';
import { Question as QuestionType, QuizResponse } from '../../types/quiz.types'; // Renamed to avoid conflict
import QuestionRenderer from './QuestionRenderer';
import QuizNavigation from './QuizNavigation';
import QuizProgress from './QuizProgress';
import PreviewPaneRenderer from './PreviewPaneRenderer'; // Added
import { calculateWordCount, calculateReadingTime } from '../../lib/textUtils'; // Added
// import { validateResponse } from '../../lib/quizValidator'; // To be created

// Example Quiz Data (to be replaced by API call or props)
const exampleQuizId = 'sample-quiz-1';
const exampleQuestions: QuestionType[] = [
  {
    id: 1,
    type: 'text',
    text: 'What is your name?',
    placeholder: 'Enter your full name',
    validationRules: [{ type: 'required', message: 'Name is required.' }],
  },
  {
    id: 2,
    type: 'multiple-choice',
    text: 'What is your favorite color?',
    options: [
      { id: 'opt1', text: 'Red', value: 'red' },
      { id: 'opt2', text: 'Blue', value: 'blue' },
      { id: 'opt3', text: 'Green', value: 'green' },
    ],
    validationRules: [{ type: 'required', message: 'Please select a color.' }],
  },
  {
    id: 3,
    type: 'rating',
    text: 'How would you rate this example quiz?',
    min: 1,
    max: 5,
    validationRules: [{ type: 'required', message: 'Rating is required.' }],
  },
];

interface QuizContainerProps {
  quizIdToLoad?: string; // If provided, attempts to load this quiz
  questionsToLoad?: QuestionType[];
  quizTitle?: string;
}

const QuizContainer: React.FC<QuizContainerProps> = ({
  quizIdToLoad = exampleQuizId,
  questionsToLoad = exampleQuestions,
  quizTitle = 'Sample Quiz',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    quizId,
    questions,
    currentQuestionIndex,
    responses,
    progress,
    isComplete,
    validationErrors,
    title,
    generatedPolicyContent, // Added
    isGeneratingPolicy, // Added
    policyGenerationError, // Added
  } = useSelector((state: RootState) => state.quiz);

  useEffect(() => {
    // For now, always start a new quiz with example data
    // Later, this could fetch quiz data based on quizIdToLoad or load from storage
    if (!quizId || quizId !== quizIdToLoad) {
      dispatch(startQuiz({ quizId: quizIdToLoad, questions: questionsToLoad, title: quizTitle }));
    }
  }, [dispatch, quizId, quizIdToLoad, questionsToLoad, quizTitle]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleResponseChange = (questionId: number, response: QuizResponse) => {
    dispatch(answerQuestion({ questionId, response }));
    // Optional: Trigger validation on change
    // const question = questions.find(q => q.id === questionId);
    // if (question) {
    //   const errors = validateResponse(question, response);
    //   dispatch(updateValidationError({ questionId, errors }));
    // }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true; // No question, no validation needed
    // const errors = validateResponse(currentQuestion, responses[currentQuestion.id]);
    // dispatch(updateValidationError({ questionId: currentQuestion.id, errors }));
    // return errors.length === 0;
    // For now, bypass validation
    if (currentQuestion.validationRules?.find(rule => rule.type === 'required')) {
        if (responses[currentQuestion.id] === undefined || responses[currentQuestion.id] === '' || (Array.isArray(responses[currentQuestion.id]) && (responses[currentQuestion.id] as any[]).length === 0) ) {
            dispatch(updateValidationError({ questionId: currentQuestion.id, errors: [currentQuestion.validationRules.find(r => r.type === 'required')?.message || 'This field is required.'] }));
            return false;
        }
    }
    dispatch(updateValidationError({ questionId: currentQuestion.id, errors: [] })); // Clear errors if valid
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      return;
    }
    // dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1)); // Old logic
    dispatch(navigateToNextQuestion()); // Use new navigation logic
  };

  const handlePrevious = () => {
    // dispatch(setCurrentQuestionIndex(currentQuestionIndex - 1)); // Old logic
    dispatch(navigateToPreviousQuestion()); // Use new navigation logic
  };

  const handleGeneratePreview = () => {
    // Ensure there are responses to send
    if (Object.keys(responses).length > 0) {
      dispatch(generatePolicyForQuiz(responses));
    } else {
      // Optionally, handle the case with no responses (e.g., show a message)
      console.warn("No responses yet to generate policy from.");
      // Potentially dispatch an action to set a local error message for the preview pane
    }
  };

  if (!quizId || questions.length === 0) {
    return <div>Loading quiz...</div>; // Or a spinner
  }

  if (isComplete) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <p className="mb-2">Thank you for taking the {title} quiz.</p>
        <p className="mb-4">Your responses:</p>
        <ul className="list-disc list-inside text-left max-w-md mx-auto">
          {questions.map((q) => (
            <li key={q.id} className="mb-1">
              <strong>{q.text}:</strong> {JSON.stringify(responses[q.id]) || 'Not answered'}
            </li>
          ))}
        </ul>
        {/* TODO: Add a button to restart or go somewhere else */}
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Error: Question not found.</div>;
  }

  const examplePreviewContent = `
# Policy Preview

This is a **placeholder** for the generated policy document.

## Section 1: Introduction

- Item 1
- Item 2

## Section 2: Details

Based on your answers:
*   Answer to Q1: ${responses[questions[0]?.id] || 'Not answered'}
*   Answer to Q2: ${responses[questions[1]?.id] || 'Not answered'}

---
More content will appear here as the policy is generated.
`;

  let previewContentToShow = examplePreviewContent;
  if (isGeneratingPolicy) {
    previewContentToShow = "# Generating Preview...\n\nPlease wait while the policy content is being generated.";
  } else if (policyGenerationError) {
    previewContentToShow = `# Error Generating Preview\n\nAn error occurred:\n\n\`\`\`\n${policyGenerationError}\n\`\`\`\n\nUsing fallback content.`;
  } else if (generatedPolicyContent) {
    previewContentToShow = generatedPolicyContent;
  }

  const wordCount = calculateWordCount(previewContentToShow);
  const readingTime = calculateReadingTime(wordCount);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Quiz Area */}
      <div className="lg:w-1/2 flex flex-col">
        <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
        <QuizProgress
          currentProgress={progress}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />
        <div className="flex-grow overflow-auto p-1"> {/* Added for potential scroll within quiz area */}
          <QuestionRenderer
            question={currentQuestion}
            response={responses[currentQuestion.id]}
            validationErrors={validationErrors[currentQuestion.id]}
            onResponseChange={handleResponseChange}
          />
        </div>
        <QuizNavigation
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
        <div className="mt-6 text-center">
          <button
            onClick={handleGeneratePreview}
            disabled={isGeneratingPolicy || Object.keys(responses).length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isGeneratingPolicy ? 'Generating...' : 'Generate/Update Preview'}
          </button>
        </div>
      </div>

      {/* Preview Pane Area */}
      <div className="lg:w-1/2 lg:sticky lg:top-6 h-auto flex flex-col"> {/* Sticky for larger screens, flex-col added */}
        <div className="preview-info text-sm text-gray-600 mb-2 p-2 border-b">
          {wordCount > 0 && (
            <>
              <span>Word Count: {wordCount}</span>
              <span className="mx-2">|</span>
              <span>Est. Reading Time: {readingTime} min{readingTime === 1 ? '' : 's'}</span>
            </>
          )}
          {(isGeneratingPolicy || policyGenerationError || !generatedPolicyContent) && wordCount === 0 && (
            <span>Preview metrics will appear here.</span>
          )}
        </div>
        <div className="flex-grow overflow-auto lg:max-h-[calc(100vh-6rem)]"> {/* Adjusted max-h for info bar */}
          <PreviewPaneRenderer content={previewContentToShow} />
        </div>
      </div>
    </div>
  );
};

export default QuizContainer;