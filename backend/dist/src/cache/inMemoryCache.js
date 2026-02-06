"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
class InMemoryCache {
    constructor() {
        this.store = new Map();
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() >= entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds <= 0)
            return;
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.store.set(key, { value, expiresAt });
    }
}
exports.InMemoryCache = InMemoryCache;
//# sourceMappingURL=inMemoryCache.js.map