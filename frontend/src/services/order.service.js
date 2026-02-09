import api from "./api";
// eslint-disable-next-line
import authService from "./auth.service";

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
  // Direct Buy ("Buy Now") - Bypass Manual Negotiation
  instantBuy: async (cropId, quantity) => {
    const response = await api.post("/orders/instant-buy", { cropId, quantity });
    const order = transformOrder(response.data);
    return order;
  },

  // Create order from negotiation
  createOrder: async (negotiationId) => {
    const response = await api.post("/orders", { negotiationId });
    const order = transformOrder(response.data);
    return order;
  },

  // Get all orders for current user
  getMyOrders: async () => {
    try {
      const response = await api.get("/orders/my");
      // Backend returns stored array. Map to frontend structure
      return Array.isArray(response.data)
        ? response.data.map(transformOrder)
        : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  // Get single order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return transformOrder(response.data);
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    // status must be UPPERCASE for backend enum match if not already
    const response = await api.patch(`/orders/${id}/status`, { status: status.toUpperCase() });
    const order = transformOrder(response.data);
    return order;
  },

  // Get negotiation details (helper for Order Summary)
  getNegotiationById: async (id) => {
    const response = await api.get(`/negotiations/${id}`);
    return response.data;
  }
};

export default OrderService;
