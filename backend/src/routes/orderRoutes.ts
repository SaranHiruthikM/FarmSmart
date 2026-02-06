import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;
