import api from "./api";

const transformOrder = (order) => {
  if (!order) return null;
  return {
    id: order._id,
    _id: order._id,
    crop: order.cropId?.name || "Unknown Crop",
    cropId: order.cropId?._id || order.cropId,
    quantity: order.quantity,
    totalPrice: order.totalAmount, // Backend: totalAmount, Frontend: totalPrice (mock compatibility)
    totalAmount: order.totalAmount,
    status: order.currentStatus, // Backend: currentStatus, Frontend (mock): status
    date: order.createdAt,
    farmerName: order.farmerId?.fullName || "Farmer",
    buyerName: order.buyerId?.fullName || "Buyer",
    farmerId: order.farmerId?._id || order.farmerId,
    buyerId: order.buyerId?._id || order.buyerId,
    timeline: order.status || [], // Backend: status array of objects { status, timestamp }
    negotiationId: order.negotiationId
  };
};

const MOCK_ORDERS = [
  {
    _id: "65c2a1b1e4b0a1a1a1a1a1a1",
    cropId: { name: "Premium Sona Masuri Rice", _id: "crop1" },
    quantity: 500,
    totalAmount: 25000,
    currentStatus: "DELIVERED",
    createdAt: "2024-02-01T10:00:00.000Z",
    farmerId: { fullName: "Rajesh Kumar", _id: "farmer1" },
    buyerId: { fullName: "Mock Buyer", _id: "buyer1" },
    status: [
      { status: "CREATED", timestamp: "2024-02-01T10:00:00.000Z" },
      { status: "CONFIRMED", timestamp: "2024-02-01T12:00:00.000Z" },
      { status: "SHIPPED", timestamp: "2024-02-02T09:00:00.000Z" },
      { status: "DELIVERED", timestamp: "2024-02-03T15:00:00.000Z" }
    ]
  },
  {
    _id: "65c2a1b1e4b0a1a1a1a1a1a2",
    cropId: { name: "Organic Wheat", _id: "crop2" },
    quantity: 200,
    totalAmount: 8000,
    currentStatus: "SHIPPED",
    createdAt: "2024-02-05T14:30:00.000Z",
    farmerId: { fullName: "Suresh Singh", _id: "farmer2" },
    buyerId: { fullName: "Mock Buyer", _id: "buyer1" },
    status: [
      { status: "CREATED", timestamp: "2024-02-05T14:30:00.000Z" },
      { status: "CONFIRMED", timestamp: "2024-02-05T16:00:00.000Z" },
      { status: "SHIPPED", timestamp: "2024-02-06T10:00:00.000Z" }
    ]
  },
  {
    _id: "65c2a1b1e4b0a1a1a1a1a1a3",
    cropId: { name: "Red Onions", _id: "crop3" },
    quantity: 1000,
    totalAmount: 15000,
    currentStatus: "CREATED",
    createdAt: "2024-02-07T08:00:00.000Z",
    farmerId: { fullName: "Mahesh Patil", _id: "farmer3" },
    buyerId: { fullName: "Mock Buyer", _id: "buyer1" },
    status: [
      { status: "CREATED", timestamp: "2024-02-07T08:00:00.000Z" }
    ]
  }
];

const OrderService = {
  // Direct Buy ("Buy Now") - Bypass Manual Negotiation
  instantBuy: async (cropId, quantity) => {
    const response = await api.post("/orders/instant-buy", { cropId, quantity });
    return transformOrder(response.data);
  },

  // Create order from negotiation
  createOrder: async (negotiationId) => {
    const response = await api.post("/orders", { negotiationId });
    return transformOrder(response.data);
  },

  // Get all orders for current user
  getMyOrders: async () => {
    try {
      const response = await api.get("/orders/my");
      // Backend returns stored array. Map to frontend structure
      const orders = Array.isArray(response.data)
        ? response.data.map(transformOrder)
        : [];

      // If no orders returned from backend, use mock data for UI testing
      return orders.length > 0 ? orders : MOCK_ORDERS.map(transformOrder);
    } catch (error) {
      console.warn("Falling back to mock orders due to error:", error.message);
      return MOCK_ORDERS.map(transformOrder);
    }
  },

  // Get single order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return transformOrder(response.data);
    } catch (error) {
      console.warn(`Falling back to mock order for ID ${id}:`, error.message);
      const mockOrder = MOCK_ORDERS.find(o => o._id === id);
      return mockOrder ? transformOrder(mockOrder) : null;
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      // status must be UPPERCASE for backend enum match if not already
      const response = await api.patch(`/orders/${id}/status`, { status: status.toUpperCase() });
      return transformOrder(response.data);
    } catch (error) {
      console.warn(`Simulating status update for mock order ID ${id}:`, error.message);
      const mockOrder = MOCK_ORDERS.find(o => o._id === id);
      if (mockOrder) {
        // Update the mock object in memory for the current session
        mockOrder.currentStatus = status.toUpperCase();
        // Add to mock timeline if it doesn't already have one for this status
        if (!mockOrder.status.find(s => s.status === status.toUpperCase())) {
          mockOrder.status.push({
            status: status.toUpperCase(),
            timestamp: new Date().toISOString()
          });
        }
        return transformOrder(mockOrder);
      }
      throw error;
    }
  },

  // Get negotiation details (helper for Order Summary)
  getNegotiationById: async (id) => {
    const response = await api.get(`/negotiations/${id}`);
    return response.data;
  }
};

export default OrderService;
