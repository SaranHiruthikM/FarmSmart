import { Router } from "express";
import {
    evaluateQuality,
    getPriceImpact,
} from "../controllers/qualityController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/evaluate", authenticate, evaluateQuality);
router.get("/price-impact", getPriceImpact);

export default router;
