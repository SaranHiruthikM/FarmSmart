import { Response } from "express";
import { Review } from "../models/Review";
import { Order } from "../models/Order";
import User  from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { Types } from "mongoose";

/**
 * POST /reviews
 * Create a new review for an order
 */
export const createReview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { orderId, targetId: explicitTargetId, rating, comment } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) return res.status(401).json({ message: "Unauthorized" });

    // Verify KYC status from DB
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || reviewer.kycStatus !== 'APPROVED') {
        return res.status(403).json({ message: "Only verified users can leave reviews." });
    }

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    let targetId = explicitTargetId;
    let finalOrderId = orderId;

    // SCENARIO 1: Review via Order (Verified Purchase)
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Infer target from order
      if (order.buyerId.toString() === reviewerId) {
        targetId = order.farmerId;
      } else if (order.farmerId.toString() === reviewerId) {
        targetId = order.buyerId;
      } else {
        return res.status(403).json({ message: "You are not a party to this order" });
      }

      // Check for duplicate on this order
      const existingReview = await Review.findOne({ orderId, reviewerId });
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this order" });
      }
    } 
    // SCENARIO 2: Direct Seller Review (No Order Linked)
    else {
      if (!targetId) {
        return res.status(400).json({ message: "Target user ID is required for direct reviews" });
      }
      
      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }
    }

    const review = await Review.create({
      orderId: finalOrderId,
      reviewerId,
      targetId,
      rating,
      comment,
    });

    // --- Dynamic Rating Update ---
    // Recalculate average rating for the target user
    const stats = await Review.aggregate([
      { $match: { targetId: new Types.ObjectId(targetId.toString()) } }, // Explicit casting for aggregation
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
      console.error("Review creation failed:", error); 
      
      if (error.name === "ValidationError" || error.name === "CastError") {
          return res.status(400).json({ message: error.message });
      }
      if (error.code === 11000) {
          return res.status(400).json({ message: "You have already reviewed this entity" });
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
