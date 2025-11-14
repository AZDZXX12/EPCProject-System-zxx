/**
 * 统一错误处理工具
 * 用于捕获和处理应用中的各种错误
 */

import { notification } from 'antd';
import { ApiError } from '../services/api';

// 错误类型
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

// 错误日志接口
interface ErrorLog {
  type: ErrorType;
  message: string;
  stack?: string;
  timestamp: number;
  url?: string;
  userAgent?: string;
  additionalInfo?: any;
}

// 错误日志存储
const errorLogs: ErrorLog[] = [];
const MAX_ERROR_LOGS = 100;

// 添加错误日志
const addErrorLog = (log: ErrorLog) => {
  errorLogs.unshift(log);
  if (errorLogs.length > MAX_ERROR_LOGS) {
    errorLogs.pop();
  }

  // 生产环境：发送到监控服务
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoring(log);
  }
};

// 发送到监控服务（可接入Sentry等）
const sendToMonitoring = (log: ErrorLog) => {
  // TODO: 接入实际的监控服务
  console.error('[Monitoring]', log);
};

// 获取错误类型
const getErrorType = (error: any): ErrorType => {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return ErrorType.PERMISSION;
    }
    if (error.status && error.status >= 400 && error.status < 500) {
      return ErrorType.VALIDATION;
    }
    return ErrorType.API;
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ErrorType.NETWORK;
  }

  return ErrorType.UNKNOWN;
};

// 获取用户友好的错误消息
const getUserFriendlyMessage = (error: any, type: ErrorType): string => {
  // API错误
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return '请先登录';
    }
    if (error.status === 403) {
      return '您没有权限执行此操作';
    }
    if (error.status === 404) {
      return '请求的资源不存在';
    }
    if (error.status === 500) {
      return '服务器错误，请稍后重试';
    }
    if (error.message) {
      return error.message;
    }
  }

  // 网络错误
  if (type === ErrorType.NETWORK) {
    return '网络连接失败，请检查网络设置';
  }

  // 验证错误
  if (type === ErrorType.VALIDATION) {
    return error.message || '输入数据验证失败';
  }

  // 默认消息
  return '操作失败，请重试';
};

// 主错误处理函数
export const handleError = (
  error: any,
  options: {
    showMessage?: boolean;
    silent?: boolean;
    customMessage?: string;
    onError?: (error: any) => void;
  } = {}
) => {
  const { showMessage: shouldShowMessage = true, silent = false, customMessage, onError } = options;

  // 获取错误类型
  const errorType = getErrorType(error);

  // 创建错误日志
  const errorLog: ErrorLog = {
    type: errorType,
    message: error.message || String(error),
    stack: error.stack,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    additionalInfo: {
      errorName: error.name,
      errorCode: error.code,
      errorStatus: error.status,
    },
  };

  // 记录错误
  addErrorLog(errorLog);

  // 控制台输出（开发环境）
  if (process.env.NODE_ENV === 'development' && !silent) {
    console.error('[Error Handler]', {
      type: errorType,
      error,
      log: errorLog,
    });
  }

  // 显示用户消息
  if (shouldShowMessage) {
    const userMessage = customMessage || getUserFriendlyMessage(error, errorType);

    if (errorType === ErrorType.PERMISSION) {
      notification.warning({ message: userMessage, duration: 3 });
    } else if (errorType === ErrorType.VALIDATION) {
      notification.warning({ message: userMessage, duration: 3 });
    } else {
      notification.error({ message: userMessage, duration: 3 });
    }
  }

  // 执行自定义错误处理
  if (onError) {
    onError(error);
  }

  // 特殊处理：权限错误跳转登录
  if (errorType === ErrorType.PERMISSION && error.status === 401) {
    setTimeout(() => {
      sessionStorage.clear();
      window.location.href = '/login';
    }, 1500);
  }
};

// 异步函数错误包装器
export const withErrorHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: Parameters<typeof handleError>[1]
): T => {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      throw error;
    }
  }) as T;
};

// 获取错误日志
export const getErrorLogs = (): ErrorLog[] => {
  return [...errorLogs];
};

// 清除错误日志
export const clearErrorLogs = () => {
  errorLogs.length = 0;
};

// 导出错误日志（用于调试）
export const exportErrorLogs = (): string => {
  return JSON.stringify(errorLogs, null, 2);
};

// 全局错误监听
export const setupGlobalErrorHandler = () => {
  // 捕获未处理的Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, {
      showMessage: false,
      silent: false,
    });
  });

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    handleError(event.error || event.message, {
      showMessage: false,
      silent: false,
    });
  });
};
