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

/**
 * GET /quality
 * Get all quality rules (Admin/Public)
 */
export const getQualityRules = async (req: Request, res: Response): Promise<void> => {
    try {
        let rules = await QualityRule.find();
        
        // Auto-seed default rules if database is completely empty
        if (rules.length === 0) {
            const defaultRules = [
                { grade: "A", multiplier: 1.5, description: "Export quality, premium size, minimal moisture.", minSize: 80, maxMoisture: 10 },
                { grade: "B", multiplier: 1.0, description: "Standard market quality, average size, normal moisture.", minSize: 50, maxMoisture: 14 },
                { grade: "C", multiplier: 0.7, description: "Lower grade, smaller size or higher moisture. Good for processing.", minSize: 0, maxMoisture: 20 },
            ];
            
            await QualityRule.insertMany(defaultRules);
            rules = await QualityRule.find();
        }

        res.json(rules);
    } catch (error) {
        console.error("Get Quality Rules Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * PUT /quality/:id
 * Update a quality rule (Admin)
 */
export const updateQualityRule = async (req: Request, res: Response): Promise<void> => {
    try {
        const rule = await QualityRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rule) {
            res.status(404).json({ message: "Rule not found" });
            return;
        }
        res.json({ message: "Quality rule updated", rule });
    } catch (error) {
        console.error("Update Quality Rule Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
