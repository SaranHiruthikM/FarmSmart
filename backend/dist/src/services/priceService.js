"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPriceService = void 0;
const cache_1 = require("../cache/cache");
const cacheKeys_1 = require("../cache/cacheKeys");
const inMemoryCache_1 = require("../cache/inMemoryCache");
const redisCache_1 = require("../cache/redisCache");
const mandiPriceIngestion_1 = require("./mandiPriceIngestion");
const priceMocks_1 = require("./priceMocks");
const TTL_CURRENT_SECONDS = 90;
const TTL_COMPARE_SECONDS = 420;
const TTL_HISTORY_SECONDS = 2700;
const TTL_FALLBACK_SECONDS = 45;
const createDefaultCache = () => {
    const redisUrl = process.env.REDIS_URL?.trim();
    if (redisUrl) {
        try {
            const redis = new redisCache_1.RedisCache(redisUrl);
            return redis;
        }
        catch (error) {
            console.warn('[cache] Failed to initialize Redis cache, using in-memory cache.', error);
        }
    }
    return new inMemoryCache_1.InMemoryCache();
};
const createPriceService = (options = {}) => {
    const provider = options.provider ?? (0, mandiPriceIngestion_1.createHttpMandiPriceProvider)();
    const cacheEnabled = options.cacheEnabled ?? (0, cache_1.isCacheEnabled)();
    const cache = options.cache ?? (cacheEnabled ? createDefaultCache() : undefined);
    const getCached = async (key) => {
        if (!cacheEnabled || !cache)
            return null;
        try {
            return await cache.get(key);
        }
        catch (error) {
            console.warn('[cache] Cache get failed:', error);
            return null;
        }
    };
    const setCached = async (key, value, ttlSeconds) => {
        if (!cacheEnabled || !cache)
            return;
        try {
            await cache.set(key, value, ttlSeconds);
        }
        catch (error) {
            console.warn('[cache] Cache set failed:', error);
        }
    };
    const getCurrentPrices = async (crop) => {
        const cacheKey = (0, cacheKeys_1.buildPriceCacheKey)('current', crop);
        const cached = await getCached(cacheKey);
        if (cached)
            return cached;
        try {
            if (!provider)
                throw new Error('MANDI_API_BASE_URL not configured');
            const data = await provider.getCurrentPrice(crop);
            await setCached(cacheKey, data, TTL_CURRENT_SECONDS);
            return data;
        }
        catch (error) {
            console.warn('[prices] Live current price fetch failed.', { crop, error });
            const fallback = (0, priceMocks_1.getMockCurrentPrices)(crop);
            await setCached(cacheKey, fallback, TTL_FALLBACK_SECONDS);
            return fallback;
        }
    };
    const getPriceHistory = async (crop, location) => {
        const cacheKey = (0, cacheKeys_1.buildPriceCacheKey)('history', crop, location);
        const cached = await getCached(cacheKey);
        if (cached)
            return cached;
        try {
            if (!provider)
                throw new Error('MANDI_API_BASE_URL not configured');
            const data = await provider.getPriceHistory(crop, location);
            await setCached(cacheKey, data, TTL_HISTORY_SECONDS);
            return data;
        }
        catch (error) {
            console.warn('[prices] Live price history fetch failed.', { crop, location, error });
            const fallback = (0, priceMocks_1.getMockPriceHistory)(crop, location);
            await setCached(cacheKey, fallback, TTL_FALLBACK_SECONDS);
            return fallback;
        }
    };
    const comparePrices = async (crop, location) => {
        const cacheKey = (0, cacheKeys_1.buildPriceCacheKey)('compare', crop, location);
        const cached = await getCached(cacheKey);
        if (cached)
            return cached;
        try {
            if (!provider)
                throw new Error('MANDI_API_BASE_URL not configured');
            const data = await provider.comparePrices(crop, location);
            await setCached(cacheKey, data, TTL_COMPARE_SECONDS);
            return data;
        }
        catch (error) {
            console.warn('[prices] Live compare prices fetch failed.', { crop, location, error });
            const fallback = (0, priceMocks_1.getMockComparePrices)(crop, location);
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
exports.createPriceService = createPriceService;
//# sourceMappingURL=priceService.js.map