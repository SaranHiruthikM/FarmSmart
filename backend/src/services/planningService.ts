import { getPricePrediction } from './predictionService';

interface CropProfile {
    name: string;
    suitableSoilTypes: string[]; // e.g., ["Loamy", "Clay", "Sandy"]
    sowingMonths: number[];      // 0-11 (Jan-Dec)
    durationDays: number;
    avgYieldKgPerAcre: number;
    costPerAcre: number;
}

// Mock Database of verified crop profiles
const CROP_DATA: CropProfile[] = [
    {
        name: "Onion",
        suitableSoilTypes: ["Loamy", "Sandy Loam", "Clay Loam"],
        sowingMonths: [8, 9, 10, 0, 1], // Sep-Nov (Rabi), Jan-Feb
        durationDays: 120, // 4 months
        avgYieldKgPerAcre: 8000,
        costPerAcre: 40000 
    },
    {
        name: "Potato",
        suitableSoilTypes: ["Sandy Loam", "Loamy"],
        sowingMonths: [9, 10, 11], // Oct-Dec
        durationDays: 90, // 3 months
        avgYieldKgPerAcre: 10000,
        costPerAcre: 45000
    },
    {
        name: "Tomato",
        suitableSoilTypes: ["Loamy", "Sandy Loam", "Black"],
        sowingMonths: [5, 6, 10, 11], // Jun-Jul, Nov-Dec
        durationDays: 100,
        avgYieldKgPerAcre: 12000,
        costPerAcre: 50000
    },
    {
        name: "Rice",
        suitableSoilTypes: ["Clay", "Clay Loam"],
        sowingMonths: [5, 6], // Jun-Jul
        durationDays: 150,
        avgYieldKgPerAcre: 2500,
        costPerAcre: 25000
    },
    {
        name: "Wheat",
        suitableSoilTypes: ["Loamy", "Clay Loam"],
        sowingMonths: [10, 11], // Nov-Dec
        durationDays: 140,
        avgYieldKgPerAcre: 2000,
        costPerAcre: 18000
    }
];

export const getSeasonPlan = async (landSize: number, soilType: string, district: string, dateStr?: string) => {
    const today = dateStr ? new Date(dateStr) : new Date();
    const currentMonth = today.getMonth(); // 0-11
    
    // 1. Filter Suitable Crops for Current Season & Soil
    const suitableCrops = CROP_DATA.filter(crop => 
        crop.suitableSoilTypes.some(t => t.toLowerCase().includes(soilType.toLowerCase())) &&
        crop.sowingMonths.includes(currentMonth)
    );

    if (suitableCrops.length === 0) {
        return [];
    }

    const recommendations = [];

    // 2. Predict Profits for Each
    for (const crop of suitableCrops) {
        const harvestDate = new Date(today);
        harvestDate.setDate(harvestDate.getDate() + crop.durationDays);
        
        const harvestYear = harvestDate.getFullYear();
        const harvestMonth = harvestDate.getMonth() + 1; // 1-12 for generic usage, ML usually expects 1-12

        // Call ML Price Prediction
        // Note: passing 0 as currentPrice since it's not strictly needed for this ML model (as per script analysis)
        // or fetches internal default if handled
        const prediction = await getPricePrediction(crop.name, district, 0, harvestYear, harvestMonth);

        let predictedPrice = 0;
        
        if (prediction && prediction.predicted_price) {
            predictedPrice = prediction.predicted_price;
        } else {
             // Fallback or skip if prediction fails
             console.warn(`Could not predict price for ${crop.name}, skipping recommendation.`);
             continue; 
        }

        // 3. Calculate Financials
        const totalYield = crop.avgYieldKgPerAcre * landSize;
        const revenue = totalYield * predictedPrice;
        const totalCost = crop.costPerAcre * landSize;
        const profit = revenue - totalCost;

        recommendations.push({
            crop: crop.name,
            sowingDate: today.toISOString().split('T')[0],
            harvestDate: harvestDate.toISOString().split('T')[0],
            durationDays: crop.durationDays,
            predictedPrice: predictedPrice.toFixed(2),
            estimatedYield: totalYield,
            totalCost: totalCost,
            expectedRevenue: revenue,
            estimatedProfit: profit,
            message: `Plant ${crop.name} now. Predicted profit: ₹${profit.toLocaleString('en-IN')}/${landSize} acre(s) in ~${Math.round(crop.durationDays/30)} months.`
        });
    }

    // 4. Sort by highest profit
    recommendations.sort((a, b) => b.estimatedProfit - a.estimatedProfit);

    return recommendations;
};
