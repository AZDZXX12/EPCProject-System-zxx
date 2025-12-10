/**
 * 优化的性能监控和工具集
 * 增强版性能监控，包含更多实用功能
 */
import { logger } from './logger';

// ==================== 性能监控 ====================

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'api' | 'interaction' | 'custom';
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // 最多保存100条记录

  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark: string, type: PerformanceMetrics['type'] = 'custom'): number {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measureEntry = performance.getEntriesByName(name)[0] as PerformanceMeasure;
        
        if (measureEntry) {
          const duration = measureEntry.duration;
          
          // 记录指标
          this.addMetric({
            name,
            duration,
            timestamp: Date.now(),
            type
          });

          // 性能警告
          if (duration > 1000) {
            logger.warn(`⚠️ [Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
          } else if (duration > 100) {
            logger.info(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`);
          }

          return duration;
        }
      } catch (e) {
        logger.warn('Performance measurement failed:', e);
      }
    }
    return 0;
  }

  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(type?: PerformanceMetrics['type']): PerformanceMetrics[] {
    if (type) {
      return this.metrics.filter(m => m.type === type);
    }
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  clear() {
    this.metrics = [];
  }

  report() {
    const report = {
      totalMetrics: this.metrics.length,
      byType: {} as Record<string, number>,
      slowOperations: this.metrics.filter(m => m.duration > 1000),
      averages: {} as Record<string, number>
    };

    // 按类型统计
    this.metrics.forEach(m => {
      report.byType[m.type] = (report.byType[m.type] || 0) + 1;
    });

    // 计算平均值
    const uniqueNames = [...new Set(this.metrics.map(m => m.name))];
    uniqueNames.forEach(name => {
      report.averages[name] = this.getAverageTime(name);
    });

    logger.info('📊 [Performance Report]', report);
    return report;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ==================== 防抖和节流 ====================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  const { leading = false, trailing = true } = options;

  return function executedFunction(...args: Parameters<T>) {
    lastArgs = args;

    const later = () => {
      timeout = null;
      if (trailing && lastArgs) {
        func(...lastArgs);
        lastArgs = null;
      }
    };

    const callNow = leading && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  const { leading = true, trailing = true } = options;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      if (leading) {
        func(...args);
      }
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        if (trailing && lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

// ==================== 内存监控 ====================

export const logMemoryUsage = () => {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize / 1048576;
    const total = memory.totalJSHeapSize / 1048576;
    const limit = memory.jsHeapSizeLimit / 1048576;
    const usage = (used / limit) * 100;

    const info = {
      used: `${used.toFixed(2)} MB`,
      total: `${total.toFixed(2)} MB`,
      limit: `${limit.toFixed(2)} MB`,
      usage: `${usage.toFixed(1)}%`
    };

    if (usage > 90) {
      logger.error('🔴 [Memory] Critical memory usage!', info);
    } else if (usage > 70) {
      logger.warn('🟡 [Memory] High memory usage', info);
    } else {
      logger.info('🟢 [Memory]', info);
    }

    return info;
  }
  return null;
};

// ==================== 页面性能 ====================

export const logPageLoadPerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (perfData) {
      const metrics = {
        DNS: (perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(2),
        TCP: (perfData.connectEnd - perfData.connectStart).toFixed(2),
        Request: (perfData.responseStart - perfData.requestStart).toFixed(2),
        Response: (perfData.responseEnd - perfData.responseStart).toFixed(2),
        DOM: (perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart).toFixed(2),
        Load: (perfData.loadEventEnd - perfData.loadEventStart).toFixed(2),
        Total: (perfData.loadEventEnd - perfData.fetchStart).toFixed(2),
        FCP: 0,
        LCP: 0
      };

      // 获取 FCP 和 LCP
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.FCP = parseFloat(fcpEntry.startTime.toFixed(2));
      }

      logger.info('🚀 [Page Load Performance]', metrics);
      return metrics;
    }
  }
  return null;
};

// ==================== 资源性能 ====================

export const logResourcePerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const summary = resources.reduce((acc, resource) => {
      const type = resource.initiatorType || 'other';
      if (!acc[type]) {
        acc[type] = { count: 0, totalDuration: 0, totalSize: 0, avgDuration: 0 };
      }
      acc[type].count++;
      acc[type].totalDuration += resource.duration;
      acc[type].totalSize += resource.transferSize || 0;
      return acc;
    }, {} as Record<string, { count: number; totalDuration: number; totalSize: number; avgDuration: number }>);

    // 计算平均值
    Object.keys(summary).forEach(type => {
      summary[type].avgDuration = summary[type].totalDuration / summary[type].count;
      summary[type].totalSize = Math.round(summary[type].totalSize / 1024); // KB
    });

    logger.info('📦 [Resource Performance]', summary);
    return summary;
  }
  return null;
};

// ==================== 长任务监控 ====================

export const monitorLongTasks = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.warn('⚠️ [Long Task]', {
            duration: `${entry.duration.toFixed(2)}ms`,
            startTime: `${entry.startTime.toFixed(2)}ms`
          });
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
      return observer;
    } catch (e) {
      logger.warn('Long task monitoring not supported');
    }
  }
  return null;
};

// ==================== 缓存管理 ====================

interface CacheOptions {
  ttl?: number; // 过期时间（毫秒）
  maxSize?: number; // 最大缓存数量
}

export class MemoryCache<T = any> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 默认5分钟
      maxSize: options.maxSize || 100
    };
  }

  set(key: string, value: T): void {
    // 检查缓存大小
    if (this.cache.size >= this.options.maxSize) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 清理过期项
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.options.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// ==================== 批处理 ====================

export class BatchProcessor<T = any> {
  private queue: T[] = [];
  private timer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(
    private processor: (items: T[]) => Promise<void>,
    private options: {
      maxBatchSize?: number;
      maxWaitTime?: number;
    } = {}
  ) {
    this.options.maxBatchSize = options.maxBatchSize || 50;
    this.options.maxWaitTime = options.maxWaitTime || 1000;
  }

  add(item: T): void {
    this.queue.push(item);

    // 如果达到批次大小，立即处理
    if (this.queue.length >= this.options.maxBatchSize!) {
      this.flush();
    } else {
      // 否则设置定时器
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.options.maxWaitTime);
      }
    }
  }

  async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const items = this.queue.splice(0, this.options.maxBatchSize);

    try {
      await this.processor(items);
    } catch (error) {
      logger.error('Batch processing failed:', error);
    } finally {
      this.processing = false;

      // 如果还有待处理项，继续处理
      if (this.queue.length > 0) {
        this.flush();
      }
    }
  }

  clear(): void {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// ==================== 导出工具函数 ====================

export const performanceUtils = {
  monitor: performanceMonitor,
  debounce,
  throttle,
  logMemoryUsage,
  logPageLoadPerformance,
  logResourcePerformance,
  monitorLongTasks,
  MemoryCache,
  BatchProcessor
};

export default performanceUtils;
