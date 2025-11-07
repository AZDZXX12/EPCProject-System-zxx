import React from 'react';
import { Card, Row, Col, Statistic, Button, Space, Divider, Alert, List } from 'antd';
import {
  DatabaseOutlined,
  ApiOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  LinkOutlined,
  RocketOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { API_BASE_URL } from '../config';
import './SystemManagement.css';

const SystemManagement: React.FC = () => {
  const openSwagger = () => {
    window.open(`${API_BASE_URL}/docs`, '_blank');
  };

  const openRedoc = () => {
    window.open(`${API_BASE_URL}/redoc`, '_blank');
  };

  const managementLinks = [
    {
      icon: <ApiOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Swagger UI',
      description: '交互式API文档，可以直接测试所有API接口',
      url: `${API_BASE_URL}/docs`,
      action: openSwagger,
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'ReDoc',
      description: '更美观的API文档阅读界面',
      url: `${API_BASE_URL}/redoc`,
      action: openRedoc,
    },
    {
      icon: <DatabaseOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: '数据库管理',
      description: 'SQLite数据库位于 server/data/epc_system.db',
      url: null,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 600 }}>后端管理</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>系统管理和后端API访问</p>

      <Alert
        message="后端管理访问"
        description="通过下方链接可以访问后端API文档和管理工具。Swagger UI提供交互式API测试功能。"
        type="info"
        showIcon
        icon={<SafetyOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="API端点"
              value={25}
              prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 'bold' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="数据库表"
              value={8}
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 'bold' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="注册用户"
              value={12}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 32, fontWeight: 'bold' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="系统版本"
              value="2.0.0"
              prefix={<RocketOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 32, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="后端管理工具" extra={<SettingOutlined />}>
        <List
          itemLayout="horizontal"
          dataSource={managementLinks}
          renderItem={(item) => (
            <List.Item
              actions={[
                item.action ? (
                  <Button type="primary" icon={<LinkOutlined />} onClick={item.action}>
                    打开
                  </Button>
                ) : (
                  <Button disabled>本地访问</Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={<span style={{ fontSize: 16, fontWeight: 500 }}>{item.title}</span>}
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>{item.description}</div>
                    {item.url && (
                      <div style={{ fontSize: 12, color: '#1890ff', fontFamily: 'monospace' }}>
                        {item.url}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />

        <Divider />

        <h3 style={{ marginTop: 24 }}>API端点分类</h3>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card size="small" title="项目管理 API">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>GET /api/v1/projects/ - 获取项目列表</li>
                <li>POST /api/v1/projects/ - 创建项目</li>
                <li>PUT /api/v1/projects/:id - 更新项目</li>
                <li>DELETE /api/v1/projects/:id - 删除项目</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="设备管理 API">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>GET /api/v1/devices/ - 获取设备列表</li>
                <li>POST /api/v1/devices/ - 添加设备</li>
                <li>PUT /api/v1/devices/:id - 更新设备</li>
                <li>DELETE /api/v1/devices/:id - 删除设备</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="任务管理 API">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>GET /api/v1/tasks/ - 获取任务列表</li>
                <li>POST /api/v1/tasks/ - 创建任务</li>
                <li>PUT /api/v1/tasks/:id - 更新任务</li>
                <li>DELETE /api/v1/tasks/:id - 删除任务</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="用户认证 API">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>POST /api/auth/login - 用户登录</li>
                <li>POST /api/auth/logout - 用户登出</li>
                <li>GET /api/auth/me - 获取当前用户</li>
                <li>PUT /api/auth/password - 修改密码</li>
              </ul>
            </Card>
          </Col>
        </Row>

        <Divider />

        <h3>快速访问</h3>
        <Space size="middle" wrap>
          <Button type="primary" icon={<ApiOutlined />} onClick={openSwagger}>
            打开 Swagger UI
          </Button>
          <Button icon={<FileTextOutlined />} onClick={openRedoc}>
            打开 ReDoc
          </Button>
          <Button
            icon={<DatabaseOutlined />}
            onClick={() => window.alert('数据库文件位于: server/data/epc_system.db')}
          >
            查看数据库位置
          </Button>
        </Space>
      </Card>

      <Card title="系统配置" style={{ marginTop: 16 }}>
        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: 4, fontFamily: 'monospace' }}>
          <div style={{ marginBottom: 8 }}>
            <strong>前端地址:</strong> http://localhost:3000
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>后端地址:</strong> {API_BASE_URL}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>数据库:</strong> SQLite (server/data/epc_system.db)
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>备份目录:</strong> server/data/backup/
          </div>
          <div>
            <strong>日志目录:</strong> server/logs/
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemManagement;


