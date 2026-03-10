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
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.post("/", authenticate, farmerOnly, upload.single('image'), createCrop);
router.put("/:id", authenticate, farmerOnly, upload.single('image'), updateCrop);
router.delete("/:id", authenticate, farmerOnly, deleteCrop);
router.patch("/:id/quantity", authenticate, farmerOnly, updateQuantity);

router.get("/my", authenticate, farmerOnly, myCrops); // Move 'my' above ':id' to prevent conflict
router.get("/", listCrops);
router.get("/:id", getCropById);

export default router;
