import React from 'react';
import { Layout, Select, Avatar, Dropdown, Button, message } from 'antd';
import { UserOutlined, ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { projects, currentProject, setCurrentProject, loadProjects } = useProject();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('isAuthenticated');
      message.success('退出登录成功');
      navigate('/login');
    }
  };

  return (
    <Header className="app-header">
      {/* 左侧：标题和项目选择器 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-logo-container">
          <SafetyOutlined className="header-logo-icon" />
          <span className="header-logo-text">EPC项目管理系统</span>
        </div>
        {currentProject && (
          <>
            <span className="header-project-label">当前项目:</span>
            <Select
              value={currentProject?.id}
              style={{ width: 220 }}
              onChange={(value) => {
                const project = projects.find((p) => p.id === value);
                if (project) setCurrentProject(project);
              }}
              options={projects.map((p) => ({ label: p.name, value: p.id }))}
            />
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={loadProjects}
              className="header-refresh-button"
            >
              刷新
            </Button>
          </>
        )}
      </div>

      {/* 用户信息 */}
      <Dropdown
        menu={{
          items: [
            { key: 'profile', label: '个人设置' },
            { key: 'logout', label: '退出登录' },
          ],
          onClick: handleMenuClick,
        }}
      >
        <div
          className="header-user-container"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Avatar icon={<UserOutlined />} className="header-user-avatar" />
          <span className="header-user-name">管理员</span>
        </div>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
