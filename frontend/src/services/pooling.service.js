import api from './api';

const poolingService = {
    getActivePools: async (district, cropName) => {
        const response = await api.get('/pooling/active', {
            params: { district, cropName }
        });
        return response.data;
    },

    joinPool: async (poolId, cropId, contributedQuantity) => {
        const response = await api.post('/pooling/join', {
            poolId,
            cropId,
            contributedQuantity
        });
        return response.data;
    },
    
    getInstitutionalBatches: async (cropName, district) => {
        const response = await api.get('/pooling/institutional-batches', {
            params: { cropName, district }
        });
        return response.data;
    }
};

export default poolingService;
