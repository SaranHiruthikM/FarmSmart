// MOCK SERVICE - No Backend Connection
const mockNegotiations = [
    {
        _id: "neg_001",
        cropId: "crop_123",
        cropName: "Wheat Grade A",
        price: 320,
        unit: "kg",
        quantity: 100,
        message: "Initial offer",
        status: "pending",
        farmerId: "farmer_001",
        buyerId: "buyer_001",
        createdAt: new Date().toISOString()
    }
];

const NegotiationService = {
    // Start a new negotiation (Buyer side)
    startNegotiation: async (cropId, price, quantity, message) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newNegotiation = {
                    _id: `neg_${Date.now()}`,
                    cropId,
                    cropName: "Mock Crop Name", // In real app, backend fetches this
                    price,
                    quantity,
                    unit: "kg",
                    message,
                    status: "pending",
                    farmerId: "farmer_mock",
                    buyerId: "buyer_mock",
                    createdAt: new Date().toISOString()
                };
                mockNegotiations.unshift(newNegotiation);
                console.log("Mock Negotiation Started:", newNegotiation);
                resolve(newNegotiation);
            }, 800);
        });
    },

    // Get details of a specific negotiation
    getNegotiationById: async (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const negotiation = mockNegotiations.find(n => n._id === id);
                if (negotiation) {
                    resolve(negotiation);
                } else {
                    // If not found in mock list, return a generic one for testing layout
                    resolve({
                        _id: id,
                        cropId: "crop_mock",
                        cropName: "Test Crop Details",
                        price: 350,
                        quantity: 500,
                        unit: "kg",
                        message: "This is a mock negotiation detail.",
                        status: "pending",
                        farmerId: "farmer_mock",
                        buyerId: "buyer_mock",
                        createdAt: new Date().toISOString()
                    });
                }
            }, 500);
        });
    },

    // Respond to a negotiation (Farmer side: Accept, Reject, Counter)
    respondToNegotiation: async (id, action, counterPrice = null) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const negotiation = mockNegotiations.find(n => n._id === id);
                if (negotiation) {
                    negotiation.status = action === 'counter' ? 'pending' : (action === 'accept' ? 'accepted' : 'rejected');
                    if (action === 'counter' && counterPrice) {
                        negotiation.price = counterPrice;
                        negotiation.message = "Counter offer made";
                        negotiation.statusBy = "Farmer";
                    }
                    resolve({ ...negotiation });
                } else {
                    // Mock response for non-existent id
                    resolve({
                        _id: id,
                        status: action === 'counter' ? 'pending' : (action === 'accept' ? 'accepted' : 'rejected'),
                        price: counterPrice || 350,
                        message: "Mock response update"
                    });
                }
            }, 600);
        });
    },

    // Get all negotiations for the current user
    getMyNegotiations: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...mockNegotiations]);
            }, 400);
        });
    }
};

export default NegotiationService;
