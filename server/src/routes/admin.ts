import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User management
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.delete('/users/:id', AdminController.deleteUser);

// Stadium management
router.get('/stadiums', AdminController.getAllStadiums);
router.post('/stadiums', AdminController.createStadium);
router.put('/stadiums/:id', AdminController.updateStadium);
router.delete('/stadiums/:id', AdminController.deleteStadium);

export default router;
