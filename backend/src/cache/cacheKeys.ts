const normalizePart = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'unknown';
};

export const buildPriceCacheKey = (
  kind: 'current' | 'history' | 'compare',
  crop: string,
  location?: string
): string => {
  const parts = ['prices', kind, normalizePart(crop)];
  if (location) parts.push(normalizePart(location));
  return parts.join(':');
};

export const _test = { normalizePart };
