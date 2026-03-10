import mongoose from "mongoose";
import dotenv from "dotenv";
import { Scheme } from "../models/Scheme";
import { Advisory } from "../models/Advisory";

dotenv.config();

const schemesData = [
    {
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
        benefits: [
            "Financial support for crop loss",
            "Stabilizes income",
            "Encourages innovative practices"
        ],
        applyLink: "https://pmfby.gov.in/",
        eligibilityCriteria: "Farmers with crops in notified areas",
        applicableStates: [], // All
        triggerCrops: ["Rice", "Wheat", "Maize", "Groundnut"]
    },
    {
        name: "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
        description: "Scheme to improve on-farm water use efficiency through a focused approach.",
        benefits: [
            "Expand cultivable area",
            "Improve water use efficiency",
            "Enhance recharge of aquifers"
        ],
        applyLink: "https://pmksy.gov.in/",
        eligibilityCriteria: "Farmers with cultivable land",
        applicableStates: [], // All
        triggerCrops: ["Sugarcane", "Cotton", "Banana"]
    },
    {
        name: "Soil Health Card Scheme",
        description: "Government is issuing Soil Health Cards to farmers which will carry crop-wise recommendations of nutrients and fertilizers.",
        benefits: [
            "Check soil health status",
            "Optimize fertilizer usage",
            "Increase crop yield"
        ],
        applyLink: "https://soilhealth.dac.gov.in/",
        eligibilityCriteria: "All farmers",
        applicableStates: ["Punjab", "Haryana", "Tamil Nadu"],
        triggerCrops: ["Tomato", "Onion", "Potato"]
    },
    {
        name: "PMFME Turmeric Processing Subsidy",
        description: "Under the PM-Formalisation of Micro Food Processing Enterprises (PMFME), Turmeric processing gets a 35% credit-linked subsidy.",
        benefits: [
            "35% credit-linked capital subsidy",
            "Max subsidy of ₹10 Lakh",
            "Seed capital for SHGs"
        ],
        applyLink: "https://pmfme.mofpi.gov.in/",
        eligibilityCriteria: "Micro-enterprises, SHGs, FPOs",
        applicableStates: [],
        triggerCrops: ["Turmeric", "Spices"]
    }
];

const advisoryData = [
    {
        type: "tip",
        title: "Pest Control for Wheat",
        content: "Monitor for aphids regularly. Use neem oil spray if infestation is low.",
        crop: "Wheat"
    },
    {
        type: "weather",
        title: "Heavy Rainfall Alert",
        content: "Expect heavy rainfall in the next 48 hours. Ensure proper drainage in fields.",
    },
    {
        type: "seasonal",
        title: "Winter Sowing",
        content: "Optimal time for sowing rabi crops like mustard and gram.",
    }
];

export const seedSchemesAndAdvisory = async () => {
    try {
        console.log("Seeding Schemes and Advisory...");

        // Clear existing
        await Scheme.deleteMany({});
        await Advisory.deleteMany({});

        // Insert
        await Scheme.insertMany(schemesData);
        await Advisory.insertMany(advisoryData);

        console.log("Schemes and Advisory seeded successfully");
    } catch (error) {
        console.error("Error seeding schemes:", error);
    }
};

if (require.main === module) {
    const runSeed = async () => {
        try {
            await mongoose.connect(process.env.DATABASE_URL as string);
            console.log("✓ Connected to MongoDB");
            await seedSchemesAndAdvisory();
            await mongoose.disconnect();
            console.log("✓ Disconnected");
            process.exit(0);
        } catch (error) {
            console.error("Error seeding schemes:", error);
            process.exit(1);
        }
    };
    runSeed();
}
