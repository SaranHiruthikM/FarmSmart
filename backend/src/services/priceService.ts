import { Cache, isCacheEnabled } from '../cache/cache';
import { buildPriceCacheKey } from '../cache/cacheKeys';
import { InMemoryCache } from '../cache/inMemoryCache';
import { RedisCache } from '../cache/redisCache';
import { createHttpMandiPriceProvider } from './mandiPriceIngestion';
import {
  CurrentPriceResponse,
  MandiPriceProvider,
  PriceCompareResponse,
  PriceHistoryResponse,
} from './mandiPriceProvider';
import { getMockComparePrices, getMockCurrentPrices, getMockPriceHistory } from './priceMocks';

const TTL_CURRENT_SECONDS = 90;
const TTL_COMPARE_SECONDS = 420;
const TTL_HISTORY_SECONDS = 2700;
const TTL_FALLBACK_SECONDS = 45;

type PriceServiceOptions = {
  provider?: MandiPriceProvider | null;
  cache?: Cache;
  cacheEnabled?: boolean;
};

export type PriceService = {
  getCurrentPrices: (crop: string) => Promise<CurrentPriceResponse>;
  getPriceHistory: (crop: string, location: string, days?: number) => Promise<PriceHistoryResponse>;
  comparePrices: (crop: string, location: string) => Promise<PriceCompareResponse>;
};

const createDefaultCache = (): Cache => {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      const redis = new RedisCache(redisUrl);
      return redis;
    } catch (error) {
      console.warn('[cache] Failed to initialize Redis cache, using in-memory cache.', error);
    }
  }

  return new InMemoryCache();
};

export const createPriceService = (options: PriceServiceOptions = {}): PriceService => {
  const provider = options.provider ?? createHttpMandiPriceProvider();
  const cacheEnabled = options.cacheEnabled ?? isCacheEnabled();
  const cache = options.cache ?? (cacheEnabled ? createDefaultCache() : undefined);

  const getCached = async <T>(key: string): Promise<T | null> => {
    if (!cacheEnabled || !cache) return null;
    try {
      return await cache.get<T>(key);
    } catch (error) {
      console.warn('[cache] Cache get failed:', error);
      return null;
    }
  };

  const setCached = async <T>(key: string, value: T, ttlSeconds: number): Promise<void> => {
    if (!cacheEnabled || !cache) return;
    try {
      await cache.set<T>(key, value, ttlSeconds);
    } catch (error) {
      console.warn('[cache] Cache set failed:', error);
    }
  };

  const getCurrentPrices = async (crop: string): Promise<CurrentPriceResponse> => {
    const cacheKey = buildPriceCacheKey('current', crop);
    const cached = await getCached<CurrentPriceResponse>(cacheKey);
    if (cached) return cached;

    try {
      if (!provider) throw new Error('MANDI_API_BASE_URL not configured');
      const data = await provider.getCurrentPrice(crop);
      await setCached(cacheKey, data, TTL_CURRENT_SECONDS);
      return data;
    } catch (error) {
      console.warn('[prices] Live current price fetch failed.', { crop, error });
      const fallback = getMockCurrentPrices(crop);
      await setCached(cacheKey, fallback, TTL_FALLBACK_SECONDS);
      return fallback;
    }
  };

  const getPriceHistory = async (crop: string, location: string, days: number = 30): Promise<PriceHistoryResponse> => {
    const cacheKey = buildPriceCacheKey('history', crop, location, days.toString());
    const cached = await getCached<PriceHistoryResponse>(cacheKey);
    if (cached) return cached;

    try {
      if (!provider) throw new Error('MANDI_API_BASE_URL not configured');
      const data = await provider.getPriceHistory(crop, location);
      await setCached(cacheKey, data, TTL_HISTORY_SECONDS);
      return data;
    } catch (error) {
      console.warn('[prices] Live price history fetch failed.', { crop, location, error });
      const fallback = getMockPriceHistory(crop, location, days);
      await setCached(cacheKey, fallback, TTL_FALLBACK_SECONDS);
      return fallback;
    }
  };

  const comparePrices = async (crop: string, location: string): Promise<PriceCompareResponse> => {
    const cacheKey = buildPriceCacheKey('compare', crop, location);
    const cached = await getCached<PriceCompareResponse>(cacheKey);
    if (cached) return cached;

    try {
      if (!provider) throw new Error('MANDI_API_BASE_URL not configured');
      const data = await provider.comparePrices(crop, location);
      await setCached(cacheKey, data, TTL_COMPARE_SECONDS);
      return data;
    } catch (error) {
      console.warn('[prices] Live compare prices fetch failed.', { crop, location, error });
      const fallback = getMockComparePrices(crop, location);
      await setCached(cacheKey, fallback, TTL_FALLBACK_SECONDS);
      return fallback;
    }
  };

  return {
    getCurrentPrices,
    getPriceHistory,
    comparePrices,
  };
};
