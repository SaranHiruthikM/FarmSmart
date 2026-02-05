import { Request, Response } from "express";
import { Crop } from "../models/Crop";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * POST /crops
 */
export const createCrop = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const crop = await Crop.create({
      ...req.body,
      farmerId: req.user!.id,
    });
    res.status(201).json(crop);
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /crops/:id
 */
export const updateCrop = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json(crop);
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /crops/:id
 */
export const deleteCrop = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const crop = await Crop.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user!.id,
    });
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json({ message: "Crop deleted" });
  } catch (error: any) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /crops/:id/quantity
 */
export const updateQuantity = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: "Quantity is required" });
    }
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user!.id },
      { quantity },
      { new: true, runValidators: true }
    );
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json(crop);
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /crops
 */
export const listCrops = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, state, district } = req.query;

    const filter: any = { isActive: true };

    if (name) filter.name = new RegExp(name as string, "i");
    if (state) filter["location.state"] = new RegExp(state as string, "i");
    if (district) filter["location.district"] = new RegExp(district as string, "i");

    const crops = await Crop.find(filter)
      .sort({ createdAt: -1 })
      .populate("farmerId", "fullName phoneNumber");

    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /crops/:id
 */
export const getCropById = async (req: Request, res: Response): Promise<any> => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate("farmerId", "fullName phoneNumber");

    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json(crop);
  } catch (error: any) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /crops/my
 */
export const myCrops = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const crops = await Crop.find({ farmerId: req.user!.id });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
