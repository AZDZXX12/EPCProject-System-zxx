import React from 'react';
import { Card, List, Tag, Alert, Button, Space, Descriptions, Row, Col, Statistic, Typography } from 'antd';
import {
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FireOutlined,
  ExperimentOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import PageContainer from '../components/Layout/PageContainer';

const { Title, Text } = Typography;

const Safety: React.FC = () => {
  const safetyRules = [
    {
      id: 1,
      title: '化工设备安装安全操作规程',
      level: 'critical',
      icon: <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      content: [
        '施工人员必须经过专业培训并持证上岗',
        '进入施工现场必须佩戴安全帽、防护眼镜、防护手套',
        '高空作业必须系好安全带，设置安全网',
        '电气设备安装前必须断电并验电',
        '吊装作业必须由专业人员操作，严格遵守吊装规范',
      ],
    },
    {
      id: 2,
      title: '压力容器安装安全规范',
      level: 'critical',
      icon: <ExperimentOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />,
      content: [
        '安装前必须检查压力容器合格证及检验报告',
        '严格按照设计图纸和技术要求进行安装',
        '焊接作业必须由持证焊工操作',
        '安装完成后必须进行压力试验',
        '建立完整的安装记录和质量档案',
      ],
    },
    {
      id: 3,
      title: '防火防爆安全管理制度',
      level: 'critical',
      icon: <FireOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      content: [
        '施工现场严禁烟火，设置明显警示标识',
        '动火作业必须办理动火证',
        '配备足够的灭火器材并定期检查',
        '易燃易爆区域禁止使用电焊、气割',
        '建立应急预案并定期演练',
      ],
    },
  ];

  return (
    <PageContainer>
      <div>
        {/* 页面标题 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <SafetyOutlined style={{ color: '#ff4d4f' }} />
            安全规章制度
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            化工设备安装工程安全管理与操作规范
          </Text>
        </div>

        {/* 安全提示 */}
        <Alert
          message={<span style={{ fontWeight: 600, fontSize: 15 }}>⚠️ 安全提示</span>}
          description={
            <Text style={{ fontSize: 14 }}>
              安全生产，人人有责。所有施工人员必须严格遵守安全规章制度，确保工程安全顺利进行。
            </Text>
          }
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ 
            marginBottom: 24,
            borderRadius: 12,
            border: '2px solid #faad14'
          }}
        />

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ 
                borderRadius: 12,
                borderTop: '3px solid #52c41a',
                transition: 'all 0.3s ease'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>安全天数</span>}
                value={15}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 16, color: '#666' }}>天</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ 
                borderRadius: 12,
                borderTop: '3px solid #1890ff',
                transition: 'all 0.3s ease'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>安全检查</span>}
                value={3}
                prefix={<SafetyOutlined style={{ color: '#1890ff', fontSize: 24 }} />}
                valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 16, color: '#666' }}>次/周</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ 
                borderRadius: 12,
                borderTop: '3px solid #52c41a',
                transition: 'all 0.3s ease'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 14, color: '#666' }}>隐患整改率</span>}
                value={100}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                suffix={<span style={{ fontSize: 16, color: '#666' }}>%</span>}
              />
            </Card>
          </Col>
        </Row>

        {/* 安全规章制度列表 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SafetyOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
              <span style={{ fontSize: 18, fontWeight: 600 }}>安全规章制度</span>
            </div>
          }
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              新增制度
            </Button>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
          styles={{ body: { padding: '24px' } }}
        >
          <List
            itemLayout="vertical"
            dataSource={safetyRules}
            renderItem={(item) => (
              <List.Item
                extra={
                  <Space direction="vertical">
                    <Button type="primary" icon={<DownloadOutlined />}>
                      下载PDF
                    </Button>
                    <Button icon={<EyeOutlined />}>
                      查看详情
                    </Button>
                  </Space>
                }
                style={{
                  borderRadius: 12,
                  marginBottom: 16,
                  padding: 20,
                  background: '#fafafa',
                  border: '1px solid #f0f0f0'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                      {item.icon}
                    </div>
                  }
                  title={
                    <Space size="large" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 700 }}>{item.title}</span>
                      <Tag color="red" style={{ fontSize: 13, padding: '4px 12px' }}>
                        <ThunderboltOutlined /> 强制执行
                      </Tag>
                    </Space>
                  }
                  description={
                    <div style={{ marginTop: 16 }}>
                      <ul style={{ 
                        background: '#fff', 
                        padding: '20px 20px 20px 40px',
                        borderRadius: 8,
                        lineHeight: 2,
                        margin: 0,
                        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)'
                      }}>
                        {item.content.map((line, idx) => (
                          <li key={idx} style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* 应急联系方式 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ThunderboltOutlined style={{ color: '#faad14', fontSize: 20 }} />
              <span style={{ fontSize: 18, fontWeight: 600 }}>应急联系方式</span>
            </div>
          }
          style={{ borderRadius: 12 }}
          styles={{ body: { padding: '24px' } }}
        >
          <Descriptions 
            column={{ xs: 1, sm: 2 }} 
            bordered
            size="middle"
            labelStyle={{ 
              fontWeight: 600,
              fontSize: 15,
              background: '#fafafa'
            }}
            contentStyle={{
              fontSize: 16,
              fontWeight: 500
            }}
          >
            <Descriptions.Item label="🔥 火警">
              <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>119</Text>
            </Descriptions.Item>
            <Descriptions.Item label="🚑 急救">
              <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>120</Text>
            </Descriptions.Item>
            <Descriptions.Item label="👨‍💼 项目经理">
              <Text copyable>138-0000-0001</Text>
            </Descriptions.Item>
            <Descriptions.Item label="🛡️ 安全主管">
              <Text copyable>138-0000-0002</Text>
            </Descriptions.Item>
            <Descriptions.Item label="🚒 消防部门">
              <Text copyable>0571-1234567</Text>
            </Descriptions.Item>
            <Descriptions.Item label="🌱 环保部门">
              <Text copyable>0571-7654321</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Safety;
