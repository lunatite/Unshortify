import { Cache } from "@nestjs/cache-manager";

export abstract class CacheService {
  protected abstract name: string;

  constructor(private readonly cache: Cache) {
    if (!cache) {
      throw new Error("Cache must be injected");
    }
  }

  protected async getFromCache<T>(id: string): Promise<T | null> {
    return this.cache.get<T>(`${this.name}-${id}`);
  }

  protected async storeInCache<T>(id: string, value: T, ttl?: number) {
    await this.cache.set(`${this.name}-${id}`, value, ttl);
  }
}
