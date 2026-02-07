import api from "./api";

const schemesService = {
    getSchemes: async () => {
        try {
            const response = await api.get("/schemes");
            if (Array.isArray(response.data)) {
                return response.data.map(scheme => ({
                    ...scheme,
                    id: scheme._id // Map _id to id for frontend
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching schemes:", error);
            return [];
        }
    },

    getEligibleSchemes: async () => {
        try {
            const response = await api.get("/schemes/eligible");
            if (Array.isArray(response.data)) {
                 return response.data.map(scheme => ({
                    ...scheme,
                    id: scheme._id
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching eligible schemes:", error);
            return [];
        }
    },

    getAdvisory: async () => {
        try {
            const response = await api.get("/advisory");
            if (Array.isArray(response.data)) {
                 return response.data.map(item => ({
                    ...item,
                    id: item._id,
                    date: new Date(item.createdAt).toLocaleDateString()
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching advisory:", error);
            return [];
        }
    }
};

export default schemesService;
