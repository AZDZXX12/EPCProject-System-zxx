/**
 * 项目模板库
 * 参考：Worktile
 */

import React, { useState } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, Select, Tag, Space, Empty } from 'antd';
import { PlusOutlined, RocketOutlined, BuildOutlined, ToolOutlined } from '@ant-design/icons';

interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  phases: string[];
  taskCount: number;
  usageCount: number;
  icon: React.ReactNode;
}

const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'epc-1',
    name: 'EPC总承包项目',
    category: 'epc',
    description: '适用于工程设计、采购、施工一体化项目',
    phases: ['立项', '设计', '采购', '施工', '调试', '验收', '移交'],
    taskCount: 45,
    usageCount: 128,
    icon: <RocketOutlined />,
  },
  {
    id: 'construction-1',
    name: '建筑施工项目',
    category: 'construction',
    description: '适用于房建、市政等建筑施工项目',
    phases: ['基础施工', '主体施工', '装饰装修', '竣工验收'],
    taskCount: 32,
    usageCount: 95,
    icon: <BuildOutlined />,
  },
  {
    id: 'equipment-1',
    name: '设备安装项目',
    category: 'equipment',
    description: '适用于机械设备、电气设备安装调试',
    phases: ['方案设计', '设备采购', '安装调试', '验收'],
    taskCount: 28,
    usageCount: 67,
    icon: <ToolOutlined />,
  },
];

const ProjectTemplateLibrary: React.FC<{ onSelect?: (template: ProjectTemplate) => void }> = ({ onSelect }) => {
  const [visible, setVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const handleUseTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setVisible(true);
  };

  const handleConfirm = () => {
    if (selectedTemplate && onSelect) {
      onSelect(selectedTemplate);
    }
    setVisible(false);
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        {TEMPLATES.map(template => (
          <Col span={8} key={template.id}>
            <Card
              hoverable
              actions={[
                <Button type="link" onClick={() => handleUseTemplate(template)}>
                  使用模板
                </Button>,
              ]}
            >
              <Card.Meta
                avatar={<div style={{ fontSize: 32, color: '#1890ff' }}>{template.icon}</div>}
                title={template.name}
                description={
                  <>
                    <div style={{ marginBottom: 8 }}>{template.description}</div>
                    <Space>
                      <Tag>{template.taskCount}个任务</Tag>
                      <Tag color="blue">{template.usageCount}次使用</Tag>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                      {template.phases.map(phase => (
                        <Tag key={phase} style={{ marginBottom: 4 }}>
                          {phase}
                        </Tag>
                      ))}
                    </div>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="使用项目模板"
        open={visible}
        onOk={handleConfirm}
        onCancel={() => setVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="项目名称" required>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item label="项目描述">
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          <Form.Item label="模板">
            <Input value={selectedTemplate?.name} disabled />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProjectTemplateLibrary;
