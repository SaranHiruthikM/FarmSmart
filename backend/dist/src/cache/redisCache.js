"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const redis_1 = require("redis");
class RedisCache {
    constructor(url) {
        this.url = url;
        this.isConnecting = false;
        this.client = (0, redis_1.createClient)({ url });
        this.client.on('error', (err) => {
            console.warn('[cache] Redis error:', err?.message || err);
        });
    }
    async ensureConnected() {
        if (this.client.isOpen || this.isConnecting)
            return;
        this.isConnecting = true;
        try {
            await this.client.connect();
        }
        finally {
            this.isConnecting = false;
        }
    }
    async get(key) {
        await this.ensureConnected();
        if (!this.client.isOpen)
            return null;
        const raw = await this.client.get(key);
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch (error) {
            console.warn('[cache] Failed to parse cached JSON:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        await this.ensureConnected();
        if (!this.client.isOpen)
            return;
        const payload = JSON.stringify(value);
        if (ttlSeconds > 0) {
            await this.client.setEx(key, ttlSeconds, payload);
            return;
        }
        await this.client.set(key, payload);
    }
    async disconnect() {
        if (this.client.isOpen) {
            await this.client.disconnect();
        }
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=redisCache.js.map