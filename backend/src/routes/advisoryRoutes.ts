import { Router } from "express";
import { getAdvisories, createAdvisory, getAllAdvisories } from "../controllers/advisoryController";
import { authenticate, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAdvisories);
router.post("/", authenticate, adminOnly, createAdvisory);
router.get("/admin/all", authenticate, adminOnly, getAllAdvisories);

// AI Crop Doctor
import { diagnoseSymptoms } from "../controllers/aiAdvisoryController";
router.post("/diagnose", authenticate, diagnoseSymptoms);

// AI Rotation Strategy
import { getRotationSuggestionController } from "../controllers/rotationController";
router.get("/rotation-suggestion", authenticate, getRotationSuggestionController);

export default router;
