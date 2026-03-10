import Groq from 'groq-sdk';

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MODEL_NAME = "llama-3.3-70b-versatile";

export type MarketDataPoint = {
    date: string;
    price: number;
};

export const getAiMarketAnalysis = async (crop: string, timeline: string, points: MarketDataPoint[], language: string = "English") => {
    const groq = getGroq();
    if (!groq) {
        return "Market analysis is currently unavailable as the AI service is not configured.";
    }

    try {
        // Prepare data for the prompt
        // We only send a subset of points if it's too many, but usually it's fine for 30-365 points
        const recentPoints = points.slice(-30); // Last 30 points for context
        const startPrice = points[0]?.price || 0;
        const endPrice = points[points.length - 1]?.price || 0;
        const priceChange = ((endPrice - startPrice) / startPrice * 100).toFixed(2);
        const trend = endPrice > startPrice ? "RISING" : endPrice < startPrice ? "FALLING" : "STABLE";

        const prompt = `
        You are an expert agricultural market analyst. 
        Analyze the following price trend data for "${crop}" over a period of "${timeline}".
        
        Trend Analysis Data:
        - Price Change: ${priceChange}%
        - Observation: Prices moved from ₹${startPrice}/kg to ₹${endPrice}/kg.
        - Overall Trend: ${trend}
        
        Recent Samples (Date: Price):
        ${recentPoints.map(p => `${new Date(p.date).toLocaleDateString()}: ₹${p.price}`).join('\n')}
        
        Task:
        Provide a very concise (max 1-2 sentences) market analysis insight for a farmer. 
        Focus on the current trend and a brief implication (e.g., good time to sell, wait for better prices, etc.).
        Be professional, actionable, and encouraging.
        Do NOT use markdown headers. Keep it as plain text.
        Respond in "${language}" language.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
        });

        return completion.choices[0].message.content?.trim() || "Market Analysis: Prices are currently showing a steady trend.";
    } catch (error) {
        console.error('[MarketAnalysisService] Groq API Error:', error);
        return "Market Analysis: Based on current trends, prices for " + crop + " are " + (points[points.length - 1]?.price > points[0]?.price ? 'RISING' : 'STABLE') + ".";
    }
};
