"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.farmerOnly = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Map userId from token to id in request user object
        req.user = { id: decoded.userId || decoded.id, role: decoded.role };
        next();
    }
    catch (err) {
        console.error("Auth Middleware Error:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.authenticate = authenticate;
const farmerOnly = (req, res, next) => {
    if (req.user?.role !== "FARMER") {
        return res.status(403).json({ message: "Farmers only" });
    }
    next();
};
exports.farmerOnly = farmerOnly;
//# sourceMappingURL=authMiddleware.js.map