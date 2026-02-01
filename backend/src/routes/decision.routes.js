import { Router } from 'express';
import { recommend } from '../controllers/decision.controller.js';

const router = Router();

// Spec: GET /api/decision/recommend?cropId=101
router.get('/recommend', recommend);

export default router;
