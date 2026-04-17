import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// User routes (authenticated)
router.post('/checkout', authMiddleware, TransactionController.createTransaction);
router.get('/', authMiddleware, TransactionController.getUserTransactions);
router.get('/:id', authMiddleware, TransactionController.getTransactionById);

// Admin only routes
router.get('/admin/all', authMiddleware, adminMiddleware, TransactionController.getAllTransactions);
router.patch('/:id/status', authMiddleware, adminMiddleware, TransactionController.updateTransactionStatus);

export default router;
