/**
 * 高级API客户端 - 企业级实现
 * 特性：
 * - 拦截器支持
 * - 自动重试
 * - 请求去重
 * - 缓存管理
 * - 类型安全
 */

import { Result, Ok, Err, AppError, NetworkError, ServerError } from './Result';

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retry?: number | RetryConfig;
  cache?: boolean | CacheConfig;
  signal?: AbortSignal;
}

export interface RetryConfig {
  count: number;
  delay: number | ((attempt: number) => number);
  shouldRetry?: (error: AppError) => boolean;
}

export interface CacheConfig {
  key: string;
  ttl: number; // milliseconds
  staleWhileRevalidate?: boolean;
}

export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = (
  response: Response
) => Response | Promise<Response>;

export type ErrorInterceptor = (error: AppError) => AppError | Promise<AppError>;

export class ApiClient {
  private baseURL: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private pendingRequests = new Map<string, Promise<Result<unknown, AppError>>>();
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '');
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * 发送请求
   */
  async request<T>(config: RequestConfig): Promise<Result<T, AppError>> {
    // 检查缓存
    if (config.cache && config.method === 'GET') {
      const cached = this.getFromCache<T>(config);
      if (cached) {
        return Ok(cached);
      }
    }

    // 请求去重
    const requestKey = this.getRequestKey(config);
    const pending = this.pendingRequests.get(requestKey);
    if (pending) {
      return pending as Promise<Result<T, AppError>>;
    }

    // 创建请求Promise
    const requestPromise = this.executeRequest<T>(config);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // 保存到缓存
      if (result.ok && config.cache && config.method === 'GET') {
        this.saveToCache(config, result.value);
      }
      
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * 执行请求
   */
  private async executeRequest<T>(
    config: RequestConfig
  ): Promise<Result<T, AppError>> {
    try {
      // 应用请求拦截器
      let finalConfig = config;
      for (const interceptor of this.requestInterceptors) {
        finalConfig = await interceptor(finalConfig);
      }

      // 构建URL
      const url = this.buildURL(finalConfig);

      // 构建请求选项
      const options: RequestInit = {
        method: finalConfig.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...finalConfig.headers,
        },
        signal: finalConfig.signal,
      };

      if (finalConfig.body) {
        options.body = JSON.stringify(finalConfig.body);
      }

      // 发送请求（带重试）
      const response = await this.fetchWithRetry(url, options, finalConfig.retry);

      // 应用响应拦截器
      let finalResponse = response;
      for (const interceptor of this.responseInterceptors) {
        finalResponse = await interceptor(finalResponse);
      }

      // 解析响应
      if (!finalResponse.ok) {
        return this.handleErrorResponse(finalResponse);
      }

      const data = await finalResponse.json();
      return Ok(data as T);

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * 带重试的fetch
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retry?: number | RetryConfig
  ): Promise<Response> {
    const retryConfig = this.normalizeRetryConfig(retry);
    let lastError: unknown;

    for (let attempt = 0; attempt <= retryConfig.count; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // 如果成功或不应该重试，直接返回
        if (response.ok || !this.shouldRetry(response.status, retryConfig)) {
          return response;
        }

        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error;
        
        if (attempt < retryConfig.count) {
          const delay = typeof retryConfig.delay === 'function'
            ? retryConfig.delay(attempt)
            : retryConfig.delay;
          
          await this.sleep(delay);
          continue;
        }
      }
    }

    throw lastError;
  }

  /**
   * 构建URL
   */
  private buildURL(config: RequestConfig): string {
    let url = `${this.baseURL}${config.url}`;

    if (config.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * 获取请求缓存Key
   */
  private getRequestKey(config: RequestConfig): string {
    const url = this.buildURL(config);
    const method = config.method || 'GET';
    const body = config.body ? JSON.stringify(config.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * 从缓存获取
   */
  private getFromCache<T>(config: RequestConfig): T | null {
    if (!config.cache) return null;

    const key = this.getRequestKey(config);
    const cached = this.cache.get(key);

    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * 保存到缓存
   */
  private saveToCache(config: RequestConfig, data: unknown): void {
    if (!config.cache) return;

    const cacheConfig = typeof config.cache === 'boolean'
      ? { key: this.getRequestKey(config), ttl: 5 * 60 * 1000 }
      : config.cache;

    this.cache.set(cacheConfig.key, {
      data,
      timestamp: Date.now(),
      ttl: cacheConfig.ttl,
    });
  }

  /**
   * 处理错误响应
   */
  private async handleErrorResponse(
    response: Response
  ): Promise<Result<never, AppError>> {
    let message = response.statusText;
    
    try {
      const error = await response.json();
      message = error.message || error.detail || message;
    } catch {
      // 忽略JSON解析错误
    }

    const error = new ServerError(message);
    const finalError = await this.applyErrorInterceptors(error);
    return Err(finalError);
  }

  /**
   * 处理异常
   */
  private async handleError(error: unknown): Promise<Result<never, AppError>> {
    const appError = error instanceof AppError
      ? error
      : new NetworkError('Network request failed', error);

    const finalError = await this.applyErrorInterceptors(appError);
    return Err(finalError);
  }

  /**
   * 应用错误拦截器
   */
  private async applyErrorInterceptors(error: AppError): Promise<AppError> {
    let finalError = error;
    for (const interceptor of this.errorInterceptors) {
      finalError = await interceptor(finalError);
    }
    return finalError;
  }

  /**
   * 规范化重试配置
   */
  private normalizeRetryConfig(retry?: number | RetryConfig): RetryConfig {
    if (typeof retry === 'number') {
      return {
        count: retry,
        delay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      };
    }
    return retry || { count: 0, delay: 0 };
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(status: number, _config: RetryConfig): boolean {
    // 5xx错误可以重试
    if (status >= 500) return true;
    
    // 429 Too Many Requests可以重试
    if (status === 429) return true;
    
    return false;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 便捷方法
   */
  get<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Result<T, AppError>> {
    return this.request({ ...config, url, method: 'GET' });
  }

  post<T>(url: string, body?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<Result<T, AppError>> {
    return this.request({ ...config, url, method: 'POST', body });
  }

  put<T>(url: string, body?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<Result<T, AppError>> {
    return this.request({ ...config, url, method: 'PUT', body });
  }

  delete<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Result<T, AppError>> {
    return this.request({ ...config, url, method: 'DELETE' });
  }

  patch<T>(url: string, body?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<Result<T, AppError>> {
    return this.request({ ...config, url, method: 'PATCH', body });
  }
}

/**
 * 创建默认客户端实例
 */
export const createApiClient = (baseURL: string): ApiClient => {
  const client = new ApiClient(baseURL);

  // 添加默认拦截器
  client.addRequestInterceptor(async (config) => {
    // 添加认证token
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    return config;
  });

  client.addErrorInterceptor(async (error) => {
    // 统一错误处理
    console.error('[API Error]', error);
    return error;
  });

  return client;
};

export default ApiClient;
