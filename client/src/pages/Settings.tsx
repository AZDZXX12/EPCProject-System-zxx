import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Tabs, Avatar, Upload, Divider, Space, Switch } from 'antd';
import { UserOutlined, LockOutlined, BellOutlined, SettingOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import './Settings.css';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username') || 'admin';
  const [form] = Form.useForm();

  const handleUpdateProfile = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      console.log('更新个人信息:', values);
      message.success('个人信息更新成功！');
      setLoading(false);
    }, 1000);
  };

  const handleChangePassword = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致！');
        setLoading(false);
        return;
      }
      console.log('修改密码');
      message.success('密码修改成功，请重新登录！');
      setLoading(false);
    }, 1000);
  };

  const handleNotificationChange = (checked: boolean, type: string) => {
    message.success(`${type}通知已${checked ? '开启' : '关闭'}`);
  };

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> 个人资料
        </span>
      ),
      children: (
        <Card variant="borderless">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div style={{ marginTop: 16 }}>
              <Upload
                showUploadList={false}
                beforeUpload={() => {
                  message.info('头像上传功能开发中...');
                  return false;
                }}
              >
                <Button icon={<CameraOutlined />} type="link">
                  更换头像
                </Button>
              </Upload>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            initialValues={{
              username: username,
              realname: '系统管理员',
              email: 'admin@epc-system.com',
              phone: '138****8888',
              department: '项目管理部',
              position: '系统管理员',
            }}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input disabled prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="真实姓名"
              name="realname"
              rules={[{ required: true, message: '请输入真实姓名' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="手机号"
              name="phone"
              rules={[{ required: true, message: '请输入手机号' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item label="部门" name="department">
              <Input />
            </Form.Item>

            <Form.Item label="职位" name="position">
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined /> 安全设置
        </span>
      ),
      children: (
        <Card variant="borderless">
          <h3>修改密码</h3>
          <Form layout="vertical" onFinish={handleChangePassword}>
            <Form.Item
              label="当前密码"
              name="currentPassword"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              rules={[{ required: true, message: '请确认新密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                修改密码
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <h3>登录设备管理</h3>
          <div style={{ padding: '16px 0' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div><strong>Chrome 浏览器 (Windows)</strong></div>
                    <div style={{ fontSize: 12, color: '#999' }}>最后登录: 2025-10-18 15:30</div>
                  </div>
                  <Button size="small" danger>
                    下线
                  </Button>
                </div>
              </Card>
            </Space>
          </div>
        </Card>
      ),
    },
    {
      key: 'notification',
      label: (
        <span>
          <BellOutlined /> 通知设置
        </span>
      ),
      children: (
        <Card variant="borderless">
          <div style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 24 }}>
              <h4>系统通知</h4>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div>项目进度更新通知</div>
                    <div style={{ fontSize: 12, color: '#999' }}>当项目进度发生变化时接收通知</div>
                  </div>
                  <Switch defaultChecked onChange={(checked) => handleNotificationChange(checked, '项目进度')} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div>设备安装提醒</div>
                    <div style={{ fontSize: 12, color: '#999' }}>设备安装计划和状态变更提醒</div>
                  </div>
                  <Switch defaultChecked onChange={(checked) => handleNotificationChange(checked, '设备安装')} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div>安全预警通知</div>
                    <div style={{ fontSize: 12, color: '#999' }}>安全隐患和事故预警信息</div>
                  </div>
                  <Switch defaultChecked onChange={(checked) => handleNotificationChange(checked, '安全预警')} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div>质量检测通知</div>
                    <div style={{ fontSize: 12, color: '#999' }}>质量检测结果和不合格品处理通知</div>
                  </div>
                  <Switch defaultChecked onChange={(checked) => handleNotificationChange(checked, '质量检测')} />
                </div>
              </Space>
            </div>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <h4>邮件通知</h4>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div>每日工作汇总</div>
                    <div style={{ fontSize: 12, color: '#999' }}>每日18:00发送工作汇总邮件</div>
                  </div>
                  <Switch onChange={(checked) => handleNotificationChange(checked, '每日汇总')} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div>周报推送</div>
                    <div style={{ fontSize: 12, color: '#999' }}>每周五发送本周工作报告</div>
                  </div>
                  <Switch onChange={(checked) => handleNotificationChange(checked, '周报推送')} />
                </div>
              </Space>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'system',
      label: (
        <span>
          <SettingOutlined /> 系统设置
        </span>
      ),
      children: (
        <Card variant="borderless">
          <div style={{ maxWidth: 600 }}>
            <h4>显示设置</h4>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div>深色模式</div>
                  <div style={{ fontSize: 12, color: '#999' }}>切换至深色主题</div>
                </div>
                <Switch onChange={(checked) => message.info('主题切换功能开发中...')} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div>侧边栏折叠</div>
                  <div style={{ fontSize: 12, color: '#999' }}>默认折叠侧边导航栏</div>
                </div>
                <Switch onChange={(checked) => message.info('侧边栏折叠功能开发中...')} />
              </div>
            </Space>

            <Divider />

            <h4>语言设置</h4>
            <Form layout="vertical">
              <Form.Item label="界面语言">
                <Input value="简体中文" disabled />
              </Form.Item>
            </Form>

            <Divider />

            <h4>系统信息</h4>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>系统版本:</strong> v2.0.0
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>构建时间:</strong> 2025-10-18
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>后端API:</strong> http://localhost:8000
              </div>
              <div>
                <strong>API文档:</strong>{' '}
                <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
                  打开Swagger UI
                </a>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 600 }}>个人设置</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>管理您的个人资料和系统偏好设置</p>

      <Tabs defaultActiveKey="profile" items={items} />
    </div>
  );
};

export default Settings;

