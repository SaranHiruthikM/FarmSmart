import { Router } from "express";
import {
    startNegotiation,
    respondToNegotiation,
    getMyNegotiations,
    getNegotiationById,
} from "../controllers/negotiationController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/my", authenticate, getMyNegotiations); // Move 'my' above ':id' to prevent conflict
router.post("/start", authenticate, startNegotiation);
router.post("/:id/respond", authenticate, respondToNegotiation);
router.get("/:id", authenticate, getNegotiationById);

export default router;
