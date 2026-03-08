import api from "./api";

const aiAdvisoryService = {
    /**
     * Post symptoms to get AI diagnosis
     * @param {string} symptoms 
     * @param {string} crop 
     * @param {string} location 
     */
    diagnose: async (symptoms, crop = "General", location = "India") => {
        try {
            const response = await api.post("/advisory/diagnose", {
                symptoms,
                crop,
                location
            });
            return response.data.data; // Standardized backend response wraps actual data in .data
        } catch (error) {
            console.error("AI Diagnosis API error", error);
            throw error;
        }
    },

    /**
     * Get existing static advisories
     */
    getAdvisories: async () => {
        try {
            const response = await api.get("/advisory");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch advisories", error);
            return [];
        }
    }
};

export default aiAdvisoryService;
