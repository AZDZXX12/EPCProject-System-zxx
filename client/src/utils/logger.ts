/**
 * 统一日志工具 - 生产环境自动禁用
 */

const isDev = process.env.NODE_ENV === 'development';

interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  data?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private addLog(level: string, args: unknown[]) {
    const entry: LogEntry = {
      level,
      message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
      timestamp: new Date(),
      data: args.length > 1 ? args : args[0],
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  log(...args: unknown[]) {
    if (isDev) {
      console.log(...(args as unknown[] as any[]));
      this.addLog('log', args);
    }
  }

  error(...args: unknown[]) {
    console.error(...(args as unknown[] as any[]));
    this.addLog('error', args);
    // 生产环境发送到错误追踪服务
    if (!isDev && typeof window !== 'undefined') {
      this.sendToErrorTracking(args);
    }
  }

  warn(...args: unknown[]) {
    if (isDev) {
      console.warn(...(args as unknown[] as any[]));
      this.addLog('warn', args);
    }
  }

  info(...args: unknown[]) {
    if (isDev) {
      console.info(...(args as unknown[] as any[]));
      this.addLog('info', args);
    }
  }

  debug(...args: unknown[]) {
    if (isDev) {
      console.debug(...(args as unknown[] as any[]));
      this.addLog('debug', args);
    }
  }

  getLogs(level?: string): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  private sendToErrorTracking(args: unknown[]) {
    // 实现错误追踪逻辑
    try {
      // 可以集成Sentry等服务
      const errorData = {
        message: String(args[0]),
        stack: (typeof args[1] === 'object' && args[1] !== null && 'stack' in (args[1] as any)) ? String((args[1] as any).stack) : undefined,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      void errorData;
      // 发送到后端或第三方服务
      // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });
    } catch (e) {
      // 静默失败
    }
  }
}

export const logger = new Logger();
