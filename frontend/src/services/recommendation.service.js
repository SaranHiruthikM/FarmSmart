import api from "./api";

const recommendationService = {
    // Get demand forecasting for a specific crop
    getDemandForecast: async (cropId, location = 'Coimbatore') => {
        const response = await api.get('/demand/forecast', {
            params: { crop: cropId, location }
        });
        return response.data;
    },

    // Get crop recommendations based on location and currently selected crop
    getCropRecommendations: async (location, currentCrop) => {
        const params = { location };
        if (currentCrop) params.crop = currentCrop;
        const response = await api.get('/demand/recommendations', { params });
        return response.data.suggestions || response.data;
    }
};

export default recommendationService;
