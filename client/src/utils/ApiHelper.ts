/**
 * 🌐 API请求助手
 *
 * 功能：
 * 1. 智能重试机制（指数退避）
 * 2. 超时控制
 * 3. 错误分类处理
 * 4. 请求缓存
 * 5. 请求取消
 */

export interface FetchOptions extends Omit<RequestInit, 'cache'> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
}

// 缓存存储
const responseCache = new Map<string, CachedResponse>();

/**
 * 智能Fetch（带重试、超时、缓存）
 */
export async function smartFetch<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    timeout = 5000,
    retries = 3,
    retryDelay = 1000,
    cache = false,
    cacheTTL = 60000, // 1分钟
    ...fetchOptions
  } = options;

  // 检查缓存
  if (cache) {
    const cached = responseCache.get(url);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`[ApiHelper] 使用缓存: ${url}`);
      return cached.data as T;
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        // 指数退避：1s, 2s, 4s...
        const delay = retryDelay * Math.pow(2, attempt - 1);
        console.log(`[ApiHelper] 重试 ${attempt}/${retries}，延迟${delay}ms: ${url}`);
        await sleep(delay);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // HTTP错误
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).response = response;
        throw error;
      }

      const data = await response.json();

      // 保存到缓存
      if (cache) {
        responseCache.set(url, {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL,
        });
      }

      return data as T;
    } catch (error: any) {
      lastError = error;

      // 判断是否应该重试
      if (!shouldRetry(error, attempt, retries)) {
        break;
      }
    }
  }

  // 所有重试都失败了
  console.error(`[ApiHelper] 请求失败（${retries + 1}次尝试）: ${url}`, lastError);
  throw lastError || new Error('Unknown error');
}

/**
 * 判断是否应该重试
 */
function shouldRetry(error: any, attempt: number, maxRetries: number): boolean {
  // 已达到最大重试次数
  if (attempt >= maxRetries) {
    return false;
  }

  // 网络错误 - 应该重试
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return true;
  }

  // 超时错误 - 应该重试
  if (error.name === 'AbortError') {
    return true;
  }

  // HTTP 5xx 错误 - 应该重试
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // HTTP 429 (Too Many Requests) - 应该重试
  if (error.status === 429) {
    return true;
  }

  // HTTP 4xx 错误（除429外）- 不应该重试
  if (error.status >= 400 && error.status < 500) {
    return false;
  }

  // 其他错误 - 默认不重试
  return false;
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 清空缓存
 */
export function clearCache(url?: string): void {
  if (url) {
    responseCache.delete(url);
  } else {
    responseCache.clear();
  }
}

/**
 * 批量请求（并发控制）
 */
export async function batchFetch<T = any>(
  urls: string[],
  options: FetchOptions = {},
  concurrency: number = 5
): Promise<(T | Error)[]> {
  const results: (T | Error)[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    const promise = smartFetch<T>(url, options)
      .then((data) => {
        results[i] = data;
      })
      .catch((error) => {
        results[i] = error;
      })
      .then(() => {
        executing.splice(executing.indexOf(promise), 1);
      });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * GET请求（简化版）
 */
export async function get<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  return smartFetch<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST请求（简化版）
 */
export async function post<T = any>(
  url: string,
  data: any,
  options: FetchOptions = {}
): Promise<T> {
  return smartFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * PUT请求（简化版）
 */
export async function put<T = any>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
  return smartFetch<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * DELETE请求（简化版）
 */
export async function del<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  return smartFetch<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * 健康检查（快速失败）
 */
export async function healthCheck(url: string): Promise<boolean> {
  try {
    await smartFetch(url, {
      timeout: 2000,
      retries: 0,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取缓存统计
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ url: string; age: number; size: number }>;
} {
  const entries = Array.from(responseCache.entries()).map(([url, cached]) => ({
    url,
    age: Date.now() - cached.timestamp,
    size: JSON.stringify(cached.data).length,
  }));

  return {
    size: responseCache.size,
    entries,
  };
}

const ApiHelper = {
  smartFetch,
  get,
  post,
  put,
  del,
  batchFetch,
  healthCheck,
  clearCache,
  getCacheStats,
};

export default ApiHelper;
