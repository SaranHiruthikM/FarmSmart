// NOTE: This is a stubbed price service.
// In a real deployment you'd pull mandi prices from a government feed/API.

function pseudoRand(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export async function currentPrices(req, res) {
  const crop = (req.query.crop || '').toString().trim();
  if (!crop) {
    return res.status(400).json({ error: 'crop query parameter is required.' });
  }

  // Deterministic mock values per crop name to keep UI stable
  const seed = crop.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 20 + Math.round(pseudoRand(seed) * 15);
  const v1 = base - (1 + Math.round(pseudoRand(seed + 1) * 2));
  const v2 = base + (1 + Math.round(pseudoRand(seed + 2) * 2));

  return res.status(200).json({
    averageMarketPrice: base,
    regionalVariations: [
      { mandi: 'Coimbatore', price: v1 },
      { mandi: 'Erode', price: v2 }
    ]
  });
}
