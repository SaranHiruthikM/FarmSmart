import priceData from "../mock/prices.json";

const priceService = {
    // Get all available crops for selectors
    getAvailableCrops: async () => {
        return priceData.crops.map(c => ({ id: c.id, name: c.name }));
    },

    // Get price data for a specific crop
    getPriceDataByCrop: async (cropId) => {
        const crop = priceData.crops.find(c => c.id === cropId);
        if (crop) return crop;
        throw new Error("Crop price data not found");
    },

    // Get mandi comparisons for a specific crop
    getMandiComparisons: async (cropId) => {
        const crop = priceData.crops.find(c => c.id === cropId);
        if (crop) return crop.mandis;
        throw new Error("Crop mandi data not found");
    },

    // Get historical trends for charts
    getHistoricalTrends: async (cropId, period = "7d") => {
        const crop = priceData.crops.find(c => c.id === cropId);
        if (!crop) throw new Error("Crop historical data not found");

        // Mocking period filtering
        // In real app, we would slice the array based on date
        return crop.historical;
    }
};

export default priceService;
