/**
 * 移动端优化工具集
 * 提供手势支持、性能优化、触摸反馈等功能
 */

import { logger } from './EnhancedLogger';

/**
 * 检测是否为移动设备
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // 检测移动设备
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
  
  // 检测触摸屏
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 检测屏幕宽度
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobileUA || (hasTouchScreen && isSmallScreen);
};

/**
 * 检测设备类型
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * 检测是否为iOS设备
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
};

/**
 * 检测是否为Android设备
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android/i.test(userAgent);
};

/**
 * 手势识别类
 */
export class GestureRecognizer {
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private element: HTMLElement;
  
  constructor(element: HTMLElement) {
    this.element = element;
    this.init();
  }
  
  private init() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }
  
  private handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  }
  
  private handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;
    
    // 识别滑动手势
    if (Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX > 0) {
        this.onSwipeRight();
      } else {
        this.onSwipeLeft();
      }
    }
    
    if (Math.abs(deltaY) > 50 && deltaTime < 300) {
      if (deltaY > 0) {
        this.onSwipeDown();
      } else {
        this.onSwipeUp();
      }
    }
    
    // 识别点击手势
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
      this.onTap();
    }
    
    // 识别长按手势
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime > 500) {
      this.onLongPress();
    }
  }
  
  // 手势回调（可被重写）
  onSwipeLeft() {
    logger.debug('[手势] 向左滑动');
  }
  
  onSwipeRight() {
    logger.debug('[手势] 向右滑动');
  }
  
  onSwipeUp() {
    logger.debug('[手势] 向上滑动');
  }
  
  onSwipeDown() {
    logger.debug('[手势] 向下滑动');
  }
  
  onTap() {
    logger.debug('[手势] 点击');
  }
  
  onLongPress() {
    logger.debug('[手势] 长按');
  }
  
  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}

/**
 * 添加触摸反馈效果
 */
export const addTouchFeedback = (element: HTMLElement) => {
  element.addEventListener('touchstart', () => {
    element.style.opacity = '0.7';
  }, { passive: true });
  
  element.addEventListener('touchend', () => {
    element.style.opacity = '1';
  }, { passive: true });
  
  element.addEventListener('touchcancel', () => {
    element.style.opacity = '1';
  }, { passive: true });
};

/**
 * 防止iOS双击缩放
 */
export const preventDoubleTapZoom = () => {
  if (!isIOS()) return;
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
};

/**
 * 优化滚动性能
 */
export const optimizeScrollPerformance = (element: HTMLElement) => {
  // 启用硬件加速
  element.style.transform = 'translateZ(0)';
  (element.style as any).webkitTransform = 'translateZ(0)';
  
  // 启用平滑滚动
  (element.style as any).webkitOverflowScrolling = 'touch';
};

/**
 * 懒加载图片
 */
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

/**
 * 获取安全区域insets（适配刘海屏）
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
};

/**
 * 禁用页面缩放
 */
export const disableZoom = () => {
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
};

/**
 * 启用页面缩放
 */
export const enableZoom = () => {
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
  }
};

/**
 * 检测网络状态
 */
export const getNetworkStatus = () => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return { online: true, effectiveType: 'unknown' };
  }
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
    saveData: connection?.saveData || false,
  };
};

/**
 * 优化移动端性能
 */
export const optimizeMobilePerformance = () => {
  if (!isMobile()) return;
  
  logger.info('[移动端优化] 开始优化');
  
  // 防止双击缩放
  preventDoubleTapZoom();
  
  // 懒加载图片
  lazyLoadImages();
  
  // 优化所有可滚动容器
  document.querySelectorAll('.scrollable-container').forEach((el) => {
    optimizeScrollPerformance(el as HTMLElement);
  });
  
  // 添加触摸反馈
  document.querySelectorAll('.touch-feedback').forEach((el) => {
    addTouchFeedback(el as HTMLElement);
  });
  
  logger.info('[移动端优化] 优化完成', {
    deviceType: getDeviceType(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
  });
};

/**
 * 振动反馈（如果支持）
 */
export const vibrate = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * 全屏API
 */
export const requestFullscreen = (element?: HTMLElement) => {
  const el = element || document.documentElement;
  
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if ((el as any).webkitRequestFullscreen) {
    (el as any).webkitRequestFullscreen();
  } else if ((el as any).mozRequestFullScreen) {
    (el as any).mozRequestFullScreen();
  } else if ((el as any).msRequestFullscreen) {
    (el as any).msRequestFullscreen();
  }
};

export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
};

/**
 * 屏幕方向锁定
 */
export const lockOrientation = (orientation: 'portrait' | 'landscape') => {
  if ('screen' in window && 'orientation' in window.screen) {
    const screenOrientation = (window.screen as any).orientation;
    if (screenOrientation && screenOrientation.lock) {
      screenOrientation.lock(orientation).catch((err: Error) => {
        logger.warn('[屏幕方向] 锁定失败', err);
      });
    }
  }
};

export const unlockOrientation = () => {
  if ('screen' in window && 'orientation' in window.screen) {
    const screenOrientation = (window.screen as any).orientation;
    if (screenOrientation && screenOrientation.unlock) {
      screenOrientation.unlock();
    }
  }
};

export default {
  isMobile,
  getDeviceType,
  isIOS,
  isAndroid,
  GestureRecognizer,
  addTouchFeedback,
  preventDoubleTapZoom,
  optimizeScrollPerformance,
  lazyLoadImages,
  getSafeAreaInsets,
  disableZoom,
  enableZoom,
  getNetworkStatus,
  optimizeMobilePerformance,
  vibrate,
  requestFullscreen,
  exitFullscreen,
  lockOrientation,
  unlockOrientation,
};
