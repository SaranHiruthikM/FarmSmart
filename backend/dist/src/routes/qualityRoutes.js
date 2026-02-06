"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qualityController_1 = require("../controllers/qualityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/evaluate", authMiddleware_1.authenticate, qualityController_1.evaluateQuality);
router.get("/price-impact", qualityController_1.getPriceImpact);
exports.default = router;
//# sourceMappingURL=qualityRoutes.js.map