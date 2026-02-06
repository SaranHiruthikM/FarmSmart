"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJson = fetchJson;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchJson(url, options = {}) {
    const { method = 'GET', headers = {}, timeoutMs = 7000, retries = 2, retryDelayMs = 250, } = options;
    let attempt = 0;
    let lastError;
    while (attempt <= retries) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                method,
                headers,
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return (await response.json());
        }
        catch (error) {
            lastError = error;
            if (attempt >= retries)
                break;
            await delay(retryDelayMs * (attempt + 1));
        }
        finally {
            clearTimeout(timeout);
        }
        attempt += 1;
    }
    throw lastError;
}
//# sourceMappingURL=httpClient.js.map