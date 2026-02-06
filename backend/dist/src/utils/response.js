"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, message, data) => {
    res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data: data || null,
    });
};
exports.sendResponse = sendResponse;
//# sourceMappingURL=response.js.map