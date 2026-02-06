import { Cache } from '../cache/cache';
import { CurrentPriceResponse, MandiPriceProvider, PriceCompareResponse, PriceHistoryResponse } from './mandiPriceProvider';
type PriceServiceOptions = {
    provider?: MandiPriceProvider | null;
    cache?: Cache;
    cacheEnabled?: boolean;
};
export type PriceService = {
    getCurrentPrices: (crop: string) => Promise<CurrentPriceResponse>;
    getPriceHistory: (crop: string, location: string) => Promise<PriceHistoryResponse>;
    comparePrices: (crop: string, location: string) => Promise<PriceCompareResponse>;
};
export declare const createPriceService: (options?: PriceServiceOptions) => PriceService;
export {};
//# sourceMappingURL=priceService.d.ts.map