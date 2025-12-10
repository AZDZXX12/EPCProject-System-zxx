/**
 * 增强版后台管理页面
 * 模块：用户管理、项目管理、系统配置、操作日志
 */

import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Avatar,
  message,
  Popconfirm,
  Switch,
  Statistic,
  Row,
  Col,
  DatePicker,
} from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  SettingOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './SystemManagement.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  ip: string;
  time: string;
  status: 'success' | 'failed';
}

const EnhancedSystemManagement: React.FC = () => {
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟用户数据
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-11-23 15:30',
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@example.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2025-11-23 14:20',
    },
  ]);

  // 模拟项目数据
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'PROJ-001',
      name: 'EPC总承包项目',
      status: '进行中',
      progress: 65,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    },
  ]);

  // 模拟审计日志
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      user: 'admin',
      action: '创建任务',
      module: '任务管理',
      ip: '192.168.1.100',
      time: '2025-11-23 15:30:25',
      status: 'success',
    },
    {
      id: '2',
      user: 'manager',
      action: '修改项目信息',
      module: '项目管理',
      ip: '192.168.1.105',
      time: '2025-11-23 14:20:18',
      status: 'success',
    },
  ];

  // 用户表格列
  const userColumns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <Space>
          <Avatar icon={<TeamOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colors: Record<string, string> = {
          admin: 'red',
          manager: 'blue',
          user: 'green',
        };
        const labels: Record<string, string> = {
          admin: '管理员',
          manager: '项目经理',
          user: '普通用户',
        };
        return <Tag color={colors[role]}>{labels[role]}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteUser(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 项目表格列
  const projectColumns: ColumnsType<Project> = [
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          进行中: 'blue',
          已完成: 'green',
          已暂停: 'orange',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link">查看详情</Button>
        </Space>
      ),
    },
  ];

  // 审计日志表格列
  const auditLogColumns: ColumnsType<AuditLog> = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
  ];

  const handleAddUser = () => {
    form.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    form.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    message.success('删除成功');
  };

  const handleUserModalOk = async () => {
    try {
      const values = await form.validateFields();
      message.success('操作成功');
      setUserModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div className="system-management-enhanced">
      <div className="page-header">
        <div className="header-content">
          <Space size="large">
            <SettingOutlined className="header-icon" />
            <div>
              <h2 className="header-title">系统管理</h2>
              <p className="header-subtitle">用户、项目、配置、日志管理</p>
            </div>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-blue" hoverable>
            <Statistic
              title="用户总数"
              value={users.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-green" hoverable>
            <Statistic
              title="项目总数"
              value={projects.length}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-orange" hoverable>
            <Statistic
              title="今日操作"
              value={15}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-purple" hoverable>
            <Statistic
              title="在线用户"
              value={3}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="content-card">
        <Tabs defaultActiveKey="users" type="card">
          {/* 用户管理 */}
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                用户管理
              </span>
            }
            key="users"
          >
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                新增用户
              </Button>
              <Input.Search
                placeholder="搜索用户名或邮箱"
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
            </Space>
            <Table columns={userColumns} dataSource={users} rowKey="id" />
          </TabPane>

          {/* 项目管理 */}
          <TabPane
            tab={
              <span>
                <ProjectOutlined />
                项目管理
              </span>
            }
            key="projects"
          >
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />}>
                新建项目
              </Button>
              <Select placeholder="状态筛选" style={{ width: 150 }} allowClear>
                <Option value="进行中">进行中</Option>
                <Option value="已完成">已完成</Option>
                <Option value="已暂停">已暂停</Option>
              </Select>
            </Space>
            <Table columns={projectColumns} dataSource={projects} rowKey="id" />
          </TabPane>

          {/* 系统配置 */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                系统配置
              </span>
            }
            key="config"
          >
            <Form layout="vertical">
              <Form.Item label="系统名称">
                <Input defaultValue="EPC项目管理系统" />
              </Form.Item>
              <Form.Item label="系统Logo">
                <Button icon={<DownloadOutlined />}>上传Logo</Button>
              </Form.Item>
              <Form.Item label="备份设置">
                <Space>
                  <Switch defaultChecked />
                  <span>自动备份（每天凌晨2点）</span>
                </Space>
              </Form.Item>
              <Form.Item label="通知设置">
                <Space>
                  <Switch defaultChecked />
                  <span>启用邮件通知</span>
                </Space>
              </Form.Item>
              <Form.Item>
                <Button type="primary">保存配置</Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 操作日志 */}
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                操作日志
              </span>
            }
            key="logs"
          >
            <Space style={{ marginBottom: 16 }}>
              <RangePicker />
              <Select placeholder="模块筛选" style={{ width: 150 }} allowClear>
                <Option value="task">任务管理</Option>
                <Option value="project">项目管理</Option>
                <Option value="device">设备管理</Option>
              </Select>
              <Button icon={<SearchOutlined />}>查询</Button>
              <Button icon={<DownloadOutlined />}>导出</Button>
            </Space>
            <Table columns={auditLogColumns} dataSource={auditLogs} rowKey="id" />
          </TabPane>
        </Tabs>
      </Card>

      {/* 用户编辑Modal */}
      <Modal
        title="用户信息"
        open={userModalVisible}
        onOk={handleUserModalOk}
        onCancel={() => setUserModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="manager">项目经理</Option>
              <Option value="user">普通用户</Option>
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}>
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnhancedSystemManagement;
