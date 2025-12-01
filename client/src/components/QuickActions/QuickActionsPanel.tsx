import React, { useState } from 'react';
import { Drawer, Button, Space, Card, Row, Col, Statistic, Badge, Tooltip } from 'antd';
import {
  PlusOutlined,
  FileAddOutlined,
  TeamOutlined,
  ToolOutlined,
  CalendarOutlined,
  FileTextOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './QuickActionsPanel.css';

interface QuickActionsProps {
  visible: boolean;
  onClose: () => void;
}

interface QuickAction {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  color: string;
  badge?: number;
  hot?: boolean;
}

const QuickActionsPanel: React.FC<QuickActionsProps> = ({ visible, onClose }) => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      key: 'new-task',
      title: '新建任务',
      icon: <PlusOutlined />,
      description: '快速创建新任务',
      path: '/tasks?action=new',
      color: '#1890ff',
      hot: true,
    },
    {
      key: 'new-project',
      title: '新建项目',
      icon: <FileAddOutlined />,
      description: '创建新项目',
      path: '/workspace?action=new-project',
      color: '#52c41a',
    },
    {
      key: 'team',
      title: '团队协作',
      icon: <TeamOutlined />,
      description: '查看团队成员',
      path: '/personnel',
      color: '#722ed1',
      badge: 3,
    },
    {
      key: 'tools',
      title: '实用工具',
      icon: <ToolOutlined />,
      description: '工程计算器',
      path: '/utilities',
      color: '#fa8c16',
    },
    {
      key: 'schedule',
      title: '日程安排',
      icon: <CalendarOutlined />,
      description: '查看日程',
      path: '/tasks?view=calendar',
      color: '#13c2c2',
    },
    {
      key: 'documents',
      title: '文档中心',
      icon: <FileTextOutlined />,
      description: '项目文档',
      path: '/documents',
      color: '#eb2f96',
    },
    {
      key: 'quick-start',
      title: '快速开始',
      icon: <RocketOutlined />,
      description: '新手指南',
      path: '/workspace',
      color: '#2f54eb',
    },
    {
      key: 'ai-assistant',
      title: 'AI助手',
      icon: <ThunderboltOutlined />,
      description: '智能助手',
      path: '/workspace',
      color: '#9254de',
      hot: true,
    },
  ];

  const todayStats = {
    pending: 5,
    completed: 12,
    inProgress: 3,
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.key === 'ai-assistant') {
      // 触发AI助手打开事件
      window.dispatchEvent(new CustomEvent('open-ai-assistant'));
    } else {
      navigate(action.path);
    }
    onClose();
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThunderboltOutlined style={{ color: '#1890ff' }} />
          <span>快捷操作</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={420}
      className="quick-actions-drawer"
    >
      {/* 今日概览 */}
      <Card
        title="今日概览"
        size="small"
        style={{ marginBottom: '16px' }}
        className="today-overview-card"
      >
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="待办"
              value={todayStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="进行中"
              value={todayStats.inProgress}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="已完成"
              value={todayStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 快捷操作网格 */}
      <div className="quick-actions-title">快捷操作</div>
      <div className="quick-actions-grid">
        {quickActions.map((action) => (
          <Badge.Ribbon
            key={action.key}
            text="HOT"
            color="red"
            style={{ display: action.hot ? 'block' : 'none' }}
          >
            <Card
              hoverable
              className="quick-action-card"
              onClick={() => handleActionClick(action)}
              style={{ borderLeft: `3px solid ${action.color}` }}
            >
              <div className="quick-action-content">
                <div
                  className="quick-action-icon"
                  style={{ background: `${action.color}15`, color: action.color }}
                >
                  {action.icon}
                </div>
                <div className="quick-action-text">
                  <div className="quick-action-title">
                    {action.title}
                    {action.badge && (
                      <Badge
                        count={action.badge}
                        style={{ marginLeft: '8px' }}
                      />
                    )}
                  </div>
                  <div className="quick-action-description">{action.description}</div>
                </div>
              </div>
            </Card>
          </Badge.Ribbon>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="quick-actions-footer">
        <Tooltip title="使用 Ctrl+K 打开命令面板">
          <Button type="link" size="small">
            💡 提示：试试按 Ctrl+K
          </Button>
        </Tooltip>
      </div>
    </Drawer>
  );
};

export default QuickActionsPanel;
