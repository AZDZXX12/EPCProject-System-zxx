/**
 * 今日概览组件
 * 显示今日任务、进度、风险等关键信息
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Empty, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useResponsive } from '../../hooks/useResponsive';
import './TodayOverview.css';

const { Text, Title } = Typography;

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
  assignee: string;
}

interface TodayOverviewProps {
  projectId?: string;
}

export const TodayOverview: React.FC<TodayOverviewProps> = ({ projectId }) => {
  const { isMobile } = useResponsive();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    teamMembers: 0,
    todayProgress: 0,
  });

  useEffect(() => {
    // 模拟数据加载
    const mockTasks: Task[] = [
      {
        id: '1',
        title: '完成设备基础施工',
        priority: 'high',
        status: 'in_progress',
        deadline: dayjs().format('YYYY-MM-DD'),
        assignee: '张三',
      },
      {
        id: '2',
        title: '提交质量检查报告',
        priority: 'high',
        status: 'pending',
        deadline: dayjs().format('YYYY-MM-DD'),
        assignee: '李四',
      },
      {
        id: '3',
        title: '采购材料验收',
        priority: 'medium',
        status: 'completed',
        deadline: dayjs().format('YYYY-MM-DD'),
        assignee: '王五',
      },
    ];

    setTodayTasks(mockTasks);
    setStats({
      totalTasks: 8,
      completedTasks: 3,
      inProgressTasks: 4,
      overdueTasks: 1,
      teamMembers: 12,
      todayProgress: 38,
    });
  }, [projectId]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      in_progress: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
      pending: <ClockCircleOutlined style={{ color: '#8c8c8c' }} />,
    };
    return icons[status as keyof typeof icons];
  };

  return (
    <div className="today-overview">
      <Card
        title={
          <div className="overview-header">
            <CalendarOutlined />
            <span className="overview-title">今日概览</span>
            <Text type="secondary" className="overview-date">
              {dayjs().format('YYYY年MM月DD日 dddd')}
            </Text>
          </div>
        }
        className="overview-card"
      >
        {/* 统计数据 */}
        <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} className="stats-row">
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="总任务"
              value={stats.totalTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="已完成"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="进行中"
              value={stats.inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="已逾期"
              value={stats.overdueTasks}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="团队人数"
              value={stats.teamMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <div className="progress-stat">
              <Text type="secondary" className="stat-label">
                今日进度
              </Text>
              <Progress
                type="circle"
                percent={stats.todayProgress}
                width={isMobile ? 60 : 80}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Col>
        </Row>

        {/* 今日任务列表 */}
        <div className="tasks-section">
          <Title level={5} className="section-title">
            <RiseOutlined /> 今日任务
          </Title>
          {todayTasks.length > 0 ? (
            <List
              dataSource={todayTasks}
              renderItem={(task) => (
                <List.Item className="task-item">
                  <div className="task-content">
                    <div className="task-header">
                      {getStatusIcon(task.status)}
                      <Text strong className="task-title">
                        {task.title}
                      </Text>
                    </div>
                    <div className="task-meta">
                      <Tag color={getPriorityColor(task.priority)}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
                      </Tag>
                      <Text type="secondary" className="task-assignee">
                        <TeamOutlined /> {task.assignee}
                      </Text>
                      <Text type="secondary" className="task-deadline">
                        <ClockCircleOutlined /> {dayjs(task.deadline).format('HH:mm')}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description="今日暂无任务"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default TodayOverview;
