import React, { ChangeEvent } from 'react'; // Added ChangeEvent
import { Question, QuizResponse, Option } from '../../types/quiz.types';
import { Label } from '../ui/label'; // Assuming this is a ShadCN Label or similar
import { Input } from '../ui/input'; // Assuming this is a ShadCN Input or similar
// import { Textarea } from '../ui/textarea'; // Assuming you have a Textarea component - Commented out
// import { RadioGroup, RadioGroupItem } from '../ui/radio-group'; // Assuming ShadCN UI - Commented out
// import { Checkbox } from '../ui/checkbox'; // Assuming ShadCN UI - Commented out
// import { Slider } from '../ui/slider'; // Assuming ShadCN UI for rating

interface QuestionRendererProps {
  question: Question;
  response: QuizResponse | undefined;
  validationErrors: string[] | undefined;
  onResponseChange: (questionId: number, response: QuizResponse) => void;
  // Potentially add onBlur or other event handlers if needed for validation timing
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  response,
  validationErrors,
  onResponseChange,
}) => {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onResponseChange(question.id, e.target.value);
  };

  // const handleRadioChange = (value: string) => { // Commented out
  //   onResponseChange(question.id, value);
  // };

  // const handleCheckboxChange = (optionValue: string | number, checked: boolean) => { // Commented out
  //   const currentResponse = (response as (string | number)[] | undefined) || [];
  //   let newResponse: (string | number)[];
  //   if (checked) {
  //     newResponse = [...currentResponse, optionValue];
  //   } else {
  //     newResponse = currentResponse.filter((val) => val !== optionValue);
  //   }
  //   onResponseChange(question.id, newResponse);
  // };
  
  // const handleRatingChange = (value: number[]) => { // Commented out
  //   // Assuming slider returns an array, take the first value
  //   onResponseChange(question.id, value[0]);
  // };

  const renderQuestionType = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            type="text"
            id={`question-${question.id}`}
            value={(response as string) || ''}
            onChange={handleInputChange}
            placeholder={question.placeholder || 'Enter your answer'}
            className="mt-1"
          />
        );
      case 'textarea':
        // return ( // Commented out Textarea
        //   <Textarea
        //     id={`question-${question.id}`}
        //     value={(response as string) || ''}
        //     onChange={handleInputChange}
        //     placeholder={question.placeholder || 'Enter your detailed answer'}
        //     className="mt-1"
        //   />
        // );
        return (
            <textarea
              id={`question-${question.id}`}
              value={(response as string) || ''}
              onChange={handleInputChange}
              placeholder={question.placeholder || 'Enter your detailed answer'}
              className="mt-1 h-24 w-full p-2 border rounded-md" // Basic styling for textarea
            />
          );
      case 'multiple-choice':
        // return ( // Commented out RadioGroup
        //   <RadioGroup
        //     value={(response as string) || undefined}
        //     onValueChange={handleRadioChange}
        //     className="mt-2 space-y-2"
        //   >
        //     {question.options?.map((option: Option) => (
        //       <div key={option.id} className="flex items-center space-x-2">
        //         <RadioGroupItem value={String(option.value)} id={`q${question.id}-option${option.id}`} />
        //         <Label htmlFor={`q${question.id}-option${option.id}`}>{option.text}</Label>
        //         {option.imageUrl && <img src={option.imageUrl} alt={option.text} className="ml-2 h-10 w-10 object-contain" />}
        //       </div>
        //     ))}
        //   </RadioGroup>
        // );
        return <p className="mt-2">Multiple choice UI (RadioGroup) not yet implemented.</p>;
      case 'checkbox':
        // return ( // Commented out Checkbox
        //   <div className="mt-2 space-y-2">
        //     {question.options?.map((option: Option) => (
        //       <div key={option.id} className="flex items-center space-x-2">
        //         <Checkbox
        //           id={`q${question.id}-option${option.id}`}
        //           checked={((response as (string | number)[] | undefined) || []).includes(option.value)}
        //           onCheckedChange={(checked: boolean) => handleCheckboxChange(option.value, checked)}
        //         />
        //         <Label htmlFor={`q${question.id}-option${option.id}`}>{option.text}</Label>
        //          {option.imageUrl && <img src={option.imageUrl} alt={option.text} className="ml-2 h-10 w-10 object-contain" />}
        //       </div>
        //     ))}
        //   </div>
        // );
        return <p className="mt-2">Checkbox UI not yet implemented.</p>;
      case 'rating':
        // Commented out Slider
        // Placeholder for rating if Slider is not yet available
        return (
            <Input
                type="number"
                id={`question-${question.id}`}
                value={(response as number) || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onResponseChange(question.id, parseInt(e.target.value, 10))}
                min={question.min}
                max={question.max}
                step={question.step}
                placeholder={question.placeholder || `Enter rating (${question.min || 1}-${question.max || 5})`}
                className="mt-1"
            />
        );
      case 'number':
         return (
            <Input
                type="number"
                id={`question-${question.id}`}
                value={(response as number) || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onResponseChange(question.id, parseFloat(e.target.value))}
                min={question.min}
                max={question.max}
                step={question.step}
                placeholder={question.placeholder || 'Enter a number'}
                className="mt-1"
            />
        );
      case 'date':
        return (
          <Input
            type="date"
            id={`question-${question.id}`}
            value={(response as string) || ''} // Assuming date is stored as YYYY-MM-DD string
            onChange={handleInputChange}
            className="mt-1"
          />
        );
      case 'file':
        return (
          <Input
            type="file"
            id={`question-${question.id}`}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onResponseChange(question.id, e.target.files ? e.target.files[0] : null)}
            className="mt-1"
          />
          // TODO: Add preview for image/file if response exists and is a File object
        );
      default:
        return <p>Unsupported question type: {question.type}</p>;
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm">
      <Label htmlFor={`question-${question.id}`} className="text-lg font-semibold">
        {question.id}. {question.text}
      </Label>
      {question.description && (
        <p className="text-sm text-muted-foreground mt-1 mb-2">{question.description}</p>
      )}
      {question.imageUrl && (
        <img src={question.imageUrl} alt={`Question ${question.id}`} className="my-2 max-w-full h-auto rounded" />
      )}
      {renderQuestionType()}
      {validationErrors && validationErrors.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {validationErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;