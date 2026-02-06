"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCrops = exports.getCropById = exports.listCrops = exports.updateQuantity = exports.deleteCrop = exports.updateCrop = exports.createCrop = void 0;
const Crop_1 = require("../models/Crop");
/**
 * POST /crops
 */
const createCrop = async (req, res) => {
    try {
        const crop = await Crop_1.Crop.create({
            ...req.body,
            farmerId: req.user.id,
        });
        res.status(201).json(crop);
    }
    catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};
exports.createCrop = createCrop;
/**
 * PUT /crops/:id
 */
const updateCrop = async (req, res) => {
    try {
        const crop = await Crop_1.Crop.findOneAndUpdate({ _id: req.params.id, farmerId: req.user.id }, req.body, { new: true, runValidators: true });
        if (!crop)
            return res.status(404).json({ message: "Crop not found" });
        res.json(crop);
    }
    catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateCrop = updateCrop;
/**
 * DELETE /crops/:id
 */
const deleteCrop = async (req, res) => {
    try {
        const crop = await Crop_1.Crop.findOneAndDelete({
            _id: req.params.id,
            farmerId: req.user.id,
        });
        if (!crop)
            return res.status(404).json({ message: "Crop not found" });
        res.json({ message: "Crop deleted" });
    }
    catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteCrop = deleteCrop;
/**
 * PATCH /crops/:id/quantity
 */
const updateQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity === undefined || quantity === null) {
            return res.status(400).json({ message: "Quantity is required" });
        }
        const crop = await Crop_1.Crop.findOneAndUpdate({ _id: req.params.id, farmerId: req.user.id }, { quantity }, { new: true, runValidators: true });
        if (!crop)
            return res.status(404).json({ message: "Crop not found" });
        res.json(crop);
    }
    catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateQuantity = updateQuantity;
/**
 * GET /crops
 */
const listCrops = async (req, res) => {
    try {
        const { name, state, district } = req.query;
        const filter = { isActive: true };
        if (name)
            filter.name = new RegExp(name, "i");
        if (state)
            filter["location.state"] = new RegExp(state, "i");
        if (district)
            filter["location.district"] = new RegExp(district, "i");
        const crops = await Crop_1.Crop.find(filter)
            .sort({ createdAt: -1 })
            .populate("farmerId", "fullName phoneNumber");
        res.json(crops);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.listCrops = listCrops;
/**
 * GET /crops/:id
 */
const getCropById = async (req, res) => {
    try {
        const crop = await Crop_1.Crop.findById(req.params.id)
            .populate("farmerId", "fullName phoneNumber");
        if (!crop)
            return res.status(404).json({ message: "Crop not found" });
        res.json(crop);
    }
    catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: "Server error" });
    }
};
exports.getCropById = getCropById;
/**
 * GET /crops/my
 */
const myCrops = async (req, res) => {
    try {
        const crops = await Crop_1.Crop.find({ farmerId: req.user.id });
        res.json(crops);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.myCrops = myCrops;
//# sourceMappingURL=cropController.js.map