import { Router } from "express";
import { createReview, getMyReputation, getUserReviews } from "../controllers/reviewController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/my", authenticate, getMyReputation);
router.get("/user/:userId", authenticate, getUserReviews);

export default router;
