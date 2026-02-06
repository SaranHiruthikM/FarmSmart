const seedFromStrings = (...parts: Array<string | undefined>): number => {
  const s = parts
    .filter(Boolean)
    .map((p) => p!.toLowerCase().trim())
    .join('|');

  if (!s) return 0;

  let acc = 0;
  for (let i = 0; i < s.length; i++) acc += s.charCodeAt(i);
  return acc;
};

const pseudoRand = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const clamp = (n: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, n));
};

export const getMockCurrentPrices = (crop: string) => {
  const seed = seedFromStrings(crop);
  const base = 20 + Math.round(pseudoRand(seed) * 15);
  const v1 = base - (1 + Math.round(pseudoRand(seed + 1) * 2));
  const v2 = base + (1 + Math.round(pseudoRand(seed + 2) * 2));

  return {
    crop,
    unit: 'INR/kg',
    averageMarketPrice: base,
    regionalVariations: [
      { mandi: 'Coimbatore', price: v1 },
      { mandi: 'Erode', price: v2 },
    ],
  };
};

export const getMockPriceHistory = (crop: string, location: string, days: number = 30) => {
  const seed = seedFromStrings(crop, location);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const base = 18 + Math.round(pseudoRand(seed) * 20);
  const volatility = 1 + Math.round(pseudoRand(seed + 9) * 3);

  const points: Array<{ date: string; price: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const trend = Math.round((days - 1 - i) * (pseudoRand(seed + 3) - 0.5) * 0.2);
    const noise = Math.round((pseudoRand(seed + i * 7) - 0.5) * 2 * volatility);

    points.push({
      date: d.toISOString().slice(0, 10),
      price: clamp(base + trend + noise, 5, 999),
    });
  }

  return {
    crop,
    location,
    unit: 'INR/kg',
    rangeDays: days,
    points,
  };
};

export const getMockComparePrices = (crop: string, location: string) => {
  const seed = seedFromStrings(crop, location);
  const base = 18 + Math.round(pseudoRand(seed) * 20);

  const mandis = ['Local Mandi', 'District Hub', 'Wholesale Yard', 'Agri Market', 'City Mandi'].map(
    (name, idx) => {
      const delta = Math.round((pseudoRand(seed + (idx + 1) * 11) - 0.5) * 8);
      return { mandi: name, price: clamp(base + delta, 5, 999) };
    }
  );

  const best = mandis.reduce((a, b) => (b.price > a.price ? b : a), mandis[0]);
  const avg = Math.round(mandis.reduce((s, m) => s + m.price, 0) / mandis.length);

  return {
    crop,
    location,
    unit: 'INR/kg',
    averageNearbyPrice: avg,
    bestPriceHighlight: best,
    comparedMandis: mandis,
  };
};

export const _test = {
  seedFromStrings,
  pseudoRand,
  clamp,
};
