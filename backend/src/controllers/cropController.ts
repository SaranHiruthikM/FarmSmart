import { Request, Response } from "express";
import { Crop } from "../models/Crop";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * POST /crops
 */
export const createCrop = async (req: AuthRequest, res: Response): Promise<any> => {
  const crop = await Crop.create({
    ...req.body,
    farmerId: req.user!.id,
  });
  res.status(201).json(crop);
};

/**
 * PUT /crops/:id
 */
export const updateCrop = async (req: AuthRequest, res: Response): Promise<any> => {
  const crop = await Crop.findOneAndUpdate(
    { _id: req.params.id, farmerId: req.user!.id },
    req.body,
    { new: true }
  );
  if (!crop) return res.status(404).json({ message: "Crop not found" });
  res.json(crop);
};

/**
 * DELETE /crops/:id
 */
export const deleteCrop = async (req: AuthRequest, res: Response): Promise<any> => {
  const crop = await Crop.findOneAndDelete({
    _id: req.params.id,
    farmerId: req.user!.id,
  });
  if (!crop) return res.status(404).json({ message: "Crop not found" });
  res.json({ message: "Crop deleted" });
};

/**
 * PATCH /crops/:id/quantity
 */
export const updateQuantity = async (req: AuthRequest, res: Response): Promise<any> => {
  const { quantity } = req.body;
  const crop = await Crop.findOneAndUpdate(
    { _id: req.params.id, farmerId: req.user!.id },
    { quantity },
    { new: true }
  );
  if (!crop) return res.status(404).json({ message: "Crop not found" });
  res.json(crop);
};

/**
 * GET /crops
 */
export const listCrops = async (req: Request, res: Response): Promise<any> => {
  const { name, state, district } = req.query;

  const filter: any = { isActive: true };

  if (name) filter.name = new RegExp(name as string, "i");
  if (state) filter["location.state"] = state;
  if (district) filter["location.district"] = district;

  const crops = await Crop.find(filter).sort({ createdAt: -1 });
  res.json(crops);
};

/**
 * GET /crops/:id
 */
export const getCropById = async (req: Request, res: Response): Promise<any> => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) return res.status(404).json({ message: "Crop not found" });
  res.json(crop);
};

/**
 * GET /crops/my
 */
export const myCrops = async (req: AuthRequest, res: Response): Promise<any> => {
  const crops = await Crop.find({ farmerId: req.user!.id });
  res.json(crops);
};
