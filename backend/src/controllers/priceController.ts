import { Request, Response } from "express";
import { MarketPrice } from "../models/MarketPrice";

/**
 * GET /prices/current
 */
export const getCurrentPrices = async (req: Request, res: Response) => {
  const { crop, location } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If crop or location are missing, we might want to return all or filter partially.
  // The provided snippet assumes they are passed or filters by undefined (which mongoose might handle or ignore).
  // Assuming strict adherence to snippet logic but adapting for TypeScript if needed.
  
  const filter: any = { date: { $gte: today } };
  if (crop) filter.crop = crop;
  if (location) filter["location.district"] = location;

  const prices = await MarketPrice.find(filter);

  res.json(prices);
};

/**
 * GET /prices/history
 */
export const getHistoricalPrices = async (req: Request, res: Response) => {
  const { crop, location, days = 30 } = req.query;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(days));

  const filter: any = { date: { $gte: fromDate } };
  if (crop) filter.crop = crop;
  if (location) filter["location.district"] = location;

  const prices = await MarketPrice.find(filter).sort({ date: 1 });

  res.json(prices);
};

/**
 * GET /prices/compare
 */
export const comparePrices = async (req: Request, res: Response): Promise<any> => {
  const { crop, location } = req.query;

  const filter: any = {};
  if (crop) filter.crop = crop;
  if (location) filter["location.district"] = location;

  const prices = await MarketPrice.find(filter);

  if (!prices.length) {
    return res.status(404).json({ message: "No price data found" });
  }

  const best = prices.reduce((min, curr) =>
    curr.pricePerKg > min.pricePerKg ? curr : min
  );

  res.json({
    bestPrice: best.pricePerKg,
    mandi: best.mandi,
    allPrices: prices,
  });
};
