import api from "./api";

const transformDispute = (data) => {
  if (!data) return null;

  // Safety checks for populated fields
  const order = data.orderId || {};
  const farmer = order.farmerId || {};
  const buyer = order.buyerId || {};
  const raiser = data.raisedBy || {};

  // Ensure an ID exists to avoid UI crashes
  const idValue = data.id || data._id || "temp_" + Math.random().toString(36).substr(2, 6);

  return {
    id: idValue,
    // Safely handle order ID display
    orderId: typeof order === 'string' ? order : (order._id || "ORD-UNK"),
    orderIdDisplay: typeof order === 'string' ? order.slice(-6) : (order._id?.slice(-6) || "UNK"),

    raisedBy: raiser.fullName || data.raisedBy?.fullName || "A User",
    raisedByRole: data.raisedByRole || "BUYER",

    farmerName: farmer.fullName || "Farmer",
    buyerName: buyer.fullName || "Buyer",

    reason: data.reason || "General Inquiry",
    description: data.description || "No description provided.",
    status: data.status || "OPEN",
    createdAt: data.createdAt || new Date().toISOString(),
    adminRemarks: data.adminRemark || data.adminRemarks || ""
  };
};


// Local storage key for persistent mock disputes
const STORAGE_KEY = "farmsmart_mock_disputes";

// Initialize mock disputes from localStorage or default empty array
const getPersistentDisputes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse stored disputes:", err);
    return [];
  }
};

const savePersistentDisputes = (disputes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(disputes));
  } catch (err) {
    console.error("Failed to save disputes:", err);
  }
};

const disputeService = {
  // Raise a new dispute
  createDispute: async (payload) => {
    try {
      const { orderId, reason, description } = payload;
      const response = await api.post("/disputes", { orderId, reason, description });
      return transformDispute(response.data);
    } catch (error) {
      console.warn("Simulating dispute creation for mock order:", error.message);
      const user = JSON.parse(localStorage.getItem("user")) || { fullName: "Mock Buyer", role: "BUYER" };

      const mockDispute = {
        _id: "dispute_" + Math.random().toString(36).substr(2, 9),
        orderId: payload.orderId,
        reason: payload.reason,
        description: payload.description,
        status: "OPEN",
        raisedBy: { fullName: user.fullName },
        raisedByRole: user.role,
        createdAt: new Date().toISOString()
      };

      const disputes = getPersistentDisputes();
      disputes.push(mockDispute);
      savePersistentDisputes(disputes);

      return transformDispute(mockDispute);
    }
  },

  // Get all disputes for the current user
  getMyDisputes: async () => {
    try {
      const response = await api.get("/disputes/my");
      return Array.isArray(response.data) ? response.data.map(transformDispute) : [];
    } catch (error) {
      console.warn("Falling back to persistent mock disputes:", error.message);
      return getPersistentDisputes().map(transformDispute);
    }
  },

  // Get single dispute details
  getDisputeById: async (id) => {
    try {
      const response = await api.get(`/disputes/${id}`);
      return transformDispute(response.data);
    } catch (error) {
      console.warn("Falling back to persistent mock dispute lookup:", error.message);
      const disputes = getPersistentDisputes();
      const match = disputes.find(d => d._id === id);
      return match ? transformDispute(match) : null;
    }
  },

  // Admin: Get all disputes
  getAllDisputes: async () => {
    try {
      const response = await api.get("/disputes/admin/all");
      return Array.isArray(response.data) ? response.data.map(transformDispute) : [];
    } catch (error) {
      console.warn("Falling back to all persistent mock disputes (admin view):", error.message);
      return getPersistentDisputes().map(transformDispute);
    }
  },

  // Update Status (Admin or Simulation)
  updateDisputeStatus: async (id, status, adminRemarks) => {
    try {
      const response = await api.patch(`/disputes/admin/${id}`, { status, adminRemark: adminRemarks });
      return transformDispute(response.data);
    } catch (error) {
      console.warn("Simulating status update for mock dispute:", error.message);
      const disputes = getPersistentDisputes();
      const index = disputes.findIndex(d => d._id === id);
      if (index !== -1) {
        disputes[index].status = status;
        disputes[index].adminRemark = adminRemarks; // Use adminRemark as per transform
        savePersistentDisputes(disputes);
        return transformDispute(disputes[index]);
      }
      throw error;
    }
  },

  // Farmer: Resolve Dispute
  resolveDispute: async (id) => {
    try {
      const response = await api.patch(`/disputes/${id}/resolve`);
      return transformDispute(response.data);
    } catch (error) {
      console.warn("Simulating resolution for mock dispute:", error.message);
      const disputes = getPersistentDisputes();
      const index = disputes.findIndex(d => d._id === id);
      if (index !== -1) {
        disputes[index].status = "RESOLVED";
        savePersistentDisputes(disputes);
        return transformDispute(disputes[index]);
      }
      throw error;
    }
  }
};

export default disputeService;
