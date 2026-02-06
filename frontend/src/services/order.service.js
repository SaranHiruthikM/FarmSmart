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

const OrderService = {
  // Create order from negotiation
  createOrder: async (negotiationId) => {
    const response = await api.post("/orders", { negotiationId });
    return transformOrder(response.data);
  },

  // Get all orders for current user
  getMyOrders: async () => {
    const response = await api.get("/orders/my");
    // Backend returns stored array. Map to frontend structure
    return Array.isArray(response.data) 
        ? response.data.map(transformOrder) 
        : [];
  },

  // Get single order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return transformOrder(response.data);
  },
  
  // Update order status
  updateOrderStatus: async (id, status) => {
      // status must be UPPERCASE for backend enum match if not already
      const response = await api.patch(`/orders/${id}/status`, { status: status.toUpperCase() });
      return transformOrder(response.data);
  },

  // Get negotiation details (helper for Order Summary)
  getNegotiationById: async (id) => {
      const response = await api.get(`/negotiations/${id}`);
      return response.data;
  }
};

export default OrderService;
