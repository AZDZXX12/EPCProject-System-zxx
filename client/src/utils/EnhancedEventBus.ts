/**
 * 增强版事件总线
 * 
 * 功能特性：
 * 1. 类型安全的事件
 * 2. 事件历史记录
 * 3. 中间件支持
 * 4. 事件过滤和转换
 * 5. WebSocket广播
 * 6. 事件调试工具
 */

import { logger } from './EnhancedLogger';
import { useEffect } from 'react';
import type { DependencyList } from 'react';

// 事件负载接口
export interface EventPayload<T = any> {
  source: string;           // 事件来源模块
  target?: string | string[]; // 目标模块（可选）
  data: T;                  // 事件数据
  timestamp: number;        // 时间戳
  userId?: string;          // 用户ID
  sessionId?: string;       // 会话ID
  broadcast?: boolean;      // 是否广播到其他客户端
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // 优先级
  metadata?: Record<string, any>; // 元数据
}

// 事件监听器类型
type EventListener<T = any> = (payload: EventPayload<T>) => void | Promise<void>;

// 中间件类型
type Middleware = (event: string, payload: EventPayload) => EventPayload | null;

// 事件映射配置
interface EventMapping {
  from: string | RegExp;
  to: string | string[];
  transform?: (payload: EventPayload) => EventPayload;
}

// 事件统计
interface EventStats {
  event: string;
  count: number;
  lastEmitted: number;
  averageHandleTime: number;
  errors: number;
}

class EnhancedEventBus {
  private events: Map<string, Set<EventListener>> = new Map();
  private history: EventPayload[] = [];
  private middleware: Middleware[] = [];
  private mappings: EventMapping[] = [];
  private stats: Map<string, EventStats> = new Map();
  private maxHistorySize = 1000;
  private ws: WebSocket | null = null;
  private debugMode = process.env.NODE_ENV === 'development';
  private wildcardListeners: Set<EventListener> = new Set();
  
  constructor() {
    // 开发环境下暴露到全局
    if (this.debugMode) {
      (window as any).__eventBus = this;
    }
    
    // 设置默认中间件
    this.setupDefaultMiddleware();
    
    // 设置事件映射
    this.setupEventMappings();
  }
  
  // ========== 核心功能 ==========
  
  /**
   * 发送事件
   */
  emit<T = any>(event: string, payload: Partial<EventPayload<T>> | T): void {
    // 构建完整的payload
    const fullPayload: EventPayload<T> = this.buildPayload(event, payload);
    
    // 执行中间件
    const processedPayload = this.runMiddleware(event, fullPayload);
    if (!processedPayload) return; // 中间件阻止了事件
    
    // 记录统计
    this.updateStats(event);
    
    // 记录历史
    this.addToHistory(processedPayload);
    
    // 调试日志
    if (this.debugMode) {
      logger.debug(`[EventBus] ${event}`, processedPayload);
    }
    
    // 触发监听器
    this.triggerListeners(event, processedPayload);
    
    // 触发通配符监听器
    this.triggerWildcardListeners(event, processedPayload);
    
    // 处理事件映射
    this.handleMappings(event, processedPayload);
    
    // WebSocket广播
    if (processedPayload.broadcast && this.ws?.readyState === WebSocket.OPEN) {
      this.broadcastEvent(event, processedPayload);
    }
  }
  
  /**
   * 订阅事件
   */
  on<T = any>(event: string | string[], listener: EventListener<T>): () => void {
    const events = Array.isArray(event) ? event : [event];
    
    events.forEach(e => {
      if (e === '*') {
        // 通配符监听器
        this.wildcardListeners.add(listener);
      } else {
        if (!this.events.has(e)) {
          this.events.set(e, new Set());
        }
        this.events.get(e)!.add(listener);
      }
    });
    
    // 返回取消订阅函数
    return () => {
      events.forEach(e => {
        if (e === '*') {
          this.wildcardListeners.delete(listener);
        } else {
          this.events.get(e)?.delete(listener);
        }
      });
    };
  }
  
  /**
   * 一次性订阅
   */
  once<T = any>(event: string, listener: EventListener<T>): () => void {
    const wrapper: EventListener<T> = (payload) => {
      listener(payload);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
  
  /**
   * 取消订阅
   */
  off(event: string, listener?: EventListener): void {
    if (!listener) {
      // 移除该事件的所有监听器
      this.events.delete(event);
    } else {
      this.events.get(event)?.delete(listener);
    }
  }
  
  /**
   * 清除所有监听器
   */
  clear(): void {
    this.events.clear();
    this.wildcardListeners.clear();
  }
  
  // ========== 中间件系统 ==========
  
  /**
   * 添加中间件
   */
  use(middleware: Middleware): void {
    this.middleware.push(middleware);
  }
  
  /**
   * 设置默认中间件
   */
  private setupDefaultMiddleware(): void {
    // 日志中间件
    this.use((event, payload) => {
      if (payload.priority === 'urgent') {
        logger.warn(`[Urgent Event] ${event}`, payload);
      }
      return payload;
    });
    
    // 权限中间件
    this.use((event, payload) => {
      // 检查是否有权限发送该事件
      if (event.startsWith('admin:') && !this.hasAdminPermission()) {
        logger.error('Permission denied for event', { event, payload });
        return null; // 阻止事件
      }
      return payload;
    });
    
    // 性能监控中间件
    this.use((event, payload) => {
      const startTime = performance.now();
      // 在下一个微任务中记录处理时间
      Promise.resolve().then(() => {
        const duration = performance.now() - startTime;
        if (duration > 100) {
          logger.warn(`Slow event handling: ${event} took ${duration}ms`);
        }
      });
      return payload;
    });
  }
  
  /**
   * 运行中间件
   */
  private runMiddleware(event: string, payload: EventPayload): EventPayload | null {
    let result: EventPayload | null = payload;
    
    for (const middleware of this.middleware) {
      result = middleware(event, result!);
      if (!result) break; // 中间件阻止了事件
    }
    
    return result;
  }
  
  // ========== 事件映射 ==========
  
  /**
   * 设置事件映射
   */
  private setupEventMappings(): void {
    // 任务事件映射
    this.addMapping({
      from: /^task:(created|updated|deleted)$/,
      to: ['gantt:refresh', 'calendar:refresh', 'dashboard:update'],
    });
    
    // 项目事件映射
    this.addMapping({
      from: 'project:changed',
      to: ['*:reset'], // 通知所有模块重置
    });
    
    // 用户事件映射
    this.addMapping({
      from: 'user:logout',
      to: ['cache:clear', 'ws:disconnect', 'router:navigate:/login'],
    });
  }
  
  /**
   * 添加事件映射
   */
  addMapping(mapping: EventMapping): void {
    this.mappings.push(mapping);
  }
  
  /**
   * 处理事件映射
   */
  private handleMappings(event: string, payload: EventPayload): void {
    this.mappings.forEach(mapping => {
      const matches = typeof mapping.from === 'string' 
        ? mapping.from === event
        : mapping.from.test(event);
      
      if (matches) {
        const targets = Array.isArray(mapping.to) ? mapping.to : [mapping.to];
        const transformedPayload = mapping.transform ? mapping.transform(payload) : payload;
        
        targets.forEach(target => {
          // 递归发送映射的事件（避免无限循环）
          if (target !== event) {
            this.emit(target, transformedPayload);
          }
        });
      }
    });
  }
  
  // ========== 事件历史 ==========
  
  /**
   * 添加到历史记录
   */
  private addToHistory(payload: EventPayload): void {
    this.history.unshift(payload);
    
    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }
  
  /**
   * 获取事件历史
   */
  getHistory(filter?: {
    event?: string | RegExp;
    source?: string;
    target?: string;
    timeRange?: [number, number];
    limit?: number;
  }): EventPayload[] {
    let results = [...this.history];
    
    if (filter) {
      if (filter.event) {
        const eventFilter = filter.event;
        results = results.filter(item => {
          const eventName = this.getEventFromPayload(item);
          return typeof eventFilter === 'string' 
            ? eventName === eventFilter
            : eventFilter.test(eventName);
        });
      }
      
      if (filter.source) {
        results = results.filter(item => item.source === filter.source);
      }
      
      if (filter.target) {
        results = results.filter(item => {
          if (Array.isArray(item.target)) {
            return item.target.includes(filter.target!);
          }
          return item.target === filter.target;
        });
      }
      
      if (filter.timeRange) {
        const [start, end] = filter.timeRange;
        results = results.filter(item => 
          item.timestamp >= start && item.timestamp <= end
        );
      }
      
      if (filter.limit) {
        results = results.slice(0, filter.limit);
      }
    }
    
    return results;
  }
  
  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.history = [];
  }
  
  // ========== 统计功能 ==========
  
  /**
   * 更新统计信息
   */
  private updateStats(event: string): void {
    if (!this.stats.has(event)) {
      this.stats.set(event, {
        event,
        count: 0,
        lastEmitted: 0,
        averageHandleTime: 0,
        errors: 0,
      });
    }
    
    const stat = this.stats.get(event)!;
    stat.count++;
    stat.lastEmitted = Date.now();
  }
  
  /**
   * 获取统计信息
   */
  getStats(event?: string): EventStats | EventStats[] | undefined {
    if (event) {
      return this.stats.get(event);
    }
    return Array.from(this.stats.values());
  }
  
  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.clear();
  }
  
  // ========== WebSocket集成 ==========
  
  /**
   * 连接WebSocket
   */
  connectWebSocket(url: string): void {
    this.ws = new WebSocket(url);
    
    this.ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        // 接收到的WebSocket消息转发为本地事件
        this.emit(`ws:${type}`, payload);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', error);
      }
    };
    
    this.ws.onclose = () => {
      this.emit('ws:disconnected', {});
      // 尝试重连
      setTimeout(() => this.connectWebSocket(url), 5000);
    };
    
    this.ws.onopen = () => {
      this.emit('ws:connected', {});
    };
  }
  
  /**
   * 广播事件到其他客户端
   */
  private broadcastEvent(event: string, payload: EventPayload): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'event:broadcast',
        event,
        payload,
      }));
    }
  }
  
  // ========== 工具方法 ==========
  
  /**
   * 构建完整的payload
   */
  private buildPayload<T>(event: string, payload: Partial<EventPayload<T>> | T): EventPayload<T> {
    // 判断是否已经是EventPayload格式
    const isEventPayload = (p: any): p is Partial<EventPayload<T>> => {
      return p && typeof p === 'object' && ('source' in p || 'data' in p);
    };
    
    if (isEventPayload(payload)) {
      return {
        source: 'unknown',
        timestamp: Date.now(),
        priority: 'normal',
        ...payload,
        data: payload.data as T,
      };
    } else {
      // 简单数据，包装成EventPayload
      return {
        source: 'unknown',
        data: payload as T,
        timestamp: Date.now(),
        priority: 'normal',
      };
    }
  }
  
  /**
   * 触发监听器
   */
  private triggerListeners(event: string, payload: EventPayload): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(async listener => {
        try {
          await listener(payload);
        } catch (error) {
          logger.error(`Error in event listener for ${event}`, error);
          // 更新错误统计
          const stat = this.stats.get(event);
          if (stat) stat.errors++;
        }
      });
    }
  }
  
  /**
   * 触发通配符监听器
   */
  private triggerWildcardListeners(event: string, payload: EventPayload): void {
    this.wildcardListeners.forEach(async listener => {
      try {
        await listener({ ...payload, metadata: { ...payload.metadata, event } });
      } catch (error) {
        logger.error(`Error in wildcard listener for ${event}`, error);
      }
    });
  }
  
  /**
   * 从payload中获取事件名
   */
  private getEventFromPayload(payload: EventPayload): string {
    return payload.metadata?.event || 'unknown';
  }
  
  /**
   * 检查管理员权限（示例）
   */
  private hasAdminPermission(): boolean {
    // 这里应该从全局状态或用户服务获取权限
    const user = (window as any).__user;
    return user?.role === 'admin';
  }
  
  // ========== 调试工具 ==========
  
  /**
   * 调试：打印所有监听器
   */
  debugListeners(): void {
    const info: Record<string, number> = {};
    this.events.forEach((listeners, event) => {
      info[event] = listeners.size;
    });
    logger.info('[EventBus] Listeners', {
      listeners: info,
      wildcard: this.wildcardListeners.size,
    });
  }
  
  /**
   * 调试：打印最近的事件
   */
  debugRecentEvents(limit = 10): void {
    const recent = this.history.slice(0, limit).map(event => ({
      time: new Date(event.timestamp).toLocaleTimeString(),
      source: event.source,
      data: event.data,
    }));
    logger.info('[EventBus] Recent Events', recent);
  }
  
  /**
   * 调试：打印统计信息
   */
  debugStats(): void {
    const stats = Array.from(this.stats.values()).map(s => ({
      event: s.event,
      count: s.count,
      last: new Date(s.lastEmitted).toLocaleTimeString(),
      avg: s.averageHandleTime,
      errors: s.errors,
    }));
    logger.info('[EventBus] Statistics', stats);
  }
}

// 创建单例实例
export const eventBus = new EnhancedEventBus();

// 便捷方法
export const emit = eventBus.emit.bind(eventBus);
export const on = eventBus.on.bind(eventBus);
export const once = eventBus.once.bind(eventBus);
export const off = eventBus.off.bind(eventBus);

// React Hook
export const useEventBus = <T = any>(
  event: string | string[],
  handler: EventListener<T>,
  deps: DependencyList = []
) => {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, handler);
    return unsubscribe;
  }, deps);
};

// 类型导出
export type { EventListener, Middleware, EventMapping };
