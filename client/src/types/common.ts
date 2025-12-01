/**
 * 通用类型定义
 * 
 * 用于替换项目中的any类型，提供严格的类型安全
 */

// 表单相关类型
export interface ProfileFormValues {
  username?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  avatar?: string;
}

export interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  taskUpdate: boolean;
  mention: boolean;
  deadline: boolean;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

// 分页类型
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  pageSizeOptions?: string[];
}

// 表格类型
export interface TableParams {
  pagination?: Pagination;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  filters?: Record<string, any>;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}

// 项目类型
export interface Project {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  manager?: string;
  members?: string[];
  budget?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt?: string;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 任务类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  assigneeName?: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies?: string[];
  subtasks?: Task[];
  tags?: string[];
  attachments?: Attachment[];
  comments?: Comment[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 附件类型
export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

// 评论类型
export interface Comment {
  id: string;
  content: string;
  author: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export enum WebSocketMessageType {
  TASK_UPDATE = 'task_update',
  COMMENT = 'comment',
  MENTION = 'mention',
  NOTIFICATION = 'notification',
  SYSTEM = 'system',
  ERROR = 'error',
}

// 通知类型
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
  readAt?: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TASK = 'task',
  MENTION = 'mention',
  DEADLINE = 'deadline',
  SYSTEM = 'system',
}

// 文件上传类型
export interface UploadFile {
  uid: string;
  name: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  response?: any;
  url?: string;
  thumbUrl?: string;
  size?: number;
  type?: string;
  percent?: number;
  originFileObj?: File;
}

// 选项类型
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  children?: SelectOption<T>[];
}

// 树形数据类型
export interface TreeNode<T = any> {
  key: string;
  title: string;
  value?: T;
  children?: TreeNode<T>[];
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  isLeaf?: boolean;
  icon?: React.ReactNode;
}

// 图表数据类型
export interface ChartData {
  name: string;
  value: number;
  category?: string;
  date?: string;
  [key: string]: any;
}

// 地图坐标类型
export interface Coordinate {
  longitude: number;
  latitude: number;
  altitude?: number;
}

// 设备类型
export interface Device {
  id: string;
  name: string;
  type: string;
  model?: string;
  status: DeviceStatus;
  location?: string;
  coordinate?: Coordinate;
  lastMaintenance?: string;
  nextMaintenance?: string;
  parameters?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  FAULT = 'fault',
  IDLE = 'idle',
  RUNNING = 'running',
}

// 材料类型
export interface Material {
  id: string;
  name: string;
  category: string;
  specification?: string;
  unit: string;
  price: number;
  quantity?: number;
  supplier?: string;
  warehouse?: string;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  lastPurchaseDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// 供应商类型
export interface Supplier {
  id: string;
  name: string;
  code?: string;
  type: SupplierType;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  rating?: number;
  certifications?: string[];
  materials?: string[];
  paymentTerms?: string;
  deliveryTime?: number;
  createdAt: string;
  updatedAt?: string;
}

export enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  AGENT = 'agent',
  OTHER = 'other',
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
}

// 环境配置类型
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  WS_URL: string;
  PUBLIC_URL: string;
  VERSION: string;
}
