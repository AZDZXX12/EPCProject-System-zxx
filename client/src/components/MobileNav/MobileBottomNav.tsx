/**
 * 移动端底部导航栏
 * 提供快速访问主要功能的入口
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  ProjectOutlined,
  BarChartOutlined,
  SettingOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import './MobileBottomNav.css';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: '首页',
    path: '/workspace',
  },
  {
    key: 'projects',
    icon: <ProjectOutlined />,
    label: '项目',
    path: '/gantt',
  },
  {
    key: 'dashboard',
    icon: <BarChartOutlined />,
    label: '仪表盘',
    path: '/dashboard',
  },
  {
    key: 'ai',
    icon: <RobotOutlined />,
    label: 'AI助手',
    path: '/ai-assistant',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置',
    path: '/settings',
  },
];

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('home');

  // 根据当前路径设置活动项
  React.useEffect(() => {
    const currentItem = navItems.find(item => location.pathname.startsWith(item.path));
    if (currentItem) {
      setActiveKey(currentItem.key);
    }
  }, [location.pathname]);

  const handleNavClick = (item: NavItem) => {
    setActiveKey(item.key);
    navigate(item.path);
    
    // 触觉反馈
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${activeKey === item.key ? 'active' : ''}`}
          onClick={() => handleNavClick(item)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default MobileBottomNav;
