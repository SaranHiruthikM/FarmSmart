import { Request, Response } from "express";
import { Scheme } from "../models/Scheme";
import User from "../models/User";
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
 * Eligible schemes
 */
export const getEligibleSchemes = async (
    req: AuthRequest,
    res: Response
): Promise<any> => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = await User.findById(req.user.id);
        const userState = user?.location?.state;

        if (!userState) {
             // Return generic eligible schemes or empty if strict
             const allSchemes = await Scheme.find({});
             return res.json(allSchemes.map(s => ({
                 ...s.toObject(),
                 matchReason: "Available for all farmers"
             })));
        }

        const schemes = await Scheme.find({
            $or: [
                { applicableStates: userState },
                { applicableStates: { $size: 0 } }, // Empty array means all states
                { applicableStates: { $exists: false } }
            ]
        });

        const response = schemes.map(s => ({
            ...s.toObject(),
            matchReason: s.applicableStates?.includes(userState) 
                ? `Available in your state: ${userState}` 
                : "Available for all farmers"
        }));

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
