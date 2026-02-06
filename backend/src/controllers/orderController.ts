import { Response } from "express";
import { Types } from "mongoose";
import Order from "../models/Order";
import Negotiation from "../models/Negotiation";
import { AuthRequest } from "../middleware/authMiddleware";

const ORDER_STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { negotiationId } = req.body as { negotiationId?: string };

    if (!negotiationId) {
      return res.status(400).json({ message: "negotiationId is required" });
    }

    if (!Types.ObjectId.isValid(negotiationId)) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    if (negotiation.status !== "ACCEPTED") {
      return res.status(400).json({ message: "Negotiation must be ACCEPTED to create an order" });
    }

    const order = await Order.create({
      negotiationId: negotiation._id,
      cropId: negotiation.cropId,
      buyerId: negotiation.buyerId,
      farmerId: negotiation.farmerId,
      pricePerUnit: negotiation.agreedPrice,
      quantity: negotiation.agreedQuantity,
      totalAmount: negotiation.agreedPrice * negotiation.agreedQuantity,
      currentStatus: "CREATED",
      status: [{ status: "CREATED", timestamp: new Date() }],
    });

    return res.status(201).json(order);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id)
      .populate("cropId", "name")
      .populate("buyerId", "fullName role")
      .populate("farmerId", "fullName role");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

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
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.json(orders);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const nextStatus = req.body?.status as string | undefined;

    if (!nextStatus || !ORDER_STATUSES.includes(nextStatus as OrderStatus)) {
      return res.status(400).json({ message: "Missing or invalid status" });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!(req.user?.role === "FARMER" && order.farmerId.toString() === req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    order.currentStatus = nextStatus as OrderStatus;
    order.status.push({ status: nextStatus, timestamp: new Date() });

    await order.save();

    return res.json(order);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
