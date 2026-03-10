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
    console.log(`[VisionService] Starting analysis for mimeType: ${mimeType}, language: ${language}`);
    const base64Image = imageBuffer.toString("base64");

    // Priority 1: Groq (Llama 4 Scout - Primary)
    try {
        const groq = getGroq();
        if (groq) {
            console.log("[VisionService] Attempting Groq (Llama 4 Scout - Primary)...");
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `
                                You are an expert agricultural quality inspector.
                                Analyze this image of a crop strictly according to these rules:

                                GRADING LOGIC:
                                - Grade A: Perfect shape, color, no defects.
                                - Grade B: Minor cosmetic issues (small marks, slightly irregular shape), good for local market.
                                - Grade C: Visible damage, rot, spots, or serious deformation.

                                Output Requirements:
                                - Language: all descriptive values MUST be in "${language}" (keys remain in English).
                                - Format: Return ONLY a raw JSON object.
                                
                                JSON Structure:
                                {
                                  "cropName": "Detected name in ${language}",
                                  "grade": "A" | "B" | "C",
                                  "confidence": number,
                                  "defects": ["list of issues in ${language}"],
                                  "analysis": "Single sentence summary of reasoning in ${language}."
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
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                temperature: 0.1,
                max_tokens: 500,
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                console.log("[VisionService] Received response from Groq.");
                const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
                const result = JSON.parse(jsonStr);
                if (result.grade) result.grade = result.grade.toUpperCase();
                return result;
            }
        }
    } catch (groqError: any) {
        console.warn("[VisionService] Groq failed, trying fallback...", groqError?.message || groqError);
    }

    // Priority 2: Gemini (Fallback)
    try {
        const genAI = getGenerativeAI();
        if (genAI) {
            console.log("[VisionService] Attempting Gemini fallback...");
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `Analyze this crop strictly. Language: ${language}. Return ONLY raw JSON: {"cropName": "name", "grade": "A"|"B"|"C", "confidence": 0, "defects": [], "analysis": ""}`;

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

            console.log("[VisionService] Received response from Gemini.");
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(jsonStr);
            if (parsed.grade) parsed.grade = parsed.grade.toUpperCase();
            return parsed;
        }
    } catch (geminiError: any) {
        console.error("[VisionService] Gemini fallback failed:", geminiError?.message || geminiError);
    }

    // Final Fallback (Failure)
    console.warn("[VisionService] All AI providers failed. Returning failure placeholder.");
    return {
        cropName: "Analysis Unavailable",
        grade: "B",
        confidence: 0.0,
        defects: ["AI Service Connection Issue"],
        analysis: "Could not process image due to server or API limitations. Defaulting to Grade B."
    };
};
