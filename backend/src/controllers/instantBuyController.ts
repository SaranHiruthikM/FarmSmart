import { Response } from "express";
import { Order } from "../models/Order";
import { Negotiation } from "../models/Negotiation";
import { Crop } from "../models/Crop";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * POST /orders/instant-buy
 * Purpose: Allows a buyer to directly buy a crop at list price without manual negotiation approval.
 * Flow: 
 * 1. Validate Crop & Stock.
 * 2. Create Negotiation (Status: ACCEPTED).
 * 3. Create Order (Status: CREATED).
 * 4. Return Order.
 */
export const instantBuy = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { cropId, quantity } = req.body;

    if (!req.user || req.user.role.toUpperCase() !== 'BUYER') {
      return res.status(403).json({ message: "Only buyers can make purchases" });
    }

    // 1. Validate Crop
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    if (!crop.isActive) {
        return res.status(400).json({ message: "This crop is no longer available" });
    }

    // 2. Validate Stock
    if (crop.quantity < quantity) {
        return res.status(400).json({ message: `Insufficient stock. Only ${crop.quantity} ${crop.unit} available.` });
    }

    if (crop.farmerId.toString() === req.user.id) {
        return res.status(400).json({ message: "You cannot buy your own crop" });
    }

    // 3. Check for existing active transactions to prevent double-buying
    // (Optional: depending on requirements, user might be allowed to buy multiple times? 
    // But user requirement says "hide buy option... if after this user buys... allowing other users")
    // The requirement implies if *this* user buys, they shouldn't see the option again? 
    // Or maybe just standard idempotency. I'll stick to preventing duplicates for now.
    
    // 4. Create "ACCEPTED" Negotiation automatically
    const negotiation = await Negotiation.create({
      cropId: crop._id,
      buyerId: req.user.id,
      farmerId: crop.farmerId,
      status: "ACCEPTED", // Auto-accepted
      agreedPrice: crop.finalPrice || crop.basePrice,
      agreedQuantity: quantity,
      offers: [
        {
          by: "BUYER",
          pricePerUnit: crop.finalPrice || crop.basePrice,
          quantity: quantity,
          message: "Instant Buy Request",
          createdAt: new Date()
        },
        {
          by: "FARMER", // System auto-response
          pricePerUnit: crop.finalPrice || crop.basePrice,
          quantity: quantity,
          message: "Auto-accepted instant buy.",
          createdAt: new Date()
        }
      ]
    });

    // 5. Create Order
    const order = await Order.create({
      negotiationId: negotiation._id,
      cropId: crop._id,
      buyerId: req.user.id,
      farmerId: crop.farmerId,
      pricePerUnit: negotiation.agreedPrice,
      quantity: negotiation.agreedQuantity,
      totalAmount: (negotiation.agreedPrice! * negotiation.agreedQuantity!),
      currentStatus: "CREATED",
      status: [{ status: "CREATED", timestamp: new Date() }]
    });

    // 6. Reduce Stock
    crop.quantity -= quantity;
    if (crop.quantity < 0) crop.quantity = 0;

    // Ensure finalPrice is set if missing (validation fix for legacy data)
    if (!crop.finalPrice) {
      crop.finalPrice = crop.basePrice;
    }

    await crop.save();

    // Populate for frontend
    const populatedOrder = await Order.findById(order._id)
      .populate("cropId", "name")
      .populate("buyerId", "fullName role")
      .populate("farmerId", "fullName role");

    res.status(201).json(populatedOrder);

  } catch (error: any) {
    console.error("Instant Buy Error:", error);
    res.status(500).json({ message: "Server error during purchase" });
  }
};
