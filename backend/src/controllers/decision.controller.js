import { prisma } from '../db/prisma.js';

// Simple rule-based decision support.
// Inputs: cropId -> compares listing price vs (mock) market averages.
export async function recommend(req, res) {
  const cropId = Number(req.query.cropId || req.params.cropId);
  if (!Number.isFinite(cropId)) {
    return res.status(400).json({ error: 'cropId is required and must be a number.' });
  }

  const crop = await prisma.crop.findUnique({ where: { id: cropId } });
  if (!crop) return res.status(404).json({ error: 'Crop not found.' });

  // Reuse the same deterministic logic as prices.controller.js
  const name = crop.cropName;
  const seed = name.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 20 + Math.round((Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)) * 15);
  const erode = base + 2;

  const listed = Number(crop.pricePerUnit);
  const premium = ((erode - base) / base) * 100;

  // Rules:
  // - If regional premium is >= ~4% and stock is AVAILABLE -> HOLD for a short window.
  // - If listing price already at/above regional top -> SELL.
  // - Else -> SELL (market is good enough).
  let recommendation = 'SELL';
  let confidence = 'Medium';
  let reason = 'Market prices look stable.';

  if (listed >= erode) {
    recommendation = 'SELL';
    confidence = 'High';
    reason = `Your listed price (₹${listed}/unit) is already at or above the current best regional price (₹${erode}/unit). You can sell now without leaving money on the table.`;
  } else if (premium >= 4 && crop.status === 'AVAILABLE') {
    recommendation = 'HOLD';
    confidence = 'High';
    reason = `Market prices in Erode are higher than the average by about ${premium.toFixed(1)}%. If this trend continues, waiting ~3–5 days could improve your margins.`;
  } else {
    recommendation = 'SELL';
    confidence = 'Medium';
    reason = `Current average market price is around ₹${base}/unit. Your listing is below the best regional price, so selling now is reasonable to avoid storage/quality loss.`;
  }

  return res.status(200).json({
    recommendation,
    confidence,
    reason
  });
}
