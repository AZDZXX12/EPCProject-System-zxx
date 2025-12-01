/**
 * 通用iframe加载Hook
 * 
 * 功能：
 * 1. 统一iframe加载逻辑
 * 2. 加载状态管理
 * 3. 错误处理
 * 4. 性能监控
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/EnhancedLogger';

interface UseIframeOptions {
  url: string;
  name: string;
  iframeId?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

interface UseIframeReturn {
  loading: boolean;
  error: string | null;
  retry: () => void;
  iframeRef: (element: HTMLIFrameElement | null) => void;
}

export const useIframe = ({
  url,
  name,
  iframeId,
  onLoad,
  onError,
  timeout = 30000, // 30秒超时
}: UseIframeOptions): UseIframeReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 重试函数
  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    if (iframeElement) {
      iframeElement.src = url;
    }
  }, [url, iframeElement]);

  // iframe引用回调
  const iframeRef = useCallback((element: HTMLIFrameElement | null) => {
    setIframeElement(element);
  }, []);

  useEffect(() => {
    if (!iframeElement) return;

    let timeoutId: NodeJS.Timeout;
    const startTime = performance.now();

    // 加载成功处理
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setLoading(false);
      setError(null);
      
      logger.info(`${name} 加载完成`, {
        url,
        loadTime: `${loadTime.toFixed(2)}ms`,
        retryCount,
      });

      if (onLoad) {
        onLoad();
      }

      clearTimeout(timeoutId);
    };

    // 加载错误处理
    const handleError = (event: ErrorEvent | Event) => {
      const loadTime = performance.now() - startTime;
      const errorMessage = `${name} 加载失败`;
      
      setLoading(false);
      setError(errorMessage);
      
      logger.error(errorMessage, {
        url,
        loadTime: `${loadTime.toFixed(2)}ms`,
        retryCount,
        error: event,
      });

      if (onError) {
        onError(new Error(errorMessage));
      }

      clearTimeout(timeoutId);
    };

    // 设置超时
    timeoutId = setTimeout(() => {
      if (loading) {
        const errorMessage = `${name} 加载超时（${timeout}ms）`;
        setLoading(false);
        setError(errorMessage);
        
        logger.error(errorMessage, { url, timeout, retryCount });
        
        if (onError) {
          onError(new Error(errorMessage));
        }
      }
    }, timeout);

    // 添加事件监听
    iframeElement.addEventListener('load', handleLoad);
    iframeElement.addEventListener('error', handleError);

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
      iframeElement.removeEventListener('load', handleLoad);
      iframeElement.removeEventListener('error', handleError);
    };
  }, [iframeElement, url, name, loading, timeout, retryCount, onLoad, onError]);

  return {
    loading,
    error,
    retry,
    iframeRef,
  };
};

// 批量iframe管理Hook
interface IframeConfig {
  id: string;
  url: string;
  name: string;
}

interface UseMultipleIframesReturn {
  iframes: Map<string, {
    loading: boolean;
    error: string | null;
  }>;
  retryAll: () => void;
  retry: (id: string) => void;
  allLoaded: boolean;
  hasErrors: boolean;
}

export const useMultipleIframes = (
  configs: IframeConfig[]
): UseMultipleIframesReturn => {
  const [iframes, setIframes] = useState<Map<string, {
    loading: boolean;
    error: string | null;
  }>>(new Map());

  // 初始化状态
  useEffect(() => {
    const initialState = new Map();
    configs.forEach(config => {
      initialState.set(config.id, {
        loading: true,
        error: null,
      });
    });
    setIframes(initialState);
  }, [configs]);

  // 更新单个iframe状态
  const updateIframeState = useCallback((
    id: string,
    state: { loading: boolean; error: string | null }
  ) => {
    setIframes(prev => {
      const newMap = new Map(prev);
      newMap.set(id, state);
      return newMap;
    });
  }, []);

  // 重试所有
  const retryAll = useCallback(() => {
    configs.forEach(config => {
      updateIframeState(config.id, { loading: true, error: null });
    });
  }, [configs, updateIframeState]);

  // 重试单个
  const retry = useCallback((id: string) => {
    updateIframeState(id, { loading: true, error: null });
  }, [updateIframeState]);

  // 计算汇总状态
  const allLoaded = Array.from(iframes.values()).every(
    state => !state.loading && !state.error
  );
  
  const hasErrors = Array.from(iframes.values()).some(
    state => state.error !== null
  );

  return {
    iframes,
    retryAll,
    retry,
    allLoaded,
    hasErrors,
  };
};
