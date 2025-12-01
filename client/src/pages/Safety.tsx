import React from 'react';
import {
  Card,
  List,
  Tag,
  Alert,
  Button,
  Space,
  Descriptions,
  Row,
  Col,
  Statistic,
  Typography,
} from 'antd';
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
import './Safety.css';

const { Title, Text } = Typography;

const Safety: React.FC = () => {
  const safetyRules = [
    {
      id: 1,
      title: '化工设备安装安全操作规程',
      level: 'critical',
      icon: <SafetyOutlined className="icon-blue icon-24" />,
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
      icon: <ExperimentOutlined className="icon-red icon-24" />,
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
      icon: <FireOutlined className="icon-orange icon-24" />,
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
        <div className="safety-header">
          <Title level={2} className="safety-title">
            <span className="safety-title-row">
              <SafetyOutlined className="icon-red" />
              安全规章制度
            </span>
          </Title>
          <Text type="secondary" className="safety-subtext">
            化工设备安装工程安全管理与操作规范
          </Text>
        </div>

        {/* 安全提示 */}
        <Alert
          message={<span className="safety-alert-title">⚠️ 安全提示</span>}
          description={
            <Text className="safety-alert-desc">
              安全生产，人人有责。所有施工人员必须严格遵守安全规章制度，确保工程安全顺利进行。
            </Text>
          }
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          className="safety-alert"
        />

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="safety-stats-row">
          <Col xs={24} sm={8}>
            <Card hoverable className="safety-card safety-card-green">
              <Statistic
                className="safety-stat"
                title={<span className="safety-stat-title">安全天数</span>}
                value={15}
                prefix={<CheckCircleOutlined className="icon-green icon-24" />}
                suffix={"天"}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable className="safety-card safety-card-blue">
              <Statistic
                className="safety-stat"
                title={<span className="safety-stat-title">安全检查</span>}
                value={3}
                prefix={<SafetyOutlined className="icon-blue icon-24" />}
                suffix={"次/周"}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable className="safety-card safety-card-green">
              <Statistic
                className="safety-stat"
                title={<span className="safety-stat-title">隐患整改率</span>}
                value={100}
                prefix={<CheckCircleOutlined className="icon-green icon-24" />}
                suffix={"%"}
              />
            </Card>
          </Col>
        </Row>

        {/* 安全规章制度列表 */}
        <Card
          title={
            <div className="safety-card-title-row">
              <SafetyOutlined className="icon-red icon-20" />
              <span className="title-md fw-600">安全规章制度</span>
            </div>
          }
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              新增制度
            </Button>
          }
          className="mb-24 safety-card-plain"
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
                    <Button icon={<EyeOutlined />}>查看详情</Button>
                  </Space>
                }
                className="safety-list-item"
              >
                <List.Item.Meta
                  avatar={
                    <div className="safety-avatar">
                      {item.icon}
                    </div>
                  }
                  title={
                    <Space size="large" className="mb-8">
                      <span className="safety-rule-title">{item.title}</span>
                      <Tag color="red" className="safety-rule-tag">
                        <ThunderboltOutlined /> 强制执行
                      </Tag>
                    </Space>
                  }
                  description={
                    <div className="mt-16">
                      <ul className="safety-rule-ul">
                        {item.content.map((line, idx) => (
                          <li key={idx} className="safety-rule-li">
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
            <div className="safety-card-title-row">
              <ThunderboltOutlined className="icon-orange icon-20" />
              <span className="title-md fw-600">应急联系方式</span>
            </div>
          }
          className="safety-card-plain"
        >
          <Descriptions
            column={{ xs: 1, sm: 2 }}
            bordered
            size="middle"
            className="safety-descriptions"
          >
            <Descriptions.Item label="🔥 火警">
              <Text strong className="safety-hotline">
                119
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="🚑 急救">
              <Text strong className="safety-hotline">
                120
              </Text>
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
