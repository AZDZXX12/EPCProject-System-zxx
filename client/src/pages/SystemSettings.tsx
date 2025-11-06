import React, { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Statistic, Button, Space, message, Descriptions, Table, Tag, Alert, Switch, Form, Select } from 'antd';
import {
  SettingOutlined, DatabaseOutlined, SafetyOutlined, 
  BellOutlined, ApiOutlined, FolderOpenOutlined, SaveOutlined, 
  ReloadOutlined, InfoCircleOutlined, CloudServerOutlined
} from '@ant-design/icons';
import PageContainer from '../components/Layout/PageContainer';
import { API_BASE_URL } from '../config';

import { Typography } from 'antd';

const { Text, Paragraph } = Typography;

interface DatabaseInfo {
  path: string;
  size_mb: number;
  tables: string[];
  table_counts: Record<string, number>;
  backup_dir: string;
  mode?: string;
  status?: string;
}

const SystemSettings: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('database');

  useEffect(() => {
    if (activeTab === 'database') {
      loadDatabaseInfo();
    }
  }, [activeTab]);

  const loadDatabaseInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/database/info`);
      if (response.ok) {
        const data = await response.json();
        setDbInfo(data);
      }
    } catch (error) {
      console.error('获取数据库信息失败:', error);
      message.error('无法连接到后端服务');
    } finally {
      setLoading(false);
    }
  };

  const openDatabaseFolder = async () => {
    // @ts-ignore - Electron API通过preload.js注入
    if ((window as any).electronAPI) {
      // @ts-ignore
      await (window as any).electronAPI.openDatabaseFolder();
      message.success('数据库文件夹已打开');
    } else {
      message.info('此功能仅在桌面版中可用');
    }
  };

  const backupDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/database/backup`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          message.success(`数据库备份成功！文件: ${result.backup_file}`);
        } else {
          message.warning(result.message || '备份失败');
        }
      }
    } catch (error) {
      console.error('备份失败:', error);
      message.error('备份失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  // 数据库管理标签页
  const renderDatabaseTab = () => (
    <div>
      <Alert
        message={`数据库模式: ${dbInfo?.mode === 'memory' ? '内存模式' : 'SQLite模式'}`}
        description={dbInfo?.mode === 'memory' 
          ? '当前使用内存数据库，数据在程序重启后会丢失。建议切换到SQLite模式以持久化存储。' 
          : '数据已持久化存储到本地SQLite数据库。'}
        type={dbInfo?.mode === 'memory' ? 'warning' : 'info'}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="数据库大小"
              value={dbInfo?.size_mb || 0}
              suffix="MB"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="数据表数量"
              value={dbInfo?.tables?.length || 0}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="项目数量"
              value={dbInfo?.table_counts?.projects || 0}
              prefix={<FolderOpenOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="任务数量"
              value={dbInfo?.table_counts?.tasks || 0}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="数据库信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="数据库路径">{dbInfo?.path || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="备份目录">{dbInfo?.backup_dir || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="运行状态">
            <Tag color="success">{dbInfo?.status || '运行中'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="模式">
            <Tag color={dbInfo?.mode === 'memory' ? 'orange' : 'blue'}>
              {dbInfo?.mode === 'memory' ? '内存模式' : 'SQLite模式'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="数据表统计">
        <Table
          dataSource={dbInfo?.tables?.map(table => ({
            key: table,
            name: table,
            count: dbInfo.table_counts?.[table] || 0
          })) || []}
          columns={[
            { title: '表名', dataIndex: 'name', key: 'name' },
            { title: '记录数', dataIndex: 'count', key: 'count', align: 'right' }
          ]}
          pagination={false}
          size="small"
        />
      </Card>

      <Card title="数据库操作" style={{ marginTop: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={loadDatabaseInfo}
            loading={loading}
          >
            刷新信息
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={backupDatabase}
            loading={loading}
            disabled={dbInfo?.mode === 'memory'}
          >
            备份数据库
          </Button>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={openDatabaseFolder}
          >
            打开数据库文件夹
          </Button>
        </Space>
      </Card>
    </div>
  );

  // 系统配置标签页
  const renderSystemTab = () => (
    <div>
      <Card title="系统信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered>
          <Descriptions.Item label="系统名称">EPC项目管理系统</Descriptions.Item>
          <Descriptions.Item label="版本">1.0.0</Descriptions.Item>
          <Descriptions.Item label="运行模式">
            {(window as any).electronAPI ? '桌面版' : '浏览器版'}
          </Descriptions.Item>
          <Descriptions.Item label="前端端口">3001</Descriptions.Item>
          <Descriptions.Item label="后端端口">8000</Descriptions.Item>
          <Descriptions.Item label="API地址">
            <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noopener noreferrer">
              {API_BASE_URL}
            </a>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="系统配置">
        <Form layout="vertical">
          <Form.Item label="主题模式">
            <Select defaultValue="light" style={{ width: 200 }}>
              <Select.Option value="light">浅色模式</Select.Option>
              <Select.Option value="dark">深色模式</Select.Option>
              <Select.Option value="auto">跟随系统</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="语言">
            <Select defaultValue="zh-CN" style={{ width: 200 }}>
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="en-US">English</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary">保存设置</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  // 通知设置标签页
  const renderNotificationTab = () => (
    <Card title="通知设置">
      <Form layout="vertical">
        <Form.Item label="桌面通知">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>启用桌面通知</Text>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>任务提醒</Text>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>项目更新通知</Text>
              <Switch defaultChecked />
            </div>
          </Space>
        </Form.Item>
        <Form.Item>
          <Button type="primary">保存设置</Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <PageContainer>
      <Card
        title={
          <Space>
            <SettingOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>系统设置</span>
          </Space>
        }
        styles={{ body: { padding: '24px' } }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'database',
              label: <span><DatabaseOutlined />数据库管理</span>,
              children: renderDatabaseTab(),
            },
            {
              key: 'system',
              label: <span><CloudServerOutlined />系统配置</span>,
              children: renderSystemTab(),
            },
            {
              key: 'notification',
              label: <span><BellOutlined />通知设置</span>,
              children: renderNotificationTab(),
            },
            {
              key: 'security',
              label: <span><SafetyOutlined />安全设置</span>,
              children: (
                <Card>
                  <Paragraph>
                    安全设置功能开发中...
                  </Paragraph>
                </Card>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default SystemSettings;

