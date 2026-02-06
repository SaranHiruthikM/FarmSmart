"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticate, reviewController_1.addReview);
router.get("/:userId", reviewController_1.getUserReviews);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map