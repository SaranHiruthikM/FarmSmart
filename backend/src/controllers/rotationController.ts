import { Request, Response } from 'express';
import { getRotationSuggestion } from '../services/rotationService';
import { sendResponse } from '../utils/response';

export const getRotationSuggestionController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lastCrop, district } = req.query as { lastCrop: string; district: string };

        if (!lastCrop || !district) {
            sendResponse(res, 400, "Both lastCrop and district are required parameters.");
            return;
        }

        const suggestion = await getRotationSuggestion(lastCrop, district);

        sendResponse(res, 200, "Rotation suggestion generated", suggestion);
    } catch (error) {
        console.error("Rotation Suggestion Error:", error);
        sendResponse(res, 500, "Failed to generate rotation suggestion");
    }
};
