import api from "./api";

const transformDispute = (data) => {
    if (!data) return null;
    
    // Safety checks for populated fields
    const order = data.orderId || {};
    const farmer = order.farmerId || {};
    const buyer = order.buyerId || {};
    const raiser = data.raisedBy || {};

    return {
        id: data._id,
        orderId: typeof order === 'string' ? order : (order._id || "Unknown"), // Handle both string ID or populated object
        orderIdDisplay: typeof order === 'string' ? order : (order._id || "Unknown"),
        
        raisedBy: raiser.fullName || "User",
        raisedByRole: data.raisedByRole,
        
        farmerName: farmer.fullName || "Farmer",
        buyerName: buyer.fullName || "Buyer",
        
        reason: data.reason,
        description: data.description,
        status: data.status,
        createdAt: data.createdAt,
        adminRemarks: data.adminRemark
    };
};


const disputeService = {
  // Raise a new dispute
  createDispute: async (payload) => {
    // payload: { orderId, reason, description, ... }
    // Backend expects: orderId, reason, description.
    const { orderId, reason, description } = payload;
    const response = await api.post("/disputes", { orderId, reason, description });
    return transformDispute(response.data);
  },

  // Get all disputes for the current user (either as raiser or as defendant)
  getMyDisputes: async () => {
    const response = await api.get("/disputes/my");
    return Array.isArray(response.data) ? response.data.map(transformDispute) : [];
  },

  // Get single dispute details
  getDisputeById: async (id) => {
    const response = await api.get(`/disputes/${id}`);
    return transformDispute(response.data);
  },

  // Admin: Get all disputes
  getAllDisputes: async () => {
    const response = await api.get("/disputes/admin/all");
    return Array.isArray(response.data) ? response.data.map(transformDispute) : [];
  },

  // Admin: Update Status
  updateDisputeStatus: async (id, status, adminRemarks) => {
    const response = await api.patch(`/disputes/admin/${id}`, { status, adminRemark: adminRemarks }); // Note: API expects adminRemark (singular from Schema?) Controller check needed.
    return transformDispute(response.data);
  },

  // Farmer: Resolve Dispute
  resolveDispute: async (id) => {
    const response = await api.patch(`/disputes/${id}/resolve`);
    return transformDispute(response.data);
  }
};

export default disputeService;
