import { Router } from 'express';
import { getForecast, getRecommendations } from '../controllers/demandController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// We could use authentication here. If the frontend sends tokens, better to authenticate. 
// For now, allow loosely or with authentication.
router.get('/forecast', authenticate, getForecast);
router.get('/recommendations', authenticate, getRecommendations);

export default router;
