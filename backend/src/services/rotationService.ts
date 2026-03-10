import Groq from 'groq-sdk';
import { getDemandAnalysis } from './demandService';

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MODEL_NAME = "llama-3.3-70b-versatile";

export interface RotationSuggestion {
    nextCrop: string;
    reason: string;
    estimatedROI: string;
    soilBenefit: string;
    profitabilityScore: number;
}

export const getRotationSuggestion = async (lastCrop: string, district: string): Promise<RotationSuggestion> => {
    const groq = getGroq();

    // Basic Fallback
    const fallback: RotationSuggestion = {
        nextCrop: "Legumes (Beans/Peas)",
        reason: "Legumes restore nitrogen levels depleted by most cereals.",
        estimatedROI: "+15%",
        soilBenefit: "Nitrogen fixation and improved soil structure.",
        profitabilityScore: 75
    };

    if (!groq) return fallback;

    try {
        // We could also call getDemandAnalysis for a few candidate crops here if we wanted deeper data,
        // but for now, we'll let the AI's general agricultural knowledge and the current season context (March 2026) drive it.

        const prompt = `
        You are an expert Indian Agricultural Strategy Advisor.
        A farmer in ${district}, India just finished harvesting ${lastCrop}.
        It is currently March 2026 (Transitioning from Rabi to Summer season).
        
        Provide the single best crop to plant NEXT to maximize both profit and soil sustainability.
        Consider:
        1. Crop Rotation Compatibility (e.g., Nitrogen fixers after heavy feeders).
        2. Market Demand trends in Indian mandis for the next 4 months.
        3. Local climate/seasonality of ${district}.
        
        Return strictly valid JSON:
        {
            "nextCrop": "...",
            "reason": "Clear professional reason in one sentence",
            "estimatedROI": "+X%",
            "soilBenefit": "Clear soil health benefit",
            "profitabilityScore": 85
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
            response_format: { type: "json_object" },
            temperature: 0.4,
        }, { timeout: 15000 });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return result as RotationSuggestion;
    } catch (error) {
        console.error('[RotationService] AI Error:', error);
        return fallback;
    }
};
