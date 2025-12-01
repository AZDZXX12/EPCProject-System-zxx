/**
 * 性能监控工具
 */
import { logger } from './logger';

// 性能标记
export const performanceMark = (name: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);
  }
};

// 性能测量
export const performanceMeasure = (name: string, startMark: string, endMark: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measureEntry = performance.getEntriesByName(name)[0] as PerformanceMeasure | undefined;
      if (measureEntry && typeof measureEntry.duration === 'number') {
        logger.info(`⏱️ [Performance] ${name}: ${measureEntry.duration.toFixed(2)}ms`);
        return measureEntry.duration;
      }
    } catch (e) {
      logger.warn('Performance measurement failed:', e);
    }
  }
  return 0;
};

// 防抖
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 内存使用监控
export const logMemoryUsage = () => {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    logger.info('📊 [Memory]', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
};

// 页面加载性能
export const logPageLoadPerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      logger.info('🚀 [Page Load Performance]', {
        DNS: `${(perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(2)}ms`,
        TCP: `${(perfData.connectEnd - perfData.connectStart).toFixed(2)}ms`,
        Request: `${(perfData.responseStart - perfData.requestStart).toFixed(2)}ms`,
        Response: `${(perfData.responseEnd - perfData.responseStart).toFixed(2)}ms`,
        DOM: `${(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart).toFixed(2)}ms`,
        Load: `${(perfData.loadEventEnd - perfData.loadEventStart).toFixed(2)}ms`,
        Total: `${(perfData.loadEventEnd - perfData.fetchStart).toFixed(2)}ms`,
      });
    }
  }
};

// 资源加载性能
export const logResourcePerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const summary = resources.reduce((acc, resource) => {
      const type = resource.initiatorType || 'other';
      const bucket = acc[type] ?? (acc[type] = { count: 0, totalDuration: 0, totalSize: 0 });
      bucket.count++;
      bucket.totalDuration += resource.duration;
      bucket.totalSize += resource.transferSize || 0;
      return acc;
    }, {} as Record<string, { count: number; totalDuration: number; totalSize: number }>);
    
    logger.info('📦 [Resource Performance]', summary);
  }
};
