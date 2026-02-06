import { Response } from "express";
import { Order } from "../models/Order";
import { Negotiation } from "../models/Negotiation";
import { AuthRequest } from "../middleware/authMiddleware";

const ALLOWED_ORDER_STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"] as const;

/**
 * POST /orders
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { negotiationId } = req.body;

    if (!negotiationId) {
      return res.status(400).json({ message: "negotiationId is required" });
    }

    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    if (negotiation.status !== "ACCEPTED") {
      return res.status(400).json({ message: "Only accepted negotiations can create orders" });
    }

    const pricePerUnit = negotiation.agreedPrice;
    const quantity = negotiation.agreedQuantity;
    const totalAmount = pricePerUnit * quantity;

    const order = await Order.create({
      negotiationId: negotiation._id,
      cropId: negotiation.cropId,
      buyerId: negotiation.buyerId,
      farmerId: negotiation.farmerId,
      pricePerUnit,
      quantity,
      totalAmount,
      currentStatus: "CREATED",
      status: [{ status: "CREATED", timestamp: new Date() }],
    });

    return res.status(201).json(order);
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /orders/:id
 */
export const getOrderById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cropId", "name")
      .populate("buyerId", "fullName role")
      .populate("farmerId", "fullName role");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (error: any) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /orders/my
 */
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let filter: Record<string, string>;
    if (req.user.role === "BUYER") {
      filter = { buyerId: req.user.id };
    } else if (req.user.role === "FARMER") {
      filter = { farmerId: req.user.id };
    } else {
      return res.status(403).json({ message: "Role not supported for this endpoint" });
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /orders/:id/status
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const newStatus = req.body.status as string | undefined;
    if (!newStatus) {
      return res.status(400).json({ message: "status is required" });
    }

    if (!ALLOWED_ORDER_STATUSES.includes(newStatus as (typeof ALLOWED_ORDER_STATUSES)[number])) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user?.role !== "FARMER" || order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    order.currentStatus = newStatus as (typeof ALLOWED_ORDER_STATUSES)[number];
    order.status.push({ status: newStatus, timestamp: new Date() });
    await order.save();

    return res.json(order);
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};
