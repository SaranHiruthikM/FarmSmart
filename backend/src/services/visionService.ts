import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const getGenerativeAI = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const analyzeCropQuality = async (imageBuffer: Buffer, mimeType: string, language: string = "English") => {
    const base64Image = imageBuffer.toString("base64");
    
    // 1. Try Gemini First
    try {
        const genAI = getGenerativeAI();
        if (genAI) {
            // Using specific model version which is more stable
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
            You are an expert agricultural quality inspector.
            Analyze this image of a crop very strictly.
            The response must be in "${language}" (only values, keep keys in English).
            
            1. Identify the crop (e.g., Tomato, Potato).
            2. Detect any visual defects (spots, rot, unripe, shape issues, pests).
            3. Assign a Quality Grade based on these rules:
               - Grade A (Premium): Perfect shape, bright color, no defects.
               - Grade B (Standard): Minor shape irregularities, very slight marks, readable but not perfect.
               - Grade C (Low/Fair): Visible spots, cuts, rot, or serious deformation.
            4. Estimate a "Confidence Score" (0-100%).
            5. List the specific defects found (in ${language}).
        
            Return ONLY valid JSON (no markdown):
            {
              "cropName": "string",
              "grade": "A" | "B" | "C",
              "confidence": number,
              "defects": ["string (in ${language})", "string (in ${language})"],
              "analysis": "Single sentence summary of why this grade was given (in ${language})."
            }
            `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
            ]);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonStr);
        }
    } catch (geminiError) {
        console.warn("Gemini Vision failed, trying Groq fallback...", geminiError);
    }

    // 2. Fallback to Groq (Llama 3.2 Vision)
    try {
        const groq = getGroq();
        if (!groq) throw new Error("No AI providers available (Missing GEMINI_API_KEY and GROQ_API_KEY)");

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `
                            You are an expert agricultural quality inspector. Analyze this image of a crop strictly.
                            Identify crop, defects, grade (A/B/C), confidence.
                            Response MUST be in "${language}" language (values only).
                            Return ONLY valid JSON (no markdown block):
                            {
                              "cropName": "string (in ${language})",
                              "grade": "A" | "B" | "C",
                              "confidence": number,
                              "defects": ["string (in ${language})"],
                              "analysis": "string (in ${language})"
                            }
                            `
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            model: "llama-3.2-90b-vision-preview",
            temperature: 0.1,
            max_tokens: 500,
            // response_format: { type: "json_object" } // Removed as it can cause 400 with Vision models
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
            // Clean up potentially returned markdown
            const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonStr);
        }
    } catch (groqError) {
        console.error("Groq Vision failed too:", groqError);
    }

    // 3. Final Fallback (Failure)
    return {
        cropName: "Detailed Analysis Failed",
        grade: "B",
        confidence: 0.0,
        defects: ["AI Service Unavailable"],
        analysis: "Could not process image. Please check server logs and API keys."
    };
};
