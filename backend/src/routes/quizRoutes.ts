import { Router } from 'express';
import {
  getQuizDefinition,
  createQuizSession,
  getQuizSession,
  submitResponse,
  completeQuizSession,
} from '../controllers/quizController';
// import { authMiddleware } from '../middleware/authMiddleware'; // If needed later

const router = Router();

// Get a specific quiz definition (questions, title, etc.)
router.get('/definition/:quizId', getQuizDefinition);

// Create a new quiz session
router.post('/sessions', createQuizSession);

// Get an existing quiz session's state (e.g., for resuming)
router.get('/sessions/:sessionId', getQuizSession);

// Submit an answer for a question within a session
router.post('/sessions/:sessionId/responses', submitResponse);

// Mark a quiz session as complete
router.post('/sessions/:sessionId/complete', completeQuizSession);

// Potentially add routes for admin (CRUD for quizzes) later, protected by authMiddleware
// router.post('/admin/quizzes', authMiddleware, createQuiz);
// router.put('/admin/quizzes/:quizId', authMiddleware, updateQuiz);
// router.delete('/admin/quizzes/:quizId', authMiddleware, deleteQuiz);

export default router;