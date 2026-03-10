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
        const userState = user?.state;

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

/**
 * POST /schemes
 * Create Scheme (Admin)
 */
export const createScheme = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const scheme = await Scheme.create(req.body);
        res.status(201).json({ message: "Scheme created", scheme });
    } catch (error) {
        console.error("Create Scheme Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * PUT /schemes/:id
 * Update Scheme (Admin)
 */
export const updateScheme = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!scheme) return res.status(404).json({ message: "Scheme not found" });
        res.json({ message: "Scheme updated", scheme });
    } catch (error) {
        console.error("Update Scheme Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * DELETE /schemes/:id
 * Delete Scheme (Admin)
 */
export const deleteScheme = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const scheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!scheme) return res.status(404).json({ message: "Scheme not found" });
        res.json({ message: "Scheme deleted" });
    } catch (error) {
        console.error("Delete Scheme Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
