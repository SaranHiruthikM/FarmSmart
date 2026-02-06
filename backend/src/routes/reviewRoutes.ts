import { Router } from "express";
import { addReview, getUserReviews } from "../controllers/reviewController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, addReview);
router.get("/:userId", getUserReviews);

export default router;
