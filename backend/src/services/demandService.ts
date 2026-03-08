import { Negotiation } from '../models/Negotiation';
import { Crop } from '../models/Crop';
import Groq from 'groq-sdk';

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MODEL_NAME = "llama-3.3-70b-versatile";

export const getDemandAnalysis = async (cropName: string, location: string) => {
    // 1. Search for crops with this name in the DB
    const cropsFilter: any = { name: new RegExp(cropName, "i") };
    const crops = await Crop.find(cropsFilter);
    const cropIds = crops.map(c => c._id);
    const totalSupply = crops.reduce((sum, c) => sum + c.quantity, 0);

    // 2. Count active negotiations for this crop
    const activeNegotiations = await Negotiation.countDocuments({
        cropId: { $in: cropIds },
        status: 'PENDING'
    });

    const totalNegotiations = await Negotiation.countDocuments({
        cropId: { $in: cropIds }
    });

    // 3. Determine Demand Level heuristics
    let demandLevel = 'Low';

    if (activeNegotiations > 10 || (activeNegotiations > 0 && activeNegotiations >= crops.length * 2)) {
        demandLevel = 'High';
    } else if (activeNegotiations > 0 || totalNegotiations > 0) {
        demandLevel = 'Medium';
    }

    // Default Fallback values
    let explanation = `There are currently ${activeNegotiations} active buyer bids for the ${totalSupply}kg of available supply in the market.`;
    let sellRecommendation = {
        action: demandLevel === 'High' ? 'Sell Now' : 'Wait',
        reason: 'Based on current buyer activity in your region.',
        trend: demandLevel === 'High' ? 'up' : demandLevel === 'Low' ? 'down' : 'steady'
    };

    const groq = getGroq();
    if (groq) {
        try {
            const prompt = `
            You are an expert AI agriculture advisor for Indian farmers.
            Analyze this market data and provide a concise JSON response.
            
            Crop: ${cropName}
            Location: ${location}
            Active Buyers: ${activeNegotiations}
            Total Farmers Listing: ${crops.length}
            Total Supply: ${totalSupply} kg
            Computed demand: ${demandLevel}
            
            Explain the demand in 1-2 sentences. 
            Recommend 'Sell Now' or 'Wait' with a reason and trend ('up', 'down', 'steady').
            
            Return strictly valid JSON:
            {
                "explanation": "...",
                "sellRecommendation": {
                    "action": "...",
                    "reason": "...",
                    "trend": "..."
                }
            }
            `;

            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: MODEL_NAME,
                response_format: { type: "json_object" }
            });

            const aiData = JSON.parse(completion.choices[0].message.content || '{}');

            if (aiData.explanation) explanation = aiData.explanation;
            if (aiData.sellRecommendation) sellRecommendation = aiData.sellRecommendation;
        } catch (error) {
            console.error('[DemandService] Groq API Error (Forecast):', error);
        }
    }

    return {
        demandLevel,
        activeBuyers: activeNegotiations,
        totalSupply,
        explanation,
        sellRecommendation
    };
};

export const getCropRecommendations = async (location: string) => {
    const defaultRecs = [
        { name: 'Tomato', reason: 'High local demand currently', suitability: '85%' },
        { name: 'Onion', reason: 'Seasonal staple crop', suitability: '70%' },
        { name: 'Potato', reason: 'Consistent pricing', suitability: '75%' }
    ];

    const groq = getGroq();
    if (!groq) return defaultRecs;

    try {
        const prompt = `
        You are an AI agriculture expert in India. 
        Give 3 best crop recommendations to plant right now in the district of ${location}.
        
        Return strictly valid JSON:
        {
            "recommendations": [
                {
                    "name": "Crop Name",
                    "reason": "Actionable reason why",
                    "suitability": "95%"
                }
            ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
            response_format: { type: "json_object" }
        });

        const res = JSON.parse(completion.choices[0].message.content || '{}');
        return res.recommendations || defaultRecs;
    } catch (e) {
        console.error('[DemandService] Groq API Error (Recommendations):', e);
        return defaultRecs;
    }
}
