/**
 * 缓存管理器 - 优化数据获取性能
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟默认缓存时间

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, item);
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // 删除缓存
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // 获取缓存统计信息
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    this.cache.forEach((item) => {
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
      } else {
        validItems++;
      }
    });

    return {
      total: this.cache.size,
      valid: validItems,
      expired: expiredItems,
    };
  }

  // 带缓存的异步数据获取
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，获取新数据
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Failed to fetch data for key: ${key}`, error);
      throw error;
    }
  }
}

// 导出单例
export const cacheManager = new CacheManager();

// 定期清理过期缓存
setInterval(() => {
  cacheManager.cleanup();
}, 60000); // 每分钟清理一次

// 页面卸载时清空缓存
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cacheManager.clear();
  });
}
