/**
 * 工作流引擎
 * 参考：Worktile自动化规则
 */

import React, { useState } from 'react';
import { Card, Form, Select, Input, Button, Space, List, Tag, Switch } from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

const TRIGGERS = [
  { value: 'task.created', label: '任务创建时' },
  { value: 'task.updated', label: '任务更新时' },
  { value: 'task.completed', label: '任务完成时' },
  { value: 'task.overdue', label: '任务逾期时' },
];

const ACTIONS = [
  { value: 'notify.assignee', label: '通知负责人' },
  { value: 'notify.manager', label: '通知项目经理' },
  { value: 'update.status', label: '更新状态' },
  { value: 'create.subtask', label: '创建子任务' },
];

const WorkflowEngine: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: '任务完成自动通知',
      trigger: 'task.completed',
      condition: '',
      action: 'notify.assignee',
      enabled: true,
    },
  ]);

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const handleAddRule = async () => {
    const values = await form.validateFields();
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      ...values,
      enabled: true,
    };
    setRules([...rules, newRule]);
    form.resetFields();
    setVisible(false);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined />
          自动化规则
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
          新建规则
        </Button>
      }
    >
      <List
        dataSource={rules}
        renderItem={rule => (
          <List.Item
            actions={[
              <Switch checked={rule.enabled} onChange={() => toggleRule(rule.id)} />,
              <Button type="link">编辑</Button>,
              <Button type="link" danger>
                删除
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={rule.name}
              description={
                <Space>
                  <Tag color="blue">{TRIGGERS.find(t => t.value === rule.trigger)?.label}</Tag>
                  <span>→</span>
                  <Tag color="green">{ACTIONS.find(a => a.value === rule.action)?.label}</Tag>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      {visible && (
        <Card style={{ marginTop: 16 }}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
              <Input placeholder="例如：任务完成自动通知" />
            </Form.Item>
            <Form.Item name="trigger" label="触发条件" rules={[{ required: true }]}>
              <Select options={TRIGGERS} />
            </Form.Item>
            <Form.Item name="action" label="执行动作" rules={[{ required: true }]}>
              <Select options={ACTIONS} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleAddRule}>
                  保存
                </Button>
                <Button onClick={() => setVisible(false)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}
    </Card>
  );
};

export default WorkflowEngine;
