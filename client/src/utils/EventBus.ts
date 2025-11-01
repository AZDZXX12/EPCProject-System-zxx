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
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
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

    if (this.debug) {
      console.log(`[EventBus] 订阅事件: ${event}`);
    }
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
        if (this.debug) {
          console.log(`[EventBus] 取消订阅: ${event}`);
        }
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
      if (this.debug) {
        console.log(`[EventBus] 触发事件: ${event}`, args);
      }
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[EventBus] 事件回调错误: ${event}`, error);
        }
      });
    } else if (this.debug) {
      console.warn(`[EventBus] 无订阅者: ${event}`);
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
    if (this.debug) {
      console.log('[EventBus] 清除所有事件监听');
    }
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
  // ============ 项目事件 ============
  PROJECT_CREATED: 'project:created',        // 项目创建
  PROJECT_UPDATED: 'project:updated',        // 项目更新
  PROJECT_SELECTED: 'project:selected',      // 项目选中
  PROJECT_DELETED: 'project:deleted',        // 项目删除
  
  // ============ 任务事件 ============
  TASK_CREATED: 'task:created',              // 任务创建
  TASK_UPDATED: 'task:updated',              // 任务更新
  TASK_DELETED: 'task:deleted',              // 任务删除
  TASK_PROGRESS_CHANGED: 'task:progress',    // 任务进度变化
  
  // ============ 施工日志事件 ============
  LOG_CREATED: 'log:created',                // 日志创建
  LOG_UPDATED: 'log:updated',                // 日志更新
  LOG_DELETED: 'log:deleted',                // 日志删除
  
  // ============ 阶段事件 ============
  PHASE_STARTED: 'phase:started',            // 阶段开始
  PHASE_UPDATED: 'phase:updated',            // 阶段更新
  PHASE_COMPLETED: 'phase:completed',        // 阶段完成
  
  // ============ 进度事件 ============
  PROGRESS_CHANGED: 'progress:changed',      // 项目进度变化
  PROGRESS_SYNCED: 'progress:synced',        // 进度同步完成
  
  // ============ 设备事件 ============
  DEVICE_CREATED: 'device:created',          // 设备创建
  DEVICE_UPDATED: 'device:updated',          // 设备更新
  DEVICE_STATUS_CHANGED: 'device:status',    // 设备状态变化
  
  // ============ 通知事件 ============
  NOTIFICATION_SHOW: 'notification:show',    // 显示通知
  NOTIFICATION_CLEAR: 'notification:clear',  // 清除通知
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
export const useEventBus = (
  event: string,
  callback: EventCallback,
  deps: any[] = []
): void => {
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
