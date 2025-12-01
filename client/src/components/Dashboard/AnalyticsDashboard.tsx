/**
 * 数据分析仪表板
 * 全局监控中心，展示项目关键指标和智能分析
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Alert,
  Timeline,
  List,
  Badge,
  Tooltip,
  Button,
  Space,
  Tabs,
  Select,
  DatePicker,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DashboardOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  ProjectOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  BulbOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie, Gauge, Area, Radar } from '@ant-design/plots';
import { useProjectStore } from '../../store/projectStore';
import { moduleDataBus } from '../../services/ModuleDataBus';
import { procurementAutomation } from '../../services/ProcurementAutomation';
import { intelligentDecisionSupport } from '../../services/IntelligentDecisionSupport';
import './AnalyticsDashboard.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface DashboardMetrics {
  projectProgress: number;
  budgetUtilization: number;
  riskScore: number;
  qualityIndex: number;
  scheduleAdherence: number;
  resourceUtilization: number;
  supplierPerformance: number;
  systemHealth: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    projectProgress: 0,
    budgetUtilization: 0,
    riskScore: 0,
    qualityIndex: 0,
    scheduleAdherence: 0,
    resourceUtilization: 0,
    supplierPerformance: 0,
    systemHealth: 0,
  });

  const [insights, setInsights] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [procurementStats, setProcurementStats] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const projects = useProjectStore((state) => state.projects);
  const currentProject = useProjectStore((state) => state.currentProject);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, [selectedProject, dateRange]);

  const loadDashboardData = async () => {
    setRefreshing(true);
    
    // 加载各项指标
    const newMetrics = calculateMetrics();
    setMetrics(newMetrics);

    // 加载智能洞察
    const latestInsights = intelligentDecisionSupport.getInsights(5);
    setInsights(latestInsights);

    // 加载模块连接状态
    const connectionStatus = moduleDataBus.getConnectionStatus();
    setConnections(connectionStatus);

    // 加载采购统计
    const stats = procurementAutomation.getStatistics();
    setProcurementStats(stats);

    setRefreshing(false);
  };

  const calculateMetrics = (): DashboardMetrics => {
    const project = selectedProject === 'all' ? currentProject : projects.find(p => p.id === selectedProject);
    
    // 模拟计算各项指标
    return {
      projectProgress: project?.progress || Math.random() * 100,
      budgetUtilization: 68 + Math.random() * 20,
      riskScore: 25 + Math.random() * 30,
      qualityIndex: 85 + Math.random() * 10,
      scheduleAdherence: 92 + Math.random() * 5,
      resourceUtilization: 75 + Math.random() * 15,
      supplierPerformance: 88 + Math.random() * 8,
      systemHealth: moduleDataBus.getConnectionHealth().health,
    };
  };

  // 进度趋势数据
  const progressTrendData = [
    { date: '2025-01', planned: 10, actual: 8 },
    { date: '2025-02', planned: 25, actual: 22 },
    { date: '2025-03', planned: 40, actual: 38 },
    { date: '2025-04', planned: 55, actual: 54 },
    { date: '2025-05', planned: 70, actual: 68 },
    { date: '2025-06', planned: 85, actual: 82 },
  ];

  // 成本分布数据
  const costDistributionData = [
    { type: '材料采购', value: 35 },
    { type: '人工成本', value: 25 },
    { type: '设备租赁', value: 20 },
    { type: '管理费用', value: 12 },
    { type: '其他', value: 8 },
  ];

  // 风险雷达图数据
  const riskRadarData = [
    { item: '技术风险', score: 65 },
    { item: '市场风险', score: 45 },
    { item: '财务风险', score: 30 },
    { item: '供应链风险', score: 55 },
    { item: '合规风险', score: 20 },
    { item: '环境风险', score: 35 },
  ];

  const renderOverviewCards = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="metric-card">
          <Statistic
            title="项目进度"
            value={metrics.projectProgress}
            precision={1}
            suffix="%"
            valueStyle={{ color: '#3f8600' }}
            prefix={<ProjectOutlined />}
          />
          <Progress 
            percent={metrics.projectProgress} 
            strokeColor="#52c41a"
            showInfo={false}
          />
          <div className="metric-trend">
            <span>较上周</span>
            <span className="trend-value positive">
              <ArrowUpOutlined /> 5.2%
            </span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="metric-card">
          <Statistic
            title="预算使用率"
            value={metrics.budgetUtilization}
            precision={1}
            suffix="%"
            valueStyle={{ color: '#1890ff' }}
            prefix={<DollarOutlined />}
          />
          <Progress 
            percent={metrics.budgetUtilization} 
            strokeColor="#1890ff"
            showInfo={false}
          />
          <div className="metric-trend">
            <span>剩余预算</span>
            <span className="trend-value">¥2,340,000</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="metric-card">
          <Statistic
            title="风险指数"
            value={metrics.riskScore}
            precision={0}
            suffix="/100"
            valueStyle={{ color: metrics.riskScore > 50 ? '#ff4d4f' : '#faad14' }}
            prefix={<AlertOutlined />}
          />
          <Progress 
            percent={metrics.riskScore} 
            strokeColor={metrics.riskScore > 50 ? '#ff4d4f' : '#faad14'}
            showInfo={false}
          />
          <div className="metric-trend">
            <span>高风险项</span>
            <span className="trend-value negative">3个</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="metric-card">
          <Statistic
            title="质量指数"
            value={metrics.qualityIndex}
            precision={1}
            suffix="/100"
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
          <Progress 
            percent={metrics.qualityIndex} 
            strokeColor="#52c41a"
            showInfo={false}
          />
          <div className="metric-trend">
            <span>合格率</span>
            <span className="trend-value positive">98.5%</span>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderProgressChart = () => {
    const config = {
      data: progressTrendData,
      xField: 'date',
      yField: ['planned', 'actual'],
      geometryOptions: [
        { geometry: 'line', color: '#5B8FF9' },
        { geometry: 'line', color: '#5AD8A6', lineStyle: { lineDash: [4, 4] } },
      ],
      legend: {
        itemName: {
          formatter: (text: string) => text === 'planned' ? '计划进度' : '实际进度',
        },
      },
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 1000,
        },
      },
    };

    return (
      <Card title="进度趋势分析" extra={<Tag color="blue">月度</Tag>}>
        <Line {...config} />
      </Card>
    );
  };

  const renderCostChart = () => {
    const config = {
      data: costDistributionData,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}',
      },
      interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    };

    return (
      <Card title="成本分布" extra={<Tag color="green">实时</Tag>}>
        <Pie {...config} />
      </Card>
    );
  };

  const renderRiskRadar = () => {
    const config = {
      data: riskRadarData,
      xField: 'item',
      yField: 'score',
      meta: {
        score: {
          alias: '风险值',
          min: 0,
          max: 100,
        },
      },
      xAxis: {
        line: null,
        tickLine: null,
      },
      yAxis: {
        label: false,
        grid: {
          alternateColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      point: {
        size: 2,
      },
      area: {},
    };

    return (
      <Card title="风险评估雷达" extra={<Badge status="warning" text="3项预警" />}>
        <Radar {...config} />
      </Card>
    );
  };

  const renderSystemHealth = () => {
    const config = {
      percent: metrics.systemHealth / 100,
      range: {
        color: metrics.systemHealth > 80 ? '#52c41a' : metrics.systemHealth > 60 ? '#faad14' : '#ff4d4f',
      },
      indicator: {
        pointer: {
          style: {
            stroke: '#D0D0D0',
          },
        },
        pin: {
          style: {
            stroke: '#D0D0D0',
          },
        },
      },
      statistic: {
        content: {
          style: {
            fontSize: '36px',
            lineHeight: '36px',
          },
          formatter: () => `${metrics.systemHealth.toFixed(0)}%`,
        },
      },
    };

    return (
      <Card title="系统健康度" extra={<SyncOutlined spin={refreshing} />}>
        <Gauge {...config} />
        <div className="health-details">
          <Row gutter={16}>
            <Col span={8}>
              <div className="health-item">
                <Badge status="success" />
                <span>活跃连接: {connections.filter(c => c.status === 'active').length}</span>
              </div>
            </Col>
            <Col span={8}>
              <div className="health-item">
                <Badge status="warning" />
                <span>待处理: {connections.filter(c => c.status === 'inactive').length}</span>
              </div>
            </Col>
            <Col span={8}>
              <div className="health-item">
                <Badge status="error" />
                <span>错误: {connections.filter(c => c.status === 'error').length}</span>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

  const renderInsights = () => (
    <Card 
      title={
        <Space>
          <BulbOutlined />
          <span>智能洞察</span>
        </Space>
      }
      extra={<Button type="link">查看全部</Button>}
    >
      <List
        dataSource={insights}
        renderItem={(insight) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Badge
                  status={
                    insight.type === 'anomaly' ? 'error' :
                    insight.type === 'trend' ? 'warning' :
                    'processing'
                  }
                />
              }
              title={
                <Space>
                  <span>{insight.title}</span>
                  <Tag color={
                    insight.confidence > 80 ? 'green' :
                    insight.confidence > 60 ? 'blue' :
                    'orange'
                  }>
                    {insight.confidence}% 置信度
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <p>{insight.description}</p>
                  <Space wrap>
                    {insight.recommendations?.slice(0, 2).map((rec: string, idx: number) => (
                      <Tag key={idx} icon={<ThunderboltOutlined />}>
                        {rec}
                      </Tag>
                    ))}
                  </Space>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderProcurementStats = () => {
    if (!procurementStats) return null;

    return (
      <Card title="采购统计">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Statistic
              title="总采购额"
              value={procurementStats.totalAmount}
              prefix="¥"
              precision={0}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="活跃订单"
              value={procurementStats.activeOrders}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待审批"
              value={procurementStats.pendingApprovals}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="平均交付天数"
              value={procurementStats.averageLeadTime}
              suffix="天"
            />
          </Col>
        </Row>
      </Card>
    );
  };

  const renderTimeline = () => (
    <Card title="关键事件时间线">
      <Timeline mode="left">
        <Timeline.Item color="green" label="今天 14:30">
          采购订单 PO-20250119-0001 已完成验收
        </Timeline.Item>
        <Timeline.Item color="blue" label="今天 10:15">
          项目进入施工阶段
        </Timeline.Item>
        <Timeline.Item color="orange" label="昨天 16:45">
          价格预警：钢材价格上涨15%
        </Timeline.Item>
        <Timeline.Item color="red" label="昨天 09:20">
          风险识别：供应商交付延迟风险
        </Timeline.Item>
        <Timeline.Item label="前天 11:30">
          完成设备选型评审
        </Timeline.Item>
      </Timeline>
    </Card>
  );

  return (
    <div className="analytics-dashboard">
      {/* 顶部工具栏 */}
      <Card className="dashboard-toolbar">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <DashboardOutlined className="dashboard-icon" />
              <h2 className="dashboard-title">数据分析中心</h2>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={selectedProject}
                onChange={setSelectedProject}
                style={{ width: 200 }}
                placeholder="选择项目"
              >
                <Select.Option value="all">所有项目</Select.Option>
                {projects.map(p => (
                  <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                ))}
              </Select>
              <RangePicker onChange={(dates) => setDateRange(dates as [any, any])} />
              <Button 
                type="primary" 
                icon={<SyncOutlined spin={refreshing} />}
                onClick={loadDashboardData}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 关键指标卡片 */}
      {renderOverviewCards()}

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="chart-section">
        <Col xs={24} lg={12}>
          {renderProgressChart()}
        </Col>
        <Col xs={24} lg={12}>
          {renderCostChart()}
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="chart-section">
        <Col xs={24} lg={8}>
          {renderRiskRadar()}
        </Col>
        <Col xs={24} lg={8}>
          {renderSystemHealth()}
        </Col>
        <Col xs={24} lg={8}>
          {renderTimeline()}
        </Col>
      </Row>

      {/* 详细信息区域 */}
      <Row gutter={[16, 16]} className="detail-section">
        <Col xs={24} lg={16}>
          {renderInsights()}
        </Col>
        <Col xs={24} lg={8}>
          {renderProcurementStats()}
        </Col>
      </Row>

      {/* 模块连接状态 */}
      <Card title="模块连接状态" className="connection-status-card">
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }}
          dataSource={connections}
          renderItem={(connection) => (
            <List.Item>
              <Card size="small">
                <div className="connection-card">
                  <Badge
                    status={
                      connection.status === 'active' ? 'success' :
                      connection.status === 'inactive' ? 'warning' :
                      'error'
                    }
                  />
                  <div className="connection-info">
                    <div className="connection-name">{connection.name}</div>
                    <div className="connection-route">
                      {connection.sourceModule} → {connection.targetModule}
                    </div>
                    <div className="connection-stats">
                      同步: {connection.syncCount || 0} 次
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
