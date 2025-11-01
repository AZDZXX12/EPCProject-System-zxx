import React from 'react';
import { Card, Row, Col, Typography, Tag } from 'antd';
import { ToolOutlined, ThunderboltOutlined, TableOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './EquipmentSelection.css';

const { Title, Paragraph } = Typography;

const EquipmentSelection: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'fan',
      title: '离心风机选型',
      icon: <ToolOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      description: '根据风量、风压等参数智能选择合适的离心风机型号，提供性能曲线图和功率计算',
      features: ['性能曲线图', '功率自动计算', '智能型号推荐', '参数验证'],
      path: '/selection/fan',
      tag: '专业工具',
      tagColor: 'blue',
    },
    {
      id: 'cable',
      title: 'YJV电缆选型',
      icon: <ThunderboltOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      description: 'YJV电缆规格完整数据表，支持快速搜索、载流量查询和参数对比',
      features: ['完整规格表', '载流量计算', '快速搜索', '参数对比'],
      path: '/selection/cable',
      tag: '数据查询',
      tagColor: 'green',
    },
    {
      id: 'table',
      title: '在线表格编辑',
      icon: <TableOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      description: '类Excel在线表格系统，支持公式计算、图表制作、数据导入导出等功能',
      features: ['Excel导入导出', '公式计算', '图表制作', '协同编辑'],
      path: '/selection/table',
      tag: '高级功能',
      tagColor: 'orange',
    },
  ];

  return (
    <div className="equipment-selection-page">
      <div className="page-header">
        <div className="header-content">
          <RocketOutlined style={{ fontSize: 40, color: '#1890ff', marginRight: 16 }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>⚙️ 设备选型工具</Title>
            <Paragraph style={{ fontSize: 16, color: '#666', margin: '8px 0 0 0' }}>
              提供化工设备选型、电缆选型等专业工具，帮助快速完成设备选型计算
            </Paragraph>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {tools.map(tool => (
          <Col xs={24} sm={24} md={8} key={tool.id}>
            <Card
              hoverable
              className="selection-tool-card"
              onClick={() => navigate(tool.path)}
              style={{ height: '100%' }}
            >
              <div className="card-header">
                <Tag color={tool.tagColor} style={{ position: 'absolute', top: 16, right: 16 }}>
                  {tool.tag}
                </Tag>
                <div style={{ textAlign: 'center', marginBottom: 20, marginTop: 8 }}>
                  {tool.icon}
                </div>
                <Title level={4} style={{ textAlign: 'center', marginBottom: 12 }}>
                  {tool.title}
                </Title>
              </div>
              
              <Paragraph 
                style={{ 
                  color: '#666', 
                  textAlign: 'center', 
                  marginBottom: 24,
                  minHeight: 60,
                  fontSize: 14,
                  lineHeight: '1.6'
                }}
              >
                {tool.description}
              </Paragraph>
              
              <div className="features-list">
                <div style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: '#1890ff', 
                  marginBottom: 12,
                  textAlign: 'center'
                }}>
                  核心功能
                </div>
                {tool.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-dot">●</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div style={{ 
                marginTop: 20, 
                paddingTop: 16, 
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center'
              }}>
                <span style={{ 
                  color: '#1890ff', 
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  点击进入 →
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ 
        marginTop: 40, 
        padding: '24px', 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
        borderRadius: '12px',
        border: '1px solid #bbdefb'
      }}>
        <Title level={4} style={{ color: '#1976d2', marginBottom: 16 }}>
          💡 使用提示
        </Title>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div style={{ fontSize: 14 }}>
              <strong style={{ color: '#1565c0' }}>风机选型：</strong>
              <div style={{ color: '#666', marginTop: 4 }}>
                输入风量、风压等参数，系统自动计算并推荐合适的风机型号
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: 14 }}>
              <strong style={{ color: '#2e7d32' }}>电缆选型：</strong>
              <div style={{ color: '#666', marginTop: 4 }}>
                查询YJV电缆规格参数，支持型号搜索和载流量对比
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: 14 }}>
              <strong style={{ color: '#e65100' }}>在线表格：</strong>
              <div style={{ color: '#666', marginTop: 4 }}>
                类Excel功能，可用于数据整理、计算和报表制作
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EquipmentSelection;

