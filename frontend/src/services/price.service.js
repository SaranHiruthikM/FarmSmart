import api from "./api";

const priceService = {
    // Get all available crops for selectors (Hardcoded for now as backend doesn't have a distinct list endpoint yet, or we can fetch unique from crops)
    // Ideally we might want a distinct query on the backend. For now, let's keep a static list or fetch from crops endpoint if available.
    getAvailableCrops: async () => {
        // This could be replaced with an API call later
        return [
            { id: "Tomato", name: "Tomato" },
            { id: "Rice", name: "Rice" },
            { id: "Onion", name: "Onion" },
            { id: "Potato", name: "Potato" },
            { id: "Wheat", name: "Wheat" }
        ];
    },

    // Get current day's prices
    getCurrentPrices: async (crop, location) => {
        const params = {};
        if (crop) params.crop = crop;
        if (location) params.location = location;
        
        const response = await api.get("/prices/current", { params });
        return response.data;
    },

    // Get historical trends
    getHistoricalTrends: async (crop, location, days = 30) => {
        const params = {
            days
        };
        if (crop) params.crop = crop;
        if (location) params.location = location;

        const response = await api.get("/prices/history", { params });
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
        } catch (error) {
             // If 404 (no data), return null or valid structure
             return null;
        }
    }
};

export default priceService;
