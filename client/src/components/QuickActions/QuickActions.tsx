/**
 * 快速操作面板 - 提供常用功能的快捷入口
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tooltip,
  Badge,
  Statistic,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  FileAddOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  RocketOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

interface QuickAction {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path?: string;
  action?: () => void;
  badge?: number;
  hot?: boolean;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      key: 'selection',
      title: '设备选型',
      description: 'Luckysheet表格系统',
      icon: <FileAddOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      path: '/selection',
      hot: true,
    },
    {
      key: 'dashboard',
      title: '智能仪表盘',
      description: 'AI数据分析',
      icon: <DashboardOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #1890ff 0%, #13c2c2 100%)',
      path: '/dashboard',
      badge: 3,
      hot: true,
    },
    {
      key: 'gantt',
      title: '甘特图',
      description: '项目进度管理',
      icon: <BarChartOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: '/gantt',
    },
    {
      key: 'tasks',
      title: '任务管理',
      description: '待办事项',
      icon: <FileAddOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      path: '/tasks',
      badge: 15,
    },
    {
      key: 'team',
      title: '团队协作',
      description: '成员管理',
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      path: '/personnel',
    },
    {
      key: 'calendar',
      title: '日程安排',
      description: '会议日历',
      icon: <CalendarOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      path: '/calendar',
      badge: 2,
    },
    {
      key: 'risk',
      title: '风险管理',
      description: '风险监控',
      icon: <SafetyCertificateOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      path: '/risk',
      hot: true,
    },
    {
      key: 'settings',
      title: '系统设置',
      description: '配置管理',
      icon: <SettingOutlined style={{ fontSize: 24 }} />,
      color: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
      path: '/settings',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.action) {
      action.action();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className="quick-actions">
      <Card 
        title={
          <Space>
            <RocketOutlined />
            <span>快速启动</span>
          </Space>
        }
        extra={
          <Space>
            <Badge dot>
              <BellOutlined style={{ fontSize: 18 }} />
            </Badge>
            <CrownOutlined style={{ fontSize: 18, color: '#faad14' }} />
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {quickActions.map(action => (
            <Col key={action.key} xs={12} sm={8} md={6} lg={6} xl={3}>
              <div
                className={`quick-action-card ${hoveredCard === action.key ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(action.key)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleActionClick(action)}
                style={{
                  background: hoveredCard === action.key ? action.color : '#fff',
                  border: `1px solid ${hoveredCard === action.key ? 'transparent' : '#f0f0f0'}`,
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === action.key ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCard === action.key 
                    ? '0 8px 16px rgba(0,0,0,0.1)' 
                    : '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                {action.hot && (
                  <Badge 
                    count="HOT" 
                    style={{ 
                      backgroundColor: '#ff4d4f',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                    }} 
                  />
                )}
                {action.badge && action.badge > 0 && (
                  <Badge 
                    count={action.badge} 
                    style={{ 
                      position: 'absolute',
                      top: -5,
                      right: -5,
                    }} 
                  />
                )}
                <div 
                  className="action-icon"
                  style={{
                    color: hoveredCard === action.key ? '#fff' : '#666',
                    marginBottom: 8,
                  }}
                >
                  {action.icon}
                </div>
                <div 
                  className="action-title"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: hoveredCard === action.key ? '#fff' : '#333',
                    marginBottom: 4,
                  }}
                >
                  {action.title}
                </div>
                <div 
                  className="action-desc"
                  style={{
                    fontSize: 12,
                    color: hoveredCard === action.key ? 'rgba(255,255,255,0.8)' : '#999',
                  }}
                >
                  {action.description}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* 今日概览 */}
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={6}>
            <Card size="small" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>今日任务</span>}
                value={12}
                valueStyle={{ color: 'white' }}
                suffix={<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>/ 15</span>}
              />
              <Progress 
                percent={80} 
                strokeColor="white" 
                trailColor="rgba(255,255,255,0.2)" 
                showInfo={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>会议安排</span>}
                value={3}
                valueStyle={{ color: 'white' }}
                suffix={<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>场</span>}
              />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                下一场: 14:00
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>待审批</span>}
                value={5}
                valueStyle={{ color: 'white' }}
                prefix={<ThunderboltOutlined />}
              />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                2个紧急
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>风险预警</span>}
                value={2}
                valueStyle={{ color: 'white' }}
                prefix={<SafetyCertificateOutlined />}
              />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                高风险: 1
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default QuickActions;
