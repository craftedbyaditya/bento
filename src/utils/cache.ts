class Cache {
  private static instance: Cache;
  private cache: Map<string, { data: any; timestamp: number }>;
  private defaultTTL: number = 3600000; // 1 hour in milliseconds

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheInstance = Cache.getInstance();
