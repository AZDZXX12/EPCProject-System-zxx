/**
 * 全局状态管理
 * 
 * 使用Zustand实现统一的状态管理
 * 支持持久化、开发工具、中间件
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Task, Project, User, Device, Material, TaskStatus, TaskPriority } from '../types/common';
import { eventBus } from '../utils/EnhancedEventBus';
import { logger } from '../utils/EnhancedLogger';
import { taskApi } from '../services/api';

// 全局状态接口
interface GlobalState {
  // ========== 项目数据 ==========
  currentProject: Project | null;
  projects: Project[];
  
  // ========== 任务数据 ==========
  tasks: Task[];
  selectedTaskId: string | null;
  taskFilters: {
    status?: string;
    assignee?: string;
    priority?: string;
    dateRange?: [string, string];
  };
  
  // ========== 用户数据 ==========
  user: User | null;
  permissions: string[];
  token: string | null;
  
  // ========== 设备数据 ==========
  devices: Device[];
  deviceStatus: Map<string, 'online' | 'offline' | 'error'>;
  
  // ========== 材料数据 ==========
  materials: Material[];
  priceAlerts: Array<{
    materialId: string;
    threshold: number;
    type: 'above' | 'below';
  }>;
  
  // ========== UI状态 ==========
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  locale: 'zh-CN' | 'en-US';
  loading: {
    global: boolean;
    tasks: boolean;
    projects: boolean;
    [key: string]: boolean;
  };
  
  // ========== 通知状态 ==========
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  unreadCount: number;
  
  // ========== WebSocket状态 ==========
  wsConnected: boolean;
  wsReconnectAttempts: number;
  
  // ========== 缓存数据 ==========
  cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  
  // ========== Actions - 项目 ==========
  setCurrentProject: (project: Project | null) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  loadProjects: () => Promise<void>;
  
  // ========== Actions - 任务 ==========
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  selectTask: (taskId: string | null) => void;
  setTaskFilters: (filters: GlobalState['taskFilters']) => void;
  syncTasks: () => Promise<void>;
  
  // ========== Actions - 用户 ==========
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  logout: () => void;
  
  // ========== Actions - 设备 ==========
  setDevices: (devices: Device[]) => void;
  updateDeviceStatus: (deviceId: string, status: 'online' | 'offline' | 'error') => void;
  
  // ========== Actions - 材料 ==========
  setMaterials: (materials: Material[]) => void;
  addPriceAlert: (alert: GlobalState['priceAlerts'][0]) => void;
  removePriceAlert: (materialId: string) => void;
  
  // ========== Actions - UI ==========
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLocale: (locale: 'zh-CN' | 'en-US') => void;
  setLoading: (key: string, value: boolean) => void;
  
  // ========== Actions - 通知 ==========
  addNotification: (notification: Omit<GlobalState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // ========== Actions - WebSocket ==========
  setWsConnected: (connected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  
  // ========== Actions - 缓存 ==========
  setCache: (key: string, data: any, ttl?: number) => void;
  getCache: (key: string) => any;
  clearCache: (pattern?: string) => void;
  
  // ========== Actions - 工具方法 ==========
  reset: () => void;
  syncWithBackend: () => Promise<void>;
}

// 初始状态
const initialState = {
  currentProject: null,
  projects: [],
  tasks: [],
  selectedTaskId: null,
  taskFilters: {},
  user: null,
  permissions: [],
  token: null,
  devices: [],
  deviceStatus: new Map(),
  materials: [],
  priceAlerts: [],
  sidebarCollapsed: false,
  theme: 'light' as const,
  locale: 'zh-CN' as const,
  loading: {
    global: false,
    tasks: false,
    projects: false,
  },
  notifications: [],
  unreadCount: 0,
  wsConnected: false,
  wsReconnectAttempts: 0,
  cache: new Map(),
};

// 创建全局Store
export const useGlobalStore = create<GlobalState>()(
  subscribeWithSelector(
    devtools(
      persist(
        immer((set, get) => ({
          ...initialState,
          
          // ========== 项目管理 ==========
          setCurrentProject: (project) => {
            set((state) => {
              state.currentProject = project;
            });
            eventBus.emit('project:changed', { project });
            logger.info('Project changed', { projectId: project?.id });
          },
          
          updateProject: (projectId, updates) => {
            set((state) => {
              const project = state.projects.find(p => p.id === projectId);
              if (project) {
                Object.assign(project, updates);
                if (state.currentProject?.id === projectId) {
                  Object.assign(state.currentProject, updates);
                }
              }
            });
            eventBus.emit('project:updated', { projectId, updates });
          },
          
          loadProjects: async () => {
            set((state) => { state.loading.projects = true; });
            try {
              const response = await fetch('/api/projects');
              const projects = await response.json();
              set((state) => {
                state.projects = projects;
                state.loading.projects = false;
              });
            } catch (error) {
              logger.error('Failed to load projects', error);
              set((state) => { state.loading.projects = false; });
            }
          },
          
          // ========== 任务管理 ==========
          setTasks: (tasks) => {
            set((state) => { state.tasks = tasks; });
          },
          
          addTask: (task) => {
            set((state) => {
              state.tasks.push(task);
            });
            eventBus.emit('task:created', { task });
            logger.info('Task created', { taskId: task.id });
          },
          
          updateTask: (taskId, updates) => {
            set((state) => {
              const task = state.tasks.find(t => t.id === taskId);
              if (task) {
                Object.assign(task, updates);
              }
            });
            eventBus.emit('task:updated', { taskId, updates });
          },
          
          deleteTask: (taskId) => {
            set((state) => {
              state.tasks = state.tasks.filter(t => t.id !== taskId);
              if (state.selectedTaskId === taskId) {
                state.selectedTaskId = null;
              }
            });
            eventBus.emit('task:deleted', { taskId });
          },
          
          selectTask: (taskId) => {
            set((state) => { state.selectedTaskId = taskId; });
          },
          
          setTaskFilters: (filters) => {
            set((state) => { state.taskFilters = filters; });
          },
          
          syncTasks: async () => {
            set((state) => { state.loading.tasks = true; });
            try {
              const projectId = get().currentProject?.id;
              const data = await taskApi.getAll(projectId);
              const mapped: Task[] = Array.isArray(data) ? (data as any[]).map((t: any) => ({
                id: String(t.id),
                title: t.name || t.title || '',
                description: t.description || '',
                status: ((): TaskStatus => {
                  switch (t.status) {
                    case 'in_progress': return TaskStatus.IN_PROGRESS;
                    case 'completed': return TaskStatus.DONE;
                    case 'blocked': return TaskStatus.IN_REVIEW;
                    case 'pending':
                    default: return TaskStatus.TODO;
                  }
                })(),
                priority: ((): TaskPriority => {
                  switch (t.priority) {
                    case 'low': return TaskPriority.LOW;
                    case 'high': return TaskPriority.HIGH;
                    case 'urgent': return TaskPriority.URGENT;
                    case 'medium':
                    default: return TaskPriority.MEDIUM;
                  }
                })(),
                assignee: t.assignee || '',
                assigneeName: t.assignee || '',
                startDate: t.start_date,
                endDate: t.end_date,
                progress: typeof t.progress === 'number' ? t.progress : 0,
                dependencies: t.dependencies || [],
                subtasks: [],
                tags: t.tags || [],
                attachments: [],
                comments: [],
                createdBy: t.created_by || 'system',
                createdAt: t.created_at || new Date().toISOString(),
                updatedAt: t.updated_at,
              })) : [];
              set((state) => {
                state.tasks = mapped;
                state.loading.tasks = false;
              });
              logger.info('Tasks synced', { count: mapped.length, projectId });
            } catch (error) {
              logger.error('Failed to sync tasks', error);
              set((state) => { state.loading.tasks = false; });
            }
          },
          
          // ========== 用户管理 ==========
          setUser: (user) => {
            set((state) => { state.user = user; });
            eventBus.emit('user:changed', { user });
          },
          
          setToken: (token) => {
            set((state) => { state.token = token; });
            if (token) {
              localStorage.setItem('token', token);
            } else {
              localStorage.removeItem('token');
            }
          },
          
          setPermissions: (permissions) => {
            set((state) => { state.permissions = permissions; });
          },
          
          logout: () => {
            set((state) => {
              state.user = null;
              state.token = null;
              state.permissions = [];
              state.currentProject = null;
            });
            localStorage.clear();
            eventBus.emit('user:logout', {});
          },
          
          // ========== 设备管理 ==========
          setDevices: (devices) => {
            set((state) => { state.devices = devices; });
          },
          
          updateDeviceStatus: (deviceId, status) => {
            set((state) => {
              state.deviceStatus.set(deviceId, status);
            });
            eventBus.emit('device:statusChanged', { deviceId, status });
          },
          
          // ========== 材料管理 ==========
          setMaterials: (materials) => {
            set((state) => { state.materials = materials; });
          },
          
          addPriceAlert: (alert) => {
            set((state) => {
              state.priceAlerts.push(alert);
            });
            eventBus.emit('price:alertAdded', alert);
          },
          
          removePriceAlert: (materialId) => {
            set((state) => {
              state.priceAlerts = state.priceAlerts.filter(a => a.materialId !== materialId);
            });
          },
          
          // ========== UI管理 ==========
          toggleSidebar: () => {
            set((state) => {
              state.sidebarCollapsed = !state.sidebarCollapsed;
            });
          },
          
          setTheme: (theme) => {
            set((state) => { state.theme = theme; });
            document.documentElement.setAttribute('data-theme', theme);
            eventBus.emit('theme:changed', { theme });
          },
          
          setLocale: (locale) => {
            set((state) => { state.locale = locale; });
            eventBus.emit('locale:changed', { locale });
          },
          
          setLoading: (key, value) => {
            set((state) => {
              state.loading[key] = value;
            });
          },
          
          // ========== 通知管理 ==========
          addNotification: (notification) => {
            const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newNotification = {
              ...notification,
              id,
              timestamp: Date.now(),
              read: false,
            };
            
            set((state) => {
              state.notifications.unshift(newNotification);
              state.unreadCount++;
              // 只保留最近100条
              if (state.notifications.length > 100) {
                state.notifications = state.notifications.slice(0, 100);
              }
            });
            
            eventBus.emit('notification:added', newNotification);
          },
          
          markNotificationRead: (id) => {
            set((state) => {
              const notification = state.notifications.find(n => n.id === id);
              if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
              }
            });
          },
          
          clearNotifications: () => {
            set((state) => {
              state.notifications = [];
              state.unreadCount = 0;
            });
          },
          
          // ========== WebSocket管理 ==========
          setWsConnected: (connected) => {
            set((state) => {
              state.wsConnected = connected;
              if (connected) {
                state.wsReconnectAttempts = 0;
              }
            });
            eventBus.emit('ws:connectionChanged', { connected });
          },
          
          incrementReconnectAttempts: () => {
            set((state) => {
              state.wsReconnectAttempts++;
            });
          },
          
          resetReconnectAttempts: () => {
            set((state) => {
              state.wsReconnectAttempts = 0;
            });
          },
          
          // ========== 缓存管理 ==========
          setCache: (key, data, ttl = 300000) => { // 默认5分钟
            set((state) => {
              state.cache.set(key, {
                data,
                timestamp: Date.now(),
                ttl,
              });
            });
          },
          
          getCache: (key) => {
            const cached = get().cache.get(key);
            if (!cached) return null;
            
            const now = Date.now();
            if (now - cached.timestamp > cached.ttl) {
              // 缓存过期
              set((state) => {
                state.cache.delete(key);
              });
              return null;
            }
            
            return cached.data;
          },
          
          clearCache: (pattern) => {
            set((state) => {
              if (pattern) {
                const keys = Array.from(state.cache.keys());
                keys.forEach(key => {
                  if (key.includes(pattern)) {
                    state.cache.delete(key);
                  }
                });
              } else {
                state.cache.clear();
              }
            });
          },
          
          // ========== 工具方法 ==========
          reset: () => {
            set(initialState);
          },
          
          syncWithBackend: async () => {
            set((state) => { state.loading.global = true; });
            
            try {
              // 并行加载所有数据
              const [projects, tasks, devices, materials] = await Promise.all([
                fetch('/api/projects').then(r => r.json()),
                fetch('/api/tasks').then(r => r.json()),
                fetch('/api/devices').then(r => r.json()),
                fetch('/api/materials').then(r => r.json()),
              ]);
              
              set((state) => {
                state.projects = projects;
                state.tasks = tasks;
                state.devices = devices;
                state.materials = materials;
                state.loading.global = false;
              });
              
              logger.info('Backend sync completed');
              eventBus.emit('sync:completed', {});
            } catch (error) {
              logger.error('Backend sync failed', error);
              set((state) => { state.loading.global = false; });
              eventBus.emit('sync:failed', { error });
            }
          },
        })),
        {
          name: 'epc-global-store',
          // 只持久化部分状态
          partialize: (state) => ({
            user: state.user,
            token: state.token,
            theme: state.theme,
            locale: state.locale,
            sidebarCollapsed: state.sidebarCollapsed,
            taskFilters: state.taskFilters,
          }),
        }
      )
    )
  )
);

// 订阅器 - 监听特定状态变化
export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  return useGlobalStore.subscribe(
    (state) => state.tasks,
    callback
  );
};

export const subscribeToProject = (callback: (project: Project | null) => void) => {
  return useGlobalStore.subscribe(
    (state) => state.currentProject,
    callback
  );
};

// 选择器 - 获取派生状态
export const useFilteredTasks = () => {
  return useGlobalStore((state) => {
    const { tasks, taskFilters } = state;
    
    return tasks.filter(task => {
      if (taskFilters.status && task.status !== taskFilters.status) return false;
      if (taskFilters.assignee && task.assignee !== taskFilters.assignee) return false;
      if (taskFilters.priority && task.priority !== taskFilters.priority) return false;
      // 更多过滤逻辑...
      return true;
    });
  });
};

export const useUnreadNotifications = () => {
  return useGlobalStore((state) => 
    state.notifications.filter(n => !n.read)
  );
};

// 权限检查
export const useHasPermission = (permission: string) => {
  return useGlobalStore((state) => 
    state.permissions.includes(permission)
  );
};

// 导出类型
export type { GlobalState };
