/**
 * 懒加载工具 - 优化组件加载性能
 */
import { lazy, ComponentType } from 'react';

// 带错误边界的懒加载包装器
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  retryDelay = 1000
) => {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        
        // 如果不是最后一次重试，等待后重试
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }
    
    // 所有重试都失败，抛出最后的错误
    throw lastError;
  });
};

// 预加载组件
export const preloadComponent = (componentImport: () => Promise<any>) => {
  const componentPromise = componentImport();
  return componentPromise;
};

// 批量预加载
export const preloadComponents = (componentImports: (() => Promise<any>)[]) => {
  return Promise.allSettled(componentImports.map(importFn => importFn()));
};
