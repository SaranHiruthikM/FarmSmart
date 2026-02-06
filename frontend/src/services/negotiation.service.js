import api from "./api";

const NegotiationService = {
    // Start a new negotiation (Buyer side)
    startNegotiation: async (cropId, price, quantity, message) => {
        try {
            const response = await api.post("/negotiations/start", {
                cropId,
                price,
                quantity,
                message,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get details of a specific negotiation
    getNegotiationById: async (id) => {
        try {
            const response = await api.get(`/negotiations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Respond to a negotiation (Farmer side: Accept, Reject, Counter)
    // action: 'accept', 'reject', 'counter'
    respondToNegotiation: async (id, action, counterPrice = null) => {
        try {
            const payload = { action };
            if (action === 'counter' && counterPrice) {
                payload.price = counterPrice;
            }

            const response = await api.post(`/negotiations/${id}/respond`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all negotiations for the current user
    getMyNegotiations: async () => {
        try {
            const response = await api.get("/negotiations/my");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default NegotiationService;
