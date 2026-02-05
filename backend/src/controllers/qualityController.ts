import { Request, Response } from "express";
import { QualityRule } from "../models/QualityRule";

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
