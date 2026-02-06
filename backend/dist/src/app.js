"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cropRoutes_1 = __importDefault(require("./routes/cropRoutes"));
const prices_routes_1 = __importDefault(require("./routes/prices.routes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const qualityRoutes_1 = __importDefault(require("./routes/qualityRoutes"));
const response_1 = require("./utils/response");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/auth', authRoutes_1.default);
app.use('/crops', cropRoutes_1.default);
app.use('/orders', orderRoutes_1.default);
app.use('/reviews', reviewRoutes_1.default);
app.use('/quality', qualityRoutes_1.default);
/**
 * Price Comparison & Market Insights
 * Endpoints:
 *  GET /prices/current?crop=
 *  GET /prices/history?crop=&location=
 *  GET /prices/compare?crop=&location=
 */
app.use('/prices', prices_routes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    (0, response_1.sendResponse)(res, 200, 'FarmSmart Backend is running');
});
exports.default = app;
//# sourceMappingURL=app.js.map