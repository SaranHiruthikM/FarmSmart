export type HttpRequestOptions = {
    method?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number;
};
export declare function fetchJson<T>(url: string, options?: HttpRequestOptions): Promise<T>;
//# sourceMappingURL=httpClient.d.ts.map