/**
 * 性能优化Hooks集合
 * 
 * 包含：
 * 1. useMemoizedCallback - 优化回调函数
 * 2. useDeepCompareMemo - 深度比较memo
 * 3. useVirtualList - 虚拟列表
 * 4. useIntersectionObserver - 懒加载
 * 5. useComponentSize - 组件尺寸监听
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  DependencyList,
} from 'react';

/**
 * 深度比较函数
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * 深度比较的useMemo
 */
export function useDeepCompareMemo<T>(
  factory: () => T,
  deps: DependencyList
): T {
  const ref = useRef<DependencyList>();
  const signalRef = useRef<number>(0);

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [signalRef.current]);
}

/**
 * 深度比较的useCallback
 */
export function useDeepCompareCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useDeepCompareMemo(() => callback, deps);
}

/**
 * 虚拟列表Hook
 */
interface VirtualListOptions {
  itemHeight: number | ((index: number) => number);
  overscan?: number;
  scrollingDelay?: number;
}

interface VirtualListReturn<T> {
  virtualItems: Array<{
    index: number;
    start: number;
    size: number;
    data: T;
  }>;
  totalSize: number;
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
  containerProps: {
    ref: (element: HTMLElement | null) => void;
    onScroll: (e: React.UIEvent<HTMLElement>) => void;
    style: React.CSSProperties;
  };
  wrapperProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualList<T>(
  items: T[],
  containerHeight: number,
  options: VirtualListOptions
): VirtualListReturn<T> {
  const {
    itemHeight,
    overscan = 3,
    scrollingDelay = 150,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 计算每个项目的高度
  const getItemHeight = useCallback(
    (index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  // 计算所有项目的位置信息
  const itemPositions = useMemo(() => {
    const positions: Array<{ index: number; start: number; size: number }> = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      const size = getItemHeight(i);
      positions.push({
        index: i,
        start: offset,
        size,
      });
      offset += size;
    }

    return positions;
  }, [items.length, getItemHeight]);

  // 计算总高度
  const totalSize = useMemo(() => {
    if (itemPositions.length === 0) return 0;
    const lastItem = itemPositions[itemPositions.length - 1];
    return lastItem.start + lastItem.size;
  }, [itemPositions]);

  // 计算可见项目
  const virtualItems = useMemo(() => {
    const startIndex = Math.max(
      0,
      itemPositions.findIndex(item => item.start + item.size > scrollTop) - overscan
    );

    const endIndex = Math.min(
      items.length - 1,
      itemPositions.findIndex(item => item.start > scrollTop + containerHeight) + overscan
    );

    return itemPositions
      .slice(startIndex, endIndex + 1)
      .map(position => ({
        ...position,
        data: items[position.index],
      }));
  }, [scrollTop, containerHeight, itemPositions, items, overscan]);

  // 滚动处理
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const element = e.currentTarget;
    setScrollTop(element.scrollTop);
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, scrollingDelay);
  }, [scrollingDelay]);

  // 滚动到指定索引
  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      if (!scrollElementRef.current || index < 0 || index >= items.length) {
        return;
      }

      const item = itemPositions[index];
      if (!item) return;

      let scrollOffset = item.start;

      if (align === 'center') {
        scrollOffset = item.start - containerHeight / 2 + item.size / 2;
      } else if (align === 'end') {
        scrollOffset = item.start - containerHeight + item.size;
      }

      scrollElementRef.current.scrollTop = Math.max(0, Math.min(scrollOffset, totalSize - containerHeight));
    },
    [itemPositions, containerHeight, totalSize, items.length]
  );

  return {
    virtualItems,
    totalSize,
    scrollToIndex,
    containerProps: {
      ref: (element: HTMLElement | null) => {
        scrollElementRef.current = element;
      },
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative' as const,
      },
    },
    wrapperProps: {
      style: {
        height: totalSize,
        position: 'relative' as const,
      },
    },
  };
}

/**
 * Intersection Observer Hook - 用于懒加载
 */
interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
): [(element: HTMLElement | null) => void, boolean, IntersectionObserverEntry | undefined] {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    triggerOnce = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    if (triggerOnce && hasTriggeredRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);

        if (isCurrentlyIntersecting && triggerOnce) {
          hasTriggeredRef.current = true;
          observer.disconnect();
        }
      },
      { threshold, rootMargin, root }
    );

    observer.observe(elementRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, root, triggerOnce]);

  return [setElement, isIntersecting, entry];
}

/**
 * 组件尺寸监听Hook
 */
interface ComponentSize {
  width: number;
  height: number;
}

export function useComponentSize(): [
  (element: HTMLElement | null) => void,
  ComponentSize
] {
  const [size, setSize] = useState<ComponentSize>({ width: 0, height: 0 });
  const elementRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(elementRef.current);
    resizeObserverRef.current = resizeObserver;

    // 初始尺寸
    const rect = elementRef.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [setElement, size];
}

/**
 * 防抖值Hook
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流值Hook
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate >= delay) {
      setThrottledValue(value);
      lastUpdateRef.current = now;
      return; // 添加return确保所有代码路径都有返回值
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastUpdateRef.current = Date.now();
      }, delay - timeSinceLastUpdate);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, delay]);

  return throttledValue;
}
