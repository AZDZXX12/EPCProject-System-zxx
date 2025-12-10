/**
 * 控制台监控工具
 * 用于捕获和分类控制台警告，帮助识别和修复问题
 */

export interface ConsoleWarning {
  type: 'deprecation' | 'webgl' | 'react' | 'other';
  message: string;
  stack?: string;
  timestamp: number;
}

export interface ConsoleMonitor {
  warnings: ConsoleWarning[];
  filter: (type: ConsoleWarning['type']) => ConsoleWarning[];
  clear: () => void;
  getCount: () => number;
  hasWarnings: () => boolean;
}

class ConsoleMonitorImpl implements ConsoleMonitor {
  warnings: ConsoleWarning[] = [];
  private originalWarn: typeof console.warn;
  private originalError: typeof console.error;
  private isMonitoring = false;

  constructor() {
    this.originalWarn = console.warn;
    this.originalError = console.error;
  }

  /**
   * 分类警告类型
   */
  private categorizeWarning(message: string): ConsoleWarning['type'] {
    const msgLower = message.toLowerCase();

    // WebGL相关
    if (
      msgLower.includes('webgl') ||
      msgLower.includes('context') ||
      msgLower.includes('three.js') ||
      msgLower.includes('renderer')
    ) {
      return 'webgl';
    }

    // React相关
    if (
      msgLower.includes('react') ||
      msgLower.includes('finddomnode') ||
      msgLower.includes('strictmode') ||
      msgLower.includes('useeffect')
    ) {
      return 'react';
    }

    // 废弃API
    if (
      msgLower.includes('deprecated') ||
      msgLower.includes('tabpane') ||
      msgLower.includes('legacy')
    ) {
      return 'deprecation';
    }

    return 'other';
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // 拦截console.warn
    console.warn = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');

      const warning: ConsoleWarning = {
        type: this.categorizeWarning(message),
        message,
        stack: new Error().stack,
        timestamp: Date.now(),
      };

      this.warnings.push(warning);

      // 仍然输出到控制台
      this.originalWarn.apply(console, args);
    };

    // 拦截console.error（仅记录，不影响错误处理）
    console.error = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');

      // 只记录警告类型的错误
      if (
        message.includes('Warning:') ||
        message.includes('deprecated') ||
        message.includes('context')
      ) {
        const warning: ConsoleWarning = {
          type: this.categorizeWarning(message),
          message,
          stack: new Error().stack,
          timestamp: Date.now(),
        };

        this.warnings.push(warning);
      }

      // 仍然输出到控制台
      this.originalError.apply(console, args);
    };
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (!this.isMonitoring) return;

    console.warn = this.originalWarn;
    console.error = this.originalError;
    this.isMonitoring = false;
  }

  /**
   * 过滤特定类型的警告
   */
  filter(type: ConsoleWarning['type']): ConsoleWarning[] {
    return this.warnings.filter(w => w.type === type);
  }

  /**
   * 清空警告记录
   */
  clear(): void {
    this.warnings = [];
  }

  /**
   * 获取警告数量
   */
  getCount(): number {
    return this.warnings.length;
  }

  /**
   * 检查是否有警告
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * 获取警告摘要
   */
  getSummary(): Record<ConsoleWarning['type'], number> {
    return {
      deprecation: this.filter('deprecation').length,
      webgl: this.filter('webgl').length,
      react: this.filter('react').length,
      other: this.filter('other').length,
    };
  }

  /**
   * 打印警告报告
   */
  printReport(): void {
    const summary = this.getSummary();
    console.log('=== Console Warning Report ===');
    console.log(`Total warnings: ${this.getCount()}`);
    console.log(`- Deprecation: ${summary.deprecation}`);
    console.log(`- WebGL: ${summary.webgl}`);
    console.log(`- React: ${summary.react}`);
    console.log(`- Other: ${summary.other}`);
    console.log('==============================');
  }
}

// 单例实例
export const consoleMonitor = new ConsoleMonitorImpl();

// 开发环境自动启动监控
if (process.env.NODE_ENV === 'development') {
  consoleMonitor.start();
}
