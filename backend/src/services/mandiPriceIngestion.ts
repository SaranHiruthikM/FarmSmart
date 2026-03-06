import { fetchJson } from '../utils/httpClient';
import {
  CurrentPriceResponse,
  MandiPriceProvider,
  PriceCompareResponse,
  PriceHistoryResponse,
} from './mandiPriceProvider';

// Types for Data.gov.in Response (Resource: 9ef84268-d588-465a-a308-a864a43d0070)
type DataGovRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
};

type DataGovResponse = {
  records: DataGovRecord[];
  total: number;
  count: number;
  limit: string;
  offset: string;
  version: string;
  status: string;
};

type ProviderConfig = {
  baseUrl: string;
  apiKey: string;
};

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DEFAULT_BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// Helper: Convert Quintal price (100kg) to Kg price
const toKgPrice = (priceStr: string): number => {
  const price = parseFloat(priceStr);
  return isNaN(price) ? 0 : Math.round((price / 100) * 100) / 100;
};

// Helper: Format date from dd/mm/yyyy to standard object or string
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`);
};

export class DataGovInProvider implements MandiPriceProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;
  }

  private buildUrl(params: Record<string, string>): string {
    const url = new URL(this.baseUrl);
    url.searchParams.append('api-key', this.apiKey);
    url.searchParams.append('format', 'json');
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
    return url.toString();
  }

  async getCurrentPrice(crop: string, location: string = ''): Promise<CurrentPriceResponse> {
    // Using lowercase filter keys as per resource 9ef84268...
    const filters: Record<string, string> = {
      'filters[commodity]': crop,
      'limit': '100'
    };

    if (location) {
      filters['filters[district]'] = location;
    }

    const url = this.buildUrl(filters);
    
    try {
      const data = await fetchJson<DataGovResponse>(url, { timeoutMs: 30000 });
      
      const records = data.records || [];
      if (records.length === 0) {
        return {
            crop,
            unit: 'INR/kg',
            averageMarketPrice: 0,
            regionalVariations: []
        };
      }

      // Calculate average price
      const validPrices = records
        .map(r => toKgPrice(r.modal_price))
        .filter(p => p > 0);
      
      const avgPrice = validPrices.length > 0
        ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
        : 0;

      // Regional variations (Top 5 markets found)
      const regionalVariations = records
        .slice(0, 5)
        .map(r => ({
          mandi: r.market,
          price: toKgPrice(r.modal_price)
        }));

      return {
        crop,
        unit: 'INR/kg',
        averageMarketPrice: parseFloat(avgPrice.toFixed(2)),
        regionalVariations
      };

    } catch (error) {
      console.error('[DataGovIn] Fetch failed:', error);
       return {
            crop,
            unit: 'INR/kg',
            averageMarketPrice: 0,
            regionalVariations: []
        };
    }
  }

  async getPriceHistory(crop: string, location: string): Promise<PriceHistoryResponse> {
    const filters: Record<string, string> = {
      'filters[commodity]': crop,
      'filters[district]': location,
      'limit': '100' 
    };
    const url = this.buildUrl(filters);

    try {
      const data = await fetchJson<DataGovResponse>(url, { timeoutMs: 30000 });
      const records = data.records || [];

      // Group by date
      const dataMap = new Map<string, number[]>();

      records.forEach(r => {
        const dateKey = r.arrival_date; 
        const price = toKgPrice(r.modal_price);
        if (price > 0) {
           if (!dataMap.has(dateKey)) dataMap.set(dateKey, []);
           dataMap.get(dateKey)?.push(price);
        }
      });

      const points = Array.from(dataMap.entries()).map(([dateStr, prices]) => {
          const avg = prices.reduce((a,b) => a+b, 0) / prices.length;
          try {
             const iso = parseDate(dateStr).toISOString();
             return { date: iso, price: parseFloat(avg.toFixed(2)) };
          } catch (e) { return null; }
      }).filter(x => x !== null);
      
      points.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        crop,
        location,
        unit: 'INR/kg',
        rangeDays: points.length,
        points: points
      };
      
    } catch (error) {
      console.error('[DataGovIn] History fetch failed:', error);
      return {
          crop,
          location,
          unit: 'INR/kg',
          rangeDays: 0,
          points: []
      };
    }
  }

  async getStates(): Promise<string[]> {
    // Note: Removed 'sort[arrival_date]' as API returns error ~ "Fielddata is disabled on text fields"
    const url = this.buildUrl({ 'limit': '1000' });
    try {
        const data = await fetchJson<DataGovResponse>(url, { timeoutMs: 30000 });
        const records = data.records || [];
        const states = new Set(records.map(r => r.state));
        return Array.from(states).sort();
    } catch(e) {
        console.error('Failed to get states', e);
        return [];
    }
  }

  async getDistricts(state: string): Promise<string[]> {
    // Note: Removed 'sort[arrival_date]' as API returns error ~ "Fielddata is disabled on text fields"
    const url = this.buildUrl({ 'filters[state]': state, 'limit': '500' });
    try {
        const data = await fetchJson<DataGovResponse>(url, { timeoutMs: 30000 });
        const records = data.records || [];
        const districts = new Set(records.map(r => r.district));
        return Array.from(districts).sort();
    } catch(e) {
        console.error('Failed to get districts', e);
        return [];
    }
  }

  async getAvailableCrops(location: string): Promise<string[]> {
      const url = this.buildUrl({
          'filters[district]': location,
          'limit': '100'
      });

      try {
          const data = await fetchJson<DataGovResponse>(url, { timeoutMs: 30000 });
          const records = data.records || [];
          const crops = new Set(records.map(r => r.commodity));
          return Array.from(crops).sort();
      } catch (error) {
          console.error('[DataGovIn] GetAvailableCrops fetch failed:', error);
          return [];
      }
  }

  async comparePrices(crop: string, location: string): Promise<PriceCompareResponse> {
    const url = this.buildUrl({
      'filters[commodity]': crop,
      'filters[district]': location,
      'limit': '50'
    });

    try {
      const data = await fetchJson<DataGovResponse>(url, { timeoutMs: 30000 });
      const records = data.records || [];

      if (records.length === 0) {
          return {
             crop,
             location,
             unit: 'INR/kg',
             averageNearbyPrice: 0,
             bestPriceHighlight: { mandi: 'N/A', price: 0 },
             comparedMandis: []
          };
      }

      const comparisons = records.map(r => ({
        mandi: r.market,
        price: toKgPrice(r.modal_price)
      })).filter(c => c.price > 0);

      const best = comparisons.reduce((max, curr) => curr.price > max.price ? curr : max, comparisons[0]);
      
      const avg = comparisons.reduce((sum, c) => sum + c.price, 0) / comparisons.length;

      return {
        crop,
        location,
        unit: 'INR/kg',
        averageNearbyPrice: parseFloat(avg.toFixed(2)),
        bestPriceHighlight: best,
        comparedMandis: comparisons
      };

    } catch (error) {
       console.error('[DataGovIn] Compare fetch failed:', error);
       return {
             crop,
             location,
             unit: 'INR/kg',
             averageNearbyPrice: 0,
             bestPriceHighlight: { mandi: 'N/A', price: 0 },
             comparedMandis: []
        };
    }
  }
}

export const createHttpMandiPriceProvider = (
  baseUrl?: string, 
  apiKey?: string
): MandiPriceProvider | undefined => {
  // Use provided keys or fall back to environment variables
  const finalApiKey = apiKey || process.env.MANDI_API_KEY;
  const finalBaseUrl = baseUrl || DEFAULT_BASE_URL;

  if (!finalApiKey) {
    console.warn('MANDI_API_KEY not found. Using mocks.');
    return undefined;
  }

  return new DataGovInProvider({ baseUrl: finalBaseUrl, apiKey: finalApiKey });
};
