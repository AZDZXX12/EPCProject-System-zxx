import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, Tag, Modal } from 'antd';
import {
  ToolOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  CalculatorOutlined,
  ApiOutlined,
  FileWordOutlined,
} from '@ant-design/icons';
import PageContainer from '../components/Layout/PageContainer';

const { Title, Text, Paragraph } = Typography;

interface UtilityTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  status: 'active' | 'beta';
  features: string[];
}

const Utilities: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<UtilityTool | null>(null);

  const tools: UtilityTool[] = [
    {
      id: 'fan-selector-v2',
      name: '风机选型系统',
      description: '离心风机、轴流风机专业选型工具，支持性能曲线分析、功率计算',
      icon: <ExperimentOutlined />,
      url: '/selection-tools/fan-selector-v2.html',
      color: '#1890ff',
      status: 'active',
      features: ['风机性能计算', '7点性能对比', '功率分析', '效率曲线'],
    },
    {
      id: 'cable-selector',
      name: '电缆选型系统',
      description: 'YJV电缆选型工具，包含载流量计算、短路校验、压降分析',
      icon: <ThunderboltOutlined />,
      url: '/selection-tools/cable-selector-table.html',
      color: '#faad14',
      status: 'active',
      features: ['载流量计算', '短路校验', '压降分析', '智能推荐'],
    },
    {
      id: 'cable-selector-pro',
      name: '电缆选型Pro',
      description: '增强版电缆选型工具，现代化界面，实时计算',
      icon: <ApiOutlined />,
      url: '/selection-tools/cable-selector/index.html',
      color: '#52c41a',
      status: 'active',
      features: ['3D模型展示', 'IEC标准', '温度校正', '敷设方式校正'],
    },
    {
      id: 'word-editor',
      name: 'Word文档编辑器',
      description: '在线Word文档编辑，支持富文本格式化、模板导出',
      icon: <FileWordOutlined />,
      url: '/selection-tools/word-editor.html',
      color: '#13c2c2',
      status: 'active',
      features: ['富文本编辑', '格式化', '模板支持', '导出功能'],
    },
    {
      id: 'power-calculator',
      name: '功率计算器',
      description: '电气负荷计算、功率分析、需用系数计算',
      icon: <CalculatorOutlined />,
      url: '#',
      color: '#eb2f96',
      status: 'beta',
      features: ['负荷计算', '功率因数', '需用系数', '变压器选型'],
    },
  ];

  const handleToolClick = (tool: UtilityTool) => {
    if (tool.status === 'beta' || tool.url === '#') {
      setSelectedTool(tool);
      setModalVisible(true);
      return;
    }

    window.open(tool.url, '_blank');
  };

  return (
    <PageContainer>
      <div style={{ padding: '32px 24px' }}>
        {/* 页面标题 */}
        <div
          style={{
            marginBottom: 32,
            padding: '24px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <ToolOutlined style={{ fontSize: 28 }} />
            <Title level={2} style={{ margin: 0, color: '#fff' }}>
              实用工具
            </Title>
          </div>
          <Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
            设备选型、功率计算、文档编辑等专业工具集
          </Paragraph>
        </div>

        {/* 工具统计 */}
        <Row gutter={16} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#1890ff' }}>
                  {tools.filter((t) => t.status === 'active').length}
                </div>
                <div style={{ color: '#8c8c8c', marginTop: 4 }}>可用工具</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#faad14' }}>
                  {tools.filter((t) => t.status === 'beta').length}
                </div>
                <div style={{ color: '#8c8c8c', marginTop: 4 }}>测试中</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 工具卡片 */}
        <Row gutter={[16, 16]}>
          {tools.map((tool) => (
            <Col xs={24} sm={12} lg={8} key={tool.id}>
              <Card
                hoverable
                onClick={() => handleToolClick(tool)}
                style={{
                  height: '100%',
                  borderTop: `4px solid ${tool.color}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 42,
                      color: tool.color,
                    }}
                  >
                    {tool.icon}
                  </div>
                  <Tag color={tool.status === 'active' ? 'green' : 'orange'}>
                    {tool.status === 'active' ? '可用' : '测试中'}
                  </Tag>
                </div>

                <Title level={4} style={{ marginBottom: 8, marginTop: 0 }}>
                  {tool.name}
                </Title>

                <Paragraph
                  type="secondary"
                  style={{ fontSize: 13, marginBottom: 16, minHeight: 40 }}
                >
                  {tool.description}
                </Paragraph>

                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                    主要功能：
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    {tool.features.map((feature, idx) => (
                      <Tag
                        key={idx}
                        style={{
                          fontSize: 11,
                          marginBottom: 4,
                          marginRight: 4,
                        }}
                      >
                        {feature}
                      </Tag>
                    ))}
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  style={{
                    background: tool.color,
                    borderColor: tool.color,
                    height: 40,
                  }}
                  disabled={tool.status === 'beta'}
                >
                  {tool.status === 'beta' ? '即将推出' : '打开工具'}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 使用说明 */}
        <Card title="使用说明" style={{ marginTop: 32 }} styles={{ body: { padding: '24px' } }}>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Title level={5}>📖 工具访问</Title>
              <Paragraph style={{ fontSize: 14 }}>
                点击工具卡片即可在新窗口打开对应的工具。所有工具均已集成到系统中，无需单独安装。
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>💾 数据保存</Title>
              <Paragraph style={{ fontSize: 14 }}>
                各工具的计算结果可导出为Excel、PDF等格式，方便保存和分享。
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 工具详情弹窗 */}
      <Modal
        title={selectedTool?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedTool && (
          <div>
            <Paragraph>{selectedTool.description}</Paragraph>
            <div style={{ marginTop: 16 }}>
              <Text strong>状态：</Text>{' '}
              <Tag color={selectedTool.status === 'active' ? 'green' : 'orange'}>
                {selectedTool.status === 'active' ? '可用' : '测试中'}
              </Tag>
            </div>
            {selectedTool.status === 'beta' && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: '#fff7e6',
                  border: '1px solid #ffd591',
                  borderRadius: 6,
                }}
              >
                <Text type="warning">
                  ⚠️ 此工具正在测试中，部分功能可能不稳定。预计将在下个版本中正式发布。
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default Utilities;
