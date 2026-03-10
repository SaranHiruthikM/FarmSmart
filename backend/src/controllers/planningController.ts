import { Request, Response } from 'express';
import { getSeasonPlan } from '../services/planningService';
import { sendResponse } from '../utils/response';

export const recommendCrops = async (req: Request, res: Response) => {
    try {
        const { landSize, soilType, district, date } = req.body;

        if (!landSize || !soilType || !district) {
             sendResponse(res, 400, "Missing required fields: landSize, soilType, district");
             return;
        }

        const recommendations = await getSeasonPlan(Number(landSize), soilType, district, date);

        sendResponse(res, 200, "Season plan generated successfully", recommendations);
    } catch (error) {
        console.error("Error generating season plan:", error);
        sendResponse(res, 500, "Internal Server Error");
    }
};
