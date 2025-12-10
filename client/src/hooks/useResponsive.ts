/**
 * 响应式Hook
 * 提供设备检测和断点判断
 */

import { useState, useEffect } from 'react';

export interface Breakpoints {
  xs: boolean; // < 576px
  sm: boolean; // >= 576px
  md: boolean; // >= 768px
  lg: boolean; // >= 992px
  xl: boolean; // >= 1200px
  xxl: boolean; // >= 1600px
}

export interface ResponsiveInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoints: Breakpoints;
  width: number;
  height: number;
}

/**
 * 使用响应式Hook
 */
export const useResponsive = (): ResponsiveInfo => {
  const [responsive, setResponsive] = useState<ResponsiveInfo>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      breakpoints: {
        xs: width < 576,
        sm: width >= 576,
        md: width >= 768,
        lg: width >= 992,
        xl: width >= 1200,
        xxl: width >= 1600,
      },
      width,
      height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setResponsive({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        breakpoints: {
          xs: width < 576,
          sm: width >= 576,
          md: width >= 768,
          lg: width >= 992,
          xl: width >= 1200,
          xxl: width >= 1600,
        },
        width,
        height,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return responsive;
};

/**
 * 媒体查询Hook
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * 获取响应式列数
 */
export const useResponsiveColumns = (
  desktop: number = 4,
  tablet: number = 2,
  mobile: number = 1
): number => {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

/**
 * 获取响应式Gutter
 */
export const useResponsiveGutter = (): [number, number] => {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) return [8, 8];
  if (isTablet) return [12, 12];
  return [16, 16];
};

export default useResponsive;
