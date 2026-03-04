import api from "./api";

const recommendationService = {
    // Get demand forecasting for a specific crop
    getDemandForecast: async (cropId, location = 'Coimbatore') => {
        const response = await api.get('/demand/forecast', {
            params: { crop: cropId, location }
        });
        return response.data;
    },

    // Get crop recommendations based on location
    getCropRecommendations: async (location) => {
        const response = await api.get('/demand/recommendations', {
            params: { location }
        });
        return response.data.suggestions || response.data;
    }
};

export default recommendationService;
