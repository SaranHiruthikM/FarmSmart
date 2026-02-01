import { Router } from 'express';
import { raiseDispute } from '../controllers/disputes.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, raiseDispute);

export default router;
