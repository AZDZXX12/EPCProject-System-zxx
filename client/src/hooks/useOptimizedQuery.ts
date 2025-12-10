/**
 * 优化的数据查询Hook
 * 集成缓存、防抖、错误处理等功能
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { MemoryCache, debounce } from '../utils/optimizedPerformance';
import { logger } from '../utils/logger';

interface QueryOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  debounceMs?: number;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

// 全局缓存实例
const queryCache = new MemoryCache({ ttl: 5 * 60 * 1000, maxSize: 200 });

export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000,
    debounceMs = 0,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    enabled = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  // 执行查询
  const executeQuery = useCallback(async () => {
    // 检查缓存
    if (cacheKey) {
      const cached = queryCache.get(cacheKey);
      if (cached) {
        logger.debug(`[Query] Cache hit: ${cacheKey}`);
        setData(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      
      if (!mountedRef.current) return;

      setData(result);
      setError(null);
      retryCountRef.current = 0;

      // 缓存结果
      if (cacheKey) {
        queryCache.set(cacheKey, result);
      }

      onSuccess?.(result);
      
      logger.debug(`[Query] Success: ${cacheKey || 'anonymous'}`);
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err as Error;
      
      // 重试逻辑
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        logger.warn(`[Query] Retry ${retryCountRef.current}/${retryCount}: ${error.message}`);
        
        setTimeout(() => {
          if (mountedRef.current) {
            executeQuery();
          }
        }, retryDelay * retryCountRef.current);
        
        return;
      }

      setError(error);
      onError?.(error);
      
      logger.error(`[Query] Failed: ${cacheKey || 'anonymous'}`, error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryFn, cacheKey, retryCount, retryDelay, onSuccess, onError]);

  // 防抖查询
  const debouncedQuery = useCallback(
    debounceMs > 0 ? debounce(executeQuery, debounceMs) : executeQuery,
    [executeQuery, debounceMs]
  );

  // 重置状态
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryCountRef.current = 0;
    
    if (cacheKey) {
      queryCache.delete(cacheKey);
    }
  }, [cacheKey]);

  // 自动执行查询
  useEffect(() => {
    if (enabled) {
      debouncedQuery();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, debouncedQuery]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
    reset
  };
}

// 批量查询Hook
export function useOptimizedQueries<T>(
  queries: Array<{
    queryFn: () => Promise<T>;
    options?: QueryOptions<T>;
  }>
): Array<QueryResult<T>> {
  return queries.map(({ queryFn, options }) => 
    useOptimizedQuery(queryFn, options)
  );
}

// 清除所有缓存
export function clearQueryCache(): void {
  queryCache.clear();
  logger.info('[Query] Cache cleared');
}

// 清除特定缓存
export function clearQueryCacheByKey(key: string): void {
  queryCache.delete(key);
  logger.info(`[Query] Cache cleared: ${key}`);
}

export default useOptimizedQuery;
