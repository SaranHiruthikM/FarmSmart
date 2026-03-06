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

