import api from "./api";

const rotationService = {
    getRotationSuggestion: async (lastCrop, district) => {
        try {
            const response = await api.get(`/advisory/rotation-suggestion?lastCrop=${lastCrop}&district=${district}`);
            return response.data.data;
        } catch (error) {
            console.error("Rotation suggestion error", error);
            throw error;
        }
    }
};

export default rotationService;
