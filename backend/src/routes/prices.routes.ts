import { Router } from "express";
import { comparePrices, getCurrentPrices, getPriceHistory } from "../controllers/prices.controller";

const router = Router();

/**
 * Endpoints:
 * GET /prices/current?crop=
 * GET /prices/history?crop=&location=
 * GET /prices/compare?crop=&location=
 *
 * Note: If your app mounts routes under /api, final path becomes /api/prices/...
 */
router.get("/current", getCurrentPrices);
router.get("/history", getPriceHistory);
router.get("/compare", comparePrices);

export default router;
