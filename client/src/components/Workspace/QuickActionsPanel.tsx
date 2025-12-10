/**
 * 快速操作面板
 * 提供常用功能的快捷入口
 */

import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import {
  PlusOutlined,
  FileAddOutlined,
  RobotOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import { vibrate } from '../../utils/mobileOptimization';
import './QuickActionsPanel.css';

const { Text } = Typography;

interface QuickAction {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  path?: string;
  onClick?: () => void;
}

interface QuickActionsPanelProps {
  onCreateProject?: () => void;
  onOpenAI?: () => void;
  onImportData?: () => void;
  onExportData?: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onCreateProject,
  onOpenAI,
  onImportData,
  onExportData,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const actions: QuickAction[] = [
    {
      key: 'create-project',
      icon: <PlusOutlined />,
      title: '新建项目',
      description: '创建新的EPC项目',
      color: '#1890ff',
      onClick: onCreateProject,
    },
    {
      key: 'gantt',
      icon: <BarChartOutlined />,
      title: '甘特图',
      description: '查看项目进度',
      color: '#52c41a',
      path: '/gantt',
    },
    {
      key: 'ai-assistant',
      icon: <RobotOutlined />,
      title: 'AI助手',
      description: '智能项目分析',
      color: '#722ed1',
      onClick: onOpenAI,
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      title: '团队管理',
      description: '管理项目成员',
      color: '#fa8c16',
      path: '/personnel',
    },
    {
      key: 'import',
      icon: <UploadOutlined />,
      title: '导入数据',
      description: 'Excel批量导入',
      color: '#13c2c2',
      onClick: onImportData,
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      title: '导出报表',
      description: '生成项目报表',
      color: '#eb2f96',
      onClick: onExportData,
    },
    {
      key: 'dashboard',
      icon: <BarChartOutlined />,
      title: '数据看板',
      description: '实时数据分析',
      color: '#2f54eb',
      path: '/dashboard',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      title: '系统设置',
      description: '配置系统参数',
      color: '#8c8c8c',
      path: '/settings',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    // 触觉反馈
    vibrate(10);

    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <Card
      title="快速操作"
      className="quick-actions-panel"
      bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
    >
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        {actions.map((action) => (
          <Col
            key={action.key}
            xs={12}
            sm={8}
            md={6}
            lg={6}
            xl={3}
          >
            <div
              className="action-card"
              onClick={() => handleActionClick(action)}
              style={{ borderColor: action.color }}
            >
              <div
                className="action-icon"
                style={{ color: action.color }}
              >
                {action.icon}
              </div>
              <Text strong className="action-title">
                {action.title}
              </Text>
              {!isMobile && (
                <Text type="secondary" className="action-description">
                  {action.description}
                </Text>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuickActionsPanel;
