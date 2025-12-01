/**
 * 🚀 事件总线系统
 *
 * 用途：实现模块间解耦通信
 * 模式：发布-订阅模式
 * 参考：JavaScript设计模式 + React最佳实践
 */

type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();
  private _debug: boolean;

  constructor(debug: boolean = false) {
    this._debug = debug;
  }

  /**
   * 订阅事件
   * @param event 事件名称
   * @param callback 回调函数
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);

    // Debug模式下的日志已移除，生产环境不输出
  }

  /**
   * 取消订阅
   * @param event 事件名称
   * @param callback 回调函数
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        // Debug模式下的日志已移除
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks && callbacks.length > 0) {
      // Debug日志已移除
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          // 生产环境静默处理错误
          if (process.env.NODE_ENV === 'development') {
            console.error(`[EventBus] 事件回调错误: ${event}`, error);
          }
        }
      });
    }
  }

  /**
   * 一次性订阅（触发后自动取消）
   * @param event 事件名称
   * @param callback 回调函数
   */
  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * 清除所有事件监听
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * 获取事件统计信息
   */
  getStats(): { event: string; listeners: number }[] {
    const stats: { event: string; listeners: number }[] = [];
    this.events.forEach((callbacks, event) => {
      stats.push({ event, listeners: callbacks.length });
    });
    return stats;
  }
}

// 创建全局单例
export const eventBus = new EventBus(false); // 关闭debug模式

/**
 * 🔥 系统事件定义
 *
 * 命名规范: [模块]:[动作]
 * 例如: project:created, task:updated
 */
export const EVENTS = {
  // 项目相关事件
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_SELECTED: 'project:selected',
  PROJECT_DELETED: 'project:deleted',
  PROJECT_PROGRESS_UPDATED: 'project:progress:updated',
  
  // 任务相关事件
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_ASSIGNED: 'task:assigned',
  TASK_COMPLETED: 'task:completed',
  
  // 设备相关事件
  DEVICE_CREATED: 'device:created',
  DEVICE_UPDATED: 'device:updated',
  DEVICE_DELETED: 'device:deleted',
  DEVICE_STATUS_CHANGED: 'device:status:changed',
  
  // 采购相关事件
  PROCUREMENT_CREATED: 'procurement:created',
  PROCUREMENT_ITEM_ADDED: 'procurement:item:added',
  PROCUREMENT_STATUS_CHANGED: 'procurement:status:changed',
  PROCUREMENT_REQUEST: 'procurement:request',
  
  // 安全相关事件
  SAFETY_CHECK_CREATED: 'safety:check:created',
  SAFETY_ISSUE_FOUND: 'safety:issue:found',
  SAFETY_ISSUE_RESOLVED: 'safety:issue:resolved',
  SAFETY_ALERT: 'safety:alert',
  
  // 文档相关事件
  DOCUMENT_UPLOADED: 'document:uploaded',
  DOCUMENT_UPDATED: 'document:updated',
  DOCUMENT_DELETED: 'document:deleted',
  
  // 系统事件
  DATA_SYNCED: 'data:synced',
  ERROR_OCCURRED: 'error:occurred',
  
  // 通知事件
  NOTIFICATION_SENT: 'notification:sent',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_SHOW: 'notification:show',
  BROADCAST_NOTIFICATION: 'notification:broadcast',
  EMERGENCY_NOTIFICATION: 'notification:emergency',
  
  // 施工相关事件
  CONSTRUCTION_LOG_SUBMITTED: 'construction:log:submitted',
  CONSTRUCTION_PAUSE: 'construction:pause',
  CONSTRUCTION_STOP: 'construction:stop',
  LOG_CREATED: 'log:created',
  LOG_UPDATED: 'log:updated',
  
  // 质量相关事件
  QUALITY_ISSUE_FOUND: 'quality:issue:found',
  QUALITY_CHECK_COMPLETED: 'quality:check:completed',
  
  // 阶段管理事件
  PHASE_TRANSITION: 'phase:transition',
  PHASE_STARTED: 'phase:started',
  PHASE_READY_FOR_TRANSITION: 'phase:ready:transition',
  PHASE_COMPLETED: 'phase:completed',
  PHASE_UPDATED: 'phase:updated',
  PROGRESS_CHANGED: 'progress:changed',
  
  // 模块管理事件
  MODULE_ACTIVATED: 'module:activated',
  MODULE_DEACTIVATED: 'module:deactivated',
  
  // 优化相关事件
  SCHEDULE_OPTIMIZED: 'schedule:optimized',
  
  // 价格相关事件
  PRICE_INQUIRY: 'price:inquiry',
  
  // 供应商相关事件
  SUPPLIER_EVALUATION: 'supplier:evaluation',
  
  // 费用事件
  COST_UPDATED: 'cost:updated',
  COST_WARNING: 'cost:warning',
  
  // 采购事件（避免重复）
  PROCUREMENT_PLAN_CREATED: 'procurement:plan:created',

  // 价格预警事件
  PRICE_ALERT_TRIGGERED: 'price:alert:triggered',

  // 风险事件
  RISK_IDENTIFIED: 'risk:identified',
  RISK_UPDATED: 'risk:updated',

  // 供应商事件
  SUPPLIER_EVALUATED: 'supplier:evaluated',

  // 项目阶段事件
  PHASE_CHANGED: 'phase:changed',

  // 里程碑事件
  MILESTONE_CREATED: 'milestone:created',
  MILESTONE_UPDATED: 'milestone:updated',

  // 交付物事件
  DELIVERABLE_ADDED: 'deliverable:added',
  DELIVERABLE_COMPLETED: 'deliverable:completed',
  DELIVERABLE_APPROVED: 'deliverable:approved',
  DELIVERABLE_REJECTED: 'deliverable:rejected',
  DELIVERABLE_UPDATED: 'deliverable:updated',

  // 模块集成事件
  CONSTRUCTION_MILESTONE_REACHED: 'construction:milestone:reached',
  HIGH_RISK_WORK_STARTED: 'construction:highrisk:started',
  SAFETY_INCIDENT: 'safety:incident',
  BUDGET_EXCEEDED: 'budget:exceeded',
  RESOURCE_CONFLICT: 'resource:conflict',
  CONSTRUCTION_UPDATE: 'construction:update',
  TASK_PROGRESS_UPDATE: 'task:progress:update',
  RESOURCE_REALLOCATED: 'resource:reallocated',

  // AI助手事件
  AI_ASSISTANT_OPEN: 'ai:open',
} as const;

/**
 * 🔑 类型定义
 */

// 项目事件数据
export interface ProjectEventData {
  id: string;
  name: string;
  status?: string;
  progress?: number;
}

// 任务事件数据
export interface TaskEventData {
  id: string;
  projectId: string;
  name: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  type?: string;
}

// 日志事件数据
export interface LogEventData {
  id: string;
  projectId: string;
  taskId?: string;
  date: string;
  progress: number;
  content?: string;
}

// 阶段事件数据
export interface PhaseEventData {
  key: string;
  projectId: string;
  name: string;
  progress: number;
  startDate?: string;
  endDate?: string;
}

// 进度事件数据
export interface ProgressEventData {
  projectId: string;
  progress: number;
  source?: 'task' | 'phase' | 'log' | 'manual';
  metadata?: any;
}

// 采购计划事件数据
export interface ProcurementEventData {
  materialId: string;
  materialName: string;
  specification: string;
  quantity: number;
  estimatedPrice: number;
  urgency?: 'low' | 'medium' | 'high' | 'normal' | 'urgent' | 'emergency';
  type?: string;
  reason?: string;
  data?: any;
}

// 价格预警事件数据
export interface PriceAlertEventData {
  materialId: string;
  materialName: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  region?: string;
}

/**
 * 🎯 React Hook: 使用事件总线
 *
 * @example
 * ```tsx
 * useEventBus(EVENTS.TASK_UPDATED, (task) => {
 *   console.log('任务已更新', task);
 * }, []);
 * ```
 */
export const useEventBus = (event: string, callback: EventCallback, deps: any[] = []): void => {
  const { useEffect, useRef } = require('react');

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (...args: any[]) => {
      callbackRef.current(...args);
    };

    eventBus.on(event, handler);

    return () => {
      eventBus.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
};

export default eventBus;
