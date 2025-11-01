/**
 * 💾 本地存储管理器
 * 
 * 职责：
 * 1. 封装LocalStorage操作
 * 2. 提供类型安全的存储接口
 * 3. 处理存储异常
 * 4. 支持数据过期
 */

export interface StorageOptions {
  /** 过期时间（毫秒） */
  ttl?: number;
  /** 是否压缩 */
  compress?: boolean;
}

interface StorageData<T = any> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export class StorageManager {
  private static prefix = 'epc_'; // 键前缀，避免冲突

  /**
   * 💾 保存数据
   * @param key 键名
   * @param value 值
   * @param options 选项
   */
  static save<T = any>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      const fullKey = this.prefix + key;
      
      const storageData: StorageData<T> = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl
      };

      const serialized = JSON.stringify(storageData);
      localStorage.setItem(fullKey, serialized);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Storage] 保存成功: ${key}`, { size: serialized.length });
      }

      return true;
    } catch (error) {
      console.error(`[Storage] 保存失败: ${key}`, error);
      
      // 如果是配额超限，尝试清理
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanup();
        console.warn('[Storage] 存储空间不足，已清理过期数据');
      }
      
      return false;
    }
  }

  /**
   * 📖 读取数据
   * @param key 键名
   * @param defaultValue 默认值
   */
  static load<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);

      if (!item) {
        return defaultValue;
      }

      const storageData: StorageData<T> = JSON.parse(item);

      // 检查是否过期
      if (storageData.ttl) {
        const isExpired = Date.now() - storageData.timestamp > storageData.ttl;
        if (isExpired) {
          this.remove(key);
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Storage] 数据已过期: ${key}`);
          }
          return defaultValue;
        }
      }

      return storageData.value;
    } catch (error) {
      console.error(`[Storage] 读取失败: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * 🗑️ 删除数据
   * @param key 键名
   */
  static remove(key: string): boolean {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Storage] 删除成功: ${key}`);
      }
      
      return true;
    } catch (error) {
      console.error(`[Storage] 删除失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 🧹 清理所有数据
   */
  static clear(): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`[Storage] 清理完成，共删除 ${keys.length} 项`);
      return true;
    } catch (error) {
      console.error('[Storage] 清理失败:', error);
      return false;
    }
  }

  /**
   * 🧹 清理过期数据
   */
  static cleanup(): number {
    try {
      const keys = this.getAllKeys();
      let cleanedCount = 0;

      keys.forEach(fullKey => {
        try {
          const item = localStorage.getItem(fullKey);
          if (item) {
            const storageData: StorageData = JSON.parse(item);
            
            if (storageData.ttl) {
              const isExpired = Date.now() - storageData.timestamp > storageData.ttl;
              if (isExpired) {
                localStorage.removeItem(fullKey);
                cleanedCount++;
              }
            }
          }
        } catch (e) {
          // 如果解析失败，删除该项
          localStorage.removeItem(fullKey);
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        console.log(`[Storage] 清理过期数据完成，共删除 ${cleanedCount} 项`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('[Storage] 清理过期数据失败:', error);
      return 0;
    }
  }

  /**
   * 📋 获取所有键名
   */
  static getAllKeys(): string[] {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  /**
   * 📊 获取存储统计信息
   */
  static getStats(): {
    totalItems: number;
    totalSize: number;
    items: { key: string; size: number; age: number }[];
  } {
    const keys = this.getAllKeys();
    const items: { key: string; size: number; age: number }[] = [];
    let totalSize = 0;

    keys.forEach(fullKey => {
      const item = localStorage.getItem(fullKey);
      if (item) {
        const size = item.length;
        totalSize += size;

        try {
          const storageData: StorageData = JSON.parse(item);
          const age = Date.now() - storageData.timestamp;
          items.push({
            key: fullKey.replace(this.prefix, ''),
            size,
            age
          });
        } catch (e) {
          items.push({
            key: fullKey.replace(this.prefix, ''),
            size,
            age: 0
          });
        }
      }
    });

    return {
      totalItems: items.length,
      totalSize,
      items: items.sort((a, b) => b.size - a.size) // 按大小降序
    };
  }

  /**
   * ✅ 检查键是否存在
   */
  static has(key: string): boolean {
    const fullKey = this.prefix + key;
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * 🔄 更新数据（仅当存在时）
   */
  static update<T = any>(key: string, updater: (value: T | null) => T): boolean {
    const currentValue = this.load<T>(key);
    const newValue = updater(currentValue);
    return this.save(key, newValue);
  }

  /**
   * 📦 批量保存
   */
  static saveMultiple(data: Record<string, any>): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (this.save(key, value)) {
        success++;
      } else {
        failed++;
      }
    });

    return { success, failed };
  }

  /**
   * 📦 批量读取
   */
  static loadMultiple<T = any>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    
    keys.forEach(key => {
      result[key] = this.load<T>(key);
    });

    return result;
  }

  /**
   * 🔍 搜索键
   */
  static searchKeys(pattern: string): string[] {
    const keys = this.getAllKeys();
    const regex = new RegExp(pattern, 'i');
    
    return keys
      .map(k => k.replace(this.prefix, ''))
      .filter(k => regex.test(k));
  }

  /**
   * 📤 导出所有数据
   */
  static exportAll(): Record<string, any> {
    const keys = this.getAllKeys();
    const data: Record<string, any> = {};

    keys.forEach(fullKey => {
      const key = fullKey.replace(this.prefix, '');
      const value = this.load(key);
      if (value !== null) {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * 📥 导入数据
   */
  static importAll(data: Record<string, any>): { success: number; failed: number } {
    return this.saveMultiple(data);
  }
}

export default StorageManager;



