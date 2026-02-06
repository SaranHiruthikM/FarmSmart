import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { QualityRule } from '../models/QualityRule';

dotenv.config();

const seedQualityRules = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/farmsmart');
        console.log('✓ Connected to MongoDB');

        // Clear existing quality rules
        await QualityRule.deleteMany({});
        console.log('✓ Cleared existing quality rules');

        // Insert quality rules
        const qualityRules = [
            { grade: "A", multiplier: 1.15, description: "Premium quality" },
            { grade: "B", multiplier: 1.0, description: "Standard quality" },
            { grade: "C", multiplier: 0.8, description: "Below average quality" }
        ];

        await QualityRule.insertMany(qualityRules);
        console.log('✓ Seeded quality rules:');
        qualityRules.forEach(rule => {
            console.log(`  - Grade ${rule.grade}: ${rule.multiplier}x (${rule.description})`);
        });

        // Disconnect
        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
        console.log('\n✅ Quality rules seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding quality rules:', error);
        process.exit(1);
    }
};

seedQualityRules();
