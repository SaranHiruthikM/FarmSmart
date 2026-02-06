import { buildPriceCacheKey } from '../../src/cache/cacheKeys';
import { InMemoryCache } from '../../src/cache/inMemoryCache';
import { createPriceService } from '../../src/services/priceService';
import { getMockCurrentPrices } from '../../src/services/priceMocks';
import { MandiPriceProvider } from '../../src/services/mandiPriceProvider';

describe('Price cache keys', () => {
  it('normalizes crop and location into stable cache keys', () => {
    const key = buildPriceCacheKey('history', '  Tomato  ', ' Coimbatore  ');
    expect(key).toBe('prices:history:tomato:coimbatore');
  });
});

describe('InMemoryCache TTL', () => {
  it('expires entries after TTL', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-05T00:00:00Z'));

    const cache = new InMemoryCache();
    await cache.set('prices:test', { value: 123 }, 1);

    const immediate = await cache.get<{ value: number }>('prices:test');
    expect(immediate?.value).toBe(123);

    jest.advanceTimersByTime(1100);
    const expired = await cache.get<{ value: number }>('prices:test');
    expect(expired).toBeNull();

    jest.useRealTimers();
  });
});

describe('PriceService fallback', () => {
  it('returns mock data when provider fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const failingProvider: MandiPriceProvider = {
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

    const service = createPriceService({ provider: failingProvider, cacheEnabled: false });
    const result = await service.getCurrentPrices('Tomato');

    expect(result).toEqual(getMockCurrentPrices('Tomato'));

    warnSpy.mockRestore();
  });
});
