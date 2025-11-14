/**
 * 性能监控Hook
 */
import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export const usePerformance = (componentName: string) => {
  const startTime = performance.now();

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 记录性能指标
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
    };

    // 开发环境下输出性能信息
    if (process.env.NODE_ENV === 'development' && renderTime > 100) {
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    // 可以发送到监控服务
    if (renderTime > 1000) {
      // 发送到监控系统
      console.error('Performance issue detected:', metrics);
    }
  }, [componentName, startTime]);

  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${operationName} completed in ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  return { measureAsync };
};
