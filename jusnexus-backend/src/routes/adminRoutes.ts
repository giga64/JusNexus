import express from 'express';
import { approveUser, getPendingUsers } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Aplica os middlewares para todas as rotas deste arquivo
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users/pending', getPendingUsers);
router.patch('/users/:id/approve', approveUser);

export default router;
