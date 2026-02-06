"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticate, orderController_1.createOrder);
router.get("/my", authMiddleware_1.authenticate, orderController_1.getMyOrders);
router.get("/:id", authMiddleware_1.authenticate, orderController_1.getOrderById);
router.patch("/:id/status", authMiddleware_1.authenticate, orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map