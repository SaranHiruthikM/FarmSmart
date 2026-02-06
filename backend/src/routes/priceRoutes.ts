import { Router } from "express";
import {
  getCurrentPrices,
  getHistoricalPrices,
  comparePrices,
} from "../controllers/priceController";

const router = Router();

router.get("/current", getCurrentPrices);
router.get("/history", getHistoricalPrices);
router.get("/compare", comparePrices);

export default router;
