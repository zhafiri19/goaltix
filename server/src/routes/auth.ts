import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/admin/login', AuthController.adminLogin);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;
