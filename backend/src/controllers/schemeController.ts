import { Request, Response } from "express";
import { Scheme } from "../models/Scheme";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * GET /schemes
 * List schemes
 */
import { getAiSchemeRecommendation } from "../services/schemeMatcherService";

export const getSchemes = async (req: Request, res: Response): Promise<any> => {
    try {
        const { crop, state } = req.query as { crop?: string; state?: string };
        let query: any = {};

        if (crop) {
            // 1. Try exact database match first
            query.triggerCrops = { $in: [new RegExp(crop as string, "i")] };
        }

        if (state) {
            query.$or = [
                { applicableStates: state },
                { applicableStates: { $size: 0 } },
                { applicableStates: { $exists: false } }
            ];
        }

        let schemes = await Scheme.find(query);

        // 2. If no direct match for crop, use AI to find the best relevant scheme
        if (crop && schemes.length === 0) {
            const allSchemes = await Scheme.find({}); // Get context for AI
            const aiSuggestion = await getAiSchemeRecommendation(crop, state || "India", allSchemes);

            if (aiSuggestion && aiSuggestion.matchFound) {
                return res.json([{
                    name: aiSuggestion.schemeName,
                    description: aiSuggestion.buddyTip,
                    isAiSuggestion: true,
                    applyLink: aiSuggestion.applyLink || "https://www.india.gov.in/topics/agriculture"
                }]);
            }
        }

        res.json(schemes);
    } catch (error) {
        console.error("Fetch Schemes Error:", error);
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
