"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prices_controller_1 = require("../controllers/prices.controller");
const router = (0, express_1.Router)();
/**
 * Endpoints:
 * GET /prices/current?crop=
 * GET /prices/history?crop=&location=
 * GET /prices/compare?crop=&location=
 *
 * Note: If your app mounts routes under /api, final path becomes /api/prices/...
 */
router.get("/current", prices_controller_1.getCurrentPrices);
router.get("/history", prices_controller_1.getPriceHistory);
router.get("/compare", prices_controller_1.comparePrices);
exports.default = router;
//# sourceMappingURL=prices.routes.js.map