import api from "./api";
import notificationService from "./notification.service";
import authService from "./auth.service";

// Helper to transform Backend Data (Crop Model) -> to Frontend UI Model (Mock structure)
// Backend: { _id, farmerId: { _id, fullName }, ... }
// Frontend Expects: { _id, farmer: "id", farmerName: "name", ... }
const transformCrop = (crop) => {
    if (!crop) return null;

    // Handle farmerId population
    const farmerObj = crop.farmerId || {};
    // If populated, it has _id. If not (just ID string), it is the ID.
    const farmerId = farmerObj._id || farmerObj;
    const farmerName = farmerObj.fullName || "Unknown Farmer";
    const farmerPhone = farmerObj.phoneNumber;
    const farmerRating = farmerObj.averageRating || 0;
    const reviewCount = farmerObj.reviewCount || 0;

    return {
        ...crop,
        farmer: farmerId,
        farmerName: farmerName,
        farmerPhone: farmerPhone,
        farmerRating: farmerRating,
        reviewCount: reviewCount,
        // Ensure location exists to prevent UI crash
        location: crop.location || { state: "", district: "", village: "" }
    };
};

const cropService = {
    // Create new crop
    createCrop: async (cropData) => {
        // Backend expects { name, quantity, unit, ... location: {...} }
        const response = await api.post("/crops", cropData);
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            notificationService.addNotification(
                currentUser.id,
                `Your crop "${cropData.name}" has been listed successfully.`,
                "SUCCESS"
            );
        }
        return transformCrop(response.data);
    },

    // Get all crops (with filters)
    getAllCrops: async (filters = {}) => {
        // filters: { name, state, district }
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/crops?${params}`);
        return response.data.map(transformCrop);
    },

    // Get single crop
    getCropById: async (id) => {
        const response = await api.get(`/crops/${id}`);
        return transformCrop(response.data);
    },

    // Update crop
    updateCrop: async (id, cropData) => {
        const response = await api.put(`/crops/${id}`, cropData);
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            notificationService.addNotification(
                currentUser.id,
                `Your crop "${cropData.name}" has been updated.`,
                "INFO"
            );
        }
        return transformCrop(response.data);
    },

    // Delete crop
    deleteCrop: async (id, cropName = "Unknown Crop") => {
        const response = await api.delete(`/crops/${id}`);
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            notificationService.addNotification(
                currentUser.id,
                `Crop listing has been deleted.`,
                "WARNING"
            );
        }
        return response.data;
    },

    // Update quantity (Partial update)
    updateQuantity: async (id, quantity) => {
        const response = await api.patch(`/crops/${id}/quantity`, { quantity });
        return transformCrop(response.data);
    },

    // Get My Crops (Farmer's own listings)
    getMyCrops: async () => {
        const response = await api.get("/crops/my");
        return response.data.map(transformCrop);
    }
};

export default cropService;
