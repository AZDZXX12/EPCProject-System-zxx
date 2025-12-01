import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import {
  HomeOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  BuildOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  TeamOutlined,
  FolderOutlined,
  FilePdfOutlined,
  ApiOutlined,
  SettingOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import './Breadcrumb.css';

interface BreadcrumbItem {
  path: string;
  title: string;
  icon?: React.ReactNode;
}

// 路由配置映射
const routeConfig: Record<string, BreadcrumbItem> = {
  '/workspace': { path: '/workspace', title: '工作台', icon: <RocketOutlined /> },
  '/digital-twin': { path: '/digital-twin', title: '数字孪生驾驶舱', icon: <DashboardOutlined /> },
  '/tasks': { path: '/tasks', title: '任务管理', icon: <UnorderedListOutlined /> },
  '/construction': { path: '/construction', title: '施工管理', icon: <BuildOutlined /> },
  '/procurement': { path: '/procurement', title: '采购管理', icon: <ShoppingCartOutlined /> },
  '/material-price': { path: '/material-price', title: '材料价格监控', icon: <DollarOutlined /> },
  '/selection': { path: '/selection', title: '设备选型系统', icon: <AppstoreOutlined /> },
  '/safety': { path: '/safety', title: 'HSE安全管理', icon: <SafetyOutlined /> },
  '/quality': { path: '/quality', title: 'HSE质量检测', icon: <ExperimentOutlined /> },
  '/personnel': { path: '/personnel', title: '人员管理', icon: <TeamOutlined /> },
  '/documents': { path: '/documents', title: '文档中心', icon: <FolderOutlined /> },
  '/reports': { path: '/reports', title: '数据分析', icon: <FilePdfOutlined /> },
  '/system-management': { path: '/system-management', title: '后台管理', icon: <ApiOutlined /> },
  '/system-settings': { path: '/system-settings', title: '系统设置', icon: <SettingOutlined /> },
  '/utilities': { path: '/utilities', title: '实用工具', icon: <SettingOutlined /> },
  '/lifecycle': { path: '/lifecycle', title: '项目生命周期', icon: <DashboardOutlined /> },
  '/cost': { path: '/cost', title: '成本管理', icon: <DollarOutlined /> },
  '/knowledge': { path: '/knowledge', title: '知识库', icon: <FolderOutlined /> },
  '/devices': { path: '/devices', title: '设备管理', icon: <AppstoreOutlined /> },
};

const AppBreadcrumb: React.FC = () => {
  const location = useLocation();
  
  // 获取面包屑项
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { path: '/', title: '首页', icon: <HomeOutlined /> }
    ];
    
    const currentRoute = routeConfig[location.pathname];
    if (currentRoute) {
      items.push(currentRoute);
    }
    
    // 处理查询参数（如任务管理的视图切换）
    const searchParams = new URLSearchParams(location.search);
    const view = searchParams.get('view');
    if (view) {
      const viewNames: Record<string, string> = {
        'gantt': '甘特图视图',
        'kanban': '看板视图',
        'list': '列表视图',
      };
      if (viewNames[view]) {
        items.push({
          path: location.pathname + location.search,
          title: viewNames[view],
        });
      }
    }
    
    return items;
  };
  
  const breadcrumbItems = getBreadcrumbItems();
  
  // 如果只有首页，不显示面包屑
  if (breadcrumbItems.length <= 1) {
    return null;
  }
  
  return (
    <div className="app-breadcrumb-wrapper">
      <Breadcrumb className="app-breadcrumb">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <Breadcrumb.Item key={item.path}>
              {!isLast ? (
                <Link to={item.path} className="breadcrumb-link">
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  <span>{item.title}</span>
                </Link>
              ) : (
                <>
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  <span className="breadcrumb-current">{item.title}</span>
                </>
              )}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default AppBreadcrumb;
