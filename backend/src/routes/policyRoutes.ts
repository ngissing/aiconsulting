import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import policyController from '../controllers/policyController';
// import { authMiddleware } from '../middleware/authMiddleware'; // Assuming you might want to protect this later

const router = Router();

// Define a rate limiter for the policy generation endpoint
const generatePolicyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many policy generation requests from this IP, please try again after 15 minutes.',
});

// POST /api/policy/generate
// Body: { quizResponses: { ... } }
router.post('/generate', generatePolicyLimiter, policyController.generatePolicy);
// Example of a protected route if needed in the future:
// router.post('/generate', authMiddleware, generatePolicyLimiter, policyController.generatePolicy);


export default router;