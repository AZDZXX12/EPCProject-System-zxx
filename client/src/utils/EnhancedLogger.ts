/**
 * 增强版日志服务
 * 
 * 功能特性：
 * 1. 环境感知（开发/生产）
 * 2. 日志级别控制
 * 3. 性能监控
 * 4. 错误追踪
 * 5. 监控服务集成
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
  userId?: string;
  sessionId?: string;
}

interface PerformanceEntry {
  operation: string;
  duration: number;
  timestamp: string;
  status: 'success' | 'failure';
}

class EnhancedLogger {
  private isDev = process.env.NODE_ENV === 'development';
  private isProd = process.env.NODE_ENV === 'production';
  private logBuffer: LogEntry[] = [];
  private performanceBuffer: PerformanceEntry[] = [];
  private maxBufferSize = 100;
  private sessionId = this.generateSessionId();

  constructor() {
    // 生产环境下定期发送日志
    if (this.isProd) {
      setInterval(() => this.flushLogs(), 30000); // 每30秒
    }

    // 监听全局错误
    this.setupGlobalErrorHandlers();
  }

  // 生成会话ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 设置全局错误处理
  private setupGlobalErrorHandlers(): void {
    // React错误边界之外的错误
    window.addEventListener('error', (event) => {
      this.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });

    // Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });
  }

  // 核心日志方法
  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source,
      userId: this.getUserId(),
      sessionId: this.sessionId,
    };

    // 开发环境：输出到控制台
    if (this.isDev) {
      const style = this.getConsoleStyle(level);
      console.log(`%c[${level.toUpperCase()}]`, style, message, data || '');
    }

    // 添加到缓冲区
    this.addToBuffer(entry);

    // 生产环境：错误立即发送
    if (this.isProd && level === 'error') {
      this.sendToMonitoring([entry]);
    }
  }

  // 获取控制台样式
  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #888; font-weight: normal;',
      info: 'color: #2196F3; font-weight: normal;',
      warn: 'color: #FF9800; font-weight: bold;',
      error: 'color: #F44336; font-weight: bold;',
    };
    return styles[level];
  }

  // 添加到缓冲区
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  // 获取用户ID
  private getUserId(): string | undefined {
    try {
      return localStorage.getItem('userId') || undefined;
    } catch {
      return undefined;
    }
  }

  // 发送到监控服务
  private async sendToMonitoring(logs: LogEntry[]): Promise<void> {
    if (!this.isProd || logs.length === 0) return;

    try {
      const response = await fetch('/api/monitoring/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to send logs to monitoring service');
      }
    } catch (error) {
      // 静默失败，避免循环
      console.error('Monitoring service error:', error);
    }
  }

  // 刷新日志缓冲区
  private flushLogs(): void {
    if (this.logBuffer.length > 0) {
      this.sendToMonitoring([...this.logBuffer]);
      this.logBuffer = [];
    }
  }

  // 公共API方法
  debug(message: string, data?: any, source?: string): void {
    if (this.isDev) {
      this.log('debug', message, data, source);
    }
  }

  info(message: string, data?: any, source?: string): void {
    this.log('info', message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.log('warn', message, data, source);
  }

  error(message: string, data?: any, source?: string): void {
    this.log('error', message, data, source);
  }

  // 性能监控
  startPerformance(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      const entry: PerformanceEntry = {
        operation,
        duration,
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      this.performanceBuffer.push(entry);
      
      if (this.isDev && duration > 100) {
        this.warn(`Slow operation: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
      }

      if (duration > 1000) {
        this.error(`Performance issue: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
      }

      return duration;
    };
  }

  // 异步操作性能监控
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const endMeasure = this.startPerformance(operation);
    
    try {
      const result = await fn();
      endMeasure();
      return result;
    } catch (error) {
      const duration = endMeasure();
      this.error(`${operation} failed`, { error, duration });
      throw error;
    }
  }

  // 获取日志历史
  getLogHistory(): LogEntry[] {
    return [...this.logBuffer];
  }

  // 获取性能历史
  getPerformanceHistory(): PerformanceEntry[] {
    return [...this.performanceBuffer];
  }

  // 清空缓冲区
  clear(): void {
    this.logBuffer = [];
    this.performanceBuffer = [];
  }

  // 导出日志
  exportLogs(): string {
    const data = {
      logs: this.logBuffer,
      performance: this.performanceBuffer,
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }
}

// 单例实例
export const logger = new EnhancedLogger();

// 便捷方法
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const measurePerformance = logger.startPerformance.bind(logger);
export const measureAsync = logger.measureAsync.bind(logger);

// 开发环境下暴露到全局
if (process.env.NODE_ENV === 'development') {
  (window as any).__logger = logger;
}
