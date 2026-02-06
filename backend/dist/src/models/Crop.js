"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crop = void 0;
const mongoose_1 = require("mongoose");
const CropSchema = new mongoose_1.Schema({
    farmerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
    variety: String,
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        enum: ["kg", "quintal", "ton"],
        required: true,
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    finalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    qualityGrade: {
        type: String,
        enum: ["A", "B", "C"],
        required: true,
    },
    location: {
        state: { type: String, required: true },
        district: { type: String, required: true },
        village: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
exports.Crop = (0, mongoose_1.model)("Crop", CropSchema);
//# sourceMappingURL=Crop.js.map