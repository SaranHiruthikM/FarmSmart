export declare const getMockCurrentPrices: (crop: string) => {
    crop: string;
    unit: string;
    averageMarketPrice: number;
    regionalVariations: {
        mandi: string;
        price: number;
    }[];
};
export declare const getMockPriceHistory: (crop: string, location: string) => {
    crop: string;
    location: string;
    unit: string;
    rangeDays: number;
    points: {
        date: string;
        price: number;
    }[];
};
export declare const getMockComparePrices: (crop: string, location: string) => {
    crop: string;
    location: string;
    unit: string;
    averageNearbyPrice: number;
    bestPriceHighlight: {
        mandi: string;
        price: number;
    };
    comparedMandis: {
        mandi: string;
        price: number;
    }[];
};
export declare const _test: {
    seedFromStrings: (...parts: Array<string | undefined>) => number;
    pseudoRand: (seed: number) => number;
    clamp: (n: number, min: number, max: number) => number;
};
//# sourceMappingURL=priceMocks.d.ts.map