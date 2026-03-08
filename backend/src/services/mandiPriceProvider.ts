export type CurrentPriceResponse = {
  crop: string;
  unit: string;
  averageMarketPrice: number;
  regionalVariations: Array<{ mandi: string; price: number }>;
};

export type PriceHistoryResponse = {
  crop: string;
  location: string;
  unit: string;
  rangeDays: number;
  points: Array<{ date: string; price: number }>;
};

export type PriceCompareResponse = {
  crop: string;
  location: string;
  unit: string;
  averageNearbyPrice: number;
  bestPriceHighlight: { mandi: string; price: number };
  comparedMandis: Array<{ mandi: string; price: number }>;
};

export interface MandiPriceProvider {
  getCurrentPrice(crop: string, location?: string): Promise<CurrentPriceResponse>;
  getPriceHistory(crop: string, location: string): Promise<PriceHistoryResponse>;
  comparePrices(crop: string, location: string): Promise<PriceCompareResponse>;
  getAvailableCrops(location: string): Promise<string[]>;
  getStates(): Promise<string[]>;
  getDistricts(state: string): Promise<string[]>;
}
