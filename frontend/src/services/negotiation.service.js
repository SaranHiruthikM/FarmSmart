import api from "./api";
import notificationService from "./notification.service";
import authService from "./auth.service";

// Helper to transform Backend Negotiation format to Frontend Mock format
const transformNegotiation = (serverData) => {
    if (!serverData) return null;

    const lastOffer = serverData.offers && serverData.offers.length > 0
        ? serverData.offers[serverData.offers.length - 1]
        : { pricePerUnit: 0, quantity: 0, message: "" };

    const crop = serverData.cropId || {};

    // Infer statusBy
    let statusBy = 'Unknown';
    if (serverData.status === 'ACCEPTED' || serverData.status === 'REJECTED') {
        // If accepted/rejected, the actor is the opposite of the last offer maker
        // (Assuming simple flow where you respond to the last offer)
        statusBy = lastOffer.by === 'BUYER' ? 'Farmer' : 'Buyer';
    } else {
        // Pending
        statusBy = lastOffer.by === 'BUYER' ? 'Buyer' : 'Farmer';
    }

    return {
        _id: serverData._id,
        cropName: crop.name || "Unknown Crop",
        quantity: lastOffer.quantity,
        unit: crop.unit || "kg",
        price: lastOffer.pricePerUnit, // Current/Last price

        // Frontend expects 'message' on root for the main display?
        message: lastOffer.message,

        status: (serverData.status === 'PENDING' && serverData.offers && serverData.offers.length > 1)
            ? 'counter_offer'
            : (serverData.status ? serverData.status.toLowerCase() : 'pending'),
        statusBy,
        lastOfferBy: lastOffer.by,

        createdAt: serverData.createdAt,
        updatedAt: serverData.updatedAt,

        farmerId: serverData.farmerId?._id || serverData.farmerId, // Needed for role check
        buyerId: serverData.buyerId?._id || serverData.buyerId,
        farmerName: serverData.farmerId?.fullName || "Farmer",
        buyerName: serverData.buyerId?.fullName || "Buyer",

        // Map offers to history
        history: (serverData.offers || []).map(offer => ({
            by: offer.by,
            price: offer.pricePerUnit,
            quantity: offer.quantity,
            message: offer.message,
            createdAt: offer.createdAt
        }))
    };
};

const NegotiationService = {
    // Start a new negotiation (Buyer side)
    startNegotiation: async (cropId, price, quantity, message, farmerId) => {
        const response = await api.post("/negotiations/start", {
            cropId,
            pricePerUnit: price,
            quantity,
            message,
            farmerId // Required by backend
        });

        // Notify Farmer
        notificationService.addNotification(
            farmerId,
            `New Bid Received! Buyer offered ₹${price} for your crop.`,
            "PRICE"
        );

        return transformNegotiation(response.data);
    },

    // Get all negotiations for current user
    getMyNegotiations: async () => {
        const response = await api.get("/negotiations/my");
        // Backend returns array
        return Array.isArray(response.data)
            ? response.data.map(transformNegotiation)
            : [];
    },

    // Get details of a specific negotiation
    getNegotiationById: async (id) => {
        const response = await api.get(`/negotiations/${id}`);
        return transformNegotiation(response.data);
    },

    // Respond to negotiation (Accept/Reject/Counter)
    respondToNegotiation: async (id, action, pricePerUnit, quantity, message) => {
        const payload = {
            action: action.toUpperCase(), // Ensure backend enum match (ACCEPT, REJECT, COUNTER)
            pricePerUnit,
            quantity,
            message
        };
        const response = await api.post(`/negotiations/${id}/respond`, payload);
        const data = response.data;
        const currentUser = authService.getCurrentUser();

        // Determine target (The other party)
        // If current user is buyer, notify farmer. If farmer, notify buyer.
        // We need the IDs. 'data' from backend usually contains buyerId and farmerId.
        // Assuming data is the Negotiation object

        const targetUserId = currentUser.id === data.buyerId ? data.farmerId : data.buyerId;

        if (targetUserId) {
            let notifMsg = "";
            let notifType = "INFO";

            if (action.toUpperCase() === 'ACCEPT') {
                notifMsg = `Great News! Your offer for ${data.cropId?.name || 'crop'} was ACCEPTED!`;
                notifType = "SUCCESS";
            } else if (action.toUpperCase() === 'REJECT') {
                notifMsg = `Update: Your offer for ${data.cropId?.name || 'crop'} was REJECTED.`;
                notifType = "ERROR";
            } else if (action.toUpperCase() === 'COUNTER') {
                notifMsg = `Counter Offer: You received a new offer of ₹${pricePerUnit} for ${data.cropId?.name || 'crop'}.`;
                notifType = "PRICE";
            }

            notificationService.addNotification(targetUserId, notifMsg, notifType);
        }

        return transformNegotiation(data);
    }
};

export default NegotiationService;
