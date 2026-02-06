"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const QualityRule_1 = require("../models/QualityRule");
dotenv_1.default.config();
const seedQualityRules = async () => {
    try {
        // Connect to database
        await mongoose_1.default.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/farmsmart');
        console.log('✓ Connected to MongoDB');
        // Clear existing quality rules
        await QualityRule_1.QualityRule.deleteMany({});
        console.log('✓ Cleared existing quality rules');
        // Insert quality rules
        const qualityRules = [
            { grade: "A", multiplier: 1.15, description: "Premium quality" },
            { grade: "B", multiplier: 1.0, description: "Standard quality" },
            { grade: "C", multiplier: 0.8, description: "Below average quality" }
        ];
        await QualityRule_1.QualityRule.insertMany(qualityRules);
        console.log('✓ Seeded quality rules:');
        qualityRules.forEach(rule => {
            console.log(`  - Grade ${rule.grade}: ${rule.multiplier}x (${rule.description})`);
        });
        // Disconnect
        await mongoose_1.default.disconnect();
        console.log('✓ Disconnected from MongoDB');
        console.log('\n✅ Quality rules seeded successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding quality rules:', error);
        process.exit(1);
    }
};
seedQualityRules();
//# sourceMappingURL=seedQualityRules.js.map