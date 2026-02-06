import { Response } from "express";
import { Review } from "../models/Review";
import { Order } from "../models/Order";
import User  from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * POST /reviews
 * Create a new review for an order
 */
export const createReview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { orderId, rating, comment } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) return res.status(401).json({ message: "Unauthorized" });

    // validate input
    if (!orderId || !rating) {
      return res.status(400).json({ message: "Order ID and rating are required" });
    }

    // Verify order exists and user is part of it
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Determine target (The other party)
    let targetId;
    if (order.buyerId.toString() === reviewerId) {
      targetId = order.farmerId; // Buyer reviewing Farmer
    } else if (order.farmerId.toString() === reviewerId) {
      targetId = order.buyerId; // Farmer reviewing Buyer
    } else {
      return res.status(403).json({ message: "You are not a party to this order" });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId, reviewerId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this order" });
    }

    const review = await Review.create({
      orderId,
      reviewerId,
      targetId,
      rating,
      comment,
    });

    // --- Dynamic Rating Update ---
    // Recalculate average rating for the target user
    const stats = await Review.aggregate([
      { $match: { targetId: targetId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(targetId, {
        averageRating: parseFloat(stats[0].avgRating.toFixed(1)),
        reviewCount: stats[0].count
      });
    }
    // ----------------------------

    return res.status(201).json(review);
  } catch (error: any) {
      if (error.name === "ValidationError") {
          return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /reviews/user/:userId
 * Get reviews received by a specific user
 */
export const getUserReviews = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ targetId: userId })
      .populate("reviewerId", "fullName role")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /reviews/my
 * Get reviews received by the logged-in user
 */
export const getMyReputation = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const reviews = await Review.find({ targetId: userId })
            .populate("reviewerId", "fullName role")
            .sort({ createdAt: -1 });

        return res.json(reviews);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}
