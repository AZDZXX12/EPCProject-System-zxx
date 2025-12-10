import React, { useState } from 'react';
import {
  Tabs,
  Card,
  Row,
  Col,
  Space,
  Button,
  Badge,
  Tag,
  Tooltip,
  Typography,
  List
} from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
  ApiOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FireOutlined,
  LineChartOutlined,
  MonitorOutlined
} from '@ant-design/icons';
import { DigitalTwinProvider, useDigitalTwin } from '../contexts/DigitalTwinContext';
import ProfessionalDigitalTwin from '../components/DigitalTwin/ProfessionalDigitalTwin';
import EnhancedDigitalTwinDashboard from '../components/DigitalTwin/EnhancedDigitalTwinDashboard';
import Interactive3DScene from '../components/DigitalTwin/Interactive3DSceneSimple';
import IndustrialDashboard from '../components/DigitalTwin/IndustrialDashboard';
import './DigitalTwinDashboard.css';

const { Title, Text } = Typography;

const DigitalTwinContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('industrial');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(true);
  
  const { 
    isSimulatorRunning, 
    startSimulator, 
    stopSimulator,
    systemStats,
    alarms,
    equipmentList
  } = useDigitalTwin();

  const unacknowledgedAlarms = alarms.filter(alarm => !alarm.acknowledged);

  // 全屏切换
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setShowQuickStats(false);
    }
  };

  const summaryMetrics = [
    {
      key: 'running',
      label: '运行设备',
      value: systemStats.runningCount,
      unit: '台',
      icon: <ThunderboltOutlined />,
      trend: '+2 台',
      color: 'success'
    },
    {
      key: 'efficiency',
      label: '系统效率',
      value: systemStats.totalEfficiency.toFixed(1),
      unit: '%',
      icon: <LineChartOutlined />,
      trend: '+1.4%',
      color: 'processing'
    },
    {
      key: 'power',
      label: '总功率',
      value: systemStats.totalPower.toFixed(1),
      unit: 'kW',
      icon: <FireOutlined />,
      trend: '连续稳定',
      color: 'warning'
    },
    {
      key: 'alarm',
      label: '未确认报警',
      value: unacknowledgedAlarms.length,
      unit: '条',
      icon: <WarningOutlined />,
      trend: unacknowledgedAlarms.length > 0 ? '需关注' : '全部清空',
      color: unacknowledgedAlarms.length > 0 ? 'error' : 'default'
    }
  ];

  const alarmPreview = unacknowledgedAlarms.slice(0, 4);
  const equipmentPreview = equipmentList.slice(0, 4);

  const tabItems = [
    {
      key: 'industrial',
      label: (
        <span>
          <DashboardOutlined />
          工业监控
        </span>
      ),
      children: <IndustrialDashboard />
    },
    {
      key: 'professional',
      label: (
        <span>
          <RobotOutlined />
          专业监控
        </span>
      ),
      children: <ProfessionalDigitalTwin />
    },
    {
      key: 'interactive3d',
      label: (
        <span>
          <ApiOutlined />
          3D可视化
        </span>
      ),
      children: <Interactive3DScene />
    },
    {
      key: 'enhanced',
      label: (
        <span>
          <RobotOutlined />
          PLC控制
        </span>
      ),
      children: <EnhancedDigitalTwinDashboard />
    }
  ];

  return (
    <div className={`digital-twin-dashboard ${isFullscreen ? 'dt-fullscreen' : ''}`}>
      {!isFullscreen && (
        <section className="dt-hero-card">
          <div className="dt-hero-content">
            <p className="dt-eyebrow">项目模块 · 数字孪生</p>
            <Title level={2} className="dt-hero-title">
              数字孪生驾驶舱
            </Title>
            <Text className="dt-hero-desc">
              统一监控 3D 场景、工艺数据与 PLC 控制，实现项目态势的一屏掌握。
              支持快照对比、趋势分析和跨模块联动。
            </Text>
            <div className="dt-hero-meta">
              <span>
                <CheckCircleOutlined />
                {systemStats.runningCount} 台正在运行
              </span>
              <span>
                <MonitorOutlined />
                {systemStats.totalPower.toFixed(1)} kW 载荷
              </span>
              <span>
                <ThunderboltOutlined />
                效率 {systemStats.totalEfficiency.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="dt-hero-actions">
            <Tag color={isSimulatorRunning ? 'green' : 'default'}>
              {isSimulatorRunning ? '实时模拟 · ON' : '实时模拟 · OFF'}
            </Tag>
            <Space size="middle" wrap>
              <Button
                type={isSimulatorRunning ? 'default' : 'primary'}
                icon={isSimulatorRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={isSimulatorRunning ? stopSimulator : startSimulator}
                size="large"
              >
                {isSimulatorRunning ? '停止模拟' : '启动模拟'}
              </Button>
              <Tooltip title="切换到专业监控视图">
                <Button
                  icon={<RobotOutlined />}
                  onClick={() => setActiveTab('professional')}
                  size="large"
                >
                  专业模式
                </Button>
              </Tooltip>
              <Tooltip title="打开 PLC 控制台">
                <Button
                  icon={<ApiOutlined />}
                  onClick={() => setActiveTab('enhanced')}
                  size="large"
                >
                  PLC 控制
                </Button>
              </Tooltip>
            </Space>
          </div>
        </section>
      )}

      {showQuickStats && !isFullscreen && (
        <Row gutter={[16, 16]} className="dt-summary-row">
          {summaryMetrics.map(metric => (
            <Col xs={24} sm={12} md={6} key={metric.key}>
              <Card className="dt-metric-card" hoverable>
                <div className="dt-metric-icon">{metric.icon}</div>
                <div className="dt-metric-body">
                  <div className="dt-metric-label">{metric.label}</div>
                  <div className="dt-metric-value">
                    {metric.value}
                    <span className="dt-metric-unit">{metric.unit}</span>
                  </div>
                  <div className={`dt-metric-trend trend-${metric.color}`}>
                    {metric.trend}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="dt-layout">
        <div className="dt-main-column">
          <Card className="dt-tabs-card" styles={{ body: { padding: 0 } }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              animated={{ inkBar: true, tabPane: true }}
              items={tabItems}
              className="digital-twin-tabs"
            />
          </Card>
        </div>
        <div className="dt-side-column">
          <Card
            title={
              <Space>
                <WarningOutlined />
                实时告警
                <Tag color={alarmPreview.length > 0 ? 'red' : 'green'}>
                  {alarmPreview.length > 0 ? `${alarmPreview.length} 条待处理` : '全部正常'}
                </Tag>
              </Space>
            }
            size="small"
            className="dt-side-card"
          >
            {alarmPreview.length === 0 ? (
              <div className="dt-empty-state">
                <CheckCircleOutlined />
                <span>暂无未确认告警</span>
              </div>
            ) : (
              <List
                dataSource={alarmPreview}
                split={false}
                renderItem={(alarm) => (
                  <List.Item className="dt-alarm-item">
                    <Tag color={alarm.level === 'CRITICAL' ? 'red' : 'orange'}>
                      {alarm.level}
                    </Tag>
                    <div className="dt-alarm-info">
                      <div className="dt-alarm-message">{alarm.message}</div>
                      <div className="dt-alarm-meta">
                        {alarm.device} · {new Date(alarm.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card
            title={
              <Space>
                <DashboardOutlined />
                关键设备概览
              </Space>
            }
            size="small"
            className="dt-side-card"
          >
            <List
              dataSource={equipmentPreview}
              split={false}
              renderItem={(equipment) => (
                <List.Item className="dt-equipment-item">
                  <div>
                    <div className="dt-equipment-name">{equipment.name}</div>
                    <div className="dt-equipment-meta">{equipment.type}</div>
                  </div>
                  <Space size="small">
                    <Badge status={equipment.status === 'running' ? 'processing' : equipment.status === 'warning' ? 'warning' : 'default'} text={equipment.status} />
                    <span className="dt-equipment-eff">{equipment.efficiency}%</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

// 导出包装了Provider的组件
const DigitalTwinDashboard: React.FC = () => {
  return (
    <DigitalTwinProvider>
      <DigitalTwinContent />
    </DigitalTwinProvider>
  );
};

export default DigitalTwinDashboard;
