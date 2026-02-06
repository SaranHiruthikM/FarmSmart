import { createClient, RedisClientType } from 'redis';
import { Cache } from './cache';

export class RedisCache implements Cache {
  private client: RedisClientType;
  private isConnecting = false;

  constructor(private url: string) {
    this.client = createClient({ url });
    this.client.on('error', (err) => {
      console.warn('[cache] Redis error:', err?.message || err);
    });
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.isOpen || this.isConnecting) return;
    this.isConnecting = true;
    try {
      await this.client.connect();
    } finally {
      this.isConnecting = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnected();
    if (!this.client.isOpen) return null;

    const raw = await this.client.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn('[cache] Failed to parse cached JSON:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.ensureConnected();
    if (!this.client.isOpen) return;

    const payload = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await this.client.setEx(key, ttlSeconds, payload);
      return;
    }

    await this.client.set(key, payload);
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }
}
