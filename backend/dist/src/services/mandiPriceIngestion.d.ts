import { CurrentPriceResponse, MandiPriceProvider, PriceCompareResponse, PriceHistoryResponse } from './mandiPriceProvider';
type ProviderConfig = {
    baseUrl: string;
    apiKey?: string;
};
export declare class HttpMandiPriceProvider implements MandiPriceProvider {
    private baseUrl;
    private apiKey?;
    constructor(config: ProviderConfig);
    private get headers();
    getCurrentPrice(crop: string, location?: string): Promise<CurrentPriceResponse>;
    getPriceHistory(crop: string, location: string): Promise<PriceHistoryResponse>;
    comparePrices(crop: string, location: string): Promise<PriceCompareResponse>;
}
export declare const createHttpMandiPriceProvider: () => MandiPriceProvider | null;
export {};
//# sourceMappingURL=mandiPriceIngestion.d.ts.map