import { Request, Response } from "express";
import { Advisory } from "../models/Advisory";

/**
 * GET /advisory
 * Advisory feed
 */
export const getAdvisories = async (_: Request, res: Response): Promise<any> => {
    try {
        const advisories = await Advisory.find()
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(advisories);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
