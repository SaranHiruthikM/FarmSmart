import { fetchJson } from '../utils/httpClient';
import {
  CurrentPriceResponse,
  MandiPriceProvider,
  PriceCompareResponse,
  PriceHistoryResponse,
} from './mandiPriceProvider';

type ProviderConfig = {
  baseUrl: string;
  apiKey?: string;
};

const withQuery = (baseUrl: string, path: string, params: Record<string, string | undefined>) => {
  const url = new URL(path, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
};

const ensureCurrentShape = (data: CurrentPriceResponse, crop: string): CurrentPriceResponse => {
  if (!data || typeof data.averageMarketPrice !== 'number' || !Array.isArray(data.regionalVariations)) {
    throw new Error('Invalid current price payload');
  }

  return {
    crop: data.crop || crop,
    unit: data.unit || 'INR/kg',
    averageMarketPrice: data.averageMarketPrice,
    regionalVariations: data.regionalVariations,
  };
};

const ensureHistoryShape = (data: PriceHistoryResponse, crop: string, location: string): PriceHistoryResponse => {
  if (!data || !Array.isArray(data.points)) {
    throw new Error('Invalid history payload');
  }

  return {
    crop: data.crop || crop,
    location: data.location || location,
    unit: data.unit || 'INR/kg',
    rangeDays: data.rangeDays || data.points.length,
    points: data.points,
  };
};

const ensureCompareShape = (
  data: PriceCompareResponse,
  crop: string,
  location: string
): PriceCompareResponse => {
  if (!data || !Array.isArray(data.comparedMandis)) {
    throw new Error('Invalid compare payload');
  }

  return {
    crop: data.crop || crop,
    location: data.location || location,
    unit: data.unit || 'INR/kg',
    averageNearbyPrice: data.averageNearbyPrice,
    bestPriceHighlight: data.bestPriceHighlight,
    comparedMandis: data.comparedMandis,
  };
};

export class HttpMandiPriceProvider implements MandiPriceProvider {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['x-api-key'] = this.apiKey;
    return headers;
  }

  async getCurrentPrice(crop: string, location?: string): Promise<CurrentPriceResponse> {
    const url = withQuery(this.baseUrl, '/current', { crop, location });
    const data = await fetchJson<CurrentPriceResponse>(url, {
      headers: this.headers,
      timeoutMs: 7000,
      retries: 2,
      retryDelayMs: 300,
    });

    return ensureCurrentShape(data, crop);
  }

  async getPriceHistory(crop: string, location: string): Promise<PriceHistoryResponse> {
    const url = withQuery(this.baseUrl, '/history', { crop, location });
    const data = await fetchJson<PriceHistoryResponse>(url, {
      headers: this.headers,
      timeoutMs: 7000,
      retries: 2,
      retryDelayMs: 300,
    });

    return ensureHistoryShape(data, crop, location);
  }

  async comparePrices(crop: string, location: string): Promise<PriceCompareResponse> {
    const url = withQuery(this.baseUrl, '/compare', { crop, location });
    const data = await fetchJson<PriceCompareResponse>(url, {
      headers: this.headers,
      timeoutMs: 7000,
      retries: 2,
      retryDelayMs: 300,
    });

    return ensureCompareShape(data, crop, location);
  }
}

export const createHttpMandiPriceProvider = (): MandiPriceProvider | null => {
  const baseUrl = process.env.MANDI_API_BASE_URL?.trim();
  if (!baseUrl) return null;

  return new HttpMandiPriceProvider({
    baseUrl,
    apiKey: process.env.MANDI_API_KEY?.trim(),
  });
};
