import { Router } from 'express';
import { login, logout } from '../controllers/authController';
import { requireAdminAuth } from '../middleware/authMiddleware'; // Example usage

const router = Router();

router.post('/login', login);
router.post('/logout', logout); // Typically, logout might also be protected or handled differently

// Example of a protected route - you would create other routers for admin functionalities
// and protect them with requireAdminAuth
router.get('/admin/profile', requireAdminAuth, (req: any, res) => {
  // req.user is available here from the middleware
  res.json({ message: 'Welcome admin!', user: req.user });
});

export default router;