import { Router } from "express";
import { getSchemes, getEligibleSchemes } from "../controllers/schemeController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getSchemes);
router.get("/eligible", authenticate, getEligibleSchemes);

// Admin routes
import { adminOnly } from "../middleware/authMiddleware";
import { createScheme, updateScheme, deleteScheme } from "../controllers/schemeController";

router.post("/", authenticate, adminOnly, createScheme);
router.put("/:id", authenticate, adminOnly, updateScheme);
router.delete("/:id", authenticate, adminOnly, deleteScheme);

export default router;
