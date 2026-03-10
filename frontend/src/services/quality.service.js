import api from "./api";

const qualityService = {
    // Calculate price impact based on grade using backend API
    getPriceImpact: async (grade, basePrice) => {
        const price = parseFloat(basePrice);
        if (isNaN(price)) return null;

        try {
            const response = await api.get(`/quality/price-impact`, {
                params: { grade, basePrice: price }
            });

            const { finalPrice } = response.data;
            const impact = parseFloat((finalPrice - price).toFixed(2));
            const percentage = parseFloat(((impact / price) * 100).toFixed(0));

            return {
                basePrice: price,
                finalPrice: finalPrice,
                impact: impact,
                percentage: percentage
            };
        } catch (error) {
            console.error("Error fetching price impact:", error);
            // Fallback or re-throw based on needs. For now returning null or base values could be safer but let's stick to error logging.
            return null;
        }
    },

    // Verify quality impact
    evaluateQuality: async (data, language = "English") => {
        try {
            const response = await api.post("/quality/evaluate", { ...data, language });
            return response.data;
        } catch (error) {
            console.error("Error evaluating quality:", error);
            throw error;
        }
    },

    // Analyze quality from image upload
    analyzeImage: async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('language', localStorage.getItem('i18nextLng') || 'en');
            
            const response = await api.post("/quality/analyze", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error analyzing image:", error);
            throw error;
        }
    },

    // Quality hints for tooltips (UI Helper)
    getGradeHints: () => ({
        A: "Premium: Fresh, uniform size, no defects.",
        B: "Standard: Good quality, minor size variations or defects.",
        C: "Low: Visible defects, uneven size, suitable for processing."
    })
};

export default qualityService;
