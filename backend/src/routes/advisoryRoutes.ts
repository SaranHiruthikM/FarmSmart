import { Router } from "express";
import { getAdvisories, createAdvisory, getAllAdvisories } from "../controllers/advisoryController";
import { authenticate, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAdvisories);
router.post("/", authenticate, adminOnly, createAdvisory);
router.get("/admin/all", authenticate, adminOnly, getAllAdvisories);

export default router;
