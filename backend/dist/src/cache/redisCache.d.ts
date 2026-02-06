import { Cache } from './cache';
export declare class RedisCache implements Cache {
    private url;
    private client;
    private isConnecting;
    constructor(url: string);
    private ensureConnected;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=redisCache.d.ts.map