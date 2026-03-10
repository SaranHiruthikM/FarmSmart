import { Request, Response } from 'express';
import { getAiDiagnosis } from '../services/aiAdvisoryService';
import { sendResponse } from '../utils/response';

export const diagnoseSymptoms = async (req: Request, res: Response): Promise<void> => {
    try {
        const { symptoms, crop, location } = req.body;

        if (!symptoms || symptoms.length < 5) {
            sendResponse(res, 400, "Please provide more detailed symptoms.");
            return;
        }

        const diagnosis = await getAiDiagnosis({ symptoms, crop, location, language: req.body.language || "English" });

        sendResponse(res, 200, "AI Diagnosis complete", diagnosis);
    } catch (error) {
        console.error("AI Diagnose Error:", error);
        sendResponse(res, 500, "Failed to perform AI diagnosis");
    }
};
