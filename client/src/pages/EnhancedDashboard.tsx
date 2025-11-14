import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Timeline,
  Table,
  Tag,
  Space,
  Divider,
  Typography,
  List,
} from 'antd';
import {
  ProjectOutlined,
  RiseOutlined,
  DollarOutlined,
  TeamOutlined,
  ToolOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useProject } from '../contexts/ProjectContext';

const { Title, Text } = Typography;

const EnhancedDashboard: React.FC = () => {
  const { currentProject } = useProject();
  // 移除未使用的loading状态

  // 模拟数据
  const stats = {
    totalTasks: 156,
    completedTasks: 89,
    inProgressTasks: 45,
    delayedTasks: 12,
    totalDevices: 234,
    installedDevices: 167,
    totalBudget: 50000000,
    usedBudget: 32500000,
    teamSize: 145,
    safetyScore: 96,
    qualityScore: 94,
  };

  const recentActivities = [
    { time: '10分钟前', content: '设备P-101安装完成', type: 'success' },
    { time: '1小时前', content: '安全检查发现3处隐患', type: 'warning' },
    { time: '2小时前', content: '土建工程进度达到85%', type: 'info' },
    { time: '4小时前', content: '采购订单PO-2024-089已批准', type: 'success' },
    { time: '6小时前', content: '质量检测全部通过', type: 'success' },
  ];

  const upcomingTasks = [
    { id: 1, name: '设备E-201安装', deadline: '2天后', priority: 'high', assignee: '张工' },
    { id: 2, name: '管道焊接检验', deadline: '3天后', priority: 'medium', assignee: '李工' },
    { id: 3, name: '电气系统调试', deadline: '5天后', priority: 'high', assignee: '王工' },
    { id: 4, name: 'HSE安全培训', deadline: '1周后', priority: 'low', assignee: '赵工' },
  ];

  const progressByPhase = [
    { phase: 'E-工程设计', progress: 100, status: 'success' },
    { phase: 'P-设备采购', progress: 85, status: 'active' },
    { phase: 'C-施工建设', progress: 52, status: 'active' },
    { phase: '调试验收', progress: 15, status: 'normal' },
  ];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority: string) => {
    const text: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return text[priority] || priority;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ProjectOutlined /> EPC工程综合看板
        </Title>
        <Text type="secondary">
          {currentProject ? `当前项目: ${currentProject.name}` : '请选择项目'}
        </Text>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            variant="borderless"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>总体进度</span>}
              value={currentProject?.progress || 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
            <Progress
              percent={currentProject?.progress || 0}
              showInfo={false}
              strokeColor="#fff"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            variant="borderless"
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>任务完成率</span>}
              value={((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              {stats.completedTasks}/{stats.totalTasks} 已完成
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            variant="borderless"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>预算使用</span>}
              value={((stats.usedBudget / stats.totalBudget) * 100).toFixed(1)}
              suffix="%"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              ¥{(stats.usedBudget / 10000).toFixed(0)}万 / ¥{(stats.totalBudget / 10000).toFixed(0)}
              万
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            variant="borderless"
            style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>安全评分</span>}
              value={stats.safetyScore}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              质量: {stats.qualityScore}分
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 详细统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="设备安装进度"
              value={((stats.installedDevices / stats.totalDevices) * 100).toFixed(1)}
              suffix="%"
              prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
            />
            <Progress
              percent={Number(((stats.installedDevices / stats.totalDevices) * 100).toFixed(1))}
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stats.installedDevices}/{stats.totalDevices} 设备已安装
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={stats.inProgressTasks}
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              suffix="项"
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">延期任务</Text>
              <Tag color="red">{stats.delayedTasks}项</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="团队规模"
              value={stats.teamSize}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              suffix="人"
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">在岗人数</Text>
              <Text strong>{Math.floor(stats.teamSize * 0.92)}人</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月完成任务"
              value={23}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              suffix="项"
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">环比上月</Text>
              <Text type="success">+12%</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* EPC阶段进度 */}
        <Col xs={24} lg={12}>
          <Card title="EPC各阶段进度" variant="borderless">
            <List
              dataSource={progressByPhase}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <Space
                      style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}
                    >
                      <Text strong>{item.phase}</Text>
                      <Text>{item.progress}%</Text>
                    </Space>
                    <Progress
                      percent={item.progress}
                      status={item.status as any}
                      strokeColor={
                        item.status === 'success'
                          ? '#52c41a'
                          : item.status === 'active'
                            ? '#1890ff'
                            : '#d9d9d9'
                      }
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 近期活动 */}
        <Col xs={24} lg={12}>
          <Card title="近期活动" variant="borderless">
            <Timeline
              items={recentActivities.map((activity) => ({
                color:
                  activity.type === 'success'
                    ? 'green'
                    : activity.type === 'warning'
                      ? 'orange'
                      : 'blue',
                children: (
                  <>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {activity.time}
                    </Text>
                    <div>{activity.content}</div>
                  </>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* 即将到期任务 */}
        <Col xs={24}>
          <Card title="即将到期任务" variant="borderless">
            <Table
              dataSource={upcomingTasks}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '任务名称',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: '截止时间',
                  dataIndex: 'deadline',
                  key: 'deadline',
                  render: (text) => (
                    <Space>
                      <ClockCircleOutlined />
                      {text}
                    </Space>
                  ),
                },
                {
                  title: '优先级',
                  dataIndex: 'priority',
                  key: 'priority',
                  render: (priority) => (
                    <Tag color={getPriorityColor(priority)}>{getPriorityText(priority)}</Tag>
                  ),
                },
                {
                  title: '负责人',
                  dataIndex: 'assignee',
                  key: 'assignee',
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EnhancedDashboard;
