import { Router } from "express";
import {
  createCrop,
  updateCrop,
  deleteCrop,
  updateQuantity,
  listCrops,
  getCropById,
  myCrops,
} from "../controllers/cropController";
import { authenticate, farmerOnly } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, farmerOnly, createCrop);
router.put("/:id", authenticate, farmerOnly, updateCrop);
router.delete("/:id", authenticate, farmerOnly, deleteCrop);
router.patch("/:id/quantity", authenticate, farmerOnly, updateQuantity);

router.get("/my", authenticate, farmerOnly, myCrops); // Move 'my' above ':id' to prevent conflict
router.get("/", listCrops);
router.get("/:id", getCropById);

export default router;
