import Groq from 'groq-sdk';
import { Scheme } from '../models/Scheme';

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const getAiSchemeRecommendation = async (crop: string, state: string, existingSchemes: any[]) => {
    const groq = getGroq();
    if (!groq) return null;

    try {
        // Prepare a summary of current schemes in DB to see if any apply logically
        const schemeList = existingSchemes.map(s => `- ${s.name}: ${s.description}`).join('\n');

        const prompt = `
        You are a highly proactive Indian Government Subsidy Expert.
        A farmer is currently listing "${crop}" in the state of ${state || 'India'}.
        
        CURRENT SYSTEM SCHEMES:
        ${schemeList}

        TASK:
        Find the MOST relevant connection between "${crop}" and CURRENT government financial support.
        - If a specific scheme exists for this crop (e.g., Turmeric processing, Wheat insurance), use that.
        - If NO specific scheme exists, link it to a general scheme (like PM-KISAN for income, PMFBY for insurance, or NHM for horticulture/fruit crops).
        - DO NOT REPEAT "Since you are listing...". Just generate the tip text starting with "Because ${crop} is a high-value crop..." or "You might qualify for...".
        
        RETURN STRICTLY VALID JSON:
        {
            "matchFound": true,
            "schemeName": "Best matching scheme name",
            "buddyTip": "A warm, helpful one-sentence tip. Do not start with 'Since you are listing'.",
            "isExternal": true,
            "applyLink": "Official gov link or search link"
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const content = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
    } catch (error) {
        console.error('[AiSchemeMatcher] Error:', error);
        return null;
    }
};
