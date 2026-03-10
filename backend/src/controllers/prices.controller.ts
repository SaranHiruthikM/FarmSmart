import { Request, Response } from "express";
import { createPriceService } from "../services/priceService";

export async function getStates(req: Request, res: Response) {
  const priceService = createPriceService();
  const states = await priceService.getStates();
  return res.status(200).json(states);
}

export async function getDistricts(req: Request, res: Response) {
  const priceService = createPriceService();
  const state = String(req.query.state ?? "").trim();
  if (!state) return res.status(400).json({ error: "state is required" });
  const districts = await priceService.getDistricts(state);
  return res.status(200).json(districts);
}

export async function getCurrentPrices(req: Request, res: Response) {
  const priceService = createPriceService();
  const crop = String(req.query.crop ?? "").trim();
  const location = String(req.query.location ?? "").trim();

  if (!crop) {
    return res.status(400).json({ error: "crop query parameter is required." });
  }

  const data = await priceService.getCurrentPrices(crop, location);
  return res.status(200).json(data);
}

export async function getPriceHistory(req: Request, res: Response) {
  const priceService = createPriceService();
  const crop = String(req.query.crop ?? "").trim();
  const location = String(req.query.location ?? "").trim();
  const days = Number(req.query.days) || 120; // Default to 120 days since gov data is sparse

  if (!crop) {
    return res.status(400).json({ error: "crop query parameter is required." });
  }
  if (!location) {
    return res.status(400).json({ error: "location query parameter is required." });
  }

  const data = await priceService.getPriceHistory(crop, location, days);
  return res.status(200).json(data);
}

export async function comparePrices(req: Request, res: Response) {
  const priceService = createPriceService();
  const crop = String(req.query.crop ?? "").trim();
  const location = String(req.query.location ?? "").trim();

  if (!crop) {
    return res.status(400).json({ error: "crop query parameter is required." });
  }
  if (!location) {
    return res.status(400).json({ error: "location query parameter is required." });
  }

  const data = await priceService.comparePrices(crop, location);
  return res.status(200).json(data);
}

export async function getAvailableCrops(req: Request, res: Response) {
  const priceService = createPriceService();
  const location = String(req.query.location ?? "").trim();

  // If no location provided, generic list or error?
  // For now, let's defer to service handling or return empty if stricter
  if (!location) {
    // return res.status(400).json({ error: "location is required" });
    // or return all known crops?
    // Service expects location string.
    // Let's passed empty string if it handles it, or return error.
    // The frontend generally calls this with a district.
    return res.status(400).json({ error: "location query parameter is required." });
  }

  const data = await priceService.getAvailableCrops(location);
  // Return as objects to match frontend flexibility, or just strings.
  // Transforming to objects { id: name, name: name } to be safe and consistent with previous frontend code usage
  const crops = data.map(c => ({ id: c, name: c }));
  return res.status(200).json(crops);
}

export async function getCsvPriceTrends(req: Request, res: Response) {
  const crop = String(req.query.crop ?? "").trim();
  const range = String(req.query.range ?? "30 days").trim();

  if (!crop) {
    return res.status(400).json({ error: "crop is required" });
  }

  try {
    const { getCsvTrends } = await import("../services/csvTrendService");
    const data = await getCsvTrends(crop, range);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in getCsvPriceTrends:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getAiPriceAnalysis(req: Request, res: Response) {
  const crop = String(req.body.crop ?? "").trim();
  const timeline = String(req.body.timeline ?? "30 days").trim();
  const points = req.body.points || [];
  const language = req.body.language || "English";

  if (!crop || !points.length) {
    return res.status(400).json({ error: "crop and points are required" });
  }

  try {
    const { getAiMarketAnalysis } = await import("../services/marketAnalysisService");
    const analysis = await getAiMarketAnalysis(crop, timeline, points, language);
    return res.status(200).json({ analysis });
  } catch (error: any) {
    console.error("Error in getAiPriceAnalysis:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getForecastAnalysis(req: Request, res: Response) {
  const crop = String(req.body.crop ?? "").trim();
  const district = String(req.body.district ?? "").trim();
  const currentPrice = Number(req.body.currentPrice);
  const query = String(req.body.query ?? "").trim();
  const language = req.body.language || "English";

  if (!crop || !district || isNaN(currentPrice)) {
    return res.status(400).json({ error: "crop, district, and currentPrice are required" });
  }

  try {
    const { handleChatForecast, getPricePrediction } = await import("../services/predictionService");

    let forecast;
    if (query) {
      forecast = await handleChatForecast(query, crop, district, currentPrice, language);
    } else {
      // Use a default query to trigger the LLM translation capability
      const defaultQuery = `What is the price prediction for ${crop} in ${district}?`;
      forecast = await handleChatForecast(defaultQuery, crop, district, currentPrice, language);
    }

    return res.status(200).json({ forecast });
  } catch (error: any) {
    console.error("Error in getForecastAnalysis:", error);
    return res.status(500).json({ error: error.message });
  }
}


