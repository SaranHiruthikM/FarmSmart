import { Router } from 'express';
import { currentPrices } from '../controllers/prices.controller.js';

const router = Router();

router.get('/current', currentPrices);

export default router;
