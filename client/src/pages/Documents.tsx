import React, { useState } from 'react';
import { Card, List, Tag, Button, Space, Row, Col, Tabs, Typography, Divider, Badge } from 'antd';
import {
  FileTextOutlined,
  FileWordOutlined,
  FolderOutlined,
  EyeOutlined,
  DownloadOutlined,
  SafetyOutlined,
  ToolOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import PageContainer from '../components/Layout/PageContainer';
import './Documents.css';

const { Title, Text, Paragraph } = Typography;

const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('construction');

  // 总包施工文档
  const constructionDocs = [
    {
      id: 'process',
      title: '总包流程',
      description: 'EPC项目总包施工完整流程文档',
      icon: <FileWordOutlined className="icon-blue icon-32" />,
      file: '总包流程.docx',
      category: '流程文档',
      size: '250 KB',
      importance: 'high',
    },
    {
      id: 'construction-design',
      title: '施工组织设计(样板文件）',
      description: '施工组织设计标准样板，包含施工方案、进度计划、资源配置',
      icon: <FileWordOutlined className="icon-green icon-32" />,
      file: '施工组织设计(样板文件）.docx',
      category: '技术文档',
      size: '180 KB',
      importance: 'high',
    },
    {
      id: 'construction-rules',
      title: '化工设备生产线安装工程项目施工规程',
      description: '化工设备安装施工规程，操作规范与质量标准',
      icon: <FileWordOutlined className="icon-orange icon-32" />,
      file: '化工设备生产线安装工程项目施工规程.docx',
      category: '技术文档',
      size: '320 KB',
      importance: 'high',
    },
    {
      id: 'general-disclosure',
      title: '总技术交底书（样板）',
      description: '总技术交底标准格式，技术要求与注意事项',
      icon: <FileWordOutlined className="icon-purple icon-32" />,
      file: '总技术交底书（样板）.docx',
      category: '技术交底',
      size: '150 KB',
      importance: 'normal',
    },
    {
      id: 'single-disclosure',
      title: '单项技术交底书（样板）',
      description: '单项工程技术交底书样板',
      icon: <FileWordOutlined className="icon-cyan icon-32" />,
      file: '单项技术交底书（样板）.docx',
      category: '技术交底',
      size: '120 KB',
      importance: 'normal',
    },
  ];

  const safetyDocs = [
    {
      id: 'safety-agreement',
      title: '化工施工安装工人安全协议',
      description: '施工人员安全责任协议书',
      icon: <FileWordOutlined className="icon-red icon-32" />,
      file: '化工施工安装工人安全协议.docx',
      category: '安全文档',
      size: '100 KB',
      importance: 'high',
    },
    {
      id: 'safety-management',
      title: '设备安装安全管理制度',
      description: '设备安装过程中的安全管理制度与规定',
      icon: <FileWordOutlined className="icon-red-light icon-32" />,
      file: '设备安装安全管理制度.docx',
      category: '安全文档',
      size: '160 KB',
      importance: 'high',
    },
    {
      id: 'emergency-plan',
      title: '设备安装施工应急处理预案',
      description: '施工现场应急处理预案与响应流程',
      icon: <FileWordOutlined className="icon-orange-light icon-32" />,
      file: '设备安装施工应急处理预案.docx',
      category: '安全文档',
      size: '200 KB',
      importance: 'high',
    },
    {
      id: 'safety-training',
      title: '施工安全培训表',
      description: '安全培训记录表单',
      icon: <FileWordOutlined className="icon-amber icon-32" />,
      file: '施工安全培训表.docx',
      category: '安全表单',
      size: '80 KB',
      importance: 'normal',
    },
    {
      id: 'safety-education',
      title: '安全意识教育搞',
      description: '安全意识教育培训材料',
      icon: <FileWordOutlined className="icon-orange icon-32" />,
      file: '安全意识教育搞​.docx',
      category: '安全表单',
      size: '90 KB',
      importance: 'normal',
    },
  ];

  const formsDocs = [
    {
      id: 'project-contact',
      title: '工程联络单',
      description: '工程项目联络单表单',
      icon: <FileWordOutlined className="icon-blue icon-32" />,
      file: '工程联络单.docx',
      category: '工作表单',
      size: '60 KB',
      importance: 'normal',
    },
    {
      id: 'environment-check',
      title: '环境确认表单',
      description: '施工环境确认检查表',
      icon: <FileWordOutlined className="icon-green icon-32" />,
      file: '环境确认表单.docx',
      category: '工作表单',
      size: '70 KB',
      importance: 'normal',
    },
    {
      id: 'test-inspection',
      title: '试车前设备点检表',
      description: '设备试车前检查表',
      icon: <FileWordOutlined className="icon-purple icon-32" />,
      file: '试车前设备点检表.docx',
      category: '工作表单',
      size: '85 KB',
      importance: 'normal',
    },
    {
      id: 'test-plan',
      title: '试车方案（初定搞）',
      description: '设备试车方案初稿',
      icon: <FileWordOutlined className="icon-cyan icon-32" />,
      file: '试车方案（初定搞）.docx',
      category: '工作表单',
      size: '110 KB',
      importance: 'normal',
    },
    {
      id: 'tracking-content',
      title: '跟踪人员工作内容',
      description: '项目跟踪人员工作职责与内容',
      icon: <FileWordOutlined className="icon-magenta icon-32" />,
      file: '跟踪人员工作内容.docx',
      category: '工作表单',
      size: '75 KB',
      importance: 'normal',
    },
    {
      id: 'tracking-form',
      title: '跟踪人员工作表',
      description: '跟踪人员工作记录表',
      icon: <FileWordOutlined className="icon-volcano icon-32" />,
      file: '跟踪人员工作表.docx',
      category: '工作表单',
      size: '65 KB',
      importance: 'normal',
    },
  ];

  const handleDocView = (doc: any) => {
    // 打开文档查看
    window.open(`/总包施工文件/${doc.file}`, '_blank');
  };

  const handleDocDownload = (doc: any) => {
    // 下载文档
    const link = document.createElement('a');
    link.href = `/总包施工文件/${doc.file}`;
    link.download = doc.file;
    link.click();
  };

  const renderDocList = (docs: any[]) => (
    <List
      itemLayout="horizontal"
      dataSource={docs}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleDocView(item)}
            >
              查看
            </Button>,
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDocDownload(item)}
            >
              下载
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={<div>{item.icon}</div>}
            title={
              <span className="docs-item-title">
                {item.title}
                {item.importance === 'high' && (
                  <Tag color="red" className="docs-tag-ml">
                    重要
                  </Tag>
                )}
              </span>
            }
            description={
              <div>
                <Paragraph type="secondary" className="docs-item-desc">
                  {item.description}
                </Paragraph>
                <Space size={12}>
                  <Tag color="blue">{item.category}</Tag>
                  <Text type="secondary" className="docs-item-size">
                    大小: {item.size}
                  </Text>
                </Space>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <PageContainer>
      <div className="docs-container">
        {/* 页面标题 */}
        <div className="docs-header">
          <div className="docs-header-row">
            <FolderOutlined className="icon-28" />
            <Title level={2} className="docs-header-title">
              文档中心 - 总包施工文件
            </Title>
          </div>
          <Paragraph className="docs-header-desc">
            EPC项目总包施工全套文档，包含流程、技术、安全、表单等16个文件
          </Paragraph>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} className="docs-stats-row">
          <Col xs={24} sm={6}>
            <Card>
              <div className="docs-center">
                <div className="docs-total-count">
                  {constructionDocs.length + safetyDocs.length + formsDocs.length}
                </div>
                <div className="docs-subtext">总文档数</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="docs-center">
                <Badge count={constructionDocs.length} showZero color="#52c41a">
                  <div className="docs-badge-title-green">施工文档</div>
                </Badge>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="docs-center">
                <Badge count={safetyDocs.length} showZero color="#ff4d4f">
                  <div className="docs-badge-title-red">安全文档</div>
                </Badge>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <div className="docs-center">
                <Badge count={formsDocs.length} showZero color="#faad14">
                  <div className="docs-badge-title-orange">表单文档</div>
                </Badge>
              </div>
            </Card>
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'construction',
              label: (
                <span className="docs-tab-label">
                  <ToolOutlined /> 施工技术文档 ({constructionDocs.length})
                </span>
              ),
              children: <Card>{renderDocList(constructionDocs)}</Card>,
            },
            {
              key: 'safety',
              label: (
                <span className="docs-tab-label">
                  <SafetyOutlined /> 安全管理文档 ({safetyDocs.length})
                </span>
              ),
              children: <Card>{renderDocList(safetyDocs)}</Card>,
            },
            {
              key: 'forms',
              label: (
                <span className="docs-tab-label">
                  <FileDoneOutlined /> 工作表单 ({formsDocs.length})
                </span>
              ),
              children: <Card>{renderDocList(formsDocs)}</Card>,
            },
            {
              key: 'usage',
              label: (
                <span className="docs-tab-label">
                  <FileTextOutlined /> 使用说明
                </span>
              ),
              children: (
                <Card>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <div>
                        <Title level={4}>📋 文档分类</Title>
                        <Paragraph className="text-14">
                          <ul className="pl-20">
                            <li>
                              <strong>施工技术文档</strong>: 施工流程、组织设计、技术规程、技术交底
                            </li>
                            <li>
                              <strong>安全管理文档</strong>: 安全协议、管理制度、应急预案、培训教育
                            </li>
                            <li>
                              <strong>工作表单</strong>: 联络单、确认表、检查表、跟踪记录
                            </li>
                          </ul>
                        </Paragraph>
                      </div>
                      <Divider />
                      <div>
                        <Title level={4}>⭐ 重要文档</Title>
                        <Paragraph className="text-14">
                          标记为"重要"的文档是EPC项目必备文件：
                          <ul className="pl-20 mt-8">
                            <li>总包流程 - EPC项目执行主流程</li>
                            <li>施工组织设计 - 施工方案核心文档</li>
                            <li>施工规程 - 操作规范与标准</li>
                            <li>安全协议与管理制度</li>
                          </ul>
                        </Paragraph>
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <div>
                        <Title level={4}>📖 使用指南</Title>
                        <Paragraph className="text-14">
                          <strong>查看文档:</strong> 点击"查看"按钮在浏览器中打开Word文档预览。
                          <br />
                          <strong>下载文档:</strong> 点击"下载"按钮将文档保存到本地。
                          <br />
                          <strong>编辑文档:</strong> 下载后使用Microsoft Word或WPS进行编辑。
                        </Paragraph>
                      </div>
                      <Divider />
                      <div>
                        <Title level={4}>🔗 相关模块</Title>
                        <Paragraph className="text-14">
                          <ul className="pl-20">
                            <li>
                              <strong>工作台</strong>: 查看EPC项目执行阶段流程图
                            </li>
                            <li>
                              <strong>总包施工管理</strong>: EPC全流程管理
                            </li>
                            <li>
                              <strong>施工日志</strong>: 记录施工进度
                            </li>
                            <li>
                              <strong>安全规章</strong>: 安全管理系统
                            </li>
                          </ul>
                        </Paragraph>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div className="docs-tip">
                        <Title level={5} className="docs-tip-title">
                          💡 温馨提示
                        </Title>
                        <Paragraph className="docs-tip-text">
                          这些文档是EPC项目总包施工的标准文件，包含完整的流程、规范和表单。
                          建议在项目启动前仔细阅读"总包流程"和"施工组织设计"文档。
                        </Paragraph>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ),
            },
          ]}
        />
      </div>
    </PageContainer>
  );
};

export default Documents;
