import { Router } from "express";
import {
    raiseDispute,
    getMyDisputes,
    getDisputeById,
    getAllDisputes,
    updateDisputeStatus,
    resolveDispute
} from "../controllers/disputeController";
import { authenticate, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.get("/my", authenticate, getMyDisputes);
router.post("/", authenticate, raiseDispute);
router.get("/:id", authenticate, getDisputeById);
router.patch("/:id/resolve", authenticate, resolveDispute);

// Admin
router.get("/admin/all", authenticate, adminOnly, getAllDisputes);
router.patch(
    "/admin/:id",
    authenticate,
    adminOnly,
    updateDisputeStatus
);

export default router;
