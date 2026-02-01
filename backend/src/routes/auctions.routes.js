import { Router } from 'express';
import { placeBid, manageBid } from '../controllers/auctions.controller.js';
import { checkRole } from '../middleware/auth.js';

const router = Router();

// Spec: POST /api/auctions/:cropId/bid (Buyer only)
router.post('/:cropId/bid', checkRole('BUYER', 'ADMIN'), placeBid);

// Spec: PATCH /api/auctions/bids/:bidId (Farmer only)
router.patch('/bids/:bidId', checkRole('FARMER', 'ADMIN'), manageBid);

export default router;
