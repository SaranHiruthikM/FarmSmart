import { Request, Response } from "express";
import { Advisory } from "../models/Advisory";

/**
 * GET /advisory
 * Advisory feed
 */
export const getAdvisories = async (_: Request, res: Response): Promise<any> => {
    try {
        const advisories = await Advisory.find({
            $or: [
                { isScheduled: false },
                { isScheduled: { $exists: false } },
                { scheduledDate: { $lte: new Date() } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(advisories);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /advisory/admin/all
 * All advisories including scheduled (Admin)
 */
export const getAllAdvisories = async (_: Request, res: Response): Promise<any> => {
    try {
        const advisories = await Advisory.find()
            .sort({ createdAt: -1 });
        res.json(advisories);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /advisory
 * Create advisory (Admin)
 */
export const createAdvisory = async (req: Request, res: Response): Promise<any> => {
    try {
        const advisory = await Advisory.create(req.body);
        res.status(201).json({ message: "Advisory created", advisory });
    } catch (error) {
        console.error("Create Advisory Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
