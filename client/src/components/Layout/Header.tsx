import React from 'react';
import { Layout, Select, Avatar, Dropdown, Button, message, Badge, Space, Input } from 'antd';
import { 
  UserOutlined, 
  ReloadOutlined, 
  SafetyOutlined,
  BellOutlined,
  SearchOutlined,
  RocketOutlined
} from '@ant-design/icons';
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
      {/* 左侧：Logo和项目选择器 */}
      <div className="header-left">
        <div className="header-logo-container">
          <RocketOutlined className="header-logo-icon" />
          <span className="header-logo-text">EPC项目管理系统</span>
        </div>
        {currentProject && (
          <div className="header-project-selector">
            <span className="header-project-label">当前项目:</span>
            <Select
              value={currentProject?.id}
              style={{ width: 200 }}
              onChange={(value) => {
                const project = projects.find((p) => p.id === value);
                if (project) setCurrentProject(project);
              }}
              options={projects.map((p) => ({ label: p.name, value: p.id }))}
            />
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={loadProjects}
              className="header-refresh-button"
              title="刷新项目列表"
            />
          </div>
        )}
      </div>

      {/* 中间：全局搜索 */}
      <div className="header-center">
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索项目、任务、文档..."
          className="header-search"
          style={{ width: 320 }}
          onPressEnter={(e) => {
            const value = (e.target as HTMLInputElement).value;
            if (value) {
              message.info(`搜索: ${value}`);
              // TODO: 实现全局搜索功能
            }
          }}
        />
      </div>

      {/* 右侧：通知和用户信息 */}
      <div className="header-right">
        <Space size="large">
          {/* 通知中心 */}
          <Badge count={0} showZero={false}>
            <Button
              type="text"
              icon={<BellOutlined />}
              className="header-icon-btn"
              title="通知中心"
              onClick={() => message.info('暂无新通知')}
            />
          </Badge>

          {/* 用户菜单 */}
          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: '个人设置' },
                { type: 'divider' },
                { key: 'logout', label: '退出登录', danger: true },
              ],
              onClick: handleMenuClick,
            }}
          >
            <div className="header-user-container">
              <Avatar icon={<UserOutlined />} className="header-user-avatar" />
              <span className="header-user-name">管理员</span>
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;
