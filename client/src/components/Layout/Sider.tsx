import React from 'react';
import { Layout, Menu, Button } from 'antd';
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
} from '@ant-design/icons';

const { Sider } = Layout;

interface AppSiderProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const AppSider: React.FC<AppSiderProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/workspace',
      icon: <RocketOutlined />,
      label: '工作台',
      style: {
        borderLeft: '3px solid transparent',
        fontWeight: 600,
      },
    },
    {
      key: '/digital-twin',
      icon: <DashboardOutlined />,
      label: '数字孪生驾驶舱',
    },
    {
      key: '/gantt',
      icon: <BarChartOutlined />,
      label: '甘特图',
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: '任务管理',
    },
    {
      key: '/construction-management',
      icon: <BuildOutlined />,
      label: '总包施工管理',
      style: {
        background: 'linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(102,126,234,0.1) 100%)',
        borderLeft: '3px solid #1890ff',
        fontWeight: 500,
      },
    },
    {
      key: '/construction-log',
      icon: <FileTextOutlined />,
      label: '施工日志',
    },
    {
      key: '/devices',
      icon: <ToolOutlined />,
      label: '设备安装管理',
    },
    {
      key: '/procurement',
      icon: <ShoppingCartOutlined />,
      label: '设备采购管理',
    },
    {
      key: '/selection',
      icon: <AppstoreOutlined />,
      label: '设备选型系统',
      style: {
        background:
          'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)',
        borderLeft: '3px solid #667eea',
        fontWeight: 500,
      },
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
      style: {
        background: 'linear-gradient(135deg, rgba(82,196,26,0.1) 0%, rgba(135,208,104,0.1) 100%)',
        borderLeft: '3px solid #52c41a',
        fontWeight: 500,
      },
    },
    {
      key: '/system-management',
      icon: <ApiOutlined />,
      label: '后台管理',
      style: {
        marginTop: 16,
        background: 'linear-gradient(135deg, rgba(255,85,0,0.1) 0%, rgba(255,140,0,0.1) 100%)',
        borderLeft: '3px solid #ff5500',
        fontWeight: 500,
      },
    },
    {
      key: '/system-settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      style: {
        background: 'linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(102,126,234,0.1) 100%)',
        borderLeft: '3px solid #1890ff',
        fontWeight: 500,
        marginBottom: 16,
      },
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={200}
      collapsedWidth={60}
      trigger={null}
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        height: '100vh',
        overflow: 'auto',
        zIndex: 100,
      }}
    >
      {/* Logo区域 - 精简版 */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          background:
            'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
          fontSize: collapsed ? 18 : 16,
          fontWeight: 600,
          color: '#667eea',
        }}
      >
        {collapsed ? <RocketOutlined /> : '项目管理'}
      </div>

      {/* 菜单区域 */}
      <div style={{ overflowY: 'auto', height: 'calc(100% - 96px)', paddingTop: 8 }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            height: '100%',
            borderRight: 0,
            fontSize: 15,
          }}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </div>

      {/* 折叠按钮 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '2px solid #e0e0e0',
          background: 'linear-gradient(to bottom, #fafafa, #f0f0f0)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
          zIndex: 10,
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{
            fontSize: 18,
            width: 48,
            height: 48,
            color: '#1890ff',
            fontWeight: 'bold',
          }}
        />
      </div>
    </Sider>
  );
};

export default AppSider;
