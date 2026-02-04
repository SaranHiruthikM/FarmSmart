import forecastData from "../mock/forecast.json";

const recommendationService = {
    // Get demand forecasting for a specific crop
    getDemandForecast: async (cropId) => {
        const forecast = forecastData.demandData.find(d => d.cropId === cropId);
        if (forecast) return forecast;
        return forecastData.demandData[0]; // Fallback
    },

    // Get crop recommendations based on location
    getCropRecommendations: async (location) => {
        const recommendations = forecastData.cropRecommendations.find(
            r => r.location.toLowerCase().includes(location.toLowerCase())
        );
        if (recommendations) return recommendations.suggestions;
        return forecastData.cropRecommendations[0].suggestions; // Fallback
    }
};

export default recommendationService;
