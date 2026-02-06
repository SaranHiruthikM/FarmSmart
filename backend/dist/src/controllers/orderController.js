"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getMyOrders = exports.getOrderById = exports.createOrder = void 0;
const Order_1 = require("../models/Order");
const Negotiation_1 = require("../models/Negotiation");
const ALLOWED_ORDER_STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"];
/**
 * POST /orders
 */
const createOrder = async (req, res) => {
    try {
        const { negotiationId } = req.body;
        if (!negotiationId) {
            return res.status(400).json({ message: "negotiationId is required" });
        }
        const negotiation = await Negotiation_1.Negotiation.findById(negotiationId);
        if (!negotiation) {
            return res.status(404).json({ message: "Negotiation not found" });
        }
        if (negotiation.status !== "ACCEPTED") {
            return res.status(400).json({ message: "Only accepted negotiations can create orders" });
        }
        const pricePerUnit = negotiation.agreedPrice;
        const quantity = negotiation.agreedQuantity;
        const totalAmount = pricePerUnit * quantity;
        const order = await Order_1.Order.create({
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
    }
    catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};
exports.createOrder = createOrder;
/**
 * GET /orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id)
            .populate("cropId", "name")
            .populate("buyerId", "fullName role")
            .populate("farmerId", "fullName role");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.json(order);
    }
    catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getOrderById = getOrderById;
/**
 * GET /orders/my
 */
const getMyOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let filter;
        if (req.user.role === "BUYER") {
            filter = { buyerId: req.user.id };
        }
        else if (req.user.role === "FARMER") {
            filter = { farmerId: req.user.id };
        }
        else {
            return res.status(403).json({ message: "Role not supported for this endpoint" });
        }
        const orders = await Order_1.Order.find(filter).sort({ createdAt: -1 });
        return res.json(orders);
    }
    catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getMyOrders = getMyOrders;
/**
 * PATCH /orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
    try {
        const newStatus = req.body.status;
        if (!newStatus) {
            return res.status(400).json({ message: "status is required" });
        }
        if (!ALLOWED_ORDER_STATUSES.includes(newStatus)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (req.user?.role !== "FARMER" || order.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        order.currentStatus = newStatus;
        order.status.push({ status: newStatus, timestamp: new Date() });
        await order.save();
        return res.json(order);
    }
    catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=orderController.js.map