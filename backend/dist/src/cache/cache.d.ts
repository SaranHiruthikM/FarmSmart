export interface Cache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}
export declare const isCacheEnabled: () => boolean;
//# sourceMappingURL=cache.d.ts.map