import { Request, Response } from "express";
import { QualityRule } from "../models/QualityRule";
import { analyzeCropQuality } from "../services/visionService";

/**
 * POST /quality/analyze
 * Analyze image and return crop quality analysis + price info
 */
export const analyzeImageQuality = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No image file uploaded" });
            return;
        }

        const analysis = await analyzeCropQuality(req.file.buffer, req.file.mimetype);

        // Fetch Rule for the detected grade
        const rule = await QualityRule.findOne({ grade: analysis.grade });

        res.json({
            ...analysis,
            impact: rule ? {
                originalPrice: "Base Price",
                multiplier: rule.multiplier,
                qualityStandard: rule.description
            } : null,
            suggestedAction: rule?.grade === 'C' ? 'Sell quickly or discount due to quality' : 'Premium listing recommended'
        });
    } catch (error) {
        console.error("Error analyzing image:", error);
        res.status(500).json({ message: "Failed to analyze image quality" });
    }
};

/**
 * POST /quality/evaluate
 * Validate grade & compute final price
 */
export const evaluateQuality = async (req: Request, res: Response): Promise<void> => {
    const { grade, basePrice } = req.body;

    const rule = await QualityRule.findOne({ grade });
    if (!rule) {
        res.status(400).json({ message: "Invalid quality grade" });
        return;
    }

    const finalPrice = Number(
        (basePrice * rule.multiplier).toFixed(2)
    );

    res.json({
        grade,
        basePrice,
        multiplier: rule.multiplier,
        finalPrice,
        description: rule.description,
    });
};

/**
 * GET /quality/price-impact
 * Preview price impact for live updates
 */
export const getPriceImpact = async (req: Request, res: Response): Promise<void> => {
    const { grade, basePrice } = req.query;

    const rule = await QualityRule.findOne({ grade });
    if (!rule) {
        res.status(400).json({ message: "Invalid grade" });
        return;
    }

    const finalPrice = Number(
        (Number(basePrice) * rule.multiplier).toFixed(2)
    );

    res.json({
        grade,
        basePrice: Number(basePrice),
        finalPrice,
    });
};
