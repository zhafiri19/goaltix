import { Router } from 'express';
import { MatchController } from '../controllers/matchController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', MatchController.getAllMatches);
router.get('/upcoming', MatchController.getUpcomingMatches);
router.get('/:id', MatchController.getMatchById);
router.get('/:matchId/tickets', MatchController.getTicketsByMatch);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, MatchController.createMatch);
router.put('/:id', authMiddleware, adminMiddleware, MatchController.updateMatch);
router.delete('/:id', authMiddleware, adminMiddleware, MatchController.deleteMatch);

export default router;
