"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceImpact = exports.evaluateQuality = void 0;
const QualityRule_1 = require("../models/QualityRule");
/**
 * POST /quality/evaluate
 * Validate grade & compute final price
 */
const evaluateQuality = async (req, res) => {
    const { grade, basePrice } = req.body;
    const rule = await QualityRule_1.QualityRule.findOne({ grade });
    if (!rule) {
        res.status(400).json({ message: "Invalid quality grade" });
        return;
    }
    const finalPrice = Number((basePrice * rule.multiplier).toFixed(2));
    res.json({
        grade,
        basePrice,
        multiplier: rule.multiplier,
        finalPrice,
        description: rule.description,
    });
};
exports.evaluateQuality = evaluateQuality;
/**
 * GET /quality/price-impact
 * Preview price impact for live updates
 */
const getPriceImpact = async (req, res) => {
    const { grade, basePrice } = req.query;
    const rule = await QualityRule_1.QualityRule.findOne({ grade });
    if (!rule) {
        res.status(400).json({ message: "Invalid grade" });
        return;
    }
    const finalPrice = Number((Number(basePrice) * rule.multiplier).toFixed(2));
    res.json({
        grade,
        basePrice: Number(basePrice),
        finalPrice,
    });
};
exports.getPriceImpact = getPriceImpact;
//# sourceMappingURL=qualityController.js.map