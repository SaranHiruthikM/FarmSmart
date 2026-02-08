import api from "./api";
import notificationService from "./notification.service";
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

    // Notifications
    if (order) {
      notificationService.addNotification(
        order.buyerId,
        `Order Placed Successfully! Your order for ${order.crop} needs confirmation.`,
        "SUCCESS"
      );
      notificationService.addNotification(
        order.farmerId,
        `New Order Received! You have a new order for ${order.crop}.`,
        "SYSTEM"
      );
    }
    return order;
  },

  // Create order from negotiation
  createOrder: async (negotiationId) => {
    const response = await api.post("/orders", { negotiationId });
    const order = transformOrder(response.data);

    // Notifications
    if (order) {
      notificationService.addNotification(
        order.buyerId,
        `Order Placed! Your negotiation for ${order.crop} has been finalized into an order.`,
        "SUCCESS"
      );
      notificationService.addNotification(
        order.farmerId,
        `New Order! A negotiation for ${order.crop} has been finalized.`,
        "SYSTEM"
      );
    }
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

    if (order) {
      const currentUser = authService.getCurrentUser();
      const targetUserId = currentUser.id === order.buyerId ? order.farmerId : order.buyerId;

      // Notify the OTHER party about the update
      if (targetUserId) {
        notificationService.addNotification(
          targetUserId,
          `Order Update: Status for ${order.crop} changed to ${status}.`,
          "INFO"
        );
      }

      // Also notify self for confirmation? Maybe not needed as UI updates.
      // But let's be safe and notify buyer if farmer updated it.
      // Wait, 'targetUserId' logic handles "other party".
    }

    return order;
  },

  // Get negotiation details (helper for Order Summary)
  getNegotiationById: async (id) => {
    const response = await api.get(`/negotiations/${id}`);
    return response.data;
  }
};

export default OrderService;
