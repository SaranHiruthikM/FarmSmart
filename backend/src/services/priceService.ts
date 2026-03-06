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

const TTL_CURRENT_SECONDS = 90;
const TTL_COMPARE_SECONDS = 420;
const TTL_HISTORY_SECONDS = 2700;

export const createPriceService = () => {
  const provider = createHttpMandiPriceProvider();
  
  let cache: Cache;
  // Initialize cache based on config
  if (isCacheEnabled()) {
    cache = new RedisCache(process.env.REDIS_URL || 'redis://localhost:6379');
  } else {
    cache = new InMemoryCache();
  }

  const getCached = async <T>(key: string): Promise<T | null> => {
    try {
      return await cache.get<T>(key);
    } catch (e) {
      console.warn(`[PriceService] Cache GET failed for key: ${key}`, e);
      return null;
    }
  };

  const setCached = async <T>(key: string, value: T, ttl: number): Promise<void> => {
    try {
      await cache.set(key, value, ttl);
    } catch (e) {
      console.warn(`[PriceService] Cache SET failed for key: ${key}`, e);
    }
  };

  const getListCached = async (key: string): Promise<string[] | null> => {
    try {
      return await cache.get<string[]>(key);
    } catch (e) {
        console.warn(`[PriceService] Cache GET List failed for key: ${key}`, e);
        return null;
    }
  }

  const setListCached = async (key: string, value: string[]): Promise<string[] | void> => {
    try {
        await cache.set(key, value, 3600);
        return value;
    } catch (e) {
        console.warn(`[PriceService] Cache SET List failed for key: ${key}`, e);
    }
  }

  const getCurrentPrices = async (crop: string, location: string = ''): Promise<CurrentPriceResponse> => {
    const cacheKey = buildPriceCacheKey('current', crop, location);
    const cached = await getCached<CurrentPriceResponse>(cacheKey);
    if (cached) return cached;

    try {
      if (!provider) throw new Error('MANDI_API_BASE_URL not configured');
      const data = await provider.getCurrentPrice(crop, location);
      await setCached(cacheKey, data, TTL_CURRENT_SECONDS);
      return data;
    } catch (error: any) {
       console.warn('[prices] Live current price fetch failed.', { crop, location, error });
       // Return empty/safe structure
       return {
            crop,
            unit: 'INR/kg',
            averageMarketPrice: 0,
            regionalVariations: []
       };
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
    } catch (error: any) {
        console.warn('[prices] Live price history fetch failed.', { crop, location, error });
        // Return empty/safe structure
        return {
           crop,
           location,
           unit: 'INR/kg',
           rangeDays: days,
           points: []
        };
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
    } catch (error: any) {
        console.warn('[prices] Live compare prices fetch failed.', { crop, location, error });
        // Return empty/safe structure
        return {
            crop,
            location,
            unit: 'INR/kg',
            averageNearbyPrice: 0,
            bestPriceHighlight: { mandi: 'N/A', price: 0 },
            comparedMandis: []
        };
    }
  };

  const getAvailableCrops = async (location: string): Promise<string[]> => {
      const cacheKey = buildPriceCacheKey('crops', location);
      const cached = await getListCached(cacheKey);
      if (cached && cached.length > 0) return cached;
      
      try {
           if (!provider) {
             return [];
           }
           const data = await provider.getAvailableCrops(location);
           if (data && data.length > 0) {
               await setListCached(cacheKey, data); 
               return data;
           }
      } catch (error) {
           console.warn('[prices] Available crops fetch failed', { location, error });
      }
      return [];
  };

  const getStates = async (): Promise<string[]> => {
      const cacheKey = buildPriceCacheKey('states', 'all');
      const cached = await getListCached(cacheKey);
      if (cached && cached.length > 0) return cached;
      
      try {
          if (provider) {
              const s = await provider.getStates();
              if (s.length > 0) { 
                  await setListCached(cacheKey, s); 
                  return s; 
              }
          }
      } catch (e) {
          console.warn('[prices] States fetch failed', e);
      }
      return [];
  }

  const getDistricts = async (state: string): Promise<string[]> => {
      const cacheKey = buildPriceCacheKey('districts', state);
      const cached = await getListCached(cacheKey);
      if (cached && cached.length > 0) return cached;
      
      try {
          if (provider) {
              const d = await provider.getDistricts(state);
              if (d.length > 0) { 
                  await setListCached(cacheKey, d); 
                  return d; 
              }
          }
      } catch (e) {
          console.warn('[prices] Districts fetch failed', e);
      }
      return [];
  }

  return {
    getCurrentPrices,
    getPriceHistory,
    comparePrices,
    getAvailableCrops,
    getStates,
    getDistricts
  };
};

