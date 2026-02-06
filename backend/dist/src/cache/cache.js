"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCacheEnabled = void 0;
const isCacheEnabled = () => {
    const flag = (process.env.PRICE_CACHE_ENABLED || '').toLowerCase().trim();
    if (!flag)
        return true;
    return !(flag === 'false' || flag === '0' || flag === 'off');
};
exports.isCacheEnabled = isCacheEnabled;
//# sourceMappingURL=cache.js.map