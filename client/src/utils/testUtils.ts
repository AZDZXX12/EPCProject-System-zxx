/**
 * 测试工具函数
 * 用于属性测试和控制台捕获
 */

import { consoleMonitor, ConsoleWarning } from './consoleMonitor';

/**
 * 捕获控制台输出的测试工具
 */
export class ConsoleCapture {
  private warnings: string[] = [];
  private errors: string[] = [];
  private originalWarn: typeof console.warn;
  private originalError: typeof console.error;

  constructor() {
    this.originalWarn = console.warn;
    this.originalError = console.error;
  }

  /**
   * 开始捕获
   */
  start(): void {
    this.warnings = [];
    this.errors = [];

    console.warn = (...args: any[]) => {
      this.warnings.push(args.map(a => String(a)).join(' '));
      this.originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.errors.push(args.map(a => String(a)).join(' '));
      this.originalError.apply(console, args);
    };
  }

  /**
   * 停止捕获
   */
  stop(): void {
    console.warn = this.originalWarn;
    console.error = this.originalError;
  }

  /**
   * 获取捕获的警告
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * 获取捕获的错误
   */
  getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * 检查是否有特定警告
   */
  hasWarning(pattern: string | RegExp): boolean {
    return this.warnings.some(w => 
      typeof pattern === 'string' 
        ? w.includes(pattern)
        : pattern.test(w)
    );
  }

  /**
   * 检查是否有特定错误
   */
  hasError(pattern: string | RegExp): boolean {
    return this.errors.some(e => 
      typeof pattern === 'string' 
        ? e.includes(pattern)
        : pattern.test(e)
    );
  }

  /**
   * 清空捕获
   */
  clear(): void {
    this.warnings = [];
    this.errors = [];
  }
}

/**
 * 等待指定时间
 */
export const wait = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * 等待条件满足
 */
export const waitFor = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await wait(interval);
  }
};

/**
 * 检查控制台是否干净（无警告）
 */
export const isConsoleClean = (): boolean => {
  return !consoleMonitor.hasWarnings();
};

/**
 * 获取特定类型的警告数量
 */
export const getWarningCount = (type?: ConsoleWarning['type']): number => {
  if (type) {
    return consoleMonitor.filter(type).length;
  }
  return consoleMonitor.getCount();
};

/**
 * 清空控制台监控
 */
export const clearConsoleMonitor = (): void => {
  consoleMonitor.clear();
};

/**
 * 模拟WebGL上下文丢失
 */
export const simulateContextLoss = (canvas: HTMLCanvasElement): void => {
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  if (gl) {
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }
  }
};

/**
 * 模拟WebGL上下文恢复
 */
export const simulateContextRestore = (canvas: HTMLCanvasElement): void => {
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  if (gl) {
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.restoreContext();
    }
  }
};
