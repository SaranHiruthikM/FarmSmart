"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderStatusSchema = new mongoose_1.Schema({
    status: {
        type: String,
        required: true,
        enum: ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"],
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    negotiationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Negotiation",
        required: true,
        index: true,
    },
    cropId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Crop",
        required: true,
        index: true,
    },
    buyerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    farmerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    pricePerUnit: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: [OrderStatusSchema],
        required: true,
        default: [],
    },
    currentStatus: {
        type: String,
        required: true,
        enum: ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"],
        default: "CREATED",
    },
}, { timestamps: true });
exports.Order = (0, mongoose_1.model)("Order", OrderSchema);
//# sourceMappingURL=Order.js.map