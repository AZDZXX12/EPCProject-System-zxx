/**
 * 防抖Hook - 优化高频操作性能
 * 
 * 功能：
 * - 延迟执行函数
 * - 自动清理定时器
 * - 支持立即执行模式
 * - 减少不必要的API调用
 * 
 * @example
 * const debouncedSearch = useDebounce(searchValue, 500);
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 防抖值Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖函数Hook
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param options 配置选项
 * @returns 防抖后的函数
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  options: {
    leading?: boolean; // 是否在延迟开始前调用
    trailing?: boolean; // 是否在延迟结束后调用
    maxWait?: number; // 最大等待时间
  } = {}
): {
  run: T;
  cancel: () => void;
  flush: () => void;
} {
  const { leading = false, trailing = true, maxWait } = options;

  const fnRef = useRef(fn);
  const timerRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const argsRef = useRef<any[]>();

  // 更新函数引用
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // 调用函数
  const invoke = useCallback(() => {
    const args = argsRef.current;
    if (args) {
      lastInvokeTimeRef.current = Date.now();
      return fnRef.current(...args);
    }
  }, []);

  // 判断是否应该调用
  const shouldInvoke = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - lastCallTimeRef.current;
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

      return (
        lastCallTimeRef.current === 0 ||
        timeSinceLastCall >= delay ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      );
    },
    [delay, maxWait]
  );

  // 定时器回调
  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailing ? invoke() : undefined;
    }
    // 重新设置定时器
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeWaiting = delay - timeSinceLastCall;
    timerRef.current = setTimeout(timerExpired, timeWaiting);
  }, [delay, trailing, shouldInvoke, invoke]);

  // 取消
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    lastCallTimeRef.current = 0;
    lastInvokeTimeRef.current = 0;
    argsRef.current = undefined;
  }, []);

  // 立即执行
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
      return invoke();
    }
  }, [invoke]);

  // 防抖函数
  const run = useCallback(
    ((...args: any[]) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastCallTimeRef.current = time;
      argsRef.current = args;

      if (isInvoking) {
        if (timerRef.current === undefined) {
          // 首次调用
          lastInvokeTimeRef.current = time;
          if (leading) {
            return invoke();
          }
          timerRef.current = setTimeout(timerExpired, delay);
          return;
        }
        if (maxWait !== undefined) {
          // 达到最大等待时间，立即执行
          timerRef.current = setTimeout(timerExpired, delay);
          return invoke();
        }
      }

      if (timerRef.current === undefined) {
        timerRef.current = setTimeout(timerExpired, delay);
      }
    }) as T,
    [delay, leading, maxWait, shouldInvoke, invoke, timerExpired]
  );

  // 清理
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { run, cancel, flush };
}

/**
 * 节流Hook
 * @param fn 需要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): {
  run: T;
  cancel: () => void;
} {
  const { run, cancel } = useDebounceFn(fn, delay, {
    leading: true,
    trailing: false,
    maxWait: delay,
  });

  return { run, cancel };
}

/**
 * 使用示例：
 * 
 * // 1. 防抖值
 * const [searchText, setSearchText] = useState('');
 * const debouncedSearch = useDebounce(searchText, 500);
 * 
 * useEffect(() => {
 *   // 只在防抖后的值变化时调用API
 *   fetchData(debouncedSearch);
 * }, [debouncedSearch]);
 * 
 * // 2. 防抖函数
 * const { run: debouncedSave } = useDebounceFn(
 *   async (data) => {
 *     await saveData(data);
 *   },
 *   1000
 * );
 * 
 * // 3. 节流函数
 * const { run: throttledScroll } = useThrottle(
 *   (e) => {
 *     console.log('Scroll event', e);
 *   },
 *   200
 * );
 */
