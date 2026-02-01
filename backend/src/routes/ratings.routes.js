import { Router } from 'express';
import { submitRating } from '../controllers/ratings.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, submitRating);

export default router;
