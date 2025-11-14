/**
 * 懒加载路由配置
 * 优化首屏加载性能
 */

import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// 加载指示器
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
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
export const DhtmlxGanttChart = lazyLoad(() => import('./pages/DhtmlxGanttChart'));
export const KanbanBoard = lazyLoad(() => import('./pages/KanbanBoard'));
export const TaskList = lazyLoad(() => import('./pages/TaskList'));
export const DeviceManagement = lazyLoad(() => import('./pages/DeviceManagement'));
export const Safety = lazyLoad(() => import('./pages/Safety'));
export const Quality = lazyLoad(() => import('./pages/Quality'));
export const Personnel = lazyLoad(() => import('./pages/Personnel'));
export const Documents = lazyLoad(() => import('./pages/Documents'));
export const LuckysheetTable = lazyLoad(() => import('./pages/LuckysheetTable'));
export const Settings = lazyLoad(() => import('./pages/Settings'));
export const SystemManagement = lazyLoad(() => import('./pages/SystemManagement'));
export const ReportGenerator = lazyLoad(() => import('./pages/ReportGenerator'));
export const ProcurementManagement = lazyLoad(() => import('./pages/ProcurementManagement'));
export const ConstructionLog = lazyLoad(() => import('./pages/ConstructionLog'));
export const ConstructionManagement = lazyLoad(() => import('./pages/ConstructionManagement'));
export const Utilities = lazyLoad(() => import('./pages/Utilities'));
export const SystemSettings = lazyLoad(() => import('./pages/SystemSettings'));
export const ProjectLifecycleManager = lazyLoad(() => import('./pages/ProjectLifecycleManager'));
