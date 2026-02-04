// LocalStorage-based mock service for Frontend-only mode
const STORAGE_KEY = "farm_crops";

// Helper to get crops from storage
const getStoredCrops = () => {
    const crops = localStorage.getItem(STORAGE_KEY);
    return crops ? JSON.parse(crops) : [];
};

// Helper to save crops to storage
const saveCrops = (crops) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
};

// Initialize with some mock data if empty
if (!localStorage.getItem(STORAGE_KEY)) {
    saveCrops([
        {
            _id: "1",
            name: "Premium Basmati Rice",
            variety: "Basmati",
            quantity: 500,
            unit: "kg",
            basePrice: 85,
            qualityGrade: "A",
            location: { state: "Punjab", district: "Amritsar", village: "Rayya" },
            farmer: "f1",
            farmerName: "Harpreet Singh",
            isActive: true,
            createdAt: new Date().toISOString()
        },
        {
            _id: "2",
            name: "Organic Red Tomatoes",
            variety: "Hybrid Red",
            quantity: 120,
            unit: "kg",
            basePrice: 40,
            qualityGrade: "B",
            location: { state: "Maharashtra", district: "Nashik", village: "Pimpalgaon" },
            farmer: "f2",
            farmerName: "Rahul Patil",
            isActive: true,
            createdAt: new Date().toISOString()
        }
    ]);
}

const cropService = {
    // Create a new crop listing
    createCrop: async (cropData) => {
        const crops = getStoredCrops();
        const user = JSON.parse(localStorage.getItem("user") || '{"id": "u123", "name": "Vimal Sabari", "role": "farmer"}');

        const newCrop = {
            ...cropData,
            _id: Math.random().toString(36).substr(2, 9),
            farmer: user.id,
            farmerName: user.name,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        crops.push(newCrop);
        saveCrops(crops);
        return newCrop;
    },

    // Update an existing crop
    updateCrop: async (id, cropData) => {
        const crops = getStoredCrops();
        const index = crops.findIndex(c => c._id === id);
        if (index !== -1) {
            crops[index] = { ...crops[index], ...cropData };
            saveCrops(crops);
            return crops[index];
        }
        throw new Error("Crop not found");
    },

    // Delete a crop
    deleteCrop: async (id) => {
        const crops = getStoredCrops();
        const filtered = crops.filter(c => c._id !== id);
        saveCrops(filtered);
        return { message: "Deleted successfully" };
    },

    // Update crop quantity
    updateQuantity: async (id, quantity) => {
        const crops = getStoredCrops();
        const index = crops.findIndex(c => c._id === id);
        if (index !== -1) {
            crops[index].quantity = quantity;
            saveCrops(crops);
            return crops[index];
        }
        throw new Error("Crop not found");
    },

    // Get all active crops
    getAllCrops: async (filters = {}) => {
        let crops = getStoredCrops().filter(c => c.isActive);

        if (filters.name) {
            crops = crops.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.state) {
            crops = crops.filter(c => c.location.state.toLowerCase().includes(filters.state.toLowerCase()));
        }
        if (filters.district) {
            crops = crops.filter(c => c.location.district.toLowerCase().includes(filters.district.toLowerCase()));
        }

        return crops;
    },

    // Get crop details by ID
    getCropById: async (id) => {
        const crops = getStoredCrops();
        const crop = crops.find(c => c._id === id);
        if (crop) return crop;
        throw new Error("Crop not found");
    },

    // Get crops listed by the logged-in farmer
    getMyCrops: async () => {
        const user = JSON.parse(localStorage.getItem("user") || '{"id": "u123", "name": "Vimal Sabari", "role": "farmer"}');
        const crops = getStoredCrops();
        return crops.filter(c => c.farmer === user.id);
    },
};

export default cropService;
