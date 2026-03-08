import { Router } from "express";
import { getAdvisories } from "../controllers/advisoryController";

const router = Router();

router.get("/", getAdvisories);

// AI Crop Doctor
import { diagnoseSymptoms } from "../controllers/aiAdvisoryController";
import { authenticate } from "../middleware/authMiddleware";
router.post("/diagnose", authenticate, diagnoseSymptoms);

// AI Rotation Strategy
import { getRotationSuggestionController } from "../controllers/rotationController";
router.get("/rotation-suggestion", authenticate, getRotationSuggestionController);

export default router;
