import api from "./api";

const CROP_URL = "/crops";

const cropService = {
    // Create a new crop listing (Farmer only)
    createCrop: async (cropData) => {
        const response = await api.post(CROP_URL, cropData);
        return response.data;
    },

    // Update an existing crop (Farmer only)
    updateCrop: async (id, cropData) => {
        const response = await api.put(`${CROP_URL}/${id}`, cropData);
        return response.data;
    },

    // Delete a crop (Farmer only)
    deleteCrop: async (id) => {
        const response = await api.delete(`${CROP_URL}/${id}`);
        return response.data;
    },

    // Update crop quantity (Farmer only)
    updateQuantity: async (id, quantity) => {
        const response = await api.patch(`${CROP_URL}/${id}/quantity`, { quantity });
        return response.data;
    },

    // Get all active crops (Public Marketplace)
    getAllCrops: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`${CROP_URL}?${params}`);
        return response.data;
    },

    // Get crop details by ID
    getCropById: async (id) => {
        const response = await api.get(`${CROP_URL}/${id}`);
        return response.data;
    },

    // Get crops listed by the logged-in farmer
    getMyCrops: async () => {
        const response = await api.get(`${CROP_URL}/my`);
        return response.data;
    },
};

export default cropService;
