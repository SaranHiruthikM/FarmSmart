"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cacheKeys_1 = require("../../src/cache/cacheKeys");
const inMemoryCache_1 = require("../../src/cache/inMemoryCache");
const priceService_1 = require("../../src/services/priceService");
const priceMocks_1 = require("../../src/services/priceMocks");
describe('Price cache keys', () => {
    it('normalizes crop and location into stable cache keys', () => {
        const key = (0, cacheKeys_1.buildPriceCacheKey)('history', '  Tomato  ', ' Coimbatore  ');
        expect(key).toBe('prices:history:tomato:coimbatore');
    });
});
describe('InMemoryCache TTL', () => {
    it('expires entries after TTL', async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-02-05T00:00:00Z'));
        const cache = new inMemoryCache_1.InMemoryCache();
        await cache.set('prices:test', { value: 123 }, 1);
        const immediate = await cache.get('prices:test');
        expect(immediate?.value).toBe(123);
        jest.advanceTimersByTime(1100);
        const expired = await cache.get('prices:test');
        expect(expired).toBeNull();
        jest.useRealTimers();
    });
});
describe('PriceService fallback', () => {
    it('returns mock data when provider fails', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const failingProvider = {
            getCurrentPrice: async () => {
                throw new Error('provider failure');
            },
            getPriceHistory: async () => {
                throw new Error('provider failure');
            },
            comparePrices: async () => {
                throw new Error('provider failure');
            },
        };
        const service = (0, priceService_1.createPriceService)({ provider: failingProvider, cacheEnabled: false });
        const result = await service.getCurrentPrices('Tomato');
        expect(result).toEqual((0, priceMocks_1.getMockCurrentPrices)('Tomato'));
        warnSpy.mockRestore();
    });
});
//# sourceMappingURL=priceService.test.js.map