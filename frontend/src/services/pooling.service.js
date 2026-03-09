import axios from 'axios';

const API_URL = 'http://localhost:5000/pooling';

// Helper to get token
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

const poolingService = {
    getActivePools: async (district, cropName) => {
        const response = await axios.get(`${API_URL}/active`, {
            params: { district, cropName },
            headers: getAuthHeader()
        });
        return response.data;
    },

    joinPool: async (poolId, cropId, contributedQuantity) => {
        const response = await axios.post(`${API_URL}/join`, {
            poolId,
            cropId,
            contributedQuantity
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getInstitutionalBatches: async (cropName, district) => {
        const response = await axios.get(`${API_URL}/institutional-batches`, {
            params: { cropName, district },
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default poolingService;
