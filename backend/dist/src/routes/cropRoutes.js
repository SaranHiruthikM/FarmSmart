"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cropController_1 = require("../controllers/cropController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticate, authMiddleware_1.farmerOnly, cropController_1.createCrop);
router.put("/:id", authMiddleware_1.authenticate, authMiddleware_1.farmerOnly, cropController_1.updateCrop);
router.delete("/:id", authMiddleware_1.authenticate, authMiddleware_1.farmerOnly, cropController_1.deleteCrop);
router.patch("/:id/quantity", authMiddleware_1.authenticate, authMiddleware_1.farmerOnly, cropController_1.updateQuantity);
router.get("/my", authMiddleware_1.authenticate, authMiddleware_1.farmerOnly, cropController_1.myCrops); // Move 'my' above ':id' to prevent conflict
router.get("/", cropController_1.listCrops);
router.get("/:id", cropController_1.getCropById);
exports.default = router;
//# sourceMappingURL=cropRoutes.js.map