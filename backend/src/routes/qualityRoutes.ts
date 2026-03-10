import { Router } from "express";
import {
    evaluateQuality,
    getPriceImpact,
    getQualityRules,
    updateQualityRule
} from "../controllers/qualityController";
import { authenticate, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.post("/evaluate", authenticate, evaluateQuality);
router.get("/price-impact", getPriceImpact);

router.get("/", authenticate, adminOnly, getQualityRules);
router.put("/:id", authenticate, adminOnly, updateQualityRule);

export default router;
