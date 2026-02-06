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
            raisedByRole: req.user!.role.toUpperCase(),
            reason,
            description,
        });

        res.status(201).json(dispute);
    } catch (error: any) {
        console.error("Error raising dispute:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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
        const userId = req.user!.id;
        
        // Find orders where user is the farmer to include disputes raised AGAINST them
        const myOrdersAsFarmer = await Order.find({ farmerId: userId }).select("_id");
        const orderIds = myOrdersAsFarmer.map(o => o._id);

        const disputes = await Dispute.find({
            $or: [
                { raisedBy: userId },
                { orderId: { $in: orderIds } }
            ]
        })
        .populate({
            path: "orderId",
            populate: [
                { path: "farmerId", select: "fullName" }, // To get Farmer Name
                { path: "buyerId", select: "fullName" }
            ]
        })
        .populate("raisedBy", "fullName role")
        .sort({ createdAt: -1 });

        res.json(disputes);
    } catch (error) {
        console.error(error);
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
            .populate({
                path: "orderId",
                populate: [
                    { path: "farmerId", select: "fullName" },
                    { path: "buyerId", select: "fullName" }
                ]
            })
            .populate("raisedBy", "fullName role");

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

/**
 * PATCH /disputes/:id/resolve
 * Allows Farmer to resolve the dispute
 */
export const resolveDispute = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user!.id;
        const dispute = await Dispute.findById(req.params.id).populate("orderId");
        
        if (!dispute) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        // Check if user is the farmer of the order
        const order = dispute.orderId as any; // Type assertion since it is populated
        if (order.farmerId.toString() !== userId) {
            return res.status(403).json({ message: "Only the farmer responsible for this order can resolve this dispute." });
        }

        dispute.status = "RESOLVED";
        // Optionally add a system remark or farmer remark if schema supported it
        
        await dispute.save();
        res.json(dispute);
    } catch (error) {
        console.error("Error resolving dispute:", error);
        res.status(500).json({ message: "Server error" });
    }
};
