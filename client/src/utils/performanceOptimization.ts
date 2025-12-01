import React from 'react';
import { logger } from './logger';

/**
 * 性能优化工具集
 */

// 防抖Hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 节流Hook
export const useThrottle = <T>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastExecuted = React.useRef(Date.now());

  React.useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [value, interval]);

  return throttledValue;
};

// 虚拟滚动Hook
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
};

// 懒加载图片组件
export const LazyImage: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className, placeholder }) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    let observer: IntersectionObserver;

    if (imageRef && imageSrc !== src) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, src]);

  return React.createElement('img', {
    ref: setImageRef,
    src: imageSrc,
    alt: alt,
    className: className,
  });
};

// 批量更新Hook
export const useBatchUpdate = <T>(
  updateFn: (updates: T[]) => void,
  delay = 100
) => {
  const updates = React.useRef<T[]>([]);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const batchUpdate = React.useCallback(
    (update: T) => {
      updates.current.push(update);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (updates.current.length > 0) {
          updateFn(updates.current);
          updates.current = [];
        }
      }, delay);
    },
    [updateFn, delay]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// 内存缓存Hook
export const useMemoryCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 60000 // 默认60秒
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const cache = window.localStorage.getItem(`cache_${key}`);
    if (cache) {
      const { data: cachedData, timestamp } = JSON.parse(cache);
      if (Date.now() - timestamp < ttl) {
        setData(cachedData);
        return;
      }
    }

    setLoading(true);
    fetcher()
      .then((result) => {
        setData(result);
        window.localStorage.setItem(
          `cache_${key}`,
          JSON.stringify({ data: result, timestamp: Date.now() })
        );
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [key, fetcher, ttl]);

  return { data, loading, error };
};

// WebGL上下文管理
export class WebGLContextManager {
  private static contexts: Map<string, WebGLRenderingContext> = new Map();
  private static maxContexts = 8; // 最大WebGL上下文数量

  static getContext(
    canvas: HTMLCanvasElement,
    id: string,
    options?: WebGLContextAttributes
  ): WebGLRenderingContext | null {
    // 如果已存在，返回缓存的上下文
    if (this.contexts.has(id)) {
      return this.contexts.get(id)!;
    }

    // 如果达到最大数量，释放最早的上下文
    if (this.contexts.size >= this.maxContexts) {
      const firstKey = this.contexts.keys().next().value;
      if (firstKey !== undefined) {
        const firstContext = this.contexts.get(firstKey);
        if (firstContext) {
          const loseContext = firstContext.getExtension('WEBGL_lose_context');
          if (loseContext) {
            loseContext.loseContext();
          }
        }
        this.contexts.delete(firstKey);
      }
    }

    // 创建新上下文
    const context = canvas.getContext('webgl', {
      preserveDrawingBuffer: false,
      antialias: false,
      depth: true,
      stencil: false,
      alpha: false,
      premultipliedAlpha: false,
      ...options,
    });

    if (context) {
      this.contexts.set(id, context);
    }

    return context;
  }

  static releaseContext(id: string) {
    const context = this.contexts.get(id);
    if (context) {
      const loseContext = context.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
      this.contexts.delete(id);
    }
  }

  static releaseAll() {
    this.contexts.forEach((context) => {
      const loseContext = context.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    });
    this.contexts.clear();
  }
}

// 优化的React.memo比较函数
export const arePropsEqual = (
  prevProps: Record<string, any>,
  nextProps: Record<string, any>,
  ignoreKeys: string[] = []
): boolean => {
  const prevKeys = Object.keys(prevProps).filter((key) => !ignoreKeys.includes(key));
  const nextKeys = Object.keys(nextProps).filter((key) => !ignoreKeys.includes(key));

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  return prevKeys.every((key) => {
    return Object.is(prevProps[key], nextProps[key]);
  });
};

// 性能监控装饰器
export const measurePerformance = (_target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const result = await originalMethod.apply(this, args);
    const end = performance.now();
    
    if (end - start > 100) {
      logger.warn(`⚠️ Slow method detected: ${propertyKey} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };

  return descriptor;
};
