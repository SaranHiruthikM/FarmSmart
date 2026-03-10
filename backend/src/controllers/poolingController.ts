import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Pool } from "../models/Pool";
import { Crop } from "../models/Crop";
import mongoose from "mongoose";

/**
 * Get all active pools in a district
 */
export const getActivePools = async (req: Request, res: Response): Promise<any> => {
    try {
        const { district, cropName } = req.query;
        let query: any = { status: "OPEN" };

        if (district) query.district = district;
        if (cropName) query.cropName = cropName;

        const pools = await Pool.find(query).sort({ currentQuantity: -1 });
        res.json(pools);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pools", error });
    }
};

/**
 * Join an existing pool
 */
export const joinPool = async (req: AuthRequest, res: Response): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { poolId, cropId, contributedQuantity } = req.body;
        const farmerId = req.user?.id;

        if (!poolId || !cropId || !contributedQuantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const pool = await Pool.findById(poolId).session(session);
        if (!pool || pool.status !== "OPEN") {
            return res.status(404).json({ message: "Pool not found or not open for joining" });
        }

        const crop = await Crop.findById(cropId).session(session);
        if (!crop || crop.quantity < contributedQuantity) {
            return res.status(400).json({ message: "Insufficient crop quantity available" });
        }

        // 1. Update Pool
        pool.members.push({
            farmerId: new mongoose.Types.ObjectId(farmerId),
            cropId: new mongoose.Types.ObjectId(cropId),
            contributedQuantity
        });
        pool.currentQuantity += contributedQuantity;

        // Auto-lock if target reached
        if (pool.currentQuantity >= pool.targetQuantity) {
            pool.status = "LOCKED";
        }

        await pool.save({ session });

        // 2. Update Crop (mark as inactive if all used, or reduce quantity)
        crop.quantity -= contributedQuantity;
        if (crop.quantity <= 0) {
            crop.isActive = false;
        }
        await crop.save({ session });

        await session.commitTransaction();
        res.json({ message: "Successfully joined pool", pool });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: "Error joining pool", error });
    } finally {
        session.endSession();
    }
};

/**
 * Create a new pool
 */
export const createPool = async (req: Request, res: Response): Promise<any> => {
    try {
        const { cropName, targetQuantity, unit, district, state, basePrice, expiryDays } = req.body;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

        const pool = new Pool({
            cropName,
            targetQuantity,
            unit,
            district,
            state,
            basePrice,
            expiryDate,
            status: "OPEN"
        });

        await pool.save();
        res.status(201).json(pool);
    } catch (error) {
        res.status(500).json({ message: "Error creating pool", error });
    }
};

/**
 * Get institutional batches for buyers
 */
export const getInstitutionalBatches = async (req: Request, res: Response): Promise<any> => {
    try {
        const { cropName, district } = req.query;
        let query: any = { status: { $in: ["OPEN", "LOCKED"] } };

        if (cropName) query.cropName = cropName;
        if (district) query.district = district;

        // Show larger batches first or locked ones
        const batches = await Pool.find(query)
            .sort({ status: 1, currentQuantity: -1 })
            .limit(20);

        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: "Error fetching institutional batches", error });
    }
};
