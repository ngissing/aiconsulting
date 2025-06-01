import React from 'react';
import { Button } from '../ui/button'; // Assuming ShadCN UI Button

interface QuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  // Potentially add onFinish if it's the last question
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestionIndex,
  totalQuestions,
  onNext,
  onPrevious,
  isNextDisabled = false,
  isPreviousDisabled = false,
}) => {
  return (
    <div className="mt-6 flex justify-between">
      <Button
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0 || isPreviousDisabled}
        variant="outline"
      >
        Previous
      </Button>
      <Button
        onClick={onNext}
        disabled={currentQuestionIndex >= totalQuestions - 1 || isNextDisabled}
      >
        {currentQuestionIndex >= totalQuestions - 1 ? 'Finish' : 'Next'}
      </Button>
    </div>
  );
};

export default QuizNavigation;