"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpMandiPriceProvider = exports.HttpMandiPriceProvider = void 0;
const httpClient_1 = require("../utils/httpClient");
const withQuery = (baseUrl, path, params) => {
    const url = new URL(path, baseUrl);
    Object.entries(params).forEach(([key, value]) => {
        if (value)
            url.searchParams.set(key, value);
    });
    return url.toString();
};
const ensureCurrentShape = (data, crop) => {
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
const ensureHistoryShape = (data, crop, location) => {
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
const ensureCompareShape = (data, crop, location) => {
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
class HttpMandiPriceProvider {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.apiKey = config.apiKey;
    }
    get headers() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey)
            headers['x-api-key'] = this.apiKey;
        return headers;
    }
    async getCurrentPrice(crop, location) {
        const url = withQuery(this.baseUrl, '/current', { crop, location });
        const data = await (0, httpClient_1.fetchJson)(url, {
            headers: this.headers,
            timeoutMs: 7000,
            retries: 2,
            retryDelayMs: 300,
        });
        return ensureCurrentShape(data, crop);
    }
    async getPriceHistory(crop, location) {
        const url = withQuery(this.baseUrl, '/history', { crop, location });
        const data = await (0, httpClient_1.fetchJson)(url, {
            headers: this.headers,
            timeoutMs: 7000,
            retries: 2,
            retryDelayMs: 300,
        });
        return ensureHistoryShape(data, crop, location);
    }
    async comparePrices(crop, location) {
        const url = withQuery(this.baseUrl, '/compare', { crop, location });
        const data = await (0, httpClient_1.fetchJson)(url, {
            headers: this.headers,
            timeoutMs: 7000,
            retries: 2,
            retryDelayMs: 300,
        });
        return ensureCompareShape(data, crop, location);
    }
}
exports.HttpMandiPriceProvider = HttpMandiPriceProvider;
const createHttpMandiPriceProvider = () => {
    const baseUrl = process.env.MANDI_API_BASE_URL?.trim();
    if (!baseUrl)
        return null;
    return new HttpMandiPriceProvider({
        baseUrl,
        apiKey: process.env.MANDI_API_KEY?.trim(),
    });
};
exports.createHttpMandiPriceProvider = createHttpMandiPriceProvider;
//# sourceMappingURL=mandiPriceIngestion.js.map