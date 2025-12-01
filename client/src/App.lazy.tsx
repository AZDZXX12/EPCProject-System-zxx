/**
 * 懒加载路由配置
 * 优化首屏加载性能
 */

import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// 加载指示器
const LoadingFallback = () => (
  <div className="loading-fullscreen">
    <Spin size="large" />
  </div>
);

// 懒加载组件包装器
export const lazyLoad = (importFunc: () => Promise<any>) => {
  const LazyComponent = lazy(importFunc);
  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// 懒加载所有页面组件
export const Login = lazyLoad(() => import('./pages/Login'));
export const Workspace = lazyLoad(() => import('./pages/Workspace'));
export const DigitalTwinDashboard = lazyLoad(() => import('./pages/DigitalTwinDashboard'));
export const OptimizedGanttChart = lazyLoad(() => import('./pages/OptimizedGanttChart'));
export const GanttModulePage = lazyLoad(() => import('./pages/GanttModulePage'));
export const DeviceManagement = lazyLoad(() => import('./pages/DeviceManagement'));
export const Safety = lazyLoad(() => import('./pages/Safety'));
export const Quality = lazyLoad(() => import('./pages/Quality'));
export const Personnel = lazyLoad(() => import('./pages/Personnel'));
export const Documents = lazyLoad(() => import('./pages/Documents'));
export const LuckysheetTable = lazyLoad(() => import('./pages/LuckysheetTable'));
export const LuckysheetSelection = lazyLoad(() => import('./pages/LuckysheetSelection'));
export const EnhancedSettings = lazyLoad(() => import('./pages/EnhancedSettings'));
export const SystemManagement = lazyLoad(() => import('./pages/SystemManagement'));
export const ReportGenerator = lazyLoad(() => import('./pages/ReportGenerator'));
export const ProcurementManagement = lazyLoad(() => import('./pages/ProcurementManagement'));
export const ConstructionLog = lazyLoad(() => import('./pages/ConstructionLog'));
export const EnhancedConstructionManagement = lazyLoad(() => import('./pages/EnhancedConstructionManagement'));
export const SystemSettings = lazyLoad(() => import('./pages/SystemSettings'));
export const IntelligentDashboard = lazyLoad(() => import('./pages/IntelligentDashboard'));
export const ProjectLifecycleManager = lazyLoad(() => import('./pages/ProjectLifecycleManager'));
