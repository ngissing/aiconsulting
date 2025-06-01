import { Request, Response } from 'express';
// We can import types from the frontend project if they are suitably structured
// For now, let's assume we might need to define specific DTOs or use 'any' for stubs
// import { Question, QuizResponse } from '../../../frontend/src/types/quiz.types';

// Mock quiz data for now
const quizzes: Record<string, any> = {
  'sample-quiz-1': {
    id: 'sample-quiz-1',
    title: 'Sample Backend Quiz',
    questions: [
      { id: 1, type: 'text', text: 'What is your backend name?' },
      { id: 2, type: 'multiple-choice', text: 'Favorite backend framework?', options: [{id: 'o1', text: 'Express', value: 'express'}, {id: 'o2', text: 'NestJS', value: 'nestjs'}] },
    ],
  },
};

const quizSessions: Record<string, any> = {};

export const getQuizDefinition = async (req: Request, res: Response): Promise<void> => {
  const { quizId } = req.params;
  const quiz = quizzes[quizId];
  if (quiz) {
    res.status(200).json(quiz);
  } else {
    res.status(404).json({ message: 'Quiz not found' });
  }
};

export const createQuizSession = async (req: Request, res: Response): Promise<void> => {
  const { quizId, email, schoolName } = req.body;
  // In a real app, validate quizId, associate with user if logged in, etc.
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  quizSessions[sessionId] = {
    quizId,
    email,
    schoolName,
    responses: {},
    startTime: new Date(),
    currentQuestionIndex: 0, // Or derive from quiz definition
    isCompleted: false,
  };

  res.status(201).json({ sessionId, message: 'Quiz session created', sessionData: quizSessions[sessionId] });
};

export const getQuizSession = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params;
    const session = quizSessions[sessionId];
    if (session) {
        res.status(200).json(session);
    } else {
        res.status(404).json({ message: 'Session not found' });
    }
};

export const submitResponse = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const { questionId, response } = req.body;

  const session = quizSessions[sessionId];
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  if (session.isCompleted) {
    res.status(400).json({ message: 'Quiz session already completed' });
    return;
  }

  // In a real app, validate questionId against the quiz definition
  session.responses[questionId] = response;
  // Potentially update progress, next question index based on logic here or on client
  
  // For now, just acknowledge
  res.status(200).json({ message: 'Response submitted', questionId, response });
};

export const completeQuizSession = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params;
    const session = quizSessions[sessionId];
    if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
    }
    session.isCompleted = true;
    session.endTime = new Date();
    // Potentially calculate score or final state
    res.status(200).json({ message: 'Quiz session completed', sessionData: session });
};