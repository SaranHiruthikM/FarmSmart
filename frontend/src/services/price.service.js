import api from "./api";

const priceService = {
    // Get all available crops for selectors (Dynamic by location now)
    getAvailableCrops: async (location) => {
        try {
            const params = { location };
            const response = await api.get("/prices/crops", { params });
            // If API returns mock static list or empty, ensure fallback
            if (response.data && response.data.length > 0) return response.data;
            throw new Error("No data");
        } catch (e) {
            console.error("Failed to get available crops", e);
            return [];
        }
    },

    // Get current day's prices
    getCurrentPrices: async (crop, location) => {
        const params = {};
        if (crop) params.crop = crop;
        if (location) params.location = location;

        const response = await api.get("/prices/current", { params });
        return response.data;
    },

    getStates: async () => {
        try {
            const response = await api.get("/prices/states");
            return response.data || [];
        } catch (e) {
            console.error("Failed to get states", e);
            return [];
        }
    },

    getDistricts: async (state) => {
        try {
            const response = await api.get("/prices/districts", { params: { state } });
            return response.data || [];
        } catch (e) {
            console.error("Failed to get districts", e);
            return [];
        }
    },

    // Get historical trends from Gov API
    getHistoricalTrends: async (crop, location, days = 30) => {
        const params = {
            days
        };
        if (crop) params.crop = crop;
        if (location) params.location = location;

        const response = await api.get("/prices/history", { params });
        return response.data;
    },

    // Get historical trends specifically from CSV Dataset
    getCsvHistoricalTrends: async (crop, range = "30 days") => {
        const params = { crop, range };
        const response = await api.get("/prices/csv-trends", { params });
        return response.data;
    },


    // Get market comparisons (Best Price)
    getComparison: async (crop, location) => {
        const params = {};
        if (crop) params.crop = crop;
        if (location) params.location = location;

        try {
            const response = await api.get("/prices/compare", { params });
            return response.data;
        } catch (err) {
            // If 404 (no data), return null or valid structure
            console.log(err)
            return null;
        }
    },

    // Get AI-powered market analysis
    getAiAnalysis: async (crop, timeline, points) => {
        try {
            const language = localStorage.getItem('i18nextLng') || "en";
            const response = await api.post("/prices/ai-analysis", { crop, timeline, points, language });
            return response.data.analysis;
        } catch (e) {
            console.error("Failed to get AI analysis", e);
            return null;
        }
    },

    // Get ML-based price forecast
    getForecast: async (crop, district, currentPrice, query = "") => {
        try {
            const language = localStorage.getItem('i18nextLng') || "en";
            const response = await api.post("/prices/forecast", { crop, district, currentPrice, query, language });
            return response.data.forecast;
        } catch (e) {
            console.error("Failed to get price forecast", e);
            return null;
        }
    }

};



export default priceService;
