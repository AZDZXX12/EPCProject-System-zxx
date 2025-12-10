/**
 * 修改密码页面
 * 用户和管理员都可以修改自己的密码
 */

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/Layout/PageContainer';
import './ChangePassword.css';

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentUsername = sessionStorage.getItem('username') || '';

  const handleSubmit = async (values: PasswordFormValues) => {
    setLoading(true);

    try {
      // 获取用户账号信息
      const accounts = JSON.parse(localStorage.getItem('userAccounts') || '[]');
      const userIndex = accounts.findIndex((acc: any) => acc.username === currentUsername);

      if (userIndex === -1) {
        message.error('用户不存在');
        setLoading(false);
        return;
      }

      const user = accounts[userIndex];

      // 验证旧密码
      if (user.password !== values.oldPassword) {
        message.error('原密码错误');
        setLoading(false);
        return;
      }

      // 更新密码
      accounts[userIndex].password = values.newPassword;
      accounts[userIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('userAccounts', JSON.stringify(accounts));

      // 尝试调用后端API
      try {
        const response = await fetch('http://localhost:8000/api/v1/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: currentUsername,
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          }),
        });

        if (!response.ok) {
          console.warn('API更新密码失败，但本地已更新');
        }
      } catch (error) {
        console.warn('API调用失败，但本地已更新:', error);
      }

      message.success('密码修改成功，请重新登录');
      setSuccess(true);

      // 3秒后跳转到登录页
      setTimeout(() => {
        sessionStorage.clear();
        navigate('/login');
      }, 3000);
    } catch (error) {
      message.error('修改密码失败');
      console.error('修改密码错误:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageContainer>
        <div className="change-password-container">
          <Card className="change-password-card">
            <Result
              status="success"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title="密码修改成功"
              subTitle="您的密码已成功修改，请使用新密码重新登录"
              extra={[
                <Button type="primary" key="login" onClick={() => navigate('/login')}>
                  立即登录
                </Button>,
              ]}
            />
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="修改密码">
      <div className="change-password-container">
        <Card className="change-password-card">
          <div className="change-password-header">
            <LockOutlined className="header-icon" />
            <h2>修改密码</h2>
            <p>当前用户：<strong>{currentUsername}</strong></p>
          </div>

          <Form
            form={form}
            name="changePassword"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="oldPassword"
              label="原密码"
              rules={[{ required: true, message: '请输入原密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入原密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '密码至少8个字符' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: '密码必须包含大小写字母和数字',
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入新密码（至少8位，包含大小写字母和数字）"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入新密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                确认修改
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                block
                size="large"
                onClick={() => navigate(-1)}
              >
                取消
              </Button>
            </Form.Item>
          </Form>

          <div className="password-tips">
            <h4>密码安全提示：</h4>
            <ul>
              <li>密码长度至少8个字符</li>
              <li>必须包含大写字母、小写字母和数字</li>
              <li>建议包含特殊字符以提高安全性</li>
              <li>不要使用过于简单或常见的密码</li>
              <li>定期更换密码以保护账号安全</li>
            </ul>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ChangePassword;
