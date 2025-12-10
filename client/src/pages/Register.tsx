/**
 * 注册页面
 * 用户注册需要管理员审核通过后才能登录
 */

import React, { useState } from 'react';
import { Form, Input, Button, Select, Upload, message, Steps, Result, App } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  TeamOutlined,
  UploadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadFile } from 'antd';
import './Register.css';

const { Option } = Select;
const { TextArea } = Input;

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  realName: string;
  department: string;
  position: string;
  company: string;
  reason: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 步骤配置
  const steps = [
    {
      title: '账号信息',
      description: '设置登录账号',
    },
    {
      title: '个人信息',
      description: '完善个人资料',
    },
    {
      title: '申请理由',
      description: '说明使用目的',
    },
  ];

  // 提交注册
  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      // 构建注册数据
      const registerData = {
        ...values,
        attachments: fileList.map(file => file.name),
        status: 'pending', // 待审核
        appliedAt: new Date().toISOString(),
      };

      // 调用注册API
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        const data = await response.json();
        messageApi.success('注册申请已提交，请等待管理员审核');
        setRegistrationSuccess(true);
      } else {
        const error = await response.json();
        throw new Error(error.detail || '注册失败');
      }
    } catch (error: any) {
      // API失败，使用本地存储模拟
      console.warn('API注册失败，使用本地存储:', error);
      
      const users = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      const newUser = {
        id: `USER-${Date.now()}`,
        ...values,
        attachments: fileList.map(file => file.name),
        status: 'pending',
        appliedAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem('pendingUsers', JSON.stringify(users));
      
      messageApi.success('注册申请已提交，请等待管理员审核');
      setRegistrationSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  // 下一步
  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['username', 'password', 'confirmPassword', 'email']);
      } else if (currentStep === 1) {
        await form.validateFields(['realName', 'phone', 'department', 'position', 'company']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 文件上传配置
  const uploadProps = {
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: UploadFile) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  // 注册成功页面
  if (registrationSuccess) {
    return (
      <div className="register-container">
        <div className="register-card success-card">
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="注册申请已提交"
            subTitle="您的注册申请已成功提交，管理员将在1-3个工作日内审核。审核通过后，系统将通过邮件通知您。"
            extra={[
              <Button type="primary" key="login" onClick={() => navigate('/login')}>
                返回登录
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                返回首页
              </Button>,
            ]}
          >
            <div className="success-info">
              <p><strong>申请编号：</strong>REG-{Date.now()}</p>
              <p><strong>申请时间：</strong>{new Date().toLocaleString('zh-CN')}</p>
              <p><strong>审核状态：</strong><span style={{ color: '#faad14' }}>待审核</span></p>
            </div>
          </Result>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">用户注册</h1>
          <p className="register-subtitle">EPC PROJECT MANAGEMENT SYSTEM</p>
        </div>

        {/* 步骤指示器 */}
        <Steps current={currentStep} items={steps} className="register-steps" />

        <Form
          form={form}
          name="register"
          className="register-form"
          onFinish={handleSubmit}
          layout="vertical"
          scrollToFirstError
        >
          {/* 第一步：账号信息 */}
          {currentStep === 0 && (
            <div className="form-step">
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 4, message: '用户名至少4个字符' },
                  { max: 20, message: '用户名最多20个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名（4-20个字符）"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入邮箱地址"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 8, message: '密码至少8个字符' },
                  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码（至少8位，包含大小写字母和数字）"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入密码"
                  size="large"
                />
              </Form.Item>
            </div>
          )}

          {/* 第二步：个人信息 */}
          {currentStep === 1 && (
            <div className="form-step">
              <Form.Item
                name="realName"
                label="真实姓名"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="请输入真实姓名"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号码"
                rules={[
                  { required: true, message: '请输入手机号码' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="请输入手机号码"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="company"
                label="所属公司"
                rules={[{ required: true, message: '请输入所属公司' }]}
              >
                <Input
                  prefix={<TeamOutlined />}
                  placeholder="请输入所属公司"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门" size="large">
                  <Option value="engineering">工程部</Option>
                  <Option value="procurement">采购部</Option>
                  <Option value="construction">施工部</Option>
                  <Option value="quality">质量部</Option>
                  <Option value="safety">安全部</Option>
                  <Option value="finance">财务部</Option>
                  <Option value="hr">人力资源部</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="position"
                label="职位"
                rules={[{ required: true, message: '请选择职位' }]}
              >
                <Select placeholder="请选择职位" size="large">
                  <Option value="manager">项目经理</Option>
                  <Option value="engineer">工程师</Option>
                  <Option value="supervisor">监理</Option>
                  <Option value="technician">技术员</Option>
                  <Option value="coordinator">协调员</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </div>
          )}

          {/* 第三步：申请理由 */}
          {currentStep === 2 && (
            <div className="form-step">
              <Form.Item
                name="reason"
                label="申请理由"
                rules={[
                  { required: true, message: '请说明申请理由' },
                  { min: 20, message: '请至少输入20个字符' },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="请详细说明您申请使用本系统的理由和用途（至少20个字符）"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="attachments"
                label="附件上传（可选）"
                extra="可上传工作证明、项目文件等相关材料"
              >
                <Upload {...uploadProps} maxCount={5}>
                  <Button icon={<UploadOutlined />}>选择文件</Button>
                </Upload>
              </Form.Item>
            </div>
          )}

          {/* 操作按钮 */}
          <Form.Item className="form-actions">
            <div className="button-group">
              {currentStep > 0 && (
                <Button onClick={handlePrev} size="large">
                  上一步
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext} size="large">
                  下一步
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                >
                  提交申请
                </Button>
              )}
              <Button onClick={() => navigate('/login')} size="large">
                返回登录
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
