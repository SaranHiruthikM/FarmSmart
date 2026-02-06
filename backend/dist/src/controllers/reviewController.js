"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReviews = exports.addReview = void 0;
const mongoose_1 = require("mongoose");
const Review_1 = require("../models/Review");
const Order_1 = require("../models/Order");
const addReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { orderId, rating, comment } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }
        if (rating === undefined || rating === null) {
            return res.status(400).json({ message: "rating is required" });
        }
        const parsedRating = typeof rating === "number" ? rating : Number(rating);
        if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: "rating must be a number between 1 and 5" });
        }
        if (comment !== undefined && typeof comment !== "string") {
            return res.status(400).json({ message: "comment must be a string" });
        }
        if (typeof comment === "string" && comment.length > 500) {
            return res.status(400).json({ message: "comment must not exceed 500 characters" });
        }
        const order = await Order_1.Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.currentStatus !== "COMPLETED") {
            return res.status(400).json({ message: "Only completed orders can be reviewed" });
        }
        let revieweeId;
        if (req.user.id === order.buyerId.toString()) {
            revieweeId = order.farmerId;
        }
        else if (req.user.id === order.farmerId.toString()) {
            revieweeId = order.buyerId;
        }
        else {
            return res.status(403).json({ message: "Forbidden: user is not part of this order" });
        }
        const review = await Review_1.Review.create({
            orderId,
            reviewerId: req.user.id,
            revieweeId,
            rating: parsedRating,
            comment,
        });
        return res.status(201).json(review);
    }
    catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Review already exists for this order" });
        }
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};
exports.addReview = addReview;
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        if (typeof userId !== "string" || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }
        const reviews = await Review_1.Review.find({ revieweeId: userId })
            .sort({ createdAt: -1 })
            .populate("reviewerId", "fullName role");
        const count = reviews.length;
        const averageRating = count === 0
            ? 0
            : Number((reviews.reduce((sum, review) => sum + review.rating, 0) / count).toFixed(1));
        return res.status(200).json({
            userId,
            averageRating,
            count,
            reviews,
        });
    }
    catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getUserReviews = getUserReviews;
//# sourceMappingURL=reviewController.js.map