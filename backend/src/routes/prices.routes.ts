import { Router } from "express";
import { comparePrices, getCurrentPrices, getPriceHistory, getAvailableCrops, getStates, getDistricts, getCsvPriceTrends, getAiPriceAnalysis, getForecastAnalysis } from "../controllers/prices.controller";

const router = Router();

/**
 * Endpoints:
 * GET /prices/current?crop=
 * GET /prices/history?crop=&location=
 * GET /prices/compare?crop=&location=
 * GET /prices/crops?location=
 * GET /prices/states
 * GET /prices/districts?state=
 * GET /prices/csv-trends?crop=&range=
 * POST /prices/ai-analysis
 * POST /prices/forecast
 */
router.get("/current", getCurrentPrices);
router.get("/history", getPriceHistory);
router.get("/compare", comparePrices);
router.get("/crops", getAvailableCrops);
router.get("/states", getStates);
router.get("/districts", getDistricts);
router.get("/csv-trends", getCsvPriceTrends);
router.post("/ai-analysis", getAiPriceAnalysis);
router.post("/forecast", getForecastAnalysis);

export default router;



