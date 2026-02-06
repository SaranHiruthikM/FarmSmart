import { Cache } from './cache';
export declare class InMemoryCache implements Cache {
    private store;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}
//# sourceMappingURL=inMemoryCache.d.ts.map