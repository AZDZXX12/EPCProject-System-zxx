/**
 * API服务层 - 统一管理所有API请求
 * 支持生产环境和开发环境自动切换
 */

import { API_BASE_URL, USE_MOCK_DATA } from '../config';
import { mockApi, checkBackendAvailable } from '../utils/mockApi';
import { cacheManager } from '../utils/cacheManager';

// API请求配置
interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  useCache?: boolean;
  cacheTTL?: number;
}

// 统一的错误类型
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 请求超时处理
const fetchWithTimeout = async (url: string, config: RequestConfig = {}): Promise<Response> => {
  const { timeout = 10000, ...fetchConfig } = config;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// 请求重试逻辑
const fetchWithRetry = async (url: string, config: RequestConfig = {}): Promise<Response> => {
  const { retry = 0, retryDelay = 1000, ...fetchConfig } = config;

  let lastError: Error | null = null;

  for (let i = 0; i <= retry; i++) {
    try {
      return await fetchWithTimeout(url, fetchConfig);
    } catch (error) {
      lastError = error as Error;
      if (i < retry) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }

  throw lastError;
};

// 统一的API请求方法
class ApiService {
  private backendAvailable: boolean | null = null;
  private checkingBackend = false;

  // 检查后端是否可用
  private async isBackendAvailable(): Promise<boolean> {
    if (this.backendAvailable !== null) {
      return this.backendAvailable;
    }

    if (this.checkingBackend) {
      // 等待检查完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.isBackendAvailable();
    }

    this.checkingBackend = true;

    try {
      this.backendAvailable = await checkBackendAvailable(API_BASE_URL);
    } catch {
      this.backendAvailable = false;
    } finally {
      this.checkingBackend = false;
    }

    return this.backendAvailable;
  }

  // 通用请求方法
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { useCache = false, cacheTTL = 300000, ..._fetchConfig } = config; // 默认5分钟缓存
    
    // 对于GET请求，尝试使用缓存
    if (useCache && (!config.method || config.method === 'GET')) {
      const cacheKey = `api:${endpoint}`;
      const cached = cacheManager.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    // 始终使用完整的 URL（包含 API_BASE_URL）
    const url = `${API_BASE_URL}${endpoint}`;
    const isCrossOrigin = ((): boolean => {
      if (typeof window === 'undefined') return false;
      const apiOrigin = new URL(API_BASE_URL).origin;
      return apiOrigin !== window.location.origin;
    })();

    if (USE_MOCK_DATA) {
      return this.getMockResponse<T>(endpoint, config);
    }

    

    try {
      const response = await fetchWithRetry(url, {
        ...config,
        timeout: (config.timeout ?? (isCrossOrigin ? 1200 : 10000)),
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        credentials: isCrossOrigin ? 'omit' : 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData
        );
      }

      const responseData = await response.json();
      
      // 缓存成功的GET请求响应
      if (useCache && (!config.method || config.method === 'GET')) {
        const cacheKey = `api:${endpoint}`;
        cacheManager.set(cacheKey, responseData, cacheTTL);
      }
      
      return responseData;
    } catch (error) {
      // 生产环境：记录错误但不使用mock
      if (!USE_MOCK_DATA) {
        console.error('[API] Request failed:', error);
        throw error;
      }

      
      return this.getMockResponse<T>(endpoint, config);
    }
  }

  // 获取Mock响应
  private async getMockResponse<T>(endpoint: string, config: RequestConfig): Promise<T> {
    const method = config.method?.toUpperCase() || 'GET';

    // 项目相关API
    if (endpoint.includes('/projects')) {
      if (method === 'GET' && !endpoint.match(/\/projects\/[^/]+$/)) {
        return (await mockApi.getProjects()).json() as Promise<T>;
      }
      if (method === 'POST') {
        const body = config.body ? JSON.parse(config.body as string) : {};
        return (await mockApi.createProject(body)).json() as Promise<T>;
      }
      const projectMatch = endpoint.match(/\/projects\/([^/]+)/);
      const projectId = projectMatch?.[1];
      if (projectId) {
        if (method === 'GET') {
          const res = (await mockApi.getProject(projectId)) as {
            ok: boolean;
            json: () => Promise<any>;
          };
          if (!res.ok) {
            throw new ApiError('Project not found', 404);
          }
          return res.json() as Promise<T>;
        }
        if (method === 'PUT' || method === 'PATCH') {
          const body = config.body ? JSON.parse(config.body as string) : {};
          const res = (await mockApi.updateProject(projectId, body)) as {
            ok: boolean;
            json: () => Promise<any>;
          };
          if (!res.ok) {
            throw new ApiError('Failed to update project', 400);
          }
          return res.json() as Promise<T>;
        }
        if (method === 'DELETE') {
          await mockApi.deleteProject(projectId);
          return { success: true } as T;
        }
      }
    }

    // 任务相关API
    if (endpoint.includes('/tasks')) {
      const projectId = new URLSearchParams(endpoint.split('?')[1]).get('project_id');
      if (method === 'GET') {
        return (await mockApi.getTasks(projectId || undefined)).json() as Promise<T>;
      }
      if (method === 'POST') {
        const body = config.body ? JSON.parse(config.body as string) : {};
        return (await mockApi.createTask(body)).json() as Promise<T>;
      }
      const taskMatch = endpoint.match(/\/tasks\/([^/]+)/);
      const taskId = taskMatch?.[1];
      if (taskId) {
        if (method === 'PUT' || method === 'PATCH') {
          const body = config.body ? JSON.parse(config.body as string) : {};
          const res = (await mockApi.updateTask(taskId, body)) as {
            ok: boolean;
            json: () => Promise<any>;
          };
          if (!res.ok) {
            throw new ApiError('Failed to update task', 400);
          }
          return res.json() as Promise<T>;
        }
        if (method === 'DELETE') {
          await mockApi.deleteTask(taskId);
          return { success: true } as T;
        }
      }
    }

    // 设备相关API
    if (endpoint.includes('/devices')) {
      const projectId = new URLSearchParams(endpoint.split('?')[1]).get('project_id');
      if (method === 'GET') {
        return (await mockApi.getDevices(projectId || undefined)).json() as Promise<T>;
      }
      if (method === 'POST') {
        const body = config.body ? JSON.parse(config.body as string) : {};
        return (await mockApi.createDevice(body)).json() as Promise<T>;
      }
      const deviceMatch = endpoint.match(/\/devices\/([^/]+)/);
      const deviceIdStr = deviceMatch?.[1];
      const deviceId = deviceIdStr ? Number(deviceIdStr) : NaN;
      if (!Number.isNaN(deviceId)) {
        if (method === 'PUT' || method === 'PATCH') {
          const body = config.body ? JSON.parse(config.body as string) : {};
          const res = (await mockApi.updateDevice(deviceId, body)) as {
            ok: boolean;
            json: () => Promise<any>;
          };
          if (!res.ok) {
            throw new ApiError('Failed to update device', 400);
          }
          return res.json() as Promise<T>;
        }
        if (method === 'DELETE') {
          await mockApi.deleteDevice(deviceId);
          return { success: true } as T;
        }
      }
    }

    throw new ApiError('Mock API not implemented for this endpoint', 501);
  }

  // GET请求
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH请求
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // 重置后端可用性检查
  resetBackendCheck() {
    this.backendAvailable = null;
  }
}

// 导出单例
export const apiService = new ApiService();

// 具体的API方法
export const projectApi = {
  getAll: () => apiService.get('/api/v1/projects/', { useCache: true, cacheTTL: 300000 }),
  getById: (id: string) => apiService.get(`/api/v1/projects/${id}`, { useCache: true, cacheTTL: 600000 }),
  create: (data: any) => apiService.post('/api/v1/projects/', data),
  update: (id: string, data: any) => apiService.put(`/api/v1/projects/${id}`, data),
  delete: (id: string) => apiService.delete(`/api/v1/projects/${id}`),
};

export const taskApi = {
  getAll: (projectId?: string) => {
    const query = projectId ? `?project_id=${projectId}` : '';
    return apiService.get(`/api/v1/tasks${query}`, { useCache: true, cacheTTL: 180000 });
  },
  getById: (id: string) => apiService.get(`/api/v1/tasks/${id}`, { useCache: true, cacheTTL: 300000 }),
  create: (data: any) => apiService.post('/api/v1/tasks/', data),
  update: (id: string, data: any) => apiService.put(`/api/v1/tasks/${id}`, data),
  delete: (id: string) => apiService.delete(`/api/v1/tasks/${id}`),
};

export const authApi = {
  login: (username: string, password: string) =>
    apiService.post('/api/v1/auth/login/', { username, password }),
  logout: () => apiService.post('/api/v1/auth/logout/'),
  getCsrfToken: () => apiService.get('/api/v1/auth/csrf/'),
  getCurrentUser: () => apiService.get('/api/v1/auth/user/'),
};

export const deviceApi = {
  getAll: () => apiService.get('/api/v1/devices/'),
  getById: (id: string) => apiService.get(`/api/v1/devices/${id}`),
  create: (data: any) => apiService.post('/api/v1/devices/', data),
  update: (id: string, data: any) => apiService.put(`/api/v1/devices/${id}`, data),
  delete: (id: string) => apiService.delete(`/api/v1/devices/${id}`),
};
