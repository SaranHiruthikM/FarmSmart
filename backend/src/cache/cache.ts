export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

export const isCacheEnabled = (): boolean => {
  const flag = (process.env.PRICE_CACHE_ENABLED || '').toLowerCase().trim();
  if (!flag) return false; // Default to FALSE if not specified
  return !(flag === 'false' || flag === '0' || flag === 'off');
};
