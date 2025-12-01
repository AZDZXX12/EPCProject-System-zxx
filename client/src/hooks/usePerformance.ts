/**
 * 性能监控Hook
 */
import { useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

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
      logger.warn(`[性能监控] 🐌 慢渲染: ${componentName} 耗时 ${renderTime.toFixed(2)}ms`);
    }

    // 可以发送到监控服务
    if (renderTime > 1000) {
      // 发送到监控系统
      logger.error('[性能监控] 严重性能问题:', metrics);
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
        logger.info(`[性能监控] ⚡ ${operationName} 完成，耗时 ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`[性能监控] ❌ ${operationName} 失败，耗时 ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  return { measureAsync };
};
