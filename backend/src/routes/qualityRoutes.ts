import { Router } from "express";
import multer from 'multer';
import {
    evaluateQuality,
    getPriceImpact,
    analyzeImageQuality
} from "../controllers/qualityController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
const upload = multer(); // Memory storage for processing

// Analyze image
router.post("/analyze", authenticate, upload.single('image'), analyzeImageQuality);
router.post("/evaluate", authenticate, evaluateQuality);
router.get("/price-impact", getPriceImpact);

export default router;
