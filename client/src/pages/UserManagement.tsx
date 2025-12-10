/**
 * 用户管理页面
 * 管理员审核注册申请、管理用户权限
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Descriptions,
  Badge,
  Tabs,
  Popconfirm,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageContainer from '../components/Layout/PageContainer';
import './UserManagement.css';

const { Option } = Select;
const { TextArea } = Input;

interface User {
  id: string;
  username: string;
  email: string;
  realName: string;
  phone: string;
  company: string;
  department: string;
  position: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  password?: string; // 可选，用于创建账号
}

const UserManagement: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reviewForm] = Form.useForm();

  // 加载用户数据
  const loadUsers = async () => {
    setLoading(true);
    try {
      // 尝试从API加载
      const response = await fetch('http://localhost:8000/api/v1/users/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.filter((u: User) => u.status === 'pending'));
        setApprovedUsers(data.filter((u: User) => u.status === 'approved'));
        setRejectedUsers(data.filter((u: User) => u.status === 'rejected'));
      } else {
        throw new Error('API加载失败');
      }
    } catch (error) {
      // 从本地存储加载
      const users = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      const approvedList = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      const rejectedList = JSON.parse(localStorage.getItem('rejectedUsers') || '[]');
      
      setPendingUsers(users);
      setApprovedUsers(approvedList);
      setRejectedUsers(rejectedList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 查看详情
  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  // 打开审核对话框
  const handleReview = (user: User, action: 'approve' | 'reject') => {
    setSelectedUser(user);
    reviewForm.setFieldsValue({
      action,
      comment: '',
    });
    setReviewModalVisible(true);
  };

  // 提交审核
  const handleSubmitReview = async (values: any) => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const reviewData = {
        userId: selectedUser.id,
        action: values.action,
        comment: values.comment,
        reviewedBy: 'admin', // 当前登录用户
        reviewedAt: new Date().toISOString(),
      };

      // 尝试调用API
      const response = await fetch('http://localhost:8000/api/v1/users/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('API审核失败');
      }
    } catch (error) {
      // 使用本地存储
      const users = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      const updatedUser = {
        ...selectedUser,
        status: values.action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin',
        reviewComment: values.comment,
      };

      // 从待审核列表移除
      const newPendingUsers = users.filter((u: User) => u.id !== selectedUser.id);
      localStorage.setItem('pendingUsers', JSON.stringify(newPendingUsers));

      // 添加到对应列表
      if (values.action === 'approve') {
        const approved = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        approved.push(updatedUser);
        localStorage.setItem('approvedUsers', JSON.stringify(approved));
        
        // 创建登录账号
        const accounts = JSON.parse(localStorage.getItem('userAccounts') || '[]');
        accounts.push({
          username: updatedUser.username,
          password: updatedUser.password || 'ChangeMe123!', // 临时密码
          email: updatedUser.email,
          realName: updatedUser.realName,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('userAccounts', JSON.stringify(accounts));
      } else {
        const rejected = JSON.parse(localStorage.getItem('rejectedUsers') || '[]');
        rejected.push(updatedUser);
        localStorage.setItem('rejectedUsers', JSON.stringify(rejected));
      }
    }

    message.success(
      values.action === 'approve' ? '审核通过，用户已激活' : '已拒绝该申请'
    );
    setReviewModalVisible(false);
    reviewForm.resetFields();
    loadUsers();
    setLoading(false);
  };

  // 删除用户
  const handleDelete = async (user: User) => {
    setLoading(true);
    try {
      // 从对应列表删除
      if (user.status === 'pending') {
        const users = pendingUsers.filter(u => u.id !== user.id);
        setPendingUsers(users);
        localStorage.setItem('pendingUsers', JSON.stringify(users));
      } else if (user.status === 'approved') {
        const users = approvedUsers.filter(u => u.id !== user.id);
        setApprovedUsers(users);
        localStorage.setItem('approvedUsers', JSON.stringify(users));
      } else {
        const users = rejectedUsers.filter(u => u.id !== user.id);
        setRejectedUsers(users);
        localStorage.setItem('rejectedUsers', JSON.stringify(users));
      }
      message.success('删除成功');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (text) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
      width: 150,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      render: (dept) => {
        const deptMap: Record<string, string> = {
          engineering: '工程部',
          procurement: '采购部',
          construction: '施工部',
          quality: '质量部',
          safety: '安全部',
          finance: '财务部',
          hr: '人力资源部',
          other: '其他',
        };
        return deptMap[dept] || dept;
      },
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      width: 100,
      render: (pos) => {
        const posMap: Record<string, string> = {
          manager: '项目经理',
          engineer: '工程师',
          supervisor: '监理',
          technician: '技术员',
          coordinator: '协调员',
          other: '其他',
        };
        return posMap[pos] || pos;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          pending: { color: 'gold', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleReview(record, 'approve')}
                style={{ color: '#52c41a' }}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReview(record, 'reject')}
                danger
              >
                拒绝
              </Button>
            </>
          )}
          <Popconfirm
            title="确定删除该用户吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="用户管理"
    >
      <Card>
        <Tabs
          defaultActiveKey="pending"
          items={[
            {
              key: 'pending',
              label: (
                <span>
                  <Badge count={pendingUsers.length} offset={[10, 0]}>
                    待审核
                  </Badge>
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={pendingUsers}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1400 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              ),
            },
            {
              key: 'approved',
              label: `已通过 (${approvedUsers.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={approvedUsers}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1400 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              ),
            },
            {
              key: 'rejected',
              label: `已拒绝 (${rejectedUsers.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={rejectedUsers}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1400 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* 详情对话框 */}
      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedUser && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="用户名" span={1}>
              {selectedUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="真实姓名" span={1}>
              {selectedUser.realName}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱" span={2}>
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="手机" span={1}>
              {selectedUser.phone}
            </Descriptions.Item>
            <Descriptions.Item label="公司" span={1}>
              {selectedUser.company}
            </Descriptions.Item>
            <Descriptions.Item label="部门" span={1}>
              {selectedUser.department}
            </Descriptions.Item>
            <Descriptions.Item label="职位" span={1}>
              {selectedUser.position}
            </Descriptions.Item>
            <Descriptions.Item label="申请时间" span={2}>
              {new Date(selectedUser.appliedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="申请理由" span={2}>
              {selectedUser.reason}
            </Descriptions.Item>
            {selectedUser.reviewedAt && (
              <>
                <Descriptions.Item label="审核时间" span={1}>
                  {new Date(selectedUser.reviewedAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
                <Descriptions.Item label="审核人" span={1}>
                  {selectedUser.reviewedBy}
                </Descriptions.Item>
                <Descriptions.Item label="审核意见" span={2}>
                  {selectedUser.reviewComment || '无'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 审核对话框 */}
      <Modal
        title={reviewForm.getFieldValue('action') === 'approve' ? '审核通过' : '审核拒绝'}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        onOk={() => reviewForm.submit()}
        confirmLoading={loading}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleSubmitReview}
        >
          <Form.Item name="action" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="comment"
            label="审核意见"
            rules={[{ required: true, message: '请填写审核意见' }]}
          >
            <TextArea
              rows={4}
              placeholder="请填写审核意见..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
