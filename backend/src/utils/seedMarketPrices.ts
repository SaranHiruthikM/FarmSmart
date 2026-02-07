import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MarketPrice } from '../models/MarketPrice';

dotenv.config();

const seedMarketPrices = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('✓ Connected to MongoDB');

        // Clear existing prices
        await MarketPrice.deleteMany({});
        console.log('✓ Cleared existing market prices');

        const crops = ["Tomato", "Rice", "Onion", "Potato", "Wheat"];
        const mandis = [
            { name: "Coimbatore Market", district: "Coimbatore", state: "Tamil Nadu" },
            { name: "Pollachi Mandi", district: "Coimbatore", state: "Tamil Nadu" },
            { name: "Mettupalayam Mandi", district: "Coimbatore", state: "Tamil Nadu" },
            { name: "Madurai Integrated Market", district: "Madurai", state: "Tamil Nadu" },
            { name: "Dindigul Market", district: "Dindigul", state: "Tamil Nadu" }
        ];

        const pricesToInsert = [];
        const today = new Date();

        // 1. Generate HISTORICAL Data (Last 30 days)
        console.log('Generating historical data...');
        for (const crop of crops) {
            // Base price varies by crop
            let basePrice = crop === 'Tomato' ? 20 : crop === 'Rice' ? 45 : 30;
            
            for (let i = 30; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                // Add some random fluctuation
                const dailyFluctuation = (Math.random() - 0.5) * 5; 
                const price = Math.max(10, Math.round((basePrice + dailyFluctuation) * 100) / 100);

                // Use the main mandi for history
                pricesToInsert.push({
                    crop: crop,
                    mandi: "Coimbatore Market",
                    location: { state: "Tamil Nadu", district: "Coimbatore" },
                    pricePerKg: price,
                    date: date
                });
            }
        }

        // 2. Generate TODAY'S Comparison Data (Different Mandis)
        console.log('Generating current market comparison data...');
        for (const crop of crops) {
            let basePrice = crop === 'Tomato' ? 22 : crop === 'Rice' ? 48 : 32;

            for (const mandi of mandis) {
                // Each mandi has slightly different price today
                const mandiVariance = (Math.random() - 0.5) * 4;
                const price = Math.max(10, Math.round((basePrice + mandiVariance) * 100) / 100);

                // Ensure we don't duplicate the "today" entry we added in history loop for Coimbatore Market
                // Actually, duplicate is fine, find() often returns multiple, but let's be clean.
                // For simplicity, we just push these as "current" readings.
                
                const date = new Date(today); // Today
                
                pricesToInsert.push({
                    crop: crop,
                    mandi: mandi.name,
                    location: { state: mandi.state, district: mandi.district },
                    pricePerKg: price,
                    date: date
                });
            }
        }

        await MarketPrice.insertMany(pricesToInsert);
        console.log(`✓ Successfully inserted ${pricesToInsert.length} price records`);

        await mongoose.disconnect();
        console.log('✓ Disconnected');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding market prices:', error);
        process.exit(1);
    }
};

seedMarketPrices();
