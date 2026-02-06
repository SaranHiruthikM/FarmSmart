"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityRule = void 0;
const mongoose_1 = require("mongoose");
const QualityRuleSchema = new mongoose_1.Schema({
    grade: {
        type: String,
        enum: ["A", "B", "C"],
        required: true,
        unique: true,
    },
    multiplier: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});
exports.QualityRule = (0, mongoose_1.model)("QualityRule", QualityRuleSchema);
//# sourceMappingURL=QualityRule.js.map