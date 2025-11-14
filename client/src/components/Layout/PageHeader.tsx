import React from 'react';
import { Select, Button, Avatar, Dropdown, Typography } from 'antd';
import { UserOutlined, ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const PageHeader: React.FC = () => {
  const { projects, currentProject, setCurrentProject, loadProjects } = useProject();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('isAuthenticated');
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
        borderRadius: '8px',
        margin: '16px 24px 0 24px',
      }}
    >
      {/* 左侧：标题和项目选择器 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <SafetyOutlined style={{ fontSize: 20, color: '#fff' }} />
          <Text strong style={{ color: '#fff', fontSize: 16 }}>
            EPC项目管理系统
          </Text>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>当前项目:</span>
        <Select
          value={currentProject?.id}
          placeholder="请选择项目"
          style={{ width: 220 }}
          onChange={(value) => {
            const project = projects.find((p) => p.id === value);
            if (project) setCurrentProject(project);
          }}
          options={projects.map((p) => ({ label: p.name, value: p.id }))}
          allowClear
        />
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={loadProjects}
          size="small"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
          }}
        >
          刷新
        </Button>
      </div>

      {/* 右侧：用户信息 */}
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 12px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            transition: 'all 0.3s',
          }}
        >
          <Avatar
            icon={<UserOutlined />}
            size="small"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid #fff',
            }}
          />
          <span style={{ color: '#fff', fontSize: 14 }}>管理员</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default PageHeader;
