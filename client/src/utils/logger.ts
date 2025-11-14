/**
 * 统一日志工具 - 生产环境自动禁用
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  error: (...args: any[]) => {
    console.error(...args); // 错误始终记录
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },

  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },

  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
};
