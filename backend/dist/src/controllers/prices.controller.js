"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentPrices = getCurrentPrices;
exports.getPriceHistory = getPriceHistory;
exports.comparePrices = comparePrices;
const priceService_1 = require("../services/priceService");
const priceService = (0, priceService_1.createPriceService)();
async function getCurrentPrices(req, res) {
    const crop = String(req.query.crop ?? "").trim();
    if (!crop) {
        return res.status(400).json({ error: "crop query parameter is required." });
    }
    const data = await priceService.getCurrentPrices(crop);
    return res.status(200).json(data);
}
async function getPriceHistory(req, res) {
    const crop = String(req.query.crop ?? "").trim();
    const location = String(req.query.location ?? "").trim();
    if (!crop) {
        return res.status(400).json({ error: "crop query parameter is required." });
    }
    if (!location) {
        return res.status(400).json({ error: "location query parameter is required." });
    }
    const data = await priceService.getPriceHistory(crop, location);
    return res.status(200).json(data);
}
async function comparePrices(req, res) {
    const crop = String(req.query.crop ?? "").trim();
    const location = String(req.query.location ?? "").trim();
    if (!crop) {
        return res.status(400).json({ error: "crop query parameter is required." });
    }
    if (!location) {
        return res.status(400).json({ error: "location query parameter is required." });
    }
    const data = await priceService.comparePrices(crop, location);
    return res.status(200).json(data);
}
//# sourceMappingURL=prices.controller.js.map