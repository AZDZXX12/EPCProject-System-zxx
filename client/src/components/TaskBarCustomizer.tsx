/**
 * 任务条显示信息定制器 - Ganttable 特色功能
 * 可配置任务条上显示的字段
 */

import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Space, Button, message, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import './TaskBarCustomizer.css';

interface TaskBarCustomizerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (fields: string[]) => void;
  currentFields: string[];
}

const AVAILABLE_FIELDS = [
  { key: 'text', label: '任务名称', default: true },
  { key: 'owner', label: '负责人', default: false },
  { key: 'progress', label: '完成度(%)', default: true },
  { key: 'duration', label: '持续天数', default: false },
  { key: 'remainingDays', label: '剩余天数', default: false },
  { key: 'priority', label: '优先级', default: false },
  { key: 'status', label: '状态标签', default: true },
  { key: 'delayDays', label: '延期天数', default: false },
  { key: 'slackTime', label: '浮动时间', default: false }
];

export const TaskBarCustomizer: React.FC<TaskBarCustomizerProps> = ({
  visible,
  onClose,
  onSave,
  currentFields
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(currentFields);

  useEffect(() => {
    setSelectedFields(currentFields);
  }, [currentFields]);

  const handleSave = () => {
    if (selectedFields.length === 0) {
      message.warning('至少选择一个显示字段');
      return;
    }
    onSave(selectedFields);
    message.success('任务条显示配置已更新');
    onClose();
  };

  const handleReset = () => {
    const defaultFields = AVAILABLE_FIELDS.filter(f => f.default).map(f => f.key);
    setSelectedFields(defaultFields);
  };

  return (
    <Modal
      title={<span><SettingOutlined /> 定制任务条显示信息</span>}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      width={500}
      className="task-bar-customizer"
    >
      <div className="customizer-description">
        选择要在任务条上显示的字段信息：
      </div>

      <Divider />

      <Checkbox.Group
        value={selectedFields}
        onChange={(values) => setSelectedFields(values as string[])}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {AVAILABLE_FIELDS.map(field => (
            <Checkbox key={field.key} value={field.key}>
              {field.label}
              {field.default && <span className="default-badge">默认</span>}
            </Checkbox>
          ))}
        </Space>
      </Checkbox.Group>

      <Divider />

      <div className="preview-section">
        <div className="preview-label">预览效果：</div>
        <div className="task-bar-preview">
          <div className="preview-bar">
            <div className="preview-content">
              {selectedFields.map((field, idx) => (
                <span key={field} className="preview-field">
                  {AVAILABLE_FIELDS.find(f => f.key === field)?.label}
                  {idx < selectedFields.length - 1 && ' | '}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button size="small" onClick={handleReset}>
          恢复默认
        </Button>
      </div>
    </Modal>
  );
};

/**
 * 生成任务条显示文本
 */
export function generateTaskBarText(task: any, fields: string[]): string {
  const parts: string[] = [];

  fields.forEach(field => {
    switch (field) {
      case 'text':
        parts.push(task.text || '');
        break;
      case 'owner':
        if (task.owner) parts.push(`[${task.owner}]`);
        break;
      case 'progress':
        parts.push(`${Math.round((task.progress || 0) * 100)}%`);
        break;
      case 'duration':
        parts.push(`${task.duration || 0}天`);
        break;
      case 'remainingDays':
        const remaining = calculateRemainingDays(task);
        if (remaining > 0) parts.push(`剩余${remaining}天`);
        break;
      case 'priority':
        if (task.priority) {
          const priorityMap: any = { high: '高', medium: '中', low: '低' };
          parts.push(`[${priorityMap[task.priority] || task.priority}]`);
        }
        break;
      case 'status':
        if (task.status) {
          const statusMap: any = {
            not_started: '未开始',
            in_progress: '进行中',
            completed: '已完成',
            delayed: '延期',
            on_hold: '暂停'
          };
          parts.push(`[${statusMap[task.status] || task.status}]`);
        }
        break;
      case 'delayDays':
        if (task.delayDays && task.delayDays > 0) {
          parts.push(`⚠️延期${task.delayDays}天`);
        }
        break;
      case 'slackTime':
        if (task.slackTime !== undefined) {
          parts.push(`浮动${task.slackTime}天`);
        }
        break;
    }
  });

  return parts.filter(Boolean).join(' | ');
}

function calculateRemainingDays(task: any): number {
  if (!task.end_date) return 0;
  const now = new Date();
  const end = new Date(task.end_date);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default TaskBarCustomizer;
