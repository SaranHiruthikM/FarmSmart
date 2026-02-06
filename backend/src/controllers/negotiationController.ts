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

        if (
            negotiation.farmerId.toString() !== req.user!.id &&
            negotiation.buyerId.toString() !== req.user!.id
        ) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const isFarmer = negotiation.farmerId.toString() === req.user!.id;
        const offerBy = isFarmer ? "FARMER" : "BUYER";

        if (action === "ACCEPT") {
            negotiation.status = "ACCEPTED";
            // If accepting, we use the price/qty from the LAST offer, or the ones passed in?
            // Usually you accept the *other person's* offer.
            // But for simplicity, let's trust the body provided, or verify against last offer.
            //Ideally strict validation: if accepting, use last offer's details.
            const lastOffer = negotiation.offers[negotiation.offers.length - 1];
            negotiation.agreedPrice = lastOffer.pricePerUnit;
            negotiation.agreedQuantity = lastOffer.quantity;
        }

        if (action === "REJECT") {
            negotiation.status = "REJECTED";
        }

        if (action === "COUNTER") {
            negotiation.offers.push({
                by: offerBy,
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
