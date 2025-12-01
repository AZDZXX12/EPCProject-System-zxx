/**
 * 增强版个人设置页面
 * 分类设置：个人信息、偏好设置、通知设置、安全设置
 */

import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Select,
  Switch,
  Space,
  message,
  Avatar,
  Divider,
  Modal,
  List,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LockOutlined,
  CameraOutlined,
  SaveOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import './Settings.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { Password } = Input;

const EnhancedSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // 从sessionStorage获取用户信息
  const username = sessionStorage.getItem('username') || '用户';

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // TODO: 调用API保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('设置保存成功！');
      console.log('保存的设置:', values);
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
        message.success('头像上传成功');
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleChangePassword = () => {
    Modal.confirm({
      title: '修改密码',
      content: (
        <Form layout="vertical">
          <Form.Item label="当前密码" name="oldPassword" rules={[{ required: true }]}>
            <Password />
          </Form.Item>
          <Form.Item label="新密码" name="newPassword" rules={[{ required: true, min: 6 }]}>
            <Password />
          </Form.Item>
          <Form.Item label="确认密码" name="confirmPassword" rules={[{ required: true }]}>
            <Password />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        // TODO: 调用API修改密码
        message.success('密码修改成功');
      },
    });
  };

  const handleViewLoginHistory = () => {
    Modal.info({
      title: '登录历史',
      width: 600,
      content: (
        <List
          dataSource={[
            { time: '2025-11-23 15:20', ip: '192.168.1.100', device: 'Windows Chrome', status: '成功' },
            { time: '2025-11-23 09:15', ip: '192.168.1.100', device: 'Windows Chrome', status: '成功' },
            { time: '2025-11-22 18:30', ip: '192.168.1.105', device: 'MacOS Safari', status: '成功' },
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.time}
                description={`${item.ip} · ${item.device}`}
              />
              <Tag color={item.status === '成功' ? 'green' : 'red'}>{item.status}</Tag>
            </List.Item>
          )}
        />
      ),
    });
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>个人设置</span>
          </Space>
        }
      >
        <Tabs defaultActiveKey="profile" type="card">
          {/* 个人信息 */}
          <TabPane
            tab={
              <span>
                <UserOutlined />
                个人信息
              </span>
            }
            key="profile"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                username,
                email: 'user@example.com',
                phone: '138****8888',
              }}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar size={120} src={avatarUrl} icon={<UserOutlined />} />
                    <div style={{ marginTop: 16 }}>
                      <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleAvatarChange}
                      >
                        <Button icon={<CameraOutlined />}>更换头像</Button>
                      </Upload>
                    </div>
                  </div>
                </Col>
                <Col span={16}>
                  <Form.Item label="用户名" name="username">
                    <Input />
                  </Form.Item>
                  <Form.Item label="邮箱" name="email">
                    <Input type="email" />
                  </Form.Item>
                  <Form.Item label="手机号" name="phone">
                    <Input />
                  </Form.Item>
                  <Form.Item label="部门" name="department">
                    <Input />
                  </Form.Item>
                  <Form.Item label="职位" name="position">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 偏好设置 */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                偏好设置
              </span>
            }
            key="preferences"
          >
            <Form
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                theme: 'light',
                language: 'zh-CN',
                timezone: 'Asia/Shanghai',
                dateFormat: 'YYYY-MM-DD',
              }}
            >
              <Form.Item label="主题" name="theme">
                <Select>
                  <Option value="light">亮色主题</Option>
                  <Option value="dark">暗色主题</Option>
                  <Option value="auto">跟随系统</Option>
                </Select>
              </Form.Item>
              <Form.Item label="语言" name="language">
                <Select>
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English</Option>
                </Select>
              </Form.Item>
              <Form.Item label="时区" name="timezone">
                <Select>
                  <Option value="Asia/Shanghai">北京时间 (GMT+8)</Option>
                  <Option value="Asia/Tokyo">东京时间 (GMT+9)</Option>
                  <Option value="America/New_York">纽约时间 (GMT-5)</Option>
                </Select>
              </Form.Item>
              <Form.Item label="日期格式" name="dateFormat">
                <Select>
                  <Option value="YYYY-MM-DD">2025-11-23</Option>
                  <Option value="DD/MM/YYYY">23/11/2025</Option>
                  <Option value="MM/DD/YYYY">11/23/2025</Option>
                </Select>
              </Form.Item>
              <Divider />
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 通知设置 */}
          <TabPane
            tab={
              <span>
                <BellOutlined />
                通知设置
              </span>
            }
            key="notifications"
          >
            <Form
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                taskNotify: true,
                emailNotify: true,
                desktopNotify: false,
                soundNotify: true,
              }}
            >
              <Form.Item label="任务提醒" name="taskNotify" valuePropName="checked">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Form.Item label="邮件通知" name="emailNotify" valuePropName="checked">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Form.Item label="桌面通知" name="desktopNotify" valuePropName="checked">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Form.Item label="声音提示" name="soundNotify" valuePropName="checked">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Divider />
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 安全设置 */}
          <TabPane
            tab={
              <span>
                <LockOutlined />
                安全设置
              </span>
            }
            key="security"
          >
            <List>
              <List.Item
                actions={[
                  <Button onClick={handleChangePassword} type="link">
                    修改
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title="登录密码"
                  description="定期更换密码可以提高账号安全性"
                />
              </List.Item>
              <List.Item
                actions={[
                  <Switch
                    checked={false}
                    onChange={(checked) => {
                      if (checked) {
                        message.info('双因素认证功能开发中');
                      }
                    }}
                  />,
                ]}
              >
                <List.Item.Meta
                  title="双因素认证"
                  description="开启后登录需要验证码，更加安全"
                />
              </List.Item>
              <List.Item
                actions={[
                  <Button onClick={handleViewLoginHistory} icon={<HistoryOutlined />}>
                    查看
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title="登录历史"
                  description="查看最近的登录记录"
                />
              </List.Item>
            </List>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default EnhancedSettings;
