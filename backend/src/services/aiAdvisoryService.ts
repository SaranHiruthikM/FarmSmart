import Groq from 'groq-sdk';

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MODEL_NAME = "llama-3.3-70b-versatile";

export interface DiagnosisRequest {
    symptoms: string;
    crop?: string;
    location?: string;
}

export interface DiagnosisResult {
    diagnosis: string;
    certainty: string;
    possibleCauses: string[];
    treatmentPlan: {
        immediateActions: string[];
        organicOptions: string[];
        chemicalOptions: string[];
        prevention: string[];
    };
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
}

export const getAiDiagnosis = async (data: DiagnosisRequest): Promise<DiagnosisResult> => {
    const groq = getGroq();

    // Smart Fallback for development/offline
    const fallback: DiagnosisResult = {
        diagnosis: "Preliminary Observation (Limited Data)",
        certainty: "40%",
        possibleCauses: ["General nutrient deficiency", "Local fungal infection", "Water stress"],
        treatmentPlan: {
            immediateActions: ["Isolate affected plants", "Check soil moisture", "Ensure proper sunlight"],
            organicOptions: ["Apply Neem oil spray", "Use compost tea"],
            chemicalOptions: ["General-purpose fungicide (if applicable)"],
            prevention: ["Maintain crop rotation", "Ensure adequate spacing"]
        },
        urgency: "Medium"
    };

    if (!groq) {
        console.warn('[AiAdvisoryService] GROQ_API_KEY not found. Returning fallback.');
        return fallback;
    }

    try {
        const prompt = `
        You are an expert Indian Crop Doctor and Agricultural Scientist (KVK Expert).
        A farmer has submitted symptoms for their crop. 
        
        Crop: ${data.crop || 'Unknown'}
        Location: ${data.location || 'India'}
        Symptoms: ${data.symptoms}
        
        Task:
        1. Diagnose the condition (disease, pest, or deficiency).
        2. Provide a certainty percentage.
        3. List possible causes.
        4. Provide a detailed sectioned treatment plan suitable for Indian farming conditions.
        5. Assign an urgency level.

        CRITICAL: Provide specific chemical/organic names available in India (e.g., Carbendazim, Neem Oil, Verticillium lecanii).
        
        Return internal JSON strictly (no markdown, no extra text):
        {
            "diagnosis": "Name of disease/pest",
            "certainty": "85%",
            "possibleCauses": ["Cause 1", "Cause 2"],
            "treatmentPlan": {
                "immediateActions": ["Action 1", "Action 2"],
                "organicOptions": ["Organic 1", "Organic 2"],
                "chemicalOptions": ["Chemical 1", "Chemical 2"],
                "prevention": ["Prevention 1", "Prevention 2"]
            },
            "urgency": "High"
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL_NAME,
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 800,
        }, { timeout: 20000 });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return result as DiagnosisResult;
    } catch (error) {
        console.error('[AiAdvisoryService] Error:', error);
        return fallback;
    }
};
