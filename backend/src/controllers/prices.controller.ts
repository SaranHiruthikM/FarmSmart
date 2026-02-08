import { Request, Response } from "express";
import { createPriceService } from "../services/priceService";

const priceService = createPriceService();

export async function getCurrentPrices(req: Request, res: Response) {
  const crop = String(req.query.crop ?? "").trim();
  if (!crop) {
    return res.status(400).json({ error: "crop query parameter is required." });
  }

  const data = await priceService.getCurrentPrices(crop);
  return res.status(200).json(data);
}

export async function getPriceHistory(req: Request, res: Response) {
  const crop = String(req.query.crop ?? "").trim();
  const location = String(req.query.location ?? req.query.district ?? req.query.state ?? "").trim();
  const days = Number(req.query.days) || 30;

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
  const crop = String(req.query.crop ?? "").trim();
  const location = String(req.query.location ?? req.query.district ?? req.query.state ?? "").trim();

  if (!crop) {
    return res.status(400).json({ error: "crop query parameter is required." });
  }
  if (!location) {
    return res.status(400).json({ error: "location query parameter is required." });
  }

  const data = await priceService.comparePrices(crop, location);
  return res.status(200).json(data);
}
