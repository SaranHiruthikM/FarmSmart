import { Router } from "express";
import { getActivePools, joinPool, createPool, getInstitutionalBatches } from "../controllers/poolingController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Farmer Routes
router.get("/active", authenticate, getActivePools);
router.post("/join", authenticate, joinPool);

// Admin / Cooperative Routes (To start a pool)
router.post("/create", authenticate, createPool);

// Institutional Buyer Routes
router.get("/institutional-batches", authenticate, getInstitutionalBatches);

export default router;
