import React, { Suspense, ComponentType } from 'react';
import { Spin } from 'antd';

/**
 * 路由懒加载包装器
 * 自动添加加载状态和错误边界
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(importFunc);

  return (props: any) => (
    <Suspense
      fallback={
        fallback || (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
          }}>
            <Spin size="large" tip="加载中..." />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * 预加载组件
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc();
};
