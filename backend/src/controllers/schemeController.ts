import { Request, Response } from "express";
import { Scheme } from "../models/Scheme";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * GET /schemes
 * List schemes
 */
export const getSchemes = async (_: Request, res: Response): Promise<any> => {
    try {
        const schemes = await Scheme.find();
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /schemes/eligible
 * Eligible schemes (Mock logic)
 */
export const getEligibleSchemes = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        const userState = (req.user as any).state;

        const schemes = await Scheme.find({
            applicableStates: userState,
        });

        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
