import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAvailableOrdersForLogistics,
  acceptOrder,
  updateLogisticsDetails,
  claimPayment
} from "../controllers/orderController";
import { instantBuy } from "../controllers/instantBuyController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/instant-buy", authenticate, instantBuy); // New endpoint for Direct Buy
router.post("/", authenticate, createOrder);
router.get("/my", authenticate, getMyOrders);
router.get("/available", authenticate, getAvailableOrdersForLogistics); // Logistics pick up list

router.get("/:id", authenticate, getOrderById);
router.patch("/:id/status", authenticate, updateOrderStatus);
router.post("/:id/claim", authenticate, claimPayment); // Farmer claims payment
router.put("/:id/accept", authenticate, acceptOrder);
router.patch("/:id/logistics", authenticate, updateLogisticsDetails);

export default router;
