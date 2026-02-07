import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController";
import { instantBuy } from "../controllers/instantBuyController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/instant-buy", authenticate, instantBuy); // New endpoint for Direct Buy
router.post("/", authenticate, createOrder);
router.get("/my", authenticate, getMyOrders);

router.get("/:id", authenticate, getOrderById);
router.patch("/:id/status", authenticate, updateOrderStatus);

export default router;
