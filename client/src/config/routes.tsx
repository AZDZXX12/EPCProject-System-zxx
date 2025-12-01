/**
 * 路由配置文件
 * 
 * 统一管理所有路由
 * 支持权限控制、懒加载、预加载、缓存
 */

import { lazy, LazyExoticComponent } from 'react';
import type { RouteObject } from 'react-router-dom';
import {
  HomeOutlined,
  CheckSquareOutlined,
  ProjectOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  ToolOutlined,
  SafetyOutlined,
  FileTextOutlined,
  TeamOutlined,
  FolderOutlined,
  FileSearchOutlined,
  SettingOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ENGINEER = 'engineer',
  VIEWER = 'viewer',
}

// 路由配置接口
export interface RouteConfig {
  path: string;
  name: string;
  icon?: React.ReactNode;
  element?: LazyExoticComponent<React.ComponentType<any>>;
  roles?: UserRole[]; // 允许访问的角色
  hidden?: boolean; // 是否在菜单中隐藏
  cache?: boolean; // 是否缓存组件
  preload?: boolean; // 是否预加载
  badge?: string | number; // 徽标
  children?: RouteConfig[];
  index?: boolean;
  caseSensitive?: boolean;
}

// 懒加载辅助函数
const lazyLoad = (path: string) => lazy(() => import(`../pages/${path}`));

// 路由配置
export const routes: RouteConfig[] = [
  {
    path: '/workspace',
    name: '工作台',
    element: lazyLoad('Workspace'),
    icon: <HomeOutlined />,
    preload: true,
    cache: true,
  },
  {
    path: '/dashboard',
    name: '智能仪表盘',
    element: lazyLoad('IntelligentDashboard'),
    icon: <DashboardOutlined />,
    preload: true,
    cache: true,
  },
  {
    path: '/tasks',
    name: '任务管理',
    element: lazyLoad('GanttModulePage'),
    icon: <CheckSquareOutlined />,
    cache: true,
    preload: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ENGINEER],
  },
  {
    path: '/project-lifecycle',
    name: '项目生命周期',
    element: lazyLoad('ProjectLifecycleManager'),
    icon: <ProjectOutlined />,
    cache: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/digital-twin',
    name: '数字孪生',
    element: lazyLoad('DigitalTwinDashboard'),
    icon: <DashboardOutlined />,
    cache: true,
  },
  {
    path: '/procurement',
    name: '采购管理',
    element: lazyLoad('ProcurementManagement'),
    icon: <ShoppingCartOutlined />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ENGINEER],
  },
  {
    path: '/gantt',
    name: '甘特图',
    element: lazyLoad('OptimizedGanttChart'),
    icon: <CalendarOutlined />,
    cache: true,
  },
  {
    path: '/kanban',
    name: '看板视图',
    element: lazyLoad('GanttModulePage'),
    icon: <AppstoreOutlined />,
    hidden: true, // 隐藏，通过任务管理进入
  },
  {
    path: '/construction-management',
    name: '施工管理',
    element: lazyLoad('ConstructionManagement'),
    icon: <ToolOutlined />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ENGINEER],
  },
  {
    path: '/construction-log',
    name: '施工日志',
    element: lazyLoad('ConstructionLog'),
    icon: <FileTextOutlined />,
    hidden: true,
  },
  {
    path: '/utilities',
    name: '工器具管理',
    element: lazyLoad('Utilities'),
    icon: <ToolOutlined />,
  },
  {
    path: '/devices',
    name: '设备管理',
    element: lazyLoad('DeviceManagement'),
    icon: <DashboardOutlined />,
  },
  {
    path: '/safety',
    name: '安全管理',
    element: lazyLoad('Safety'),
    icon: <SafetyOutlined />,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/quality',
    name: '质量管理',
    element: lazyLoad('Quality'),
    icon: <FileSearchOutlined />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ENGINEER],
  },
  {
    path: '/selection',
    name: '设备选型',
    element: lazyLoad('LuckysheetSelection'),
    icon: <AppstoreOutlined />,
  },
  {
    path: '/personnel',
    name: '人员管理',
    element: lazyLoad('Personnel'),
    icon: <TeamOutlined />,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/documents',
    name: '文档管理',
    element: lazyLoad('Documents'),
    icon: <FolderOutlined />,
  },
  {
    path: '/reports',
    name: '报表生成',
    element: lazyLoad('ReportGenerator'),
    icon: <FileTextOutlined />,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/material-price',
    name: '材料价格监控',
    element: lazyLoad('MaterialPriceMonitor'),
    icon: <LineChartOutlined />,
  },
  {
    path: '/settings',
    name: '个人设置',
    element: lazyLoad('EnhancedSettings'),
    icon: <SettingOutlined />,
    hidden: true,
  },
  {
    path: '/system-management',
    name: '系统管理',
    element: lazyLoad('SystemManagement'),
    icon: <SettingOutlined />,
    roles: [UserRole.ADMIN],
  },
];

// 获取扁平化的路由列表（包括子路由）
export function getFlatRoutes(routes: RouteConfig[]): RouteConfig[] {
  const flatRoutes: RouteConfig[] = [];
  
  function traverse(routes: RouteConfig[]) {
    routes.forEach(route => {
      flatRoutes.push(route);
      if (route.children) {
        traverse(route.children);
      }
    });
  }
  
  traverse(routes);
  return flatRoutes;
}

// 获取菜单路由（不包括隐藏的）
export function getMenuRoutes(routes: RouteConfig[]): RouteConfig[] {
  return routes.filter(route => !route.hidden);
}

// 根据权限过滤路由
export function filterRoutesByRole(
  routes: RouteConfig[],
  userRole: UserRole
): RouteConfig[] {
  return routes.filter(route => {
    if (!route.roles) return true;
    return route.roles.includes(userRole);
  });
}

// 获取需要预加载的路由
export function getPreloadRoutes(routes: RouteConfig[]): RouteConfig[] {
  return getFlatRoutes(routes).filter(route => route.preload);
}

// 根据path查找路由
export function findRouteByPath(
  routes: RouteConfig[],
  path: string
): RouteConfig | undefined {
  const flatRoutes = getFlatRoutes(routes);
  return flatRoutes.find(route => route.path === path);
}

// 获取路由的面包屑
export function getRouteBreadcrumb(
  routes: RouteConfig[],
  path: string
): { name: string; path: string }[] {
  const breadcrumb: { name: string; path: string }[] = [];
  const pathSegments = path.split('/').filter(Boolean);
  
  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const route = findRouteByPath(routes, currentPath);
    if (route) {
      breadcrumb.push({
        name: route.name,
        path: currentPath,
      });
    }
  });
  
  return breadcrumb;
}

// 导出默认配置
export default routes;
