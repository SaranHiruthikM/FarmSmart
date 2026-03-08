import { Request, Response } from "express";
import { Negotiation } from "../models/Negotiation";
import { AuthRequest } from "../middleware/authMiddleware";
import { getIO } from "../socket";

import { Crop } from "../models/Crop";

/**
 * POST /negotiations/start
 */
export const startNegotiation = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { cropId, farmerId, pricePerUnit, quantity, message } = req.body;

        // 1. Only BUYER can start negotiation
        if (!req.user || req.user.role.toUpperCase() !== 'BUYER') {
            return res.status(403).json({ message: "Only buyers can start negotiations" });
        }

        if (req.user!.id === farmerId) {
             return res.status(400).json({ message: "You cannot negotiate with yourself" });
        }

        // 2. Validate Farmer owns the crop
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }
        if (crop.farmerId.toString() !== farmerId) {
            return res.status(400).json({ message: "Invalid farmer ID for this crop" }); 
        }

        // 3. Check for existing active negotiation for this crop
        const existingNegotiation = await Negotiation.findOne({
            cropId,
            buyerId: req.user.id,
            status: 'PENDING'
        });

        if (existingNegotiation) {
            return res.status(400).json({ 
                message: "You already have an active negotiation for this crop. Please wait for the farmer's response.",
                negotiationId: existingNegotiation._id 
            });
        }

        const negotiation = await Negotiation.create({
            cropId,
            buyerId: req.user!.id,
            farmerId,
            offers: [
                {
                    by: "BUYER",
                    pricePerUnit,
                    quantity,
                    message,
                },
            ],
        });

        try {
            const io = getIO();
            io.to(`user_${farmerId}`).emit('negotiation:new', negotiation);
        } catch (err) {
            console.error("Socket emit error:", err);
        }

        res.status(201).json(negotiation);
    } catch (error: any) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /negotiations/:id/respond
 */
export const respondToNegotiation = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { action, pricePerUnit, quantity, message } = req.body;

        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation)
            return res.status(404).json({ message: "Not found" });

        if (
            negotiation.farmerId.toString() !== req.user!.id &&
            negotiation.buyerId.toString() !== req.user!.id
        ) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const isFarmer = negotiation.farmerId.toString() === req.user!.id;
        const offerBy = isFarmer ? "FARMER" : "BUYER";
        const lastOffer = negotiation.offers[negotiation.offers.length - 1];

        // Enforce Turn-Based Negotiation
        if (lastOffer.by === "BUYER" && !isFarmer) {
            return res.status(403).json({ message: "Waiting for farmer to respond" }); 
        }
        if (lastOffer.by === "FARMER" && isFarmer) {
            return res.status(403).json({ message: "Waiting for buyer to respond" });
        }

        if (action === "ACCEPT") {
            if (!isFarmer) {
                return res.status(403).json({ message: "Only the farmer can accept the deal finalization." });
            }
            negotiation.status = "ACCEPTED";
            // If accepting, we use the price/qty from the LAST offer
            negotiation.agreedPrice = lastOffer.pricePerUnit;
            negotiation.agreedQuantity = lastOffer.quantity;
        }

        if (action === "REJECT") {
            negotiation.status = "REJECTED";
        }

        if (action === "COUNTER") {
            // Use provided quantity, or fallback to the last offer's quantity
            const finalQuantity = quantity !== undefined ? quantity : lastOffer.quantity;
            const finalMessage = message !== undefined ? message : ""; // Optional message

            negotiation.offers.push({
                by: offerBy,
                pricePerUnit,
                quantity: finalQuantity,
                message: finalMessage,
                createdAt: new Date(),
            });
        }

        await negotiation.save();

        const populatedNegotiation = await Negotiation.findById(negotiation._id)
            .populate("cropId", "name unit location")
            .populate("buyerId", "fullName phoneNumber")
            .populate("farmerId", "fullName phoneNumber");

        try {
            const io = getIO();
            // Ensure populatedNegotiation exists and has _id
            if (populatedNegotiation) {
                io.to(`negotiation_${populatedNegotiation._id}`).emit('negotiation:update', populatedNegotiation);
                // Use populated fields which contain objects with _id
                io.to(`user_${(populatedNegotiation.buyerId as any)._id}`).emit('negotiation:update', populatedNegotiation);
                io.to(`user_${(populatedNegotiation.farmerId as any)._id}`).emit('negotiation:update', populatedNegotiation);
            }
        } catch (err) {
            console.error("Socket emit error:", err);
        }

        res.json(populatedNegotiation);
    } catch (error: any) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /negotiations/my
 */
export const getMyNegotiations = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const filter =
            req.user!.role === "BUYER"
                ? { buyerId: req.user!.id }
                : { farmerId: req.user!.id };

        const negotiations = await Negotiation.find(filter)
            .populate("cropId", "name unit")
            .populate("buyerId", "fullName phoneNumber")
            .populate("farmerId", "fullName phoneNumber")
            .sort({ updatedAt: -1 });

        res.json(negotiations);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /negotiations/:id
 */
export const getNegotiationById = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const negotiation = await Negotiation.findById(req.params.id)
            .populate("cropId", "name location unit")
            .populate("buyerId farmerId", "fullName phoneNumber");

        if (!negotiation)
            return res.status(404).json({ message: "Not found" });

        res.json(negotiation);
    } catch (error: any) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: "Server error" });
    }
};
