import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Input, Tooltip } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RocketOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  TeamOutlined,
  FolderOutlined,
  FilePdfOutlined,
  ApiOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  BuildOutlined,
  SettingOutlined,
  DollarOutlined,
  MenuOutlined,
  CloseOutlined,
  SearchOutlined,
  BellOutlined,
  StarOutlined,
} from '@ant-design/icons';
import './Sider.css';

const { Sider } = Layout;

interface AppSiderProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const AppSider: React.FC<AppSiderProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState<any[]>([]);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    {
      key: '/workspace',
      icon: <RocketOutlined />,
      label: '工作台',
      className: 'menu-item-bold',
    },
    {
      key: '/digital-twin',
      icon: <DashboardOutlined />,
      label: '数字孪生驾驶舱',
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: '任务管理',
    },
    {
      key: '/construction',
      icon: <BuildOutlined />,
      label: '施工管理',
      className: 'menu-highlight-blue',
    },
    {
      key: '/procurement',
      icon: <ShoppingCartOutlined />,
      label: '采购管理',
    },
    {
      key: '/material-price',
      icon: <DollarOutlined />,
      label: '材料价格监控',
      className: 'menu-highlight-warning',
    },
    {
      key: '/selection',
      icon: <AppstoreOutlined />,
      label: '设备选型系统',
      className: 'menu-highlight-indigo',
    },
    {
      key: '/panorama',
      icon: <DashboardOutlined />,
      label: '全景图查看器',
      className: 'menu-highlight-green',
    },
    {
      key: '/utilities',
      icon: <ToolOutlined />,
      label: '实用工具',
    },
    {
      key: 'quality-safety',
      icon: <CheckCircleOutlined />,
      label: '质量安全',
      children: [
        {
          key: '/safety',
          icon: <SafetyOutlined />,
          label: 'HSE安全管理',
        },
        {
          key: '/quality',
          icon: <ExperimentOutlined />,
          label: 'HSE质量检测',
        },
      ],
    },
    {
      key: '/personnel',
      icon: <TeamOutlined />,
      label: '人员管理',
    },
    {
      key: '/documents',
      icon: <FolderOutlined />,
      label: '文档中心',
    },
    {
      key: '/reports',
      icon: <FilePdfOutlined />,
      label: '数据分析',
      className: 'menu-highlight-green',
    },
    {
      key: '/system-management',
      icon: <ApiOutlined />,
      label: '后台管理',
      className: 'menu-highlight-system',
    },
    {
      key: '/system-settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      className: 'menu-highlight-blue menu-btm-mb',
    },
  ];

  // 搜索过滤菜单
  useEffect(() => {
    if (!searchValue) {
      setFilteredMenuItems(menuItems);
      return;
    }

    const filterItems = (items: any[]): any[] => {
      return items.filter(item => {
        if (item.label && typeof item.label === 'string') {
          if (item.label.toLowerCase().includes(searchValue.toLowerCase())) {
            return true;
          }
        }
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length > 0) {
            return true;
          }
        }
        return false;
      }).map(item => {
        if (item.children) {
          return {
            ...item,
            children: filterItems(item.children)
          };
        }
        return item;
      });
    };

    setFilteredMenuItems(filterItems(menuItems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
    // 移动端点击菜单后关闭侧边栏
    if (isMobile) {
      setMobileVisible(false);
    }
  };

  return (
    <>
      {/* 移动端菜单按钮 */}
      {isMobile && (
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileVisible(!mobileVisible)}
          aria-label="Toggle menu"
        >
          {mobileVisible ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      )}

      {/* 移动端遮罩 */}
      {isMobile && mobileVisible && (
        <div
          className="mobile-sider-mask"
          onClick={() => setMobileVisible(false)}
        />
      )}

      <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={200}
      collapsedWidth={60}
      trigger={null}
      className={`app-sider${isMobile && mobileVisible ? ' mobile-visible' : ''}`}
      theme="light"
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div className={`sider-logo ${collapsed ? 'sider-logo-collapsed' : ''}`}>
        {collapsed ? 'EPC' : 'EPC 项目管理'}
      </div>

      {/* 搜索框 - 非折叠时显示 */}
      {!collapsed && (
        <div style={{ padding: '8px 16px' }}>
          <Input
            placeholder="搜索菜单..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            size="small"
          />
        </div>
      )}

      {/* 快捷操作按钮 - 折叠时显示 */}
      {collapsed && (
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Tooltip title="搜索" placement="right">
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => onCollapse(false)}
              style={{ width: '40px', height: '40px' }}
            />
          </Tooltip>
        </div>
      )}
      
      <div className="sider-menu-wrapper">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          className="sider-menu"
          items={searchValue ? filteredMenuItems : menuItems}
          onClick={handleMenuClick}
        />
      </div>

      {/* 折叠按钮 */}
      <div className="sider-footer">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          className="sider-collapse-btn"
        />
      </div>
    </Sider>
    </>
  );
};

export default AppSider;
