import { Router } from "express";
import { getSchemes, getEligibleSchemes } from "../controllers/schemeController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getSchemes);
router.get("/eligible", authenticate, getEligibleSchemes);

export default router;
