import { Request, Response } from 'express';
import { getDemandAnalysis, getCropRecommendations } from '../services/demandService';

export const getForecast = async (req: Request, res: Response): Promise<any> => {
    try {
        const crop = req.query.crop as string || 'Tomato';
        const location = req.query.location as string || 'Coimbatore';

        const data = await getDemandAnalysis(crop, location);

        // Match frontend expected shape
        res.json({
            cropId: crop.toLowerCase(),
            cropName: crop,
            demandLevel: data.demandLevel,
            explanation: data.explanation,
            sellRecommendation: data.sellRecommendation,
            metadata: {
                activeBuyers: data.activeBuyers,
                totalSupply: data.totalSupply,
                currentPrice: data.currentPrice,
                priceTrend: data.priceTrend,
                predictedPrice: data.predictedPrice
            }
        });
    } catch (error) {
        console.error('Error in getForecast:', error);
        res.status(500).json({ message: 'Server error retrieving demand forecast' });
    }
};

export const getRecommendations = async (req: Request, res: Response): Promise<any> => {
    try {
        const location = req.query.location as string || 'Coimbatore';
        // Pass the currently selected crop so AI can suggest complementary crops
        const currentCrop = req.query.crop as string | undefined;
        const suggestions = await getCropRecommendations(location, currentCrop);

        res.json({
            location,
            suggestions
        });
    } catch (error) {
        console.error('Error in getRecommendations:', error);
        res.status(500).json({ message: 'Server error retrieving crop recommendations' });
    }
};
