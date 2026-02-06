import { Response } from "express";
import { Dispute } from "../models/Dispute";
import { AuthRequest } from "../middleware/authMiddleware";
import { Order } from "../models/Order";

/**
 * POST /disputes
 */
export const raiseDispute = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { orderId, reason, description } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const dispute = await Dispute.create({
            orderId,
            raisedBy: req.user!.id,
            raisedByRole: req.user!.role,
            reason,
            description,
        });

        res.status(201).json(dispute);
    } catch (error: any) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /disputes/my
 */
export const getMyDisputes = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const disputes = await Dispute.find({
            raisedBy: req.user!.id,
        }).sort({ createdAt: -1 });

        res.json(disputes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /disputes/:id
 */
export const getDisputeById = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const dispute = await Dispute.findById(req.params.id)
            .populate("orderId");

        if (!dispute) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        res.json(dispute);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /admin/disputes
 */
export const getAllDisputes = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const disputes = await Dispute.find()
            .populate("orderId")
            .populate("raisedBy", "fullName role")
            .sort({ createdAt: -1 });

        res.json(disputes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * PATCH /admin/disputes/:id
 */
export const updateDisputeStatus = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const { status, adminRemark } = req.body;

        const dispute = await Dispute.findById(req.params.id);
        if (!dispute) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        dispute.status = status;
        dispute.adminRemark = adminRemark;

        await dispute.save();
        res.json(dispute);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
