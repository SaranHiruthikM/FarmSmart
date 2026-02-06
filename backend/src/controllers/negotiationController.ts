import { Request, Response } from "express";
import { Negotiation } from "../models/Negotiation";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * POST /negotiations/start
 */
export const startNegotiation = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { cropId, farmerId, pricePerUnit, quantity, message } = req.body;

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

        if (negotiation.farmerId.toString() !== req.user!.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (action === "ACCEPT") {
            negotiation.status = "ACCEPTED";
            negotiation.agreedPrice = pricePerUnit;
            negotiation.agreedQuantity = quantity;
        }

        if (action === "REJECT") {
            negotiation.status = "REJECTED";
        }

        if (action === "COUNTER") {
            negotiation.offers.push({
                by: "FARMER",
                pricePerUnit,
                quantity,
                message,
                createdAt: new Date(),
            });
        }

        await negotiation.save();
        res.json(negotiation);
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
            .populate("cropId", "name")
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
            .populate("cropId", "name location")
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
