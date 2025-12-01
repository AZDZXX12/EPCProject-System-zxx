/**
 * 智能数据分析仪表盘
 * 参考：Microsoft Project、Jira Dashboard、禅道统计
 * 
 * 核心功能：
 * 1. 多维度数据分析
 * 2. 智能预测与建议
 * 3. 实时监控预警
 * 4. 可定制化面板
 */

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Timeline,
  Alert,
  Select,
  DatePicker,
  Button,
  Space,
  Tooltip,
  Badge,
  Tabs,
  List,
  Avatar,
  Typography,
  Divider,
  Empty,
  Segmented,
} from 'antd';
import {
  DashboardOutlined,
  RiseOutlined,
  FallOutlined,
  ProjectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FundProjectionScreenOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  HeatMapOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  BugOutlined,
  FireOutlined,
  RocketOutlined,
  BulbOutlined,
  ToolOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie, Area, Gauge, Radar, Heatmap, Funnel } from '@ant-design/plots';
import { useProject } from '../contexts/ProjectContext';
import { logger } from '../utils/logger';
import './IntelligentDashboard.css';

const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 项目健康度评分系统
const calculateProjectHealth = (project: any) => {
  let score = 100;
  
  // 进度因素（权重30%）
  const scheduleVariance = project.actualProgress - project.plannedProgress;
  if (scheduleVariance < -10) score -= 30;
  else if (scheduleVariance < -5) score -= 15;
  else if (scheduleVariance > 0) score += 5;
  
  // 成本因素（权重25%）
  const costVariance = (project.actualCost - project.plannedCost) / project.plannedCost;
  if (costVariance > 0.2) score -= 25;
  else if (costVariance > 0.1) score -= 12;
  else if (costVariance < 0) score += 5;
  
  // 风险因素（权重20%）
  const highRisks = project.risks?.filter((r: any) => r.level === 'high').length || 0;
  score -= highRisks * 5;
  
  // 质量因素（权重15%）
  const qualityIssues = project.qualityIssues || 0;
  score -= qualityIssues * 3;
  
  // 团队因素（权重10%）
  const teamUtilization = project.teamUtilization || 0.8;
  if (teamUtilization > 0.95) score -= 10;
  else if (teamUtilization < 0.6) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

const IntelligentDashboard: React.FC = () => {
  const { currentProject, projects } = useProject();
  const [viewMode, setViewMode] = useState<'executive' | 'detailed' | 'predictive'>('executive');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  
  // 模拟数据 - 实际应从API获取
  const [metrics, setMetrics] = useState({
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    totalBudget: 15000000,
    usedBudget: 9500000,
    totalTasks: 456,
    completedTasks: 234,
    inProgressTasks: 167,
    blockedTasks: 15,
    teamMembers: 45,
    activeMembers: 38,
    averageHealth: 78,
    onTimeDelivery: 85,
    customerSatisfaction: 92,
    resourceUtilization: 76,
  });

  // 项目健康度数据
  const projectHealthData = [
    { name: '化工装置A', health: 92, status: 'healthy' },
    { name: '管道工程B', health: 78, status: 'warning' },
    { name: '储罐项目C', health: 85, status: 'healthy' },
    { name: '反应器D', health: 65, status: 'risk' },
    { name: '分离塔E', health: 88, status: 'healthy' },
  ];

  // 进度趋势数据
  const progressTrendData = [
    { date: '2024-01', planned: 20, actual: 18 },
    { date: '2024-02', planned: 35, actual: 32 },
    { date: '2024-03', planned: 50, actual: 48 },
    { date: '2024-04', planned: 65, actual: 64 },
    { date: '2024-05', planned: 80, actual: 78 },
    { date: '2024-06', planned: 95, actual: 92 },
  ];

  // 资源分配数据
  const resourceAllocationData = [
    { type: '工程师', value: 35 },
    { type: '技术员', value: 25 },
    { type: '项目经理', value: 8 },
    { type: '质检员', value: 12 },
    { type: '安全员', value: 10 },
    { type: '其他', value: 10 },
  ];

  // 风险矩阵数据
  const riskMatrixData = [
    { probability: '高', impact: '高', count: 2, level: 'critical' },
    { probability: '高', impact: '中', count: 3, level: 'high' },
    { probability: '高', impact: '低', count: 1, level: 'medium' },
    { probability: '中', impact: '高', count: 4, level: 'high' },
    { probability: '中', impact: '中', count: 5, level: 'medium' },
    { probability: '中', impact: '低', count: 3, level: 'low' },
    { probability: '低', impact: '高', count: 1, level: 'medium' },
    { probability: '低', impact: '中', count: 2, level: 'low' },
    { probability: '低', impact: '低', count: 4, level: 'low' },
  ];

  // 里程碑状态
  const milestones = [
    { name: '项目启动', date: '2024-01-15', status: 'completed' },
    { name: '设计完成', date: '2024-03-20', status: 'completed' },
    { name: '设备采购', date: '2024-05-10', status: 'completed' },
    { name: '主体施工', date: '2024-08-30', status: 'in-progress' },
    { name: '调试运行', date: '2024-10-15', status: 'pending' },
    { name: '项目验收', date: '2024-11-30', status: 'pending' },
  ];

  // 团队绩效数据
  const teamPerformance = [
    { name: '张工', role: '项目经理', tasks: 45, completed: 42, efficiency: 93 },
    { name: '李工', role: '技术负责', tasks: 38, completed: 35, efficiency: 92 },
    { name: '王工', role: '质量工程师', tasks: 32, completed: 30, efficiency: 94 },
    { name: '赵工', role: '安全工程师', tasks: 28, completed: 27, efficiency: 96 },
    { name: '陈工', role: '采购经理', tasks: 25, completed: 22, efficiency: 88 },
  ];

  // 智能预警
  const warnings = [
    { type: 'error', message: '反应器D项目进度延迟15%，需立即关注', time: '10分钟前' },
    { type: 'warning', message: '管道工程B预算使用率达85%', time: '1小时前' },
    { type: 'warning', message: '下周有3个关键里程碑需要完成', time: '2小时前' },
    { type: 'info', message: '储罐项目C质量检查全部通过', time: '3小时前' },
  ];

  // 成本燃尽图配置
  const burndownConfig = {
    data: progressTrendData.map(item => [
      { date: item.date, value: item.planned, type: '计划' },
      { date: item.date, value: item.actual, type: '实际' }
    ]).flat(),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: { animation: 'path-in', duration: 1000 },
    },
  };

  // 资源饼图配置
  const pieConfig = {
    data: resourceAllocationData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  // 健康度仪表盘配置
  const gaugeConfig = {
    percent: metrics.averageHealth / 100,
    range: {
      color: metrics.averageHealth > 80 ? '#52c41a' : metrics.averageHealth > 60 ? '#faad14' : '#ff4d4f',
    },
    statistic: {
      content: {
        formatter: ({ percent }: any) => `${(percent * 100).toFixed(0)}分`,
      },
    },
  };

  // 渲染执行层视图
  const renderExecutiveView = () => (
    <>
      {/* 核心指标卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="项目健康度"
              value={metrics.averageHealth}
              suffix="分"
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: metrics.averageHealth > 80 ? '#52c41a' : '#faad14' }}
            />
            <Progress percent={metrics.averageHealth} showInfo={false} strokeColor={metrics.averageHealth > 80 ? '#52c41a' : '#faad14'} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="准时交付率"
              value={metrics.onTimeDelivery}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={metrics.onTimeDelivery} showInfo={false} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预算使用率"
              value={((metrics.usedBudget / metrics.totalBudget) * 100).toFixed(1)}
              suffix="%"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress percent={(metrics.usedBudget / metrics.totalBudget) * 100} showInfo={false} strokeColor="#722ed1" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="资源利用率"
              value={metrics.resourceUtilization}
              suffix="%"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Progress percent={metrics.resourceUtilization} showInfo={false} strokeColor="#fa8c16" />
          </Card>
        </Col>
      </Row>

      {/* 项目状态总览 */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="项目健康度排名" extra={<Button type="link">查看详情</Button>}>
            <List
              dataSource={projectHealthData}
              renderItem={item => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>{item.name}</span>
                      <Tag color={item.health > 80 ? 'green' : item.health > 60 ? 'orange' : 'red'}>
                        {item.health}分
                      </Tag>
                    </div>
                    <Progress 
                      percent={item.health} 
                      showInfo={false}
                      strokeColor={item.health > 80 ? '#52c41a' : item.health > 60 ? '#faad14' : '#ff4d4f'}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="里程碑追踪" extra={<Button type="link">全部里程碑</Button>}>
            <Timeline>
              {milestones.map((milestone, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    milestone.status === 'completed' ? 'green' :
                    milestone.status === 'in-progress' ? 'blue' : 'gray'
                  }
                  dot={
                    milestone.status === 'completed' ? <CheckCircleOutlined /> :
                    milestone.status === 'in-progress' ? <ClockCircleOutlined /> : null
                  }
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{milestone.name}</span>
                    <Text type="secondary">{milestone.date}</Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 智能预警 */}
      <Card title="智能预警" style={{ marginTop: 16 }} extra={
        <Badge count={warnings.filter(w => w.type === 'error').length} />
      }>
        <List
          dataSource={warnings}
          renderItem={item => (
            <Alert
              message={item.message}
              type={item.type as any}
              showIcon
              style={{ marginBottom: 8 }}
              closable
              description={item.time}
            />
          )}
        />
      </Card>
    </>
  );

  // 渲染详细视图
  const renderDetailedView = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="进度燃尽图">
            <Line {...burndownConfig} height={300} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="资源分配">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card title="任务统计">
            <div style={{ textAlign: 'center' }}>
              <Gauge {...gaugeConfig} height={200} />
              <Divider />
              <Space size="large">
                <Statistic title="总任务" value={metrics.totalTasks} />
                <Statistic title="已完成" value={metrics.completedTasks} valueStyle={{ color: '#52c41a' }} />
                <Statistic title="进行中" value={metrics.inProgressTasks} valueStyle={{ color: '#1890ff' }} />
                <Statistic title="受阻" value={metrics.blockedTasks} valueStyle={{ color: '#ff4d4f' }} />
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="团队绩效">
            <Table
              dataSource={teamPerformance}
              columns={[
                { title: '成员', dataIndex: 'name', key: 'name' },
                { title: '角色', dataIndex: 'role', key: 'role' },
                { title: '任务数', dataIndex: 'tasks', key: 'tasks' },
                { title: '已完成', dataIndex: 'completed', key: 'completed' },
                {
                  title: '效率',
                  dataIndex: 'efficiency',
                  key: 'efficiency',
                  render: (val: number) => (
                    <Progress percent={val} size="small" strokeColor={val > 90 ? '#52c41a' : '#faad14'} />
                  )
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </>
  );

  // 渲染预测视图
  const renderPredictiveView = () => (
    <>
      <Alert
        message="AI预测分析"
        description="基于历史数据和机器学习模型，为您提供项目未来趋势预测和风险预警"
        type="info"
        showIcon
        icon={<RocketOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16}>
        <Col span={12}>
          <Card title="完工预测" extra={<Tag color="blue">基于蒙特卡洛模拟</Tag>}>
            <div className="prediction-content">
              <Title level={3}>预计完工日期</Title>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text>最乐观：2024年11月15日</Text>
                  <Progress percent={25} strokeColor="#52c41a" />
                </div>
                <div>
                  <Text strong>最可能：2024年11月30日</Text>
                  <Progress percent={65} strokeColor="#1890ff" />
                </div>
                <div>
                  <Text>最悲观：2024年12月20日</Text>
                  <Progress percent={10} strokeColor="#ff4d4f" />
                </div>
              </Space>
              <Divider />
              <Paragraph type="secondary">
                置信度：85% | 基于1000次模拟计算
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="成本预测" extra={<Tag color="orange">趋势分析</Tag>}>
            <div className="prediction-content">
              <Title level={3}>最终成本估算</Title>
              <Statistic
                value={16500000}
                prefix="¥"
                valueStyle={{ color: '#cf1322' }}
                suffix={
                  <span style={{ fontSize: 14, color: '#cf1322' }}>
                    (+10%)
                  </span>
                }
              />
              <Divider />
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert message="预计超支原因" type="warning" />
                <List
                  size="small"
                  dataSource={[
                    '材料价格上涨：+5%',
                    '工期延长导致人工成本增加：+3%',
                    '设计变更：+2%',
                  ]}
                  renderItem={item => <List.Item>{item}</List.Item>}
                />
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="风险预测矩阵" style={{ marginTop: 16 }}>
        <div className="risk-matrix">
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="高风险事项" style={{ background: '#fff2e8' }}>
                <List
                  size="small"
                  dataSource={[
                    { risk: '关键设备交付延迟', probability: '75%', impact: '高' },
                    { risk: '技术人员短缺', probability: '60%', impact: '中' },
                    { risk: '天气影响施工', probability: '40%', impact: '高' },
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" size={0}>
                        <Text strong>{item.risk}</Text>
                        <Text type="secondary">概率: {item.probability} | 影响: {item.impact}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="中风险事项" style={{ background: '#fff7e6' }}>
                <List
                  size="small"
                  dataSource={[
                    { risk: '质量问题返工', probability: '30%', impact: '中' },
                    { risk: '供应商变更', probability: '25%', impact: '中' },
                    { risk: '设计方案调整', probability: '35%', impact: '低' },
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" size={0}>
                        <Text>{item.risk}</Text>
                        <Text type="secondary">概率: {item.probability} | 影响: {item.impact}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="机会事项" style={{ background: '#f0f5ff' }}>
                <List
                  size="small"
                  dataSource={[
                    { opportunity: '提前完成获得奖励', probability: '20%', benefit: '￥500,000' },
                    { opportunity: '材料价格下降', probability: '15%', benefit: '￥200,000' },
                    { opportunity: '并行施工节省工期', probability: '40%', benefit: '15天' },
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <Space direction="vertical" size={0}>
                        <Text type="success">{item.opportunity}</Text>
                        <Text type="secondary">概率: {item.probability} | 收益: {item.benefit}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Card>

      <Card title="智能建议" style={{ marginTop: 16 }} extra={<Tag icon={<BulbOutlined />} color="gold">AI建议</Tag>}>
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: '优先处理关键路径任务',
              description: '当前有3个关键路径任务延迟，建议立即分配额外资源',
              priority: 'high',
              icon: <FireOutlined style={{ color: '#ff4d4f' }} />,
            },
            {
              title: '优化资源配置',
              description: '检测到团队B利用率仅60%，可调配至项目C加速进度',
              priority: 'medium',
              icon: <TeamOutlined style={{ color: '#faad14' }} />,
            },
            {
              title: '预防性维护',
              description: '设备A运行时间已达80%寿命，建议安排维护避免故障',
              priority: 'medium',
              icon: <ToolOutlined style={{ color: '#1890ff' }} />,
            },
            {
              title: '成本优化机会',
              description: '批量采购材料可节省8%成本，约￥120,000',
              priority: 'low',
              icon: <DollarOutlined style={{ color: '#52c41a' }} />,
            },
          ]}
          renderItem={item => (
            <List.Item
              actions={[<Button type="primary" size="small">执行建议</Button>]}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </>
  );

  return (
    <div className="intelligent-dashboard">
      <div className="dashboard-header">
        <Title level={2}>
          <DashboardOutlined /> 智能分析仪表盘
        </Title>
        <Space>
          <Segmented
            options={[
              { label: '执行视图', value: 'executive', icon: <FundProjectionScreenOutlined /> },
              { label: '详细分析', value: 'detailed', icon: <BarChartOutlined /> },
              { label: 'AI预测', value: 'predictive', icon: <RocketOutlined /> },
            ]}
            value={viewMode}
            onChange={setViewMode as any}
          />
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
            <Select.Option value="quarter">本季度</Select.Option>
            <Select.Option value="year">本年度</Select.Option>
          </Select>
          <Button type="primary" icon={<DownloadOutlined />}>导出报告</Button>
        </Space>
      </div>

      <div className="dashboard-content">
        {viewMode === 'executive' && renderExecutiveView()}
        {viewMode === 'detailed' && renderDetailedView()}
        {viewMode === 'predictive' && renderPredictiveView()}
      </div>
    </div>
  );
};

export default IntelligentDashboard;
