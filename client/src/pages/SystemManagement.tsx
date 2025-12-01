import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Divider, Alert, List, Tabs, Table, Modal, Form, Input, Select, Tag, message, Switch } from 'antd';
import {
  DatabaseOutlined,
  ApiOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  LinkOutlined,
  RocketOutlined,
  SafetyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  AuditOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { API_BASE_URL } from '../config';
import './SystemManagement.css';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'failed';
}

const SystemManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 加载Mock数据
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock用户数据
    setUsers([
      { id: '1', username: 'admin', email: 'admin@epc.com', role: '系统管理员', status: 'active', lastLogin: '2025-01-20 14:30' },
      { id: '2', username: 'zhangsan', email: 'zhangsan@epc.com', role: '项目经理', status: 'active', lastLogin: '2025-01-20 10:15' },
      { id: '3', username: 'lisi', email: 'lisi@epc.com', role: '设备工程师', status: 'active', lastLogin: '2025-01-19 16:20' },
      { id: '4', username: 'wangwu', email: 'wangwu@epc.com', role: '质量专员', status: 'inactive', lastLogin: '2025-01-15 09:00' },
    ]);

    // Mock角色数据
    setRoles([
      { id: '1', name: '系统管理员', permissions: ['all'], userCount: 1 },
      { id: '2', name: '项目经理', permissions: ['project:read', 'project:write', 'task:read', 'task:write'], userCount: 3 },
      { id: '3', name: '设备工程师', permissions: ['device:read', 'device:write', 'task:read'], userCount: 5 },
      { id: '4', name: '质量专员', permissions: ['quality:read', 'quality:write'], userCount: 2 },
      { id: '5', name: '安全员', permissions: ['safety:read', 'safety:write'], userCount: 1 },
    ]);

    // Mock审计日志
    setAuditLogs([
      { id: '1', user: 'admin', action: '创建项目', resource: '化工设备生产线安装项目', timestamp: '2025-01-20 14:30:15', status: 'success' },
      { id: '2', user: 'zhangsan', action: '更新任务', resource: 'TASK-001', timestamp: '2025-01-20 14:25:30', status: 'success' },
      { id: '3', user: 'lisi', action: '添加设备', resource: 'DEV-025', timestamp: '2025-01-20 14:20:00', status: 'success' },
      { id: '4', user: 'wangwu', action: '删除文档', resource: 'DOC-123', timestamp: '2025-01-20 14:15:45', status: 'failed' },
      { id: '5', user: 'admin', action: '修改权限', resource: '项目经理角色', timestamp: '2025-01-20 14:10:00', status: 'success' },
    ]);
  };

  const openSwagger = () => {
    window.open(`${API_BASE_URL}/docs`, '_blank');
  };

  const openRedoc = () => {
    window.open(`${API_BASE_URL}/redoc`, '_blank');
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可恢复。',
      onOk: () => {
        setUsers(users.filter(u => u.id !== userId));
        message.success('用户已删除');
      },
    });
  };

  const handleUserSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...values } : u));
        message.success('用户信息已更新');
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          ...values,
          lastLogin: '-',
        };
        setUsers([...users, newUser]);
        message.success('用户已添加');
      }
      setUserModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleStatusToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    message.success(`用户状态已${newStatus === 'active' ? '启用' : '禁用'}`);
  };

  const managementLinks = [
    {
      icon: <ApiOutlined className="sm-icon-24 sm-icon-blue" />,
      title: 'Swagger UI',
      description: '交互式API文档，可以直接测试所有API接口',
      url: `${API_BASE_URL}/docs`,
      action: openSwagger,
    },
    {
      icon: <FileTextOutlined className="sm-icon-24 sm-icon-green" />,
      title: 'ReDoc',
      description: '更美观的API文档阅读界面',
      url: `${API_BASE_URL}/redoc`,
      action: openRedoc,
    },
    {
      icon: <DatabaseOutlined className="sm-icon-24 sm-icon-purple" />,
      title: '数据库管理',
      description: 'SQLite数据库位于 server/data/epc_system.db',
      url: null,
    },
  ];

  // 用户表格列定义
  const userColumns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (role: string) => <Tag color="blue">{role}</Tag> },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string, record: User) => (
        <Switch 
          checked={status === 'active'} 
          onChange={() => handleStatusToggle(record.id, status)}
          checkedChildren="启用" 
          unCheckedChildren="禁用"
        />
      )
    },
    { title: '最后登录', dataIndex: 'lastLogin', key: 'lastLogin' },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 角色表格列定义
  const roleColumns = [
    { title: '角色名称', dataIndex: 'name', key: 'name', render: (name: string) => <Tag color="purple">{name}</Tag> },
    { 
      title: '权限', 
      dataIndex: 'permissions', 
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.map(p => <Tag key={p} color="green">{p}</Tag>)}
        </Space>
      )
    },
    { title: '用户数量', dataIndex: 'userCount', key: 'userCount', render: (count: number) => `${count} 人` },
    {
      title: '操作',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  // 审计日志列定义
  const auditColumns = [
    { title: '用户', dataIndex: 'user', key: 'user', render: (user: string) => <Tag>{user}</Tag> },
    { title: '操作', dataIndex: 'action', key: 'action' },
    { title: '资源', dataIndex: 'resource', key: 'resource' },
    { title: '时间', dataIndex: 'timestamp', key: 'timestamp' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="system-management-container">
      <h1 className="sm-title">后台管理</h1>
      <p className="sm-subtitle">系统管理、用户权限和后端API访问</p>

      <Alert
        message="后端管理访问"
        description="通过下方链接可以访问后端API文档和管理工具。Swagger UI提供交互式API测试功能。"
        type="info"
        showIcon
        icon={<SafetyOutlined />}
        className="sm-mb-24"
      />

      <Row gutter={[16, 16]} className="sm-stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="注册用户"
              value={users.length}
              prefix={<UserOutlined className="sm-icon-blue" />}
              className="sm-stat sm-stat-blue"
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="系统角色"
              value={roles.length}
              prefix={<TeamOutlined className="sm-icon-green" />}
              className="sm-stat sm-stat-green"
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="今日操作"
              value={auditLogs.length}
              prefix={<AuditOutlined className="sm-icon-purple" />}
              className="sm-stat sm-stat-purple"
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="系统版本"
              value="2.0.0"
              prefix={<RocketOutlined className="sm-icon-orange" />}
              className="sm-stat sm-stat-orange"
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="users"
        items={[
          {
            key: 'users',
            label: (
              <span>
                <UserOutlined /> 用户管理
              </span>
            ),
            children: (
              <Card>
                <div className="sm-mb-16">
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                    添加用户
                  </Button>
                </div>
                <Table 
                  columns={userColumns} 
                  dataSource={users} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: 'roles',
            label: (
              <span>
                <TeamOutlined /> 角色权限
              </span>
            ),
            children: (
              <Card>
                <div className="sm-mb-16">
                  <Button type="primary" icon={<PlusOutlined />}>
                    添加角色
                  </Button>
                </div>
                <Table 
                  columns={roleColumns} 
                  dataSource={roles} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: 'audit',
            label: (
              <span>
                <AuditOutlined /> 审计日志
              </span>
            ),
            children: (
              <Card>
                <Table 
                  columns={auditColumns} 
                  dataSource={auditLogs} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: 'api',
            label: (
              <span>
                <ApiOutlined /> API管理
              </span>
            ),
            children: (
              <div>

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
                title={<span className="sm-list-title">{item.title}</span>}
                description={
                  <div>
                    <div className="sm-mb-8">{item.description}</div>
                    {item.url && (
                      <div className="sm-url">
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

        <h3 className="sm-section-title">API端点分类</h3>
        <Row gutter={[16, 16]} className="sm-mt-16">
          <Col span={12}>
            <Card size="small" title="项目管理 API">
              <ul className="sm-ul-clean">
                <li>GET /api/v1/projects/ - 获取项目列表</li>
                <li>POST /api/v1/projects/ - 创建项目</li>
                <li>PUT /api/v1/projects/:id - 更新项目</li>
                <li>DELETE /api/v1/projects/:id - 删除项目</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="设备管理 API">
              <ul className="sm-ul-clean">
                <li>GET /api/v1/devices/ - 获取设备列表</li>
                <li>POST /api/v1/devices/ - 添加设备</li>
                <li>PUT /api/v1/devices/:id - 更新设备</li>
                <li>DELETE /api/v1/devices/:id - 删除设备</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="任务管理 API">
              <ul className="sm-ul-clean">
                <li>GET /api/v1/tasks/ - 获取任务列表</li>
                <li>POST /api/v1/tasks/ - 创建任务</li>
                <li>PUT /api/v1/tasks/:id - 更新任务</li>
                <li>DELETE /api/v1/tasks/:id - 删除任务</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="用户认证 API">
              <ul className="sm-ul-clean">
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

      <Card title="系统配置" className="sm-config-card">
        <div className="sm-config-box">
          <div className="sm-mb-8">
            <strong>前端地址:</strong> http://localhost:3000
          </div>
          <div className="sm-mb-8">
            <strong>后端地址:</strong> {API_BASE_URL}
          </div>
          <div className="sm-mb-8">
            <strong>数据库:</strong> SQLite (server/data/epc_system.db)
          </div>
          <div className="sm-mb-8">
            <strong>备份目录:</strong> server/data/backup/
          </div>
          <div>
            <strong>日志目录:</strong> server/logs/
          </div>
        </div>
      </Card>
              </div>
            ),
          },
        ]}
      />

      {/* 用户管理Modal */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={userModalVisible}
        onOk={handleUserSubmit}
        onCancel={() => setUserModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.name}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemManagement;
