import { Router } from 'express';
import { recommendCrops } from '../controllers/planningController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Protect ensures only logged-in users can plan (optional, but good practice)
router.post('/plan', authenticate, recommendCrops); 

export default router;
