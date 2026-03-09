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
            }, { timeout: 15000 }); // 15 second timeout

            console.log(`[DemandService] AI Demand response received for ${cropName}`);
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

// Smart fallback recommendations — crop-aware so they don't always say Tomato/Onion/Potato
const CROP_ROTATION_FALLBACK: Record<string, Array<{ name: string; reason: string; suitability: string }>> = {
    tomato: [{ name: 'Onion', reason: 'Tomato and onion share compatible soil conditions and rotation cycle', suitability: '82%' }, { name: 'Beans', reason: 'Legumes fix nitrogen after tomato harvest, improving soil', suitability: '78%' }, { name: 'Cabbage', reason: 'Cole crops grow well in post-tomato soil with proper pH', suitability: '71%' }],
    onion: [{ name: 'Tomato', reason: 'Tomatoes thrive after onions and repel pests naturally', suitability: '85%' }, { name: 'Carrot', reason: 'Carrots and onions are great companion crops', suitability: '79%' }, { name: 'Maize', reason: 'Maize provides good windbreak for next season onion fields', suitability: '70%' }],
    potato: [{ name: 'Wheat', reason: 'Wheat is an ideal crop rotation partner after potato harvest', suitability: '83%' }, { name: 'Beans', reason: 'Beans fix nitrogen depleted by potatoes', suitability: '80%' }, { name: 'Cauliflower', reason: 'Cauliflower benefits from the loose soil left after potato digging', suitability: '74%' }],
    rice: [{ name: 'Wheat', reason: 'Classic rice-wheat rotation maximizes yield per season in India', suitability: '90%' }, { name: 'Mustard', reason: 'Mustard thrives in post-rice fields with residual moisture', suitability: '82%' }, { name: 'Gram', reason: 'Chickpea/gram is ideal nitrogen-fixer after rice in Rabi season', suitability: '77%' }],
    wheat: [{ name: 'Rice', reason: 'Rice-wheat rotation is the backbone of Indian agriculture', suitability: '88%' }, { name: 'Sugarcane', reason: 'Sugarcane benefits from wheat-prepared soils', suitability: '74%' }, { name: 'Soybean', reason: 'Soybean fixes nitrogen and prepares soil for next wheat crop', suitability: '80%' }],
    maize: [{ name: 'Soybean', reason: 'Soybean restores nitrogen after maize drain', suitability: '85%' }, { name: 'Wheat', reason: 'Wheat follows maize well in Rabi season', suitability: '80%' }, { name: 'Sunflower', reason: 'Sunflower is a good break crop after maize', suitability: '73%' }],
    sugarcane: [{ name: 'Onion', reason: 'Onion intercropping in sugarcane ratoon is highly profitable', suitability: '80%' }, { name: 'Potato', reason: 'Potato grows well in inter-rows during early sugarcane growth', suitability: '75%' }, { name: 'Garlic', reason: 'Garlic is an excellent intercrop with sugarcane in Tamil Nadu', suitability: '72%' }],
    cotton: [{ name: 'Wheat', reason: 'Wheat is ideal after cotton harvest in north and central India', suitability: '84%' }, { name: 'Gram', reason: 'Gram fixes nitrogen depleted heavily by cotton', suitability: '81%' }, { name: 'Sunflower', reason: 'Sunflower rotation breaks cotton bollworm cycle', suitability: '75%' }],
    groundnut: [{ name: 'Maize', reason: 'Maize works well after groundnut as a cereal break crop', suitability: '83%' }, { name: 'Sorghum', reason: 'Sorghum is highly suitable following groundnut harvest', suitability: '79%' }, { name: 'Wheat', reason: 'Wheat thrives in nitrogen-enriched post-groundnut soil', suitability: '77%' }],
    soybean: [{ name: 'Wheat', reason: 'Wheat is the most common and profitable crop after soybean in India', suitability: '88%' }, { name: 'Maize', reason: 'Maize rotation with soybean is highly productive', suitability: '82%' }, { name: 'Sugarcane', reason: 'Sugarcane benefits enormously from soybean nitrogen fixing', suitability: '75%' }],
    banana: [{ name: 'Turmeric', reason: 'Turmeric grows well in banana partial shade as intercrop', suitability: '81%' }, { name: 'Ginger', reason: 'Ginger intercropping in banana is economically very profitable', suitability: '78%' }, { name: 'Groundnut', reason: 'Groundnut is a lucrative intercrop between banana rows', suitability: '74%' }],
    mango: [{ name: 'Turmeric', reason: 'Turmeric grows excellently under young mango tree shade', suitability: '83%' }, { name: 'Beans', reason: 'Beans can be intercropped in mango orchards profitably', suitability: '77%' }, { name: 'Ginger', reason: 'Ginger thrives in partial-shade conditions under mango', suitability: '75%' }],
    chilli: [{ name: 'Onion', reason: 'Onion is ideal rotation crop after chilli to break pest cycles', suitability: '85%' }, { name: 'Maize', reason: 'Maize provides windbreak and rotation benefit after chilli', suitability: '79%' }, { name: 'Brinjal', reason: 'Brinjal and chilli alternate well in Kharif rotation', suitability: '72%' }],
    brinjal: [{ name: 'Onion', reason: 'Onion breaks soil-borne diseases after brinjal cultivation', suitability: '83%' }, { name: 'Maize', reason: 'Maize rotation after brinjal improves soil structure', suitability: '78%' }, { name: 'Tomato', reason: 'Tomato can follow brinjal with proper disease management', suitability: '74%' }],
    cauliflower: [{ name: 'Tomato', reason: 'Tomato is ideal after cauliflower in summer season', suitability: '82%' }, { name: 'Onion', reason: 'Onion follows well after cole crops like cauliflower', suitability: '79%' }, { name: 'Beans', reason: 'Beans fix nitrogen after heavy-feeding cauliflower', suitability: '76%' }],
    garlic: [{ name: 'Tomato', reason: 'Tomato thrives in pest-suppressed soil after garlic', suitability: '86%' }, { name: 'Brinjal', reason: 'Brinjal benefits from garlic natural soil fumigation', suitability: '80%' }, { name: 'Chilli', reason: 'Chilli grows well in rotation with garlic crops', suitability: '76%' }],
    ginger: [{ name: 'Maize', reason: 'Maize acts as windbreak and shade for intercropped ginger', suitability: '82%' }, { name: 'Turmeric', reason: 'Turmeric and ginger share compatible cultivation practices', suitability: '79%' }, { name: 'Banana', reason: 'Ginger grown as banana intercrop is very profitable', suitability: '75%' }],
    turmeric: [{ name: 'Maize', reason: 'Maize intercropping with turmeric boosts total farm income', suitability: '81%' }, { name: 'Banana', reason: 'Banana provides ideal shade for turmeric intercropping', suitability: '78%' }, { name: 'Ginger', reason: 'Ginger rotation after turmeric is highly recommended', suitability: '74%' }],
    okra: [{ name: 'Onion', reason: 'Onion is an excellent rotation crop after okra harvest', suitability: '82%' }, { name: 'Maize', reason: 'Maize is a suitable cereal break crop following okra', suitability: '78%' }, { name: 'Beans', reason: 'Beans fix nitrogen and prepare soil after okra', suitability: '75%' }],
};

const DEFAULT_FALLBACK = [
    { name: 'Tomato', reason: 'High local demand and good profitability across India', suitability: '85%' },
    { name: 'Onion', reason: 'Seasonal staple with stable market prices', suitability: '70%' },
    { name: 'Potato', reason: 'Consistent demand and pricing year-round', suitability: '75%' }
];

export const getCropRecommendations = async (location: string, currentCrop?: string) => {
    const groq = getGroq();

    if (!groq) {
        // Visible warning so developer knows to set the key
        console.warn('[DemandService] ⚠️  GROQ_API_KEY is not set in .env — using smart static fallback for recommendations.');

        // Return crop-aware fallback (not always the same 3)
        const cropKey = currentCrop?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '') || '';
        const matched = Object.entries(CROP_ROTATION_FALLBACK).find(([key]) =>
            cropKey.includes(key) || key.includes(cropKey)
        );
        return matched ? matched[1] : DEFAULT_FALLBACK;
    }

    try {
        const cropContext = currentCrop
            ? `The farmer has selected "${currentCrop}" as their current/primary crop. Suggest 3 DIFFERENT crops that would complement or be best to grow after/alongside "${currentCrop}" using crop rotation principles.`
            : `Suggest the 3 best crops to grow right now in ${location}.`;

        const prompt = `
        You are an expert Indian agriculture advisor (March 2026, Rabi/summer transition season).
        District/Location: ${location}, India.
        
        ${cropContext}
        
        Consider: local soil, climate, market demand in India, seasonal suitability, crop rotation benefits, and profitability.
        Give actionable, specific reasons. Suitability should be a realistic percentage (60%-95%).
        
        Return ONLY strictly valid JSON (no markdown, no extra text):
        {
            "recommendations": [
                {
                    "name": "Crop Name",
                    "reason": "Specific actionable reason in one sentence",
                    "suitability": "85%"
                },
                {
                    "name": "Crop Name 2",
                    "reason": "Specific actionable reason in one sentence",
                    "suitability": "78%"
                },
                {
                    "name": "Crop Name 3",
                    "reason": "Specific actionable reason in one sentence",
                    "suitability": "72%"
                }
            ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
            response_format: { type: "json_object" },
            temperature: 0.4,
            max_tokens: 400,
        }, { timeout: 15000 }); // 15 second timeout

        console.log(`[DemandService] AI Recommendation response received for ${location}`);
        const parsed = JSON.parse(completion.choices[0].message.content || '{}');
        const recs = parsed.recommendations;
        if (Array.isArray(recs) && recs.length >= 3) return recs.slice(0, 3);

        // If Groq returned bad JSON, fall back smart
        const cropKey = currentCrop?.toLowerCase() || '';
        const matched = Object.entries(CROP_ROTATION_FALLBACK).find(([key]) => cropKey.includes(key) || key.includes(cropKey));
        return matched ? matched[1] : DEFAULT_FALLBACK;
    } catch (e) {
        console.error('[DemandService] Groq API Error (Recommendations):', e);
        const cropKey = currentCrop?.toLowerCase() || '';
        const matched = Object.entries(CROP_ROTATION_FALLBACK).find(([key]) => cropKey.includes(key) || key.includes(cropKey));
        return matched ? matched[1] : DEFAULT_FALLBACK;
    }
}

