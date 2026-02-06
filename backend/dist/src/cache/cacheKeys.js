"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._test = exports.buildPriceCacheKey = void 0;
const normalizePart = (value) => {
    const normalized = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    return normalized || 'unknown';
};
const buildPriceCacheKey = (kind, crop, location) => {
    const parts = ['prices', kind, normalizePart(crop)];
    if (location)
        parts.push(normalizePart(location));
    return parts.join(':');
};
exports.buildPriceCacheKey = buildPriceCacheKey;
exports._test = { normalizePart };
//# sourceMappingURL=cacheKeys.js.map