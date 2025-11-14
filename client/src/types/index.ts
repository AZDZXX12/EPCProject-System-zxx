/**
 * 全局类型定义
 * 统一管理项目中使用的所有TypeScript类型
 */

// ==================== 项目相关 ====================
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  progress: number;
  status: ProjectStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
}

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

// ==================== 任务相关 ====================
export interface Task {
  id: string;
  projectId: string;
  name: string;
  text?: string; // dhtmlxgantt使用text字段
  description?: string;
  start_date: Date | string;
  end_date: Date | string;
  duration?: number;
  progress: number;
  parent?: string;
  type?: TaskType;
  assignee?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dependencies?: string[];
  color?: string;
  open?: boolean; // 是否展开子任务
}

export type TaskType = 'task' | 'project' | 'milestone';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

// ==================== 施工日志相关 ====================
export interface ConstructionLog {
  id: string;
  projectId: string;
  taskId?: string;
  date: Date | string;
  weather?: string;
  temperature?: string;
  workContent: string;
  workProgress: number;
  workers?: number;
  equipment?: string[];
  materials?: Material[];
  issues?: string;
  photos?: string[];
  createdBy: string;
  createdAt: Date | string;
}

export interface Material {
  name: string;
  quantity: number;
  unit: string;
  supplier?: string;
}

// ==================== 设备相关 ====================
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model?: string;
  manufacturer?: string;
  specifications?: Record<string, any>;
  quantity: number;
  unit: string;
  price?: number;
  status: DeviceStatus;
  location?: string;
  purchaseDate?: Date | string;
  warrantyPeriod?: number;
  projectId?: string;
}

export type DeviceType =
  | 'pump'
  | 'valve'
  | 'tank'
  | 'reactor'
  | 'heat-exchanger'
  | 'compressor'
  | 'other';
export type DeviceStatus = 'available' | 'in-use' | 'maintenance' | 'retired';

// ==================== 采购相关 ====================
export interface ProcurementItem {
  id: string;
  projectId: string;
  deviceId?: string;
  name: string;
  category: string;
  specifications?: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  actualPrice?: number;
  supplier?: string;
  status: ProcurementStatus;
  requestDate: Date | string;
  expectedDate?: Date | string;
  receivedDate?: Date | string;
  requestedBy: string;
}

export type ProcurementStatus = 'requested' | 'approved' | 'ordered' | 'received' | 'rejected';

// ==================== 用户相关 ====================
export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  createdAt?: Date | string;
  lastLogin?: Date | string;
}

export type UserRole = 'admin' | 'manager' | 'engineer' | 'worker' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

// ==================== 文档相关 ====================
export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  category?: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedAt: Date | string;
  version?: string;
  tags?: string[];
}

export type DocumentType = 'design' | 'contract' | 'report' | 'drawing' | 'specification' | 'other';

// ==================== 报告相关 ====================
export interface Report {
  id: string;
  projectId: string;
  type: ReportType;
  title: string;
  content: string;
  generatedBy: string;
  generatedAt: Date | string;
  period?: {
    start: Date | string;
    end: Date | string;
  };
  data?: Record<string, any>;
}

export type ReportType = 'progress' | 'quality' | 'safety' | 'cost' | 'summary';

// ==================== API响应相关 ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== 表单相关 ====================
export interface FormValues {
  [key: string]: any;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  defaultValue?: any;
  rules?: any[];
}

// ==================== 事件相关 ====================
export interface EventData {
  type: string;
  payload: any;
  timestamp: number;
}

export interface TaskEventData {
  taskId: string;
  projectId: string;
  action: 'create' | 'update' | 'delete';
  data: Partial<Task>;
}

export interface LogEventData {
  logId: string;
  projectId: string;
  taskId?: string;
  action: 'create' | 'update' | 'delete';
  data: Partial<ConstructionLog>;
}

export interface PhaseEventData {
  phaseId: string;
  projectId: string;
  action: 'update';
  data: {
    progress: number;
  };
}

// ==================== 存储相关 ====================
export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface CacheOptions {
  ttl?: number; // 缓存时间（毫秒）
  key?: string;
}

// ==================== 甘特图相关 ====================
export interface GanttConfig {
  scale_unit: 'day' | 'week' | 'month' | 'year';
  date_scale: string;
  subscales?: Array<{
    unit: string;
    step: number;
    date: string;
  }>;
  columns?: GanttColumn[];
}

export interface GanttColumn {
  name: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  tree?: boolean;
  template?: (task: Task) => string;
}

// ==================== 3D相关 ====================
export interface Scene3DConfig {
  camera?: {
    position: [number, number, number];
    fov?: number;
  };
  lights?: Array<{
    type: 'ambient' | 'directional' | 'point' | 'spot';
    color?: string;
    intensity?: number;
    position?: [number, number, number];
  }>;
  controls?: {
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
  };
}

// ==================== 工具函数类型 ====================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ==================== 导出所有类型 ====================
export // 已在上面定义，这里仅作为索引
 type {};
