class Cache {
  private static instance: Cache;
  private readonly prefix = 'bento_';
  private defaultTTL: number = 3600000; // 1 hour in milliseconds

  private constructor() {}

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    const item = {
      data: value,
      timestamp: Date.now() + ttl,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  get(key: string): any {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    const { data, timestamp } = JSON.parse(item);
    
    // Check if the item has expired
    if (Date.now() > timestamp) {
      this.remove(key);
      return null;
    }

    return data;
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    // Only clear items with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
}

export const cacheInstance = Cache.getInstance();
