import { exec } from 'child_process';
import path from 'path';
import Groq from 'groq-sdk';
import util from 'util';

const execPromise = util.promisify(exec);

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MODEL_NAME = "llama-3.3-70b-versatile";

export interface PredictionResult {
    crop: string;
    year: number;
    month: number;
    predicted_price: number;
    error?: string;
}

export const getPricePrediction = async (crop: string, district: string, currentPrice: number, targetYear?: number, targetMonth?: number) => {
    // 1. Run Python Inference
    const now = new Date();
    const tYear = targetYear || (now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear());
    const tMonth = targetMonth || (now.getMonth() === 11 ? 1 : now.getMonth() + 2);

    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_price.py');
    const pythonCmd = `python "${scriptPath}" "${crop}" ${tYear} ${tMonth}`;

    let prediction: PredictionResult | null = null;
    try {
        const { stdout } = await execPromise(pythonCmd);
        prediction = JSON.parse(stdout);

        if (prediction?.error) {
            console.error('[PredictionService] ML Error:', prediction.error);
            // DO NOT use random heuristic anymore as per user request to use ONLY model/dataset
            return null;
        }
    } catch (err) {
        console.error('[PredictionService] Script Error:', err);
        return null; // Return null instead of heuristic
    }

    return prediction;
};

export const handleChatForecast = async (query: string, currentCrop: string, currentDistrict: string, currentPrice: number) => {
    const groq = getGroq();
    if (!groq) return "Groq API key missing. Cannot use AI.";

    const VALID_CROPS = ["Onion", "Potato", "Rice", "Tomato", "Wheat"];

    try {
        // Step 1: Classify Query Intent
        const classifierPrompt = `
        You are an AI guardrail for the FarmSmart Price Predictor.
        The user is currently looking at prices for ${currentCrop}.
        
        Determine if the user query is about CROP PRICES, MARKET TRENDS, or a DATE/TIME for a forecast.
        
        Rules:
        - If the query is a date, year, month, or even just a number like "2027", return "ALLOW" (the user is asking for a prediction for that time).
        - If query is about prices, market, selling advice for crops, return "ALLOW".
        - If query is about weather, farming techniques, personal info, or general chat, return "DENY".
        
        Query: "${query}"
        
        Return ONLY "ALLOW" or "DENY".
        `;

        const classification = await groq.chat.completions.create({
            messages: [{ role: 'user', content: classifierPrompt }],
            model: "llama-3.3-70b-versatile",
        });

        const intent = classification.choices[0].message.content?.trim().toUpperCase();
        if (intent !== "ALLOW") {
            return "I am not authorised to tell you about things other than crop prices and market trends.";
        }

        // Step 2: Extract details
        const extractionPrompt = `
        Extract Crop, District, Month, and Year from the query.
        Current UI Context (Use if user doesn't specify others): Crop: ${currentCrop}, District: ${currentDistrict}, Month: ${new Date().getMonth() + 1}, Year: ${new Date().getFullYear()}.
        
        Query: "${query}"
        
        Return ONLY a JSON: {"crop": "string", "district": "string", "month": 1-12, "year": integer}. 
        If the user mentions a different crop (e.g., "Banana") than the UI context (${currentCrop}), extract that crop.
        `;

        const extraction = await groq.chat.completions.create({
            messages: [{ role: 'user', content: extractionPrompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const params = JSON.parse(extraction.choices[0].message.content || "{}");
        const crop = params.crop || currentCrop;
        const district = params.district || currentDistrict;
        const year = parseInt(params.year) || new Date().getFullYear();
        const month = parseInt(params.month) || (new Date().getMonth() + 2);

        // Step 3: Source of Truth - Dataset Lookup
        const { getLatestCsvPrice } = await import('./csvTrendService');
        const latestInfo = await getLatestCsvPrice(crop, district);

        // ML Model Prediction for Future
        const prediction = await getPricePrediction(crop, district, latestInfo?.price || currentPrice, year, month);

        // Step 4: Final Construction
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        let report = "";
        if (prediction) {
            report = `Our predictive analysis for ${crop} in ${district} for ${monthName} ${year} shows an expected price of ₹${prediction.predicted_price}/kg.`;
            if (latestInfo) {
                report += ` This is compared to the last recorded baseline of ₹${latestInfo.price}/kg.`;
            }
        } else {
            report = `I currently do not have enough specific historical patterns to generate a precise forecast for ${crop} in ${district} for that date.`;
        }

        const finalPrompt = `
        You are the FarmSmart Price Forecaster.
        Data: ${report}
        Month: ${monthName}, Year: ${year}, Crop: ${crop}, District: ${district}
        
        Rules:
        1. You MUST return ONLY one sentence in this EXACT format: "For [Month Year], the expected price of [Crop] in [District] is ₹[Price]/kg."
        2. Do NOT add any advice, greetings, notes, or disclaimers.
        3. Do NOT use bolding or markdown.
        4. If prediction is missing, return: "Currently, I do not have enough data to predict the price for ${crop} in ${district} for ${monthName} ${year}."
        5. If the crop is not supported, return: "We only support price predictions for ${VALID_CROPS.join(', ')}."
        `;

        const finalCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: finalPrompt }],
            model: MODEL_NAME,
        });

        return finalCompletion.choices[0].message.content?.trim() || "Currently I only have price data for " + VALID_CROPS.join(', ');
    } catch (error) {
        console.error("Chat Forecast Error:", error);
        return "I encountered an error analyzing that request. Please try again with a specific crop and district.";
    }
};


