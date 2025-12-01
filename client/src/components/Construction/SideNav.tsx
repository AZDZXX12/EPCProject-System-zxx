import React from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import './SideNav.css';

interface SideNavProps {
  activeView: string;
  onChange: (view: string) => void;
  collapsed?: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

const SideNav: React.FC<SideNavProps> = ({ activeView, onChange, collapsed = false }) => {
  const menuItems: MenuItem[] = [
    {
      key: 'overview',
      icon: <span className="nav-emoji">🏗️</span>,
      label: '项目概览',
    },
    {
      key: 'progress',
      icon: <span className="nav-emoji">📈</span>,
      label: '进度管理',
    },
    {
      key: 'logs',
      icon: <span className="nav-emoji">📋</span>,
      label: '施工日志',
    },
    {
      key: 'quality',
      icon: <span className="nav-emoji">🔍</span>,
      label: '质量检查',
    },
    {
      key: 'safety',
      icon: <span className="nav-emoji">⚠️</span>,
      label: '安全巡检',
    },
    {
      key: 'workers',
      icon: <span className="nav-emoji">👷</span>,
      label: '人员管理',
    },
    {
      key: 'equipment',
      icon: <span className="nav-emoji">🚛</span>,
      label: '设备管理',
    },
    {
      key: 'reports',
      icon: <span className="nav-emoji">📊</span>,
      label: '统计报表',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    onChange(e.key);
  };

  return (
    <div className={`construction-side-nav ${collapsed ? 'collapsed' : ''}`}>
      <div className="side-nav-header">
        <div className="site-logo">
          <span className="logo-icon">🏗️</span>
          {!collapsed && <span className="logo-text">施工管理</span>}
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeView]}
        onClick={handleMenuClick}
        items={menuItems}
        className="construction-menu"
        inlineCollapsed={collapsed}
      />
    </div>
  );
};

export default SideNav;
