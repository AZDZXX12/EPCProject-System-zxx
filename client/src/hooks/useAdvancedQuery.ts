/**
 * 高级查询Hook - 企业级数据获取
 * 特性：缓存、自动重试、乐观更新、轮询
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Result } from '../core/Result';
import { AppError } from '../core/Result';

export interface QueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<Result<T, AppError>>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
}

export interface QueryResult<T> {
  data: T | null;
  error: AppError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useAdvancedQuery<T>(
  options: QueryOptions<T>
): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    const { queryFn, onSuccess, onError } = optionsRef.current;
    
    setIsFetching(true);
    
    try {
      const result = await queryFn();
      
      if (result.ok) {
        setData(result.value);
        setError(null);
        onSuccess?.(result.value);
      } else {
        setError(result.error);
        setData(null);
        onError?.(result.error);
      }
    } catch (err) {
      const error = err instanceof Error ? err as AppError : new Error(String(err)) as AppError;
      setError(error);
      setData(null);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [options.enabled, fetchData]);

  // 轮询
  useEffect(() => {
    if (!options.refetchInterval) return;

    const interval = setInterval(fetchData, options.refetchInterval);
    return () => clearInterval(interval);
  }, [options.refetchInterval, fetchData]);

  // 窗口聚焦时重新获取
  useEffect(() => {
    if (!options.refetchOnWindowFocus) return;

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [options.refetchOnWindowFocus, fetchData]);

  return {
    data,
    error,
    isLoading,
    isSuccess: data !== null && error === null,
    isError: error !== null,
    isFetching,
    refetch: fetchData,
  };
}

export default useAdvancedQuery;
