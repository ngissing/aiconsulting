import React from 'react';

interface QuizProgressProps {
  currentProgress: number; // Percentage 0-100
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  currentProgress,
  currentQuestionIndex,
  totalQuestions,
}) => {
  const progressPercentage = Math.max(0, Math.min(100, currentProgress));

  return (
    <div className="my-4">
      <div className="flex justify-between mb-1 text-sm">
        <span>
          Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
        </span>
        <span>{progressPercentage}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgress;