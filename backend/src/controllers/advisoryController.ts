import { Request, Response } from "express";
import { Advisory } from "../models/Advisory";
import User from "../models/User";
import { sendAdvisoryAlert } from "../services/notificationService";

/**
 * GET /advisory
 * Advisory feed
 */
export const getAdvisories = async (_: Request, res: Response): Promise<any> => {
    try {
        const advisories = await Advisory.find({
            $or: [
                { isScheduled: false },
                { isScheduled: { $exists: false } },
                { scheduledDate: { $lte: new Date() } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(advisories);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /advisory/admin/all
 * All advisories including scheduled (Admin)
 */
export const getAllAdvisories = async (_: Request, res: Response): Promise<any> => {
    try {
        const advisories = await Advisory.find()
            .sort({ createdAt: -1 });
        res.json(advisories);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /advisory
 * Create advisory (Admin)
 */
export const createAdvisory = async (req: Request, res: Response): Promise<any> => {
    try {
        const advisory = await Advisory.create(req.body);

        // NOTIFICATION: Send SMS to Farmers in corresponding State
        try {
            if (advisory.state) {
                // Find all active farmers in that state
                const farmers = await User.find({ 
                    role: 'FARMER', 
                    state: advisory.state,
                    isActive: true
                });

                console.log(`[Advisory] Found ${farmers.length} farmers in ${advisory.state} for alert.`);
                
                // Send SMS to each farmer (Promise.all might send too fast, so iteration is safer for rate limits but slower)
                for (const farmer of farmers) {
                    if (farmer.phoneNumber) {
                        await sendAdvisoryAlert(farmer.phoneNumber, {
                            type: advisory.type,
                            title: advisory.title,
                            state: advisory.state
                        });
                    }
                }
                console.log(`[Advisory] Alerts sent successfully.`);
            }
        } catch (smsErr) {
            console.error("SMS Error (Advisory):", smsErr);
        }

        res.status(201).json({ message: "Advisory created", advisory });
    } catch (error) {
        console.error("Create Advisory Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * PATCH /advisory/:id
 * Update advisory (Admin)
 */
export const updateAdvisory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const advisory = await Advisory.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!advisory) {
            return res.status(404).json({ message: "Advisory not found" });
        }

        // NOTIFICATION: Send SMS if State is present (meaning targeted update)
        try {
            if (advisory.state) {
                 const farmers = await User.find({ 
                    role: 'FARMER', 
                    state: advisory.state,
                    isActive: true
                });

                console.log(`[Advisory Update] Found ${farmers.length} farmers in ${advisory.state} for alert.`);
                
                for (const farmer of farmers) {
                    if (farmer.phoneNumber) {
                        await sendAdvisoryAlert(farmer.phoneNumber, {
                            type: advisory.type, // e.g. "UPDATE: WEATHER"
                            title: `Update: ${advisory.title}`,
                            state: advisory.state
                        });
                    }
                }
            }
        } catch (smsErr) {
            console.error("SMS Error (Advisory Update):", smsErr);
        }

        res.json({ message: "Advisory updated", advisory });
    } catch (error) {
        console.error("Update Advisory Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
