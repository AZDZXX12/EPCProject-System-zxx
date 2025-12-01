import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, Row, Col, Tabs, Button, Switch, Badge, Statistic, Progress, 
  Timeline, Alert, Space, Tag, Tooltip, Drawer, Modal, Select, Slider 
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SettingOutlined,
  FullscreenOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FireOutlined,
  CloudOutlined,
  BugOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import PLCControlPanel from './PLCControlPanel';
import SCADADashboard from './SCADADashboard';
import EnhancedScene3D from './EnhancedScene3D';
import { plcSimulator } from '../../services/plcSimulator';
import type { PLCDataPoint, SCADAAlarm } from '../../types/industrial';
import './EnhancedDigitalTwinDashboard.css';

const { Option } = Select;

interface RealTimeData {
  timestamp: number;
  temperature: number;
  pressure: number;
  flow: number;
  level: number;
}

const EnhancedDigitalTwinDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData[]>([]);
  const [currentData, setCurrentData] = useState<PLCDataPoint[]>([]);
  const [alarms, setAlarms] = useState<SCADAAlarm[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(1000);
  const [selectedDevice, setSelectedDevice] = useState('all');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 系统统计数据
  const [systemStats, setSystemStats] = useState({
    totalDevices: 12,
    onlineDevices: 10,
    offlineDevices: 2,
    criticalAlarms: 1,
    warnings: 3,
    systemHealth: 95.8,
    dataPoints: 48,
    throughput: 1250,
    uptime: 99.2
  });

  // 初始化模拟器
  useEffect(() => {
    const handleDataUpdate = (data: PLCDataPoint) => {
      setCurrentData(prev => {
        const updated = prev.map(item => item.id === data.id ? data : item);
        if (!updated.find(item => item.id === data.id)) {
          updated.push(data);
        }
        return updated;
      });

      // 更新实时趋势数据
      if (data.type === 'REAL') {
        setRealTimeData(prev => {
          const newPoint: RealTimeData = {
            timestamp: Date.now(),
            temperature: data.id === 'temp_1' ? data.value as number : prev[prev.length - 1]?.temperature || 85,
            pressure: data.id === 'pressure_1' ? data.value as number : prev[prev.length - 1]?.pressure || 2.5,
            flow: data.id === 'flow_1' ? data.value as number : prev[prev.length - 1]?.flow || 120,
            level: data.id === 'level_1' ? data.value as number : prev[prev.length - 1]?.level || 65
          };
          
          const updated = [...prev, newPoint];
          return updated.slice(-50); // 保留最近50个数据点
        });
      }
    };

    plcSimulator.addListener(handleDataUpdate);
    
    // 加载初始数据
    const initialData = plcSimulator.getAllDataPoints();
    setCurrentData(initialData);
    
    // 加载报警数据
    const initialAlarms = plcSimulator.getAlarms();
    setAlarms(initialAlarms);

    return () => {
      plcSimulator.removeListener(handleDataUpdate);
    };
  }, []);

  // 启动/停止模拟器
  const toggleSimulator = () => {
    if (isSimulatorRunning) {
      plcSimulator.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      plcSimulator.start(updateInterval);
      // 定期更新报警和统计数据
      intervalRef.current = setInterval(() => {
        setAlarms(plcSimulator.getAlarms());
        // 模拟系统统计数据变化
        setSystemStats(prev => ({
          ...prev,
          throughput: prev.throughput + (Math.random() - 0.5) * 100,
          systemHealth: Math.max(90, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2))
        }));
      }, 5000);
    }
    setIsSimulatorRunning(!isSimulatorRunning);
  };

  // 重置系统
  const resetSystem = () => {
    plcSimulator.reset();
    setRealTimeData([]);
    setCurrentData([]);
    setAlarms([]);
  };

  // 趋势图配置
  const trendConfig = {
    data: realTimeData.length > 0 ? realTimeData : [],
    xField: 'timestamp',
    yField: 'temperature',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: '#1890ff',
    xAxis: {
      type: 'time',
      tickCount: 5,
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v}°C`,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: '温度',
          value: `${(datum?.temperature || 0).toFixed(1)}°C`,
        };
      },
    },
  };

  // 简化的数据处理
  const healthPercent = systemStats.systemHealth || 95.8;
  const levelValue = currentData.find(d => d.id === 'level_1')?.value as number || 65;

  return (
    <div className={`enhanced-digital-twin ${fullscreenMode ? 'fullscreen' : ''}`}>
      {/* 顶部控制栏 */}
      <Card className="control-header" size="small">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <div className="system-title">
                <RobotOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 'bold' }}>
                  数字孪生控制中心
                </span>
                <Badge 
                  status={isSimulatorRunning ? 'processing' : 'default'} 
                  text={isSimulatorRunning ? '运行中' : '已停止'}
                  style={{ marginLeft: '12px' }}
                />
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="系统设置">
                <Button 
                  icon={<SettingOutlined />} 
                  onClick={() => setSettingsVisible(true)}
                />
              </Tooltip>
              <Tooltip title={fullscreenMode ? '退出全屏' : '全屏显示'}>
                <Button 
                  icon={<FullscreenOutlined />} 
                  onClick={() => setFullscreenMode(!fullscreenMode)}
                />
              </Tooltip>
              <Tooltip title="重置系统">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={resetSystem}
                />
              </Tooltip>
              <Button
                type={isSimulatorRunning ? 'default' : 'primary'}
                icon={isSimulatorRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleSimulator}
                size="large"
              >
                {isSimulatorRunning ? '停止' : '启动'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 系统概览卡片 */}
      <Row gutter={[16, 16]} className="overview-cards">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="在线设备"
              value={systemStats.onlineDevices}
              suffix={`/ ${systemStats.totalDevices}`}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="数据吞吐"
              value={systemStats.throughput}
              suffix="点/秒"
              valueStyle={{ color: '#1890ff' }}
              prefix={<CloudOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="系统运行时间"
              value={systemStats.uptime}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="活跃报警"
              value={alarms.filter(a => !a.acknowledged).length}
              valueStyle={{ 
                color: alarms.filter(a => !a.acknowledged).length > 0 ? '#cf1322' : '#52c41a' 
              }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card className="main-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          tabBarExtraContent={
            <Space>
              <Select
                value={selectedDevice}
                onChange={setSelectedDevice}
                style={{ width: 120 }}
                size="small"
              >
                <Option value="all">所有设备</Option>
                <Option value="PLC-001">PLC-001</Option>
                <Option value="PUMP-001">泵-001</Option>
                <Option value="VALVE-001">阀门-001</Option>
              </Select>
              <Tag color={isSimulatorRunning ? 'green' : 'red'}>
                {isSimulatorRunning ? '实时' : '离线'}
              </Tag>
            </Space>
          }
          items={[
            {
              key: 'overview',
              label: <span><DashboardOutlined />系统概览</span>,
              children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="系统健康度" size="small">
                  <div className="chart-container">
                    <div className="progress-container">
                      <Progress
                        type="circle"
                        percent={healthPercent}
                        size={120}
                        strokeColor={{
                          '0%': '#F4664A',
                          '50%': '#FAAD14',
                          '100%': '#30BF78',
                        }}
                        format={() => `${healthPercent.toFixed(1)}%`}
                      />
                      <div className="progress-label">
                        系统运行状态
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="储罐液位" size="small">
                  <div className="chart-container">
                    <div className="progress-container">
                      <Progress
                        type="circle"
                        percent={levelValue}
                        size={120}
                        strokeColor="#1890ff"
                        format={() => `${levelValue.toFixed(1)}%`}
                      />
                      <div className="progress-label">
                        储罐液位状态
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="实时趋势" size="small">
                  <div className="trend-chart-container">
                    {realTimeData.length > 0 ? (
                      <Line {...trendConfig} />
                    ) : (
                      <div className="empty-chart">
                        <BugOutlined />
                        <div>启动模拟器以查看实时数据</div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
              )
            },
            {
              key: 'plc',
              label: <span><ThunderboltOutlined />PLC控制</span>,
              children: <PLCControlPanel deviceId="PLC-001" />
            },
            {
              key: 'scada',
              label: <span><FireOutlined />SCADA监控</span>,
              children: <SCADADashboard />
            },
            {
              key: '3d',
              label: <span><EyeOutlined />3D可视化</span>,
              children: (
                <div className="visualization-3d">
                  <EnhancedScene3D />
                </div>
              )
            },
            {
              key: 'alarms',
              label: <span><WarningOutlined />报警中心</span>,
              children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <Card title="报警列表" size="small">
                  <Timeline>
                    {alarms.length > 0 ? alarms.map(alarm => (
                      <Timeline.Item
                        key={alarm.id}
                        color={alarm.level === 'CRITICAL' ? 'red' : alarm.level === 'HIGH' ? 'orange' : 'blue'}
                        dot={alarm.acknowledged ? <CheckCircleOutlined /> : <WarningOutlined />}
                      >
                        <div>
                          <Space>
                            <Tag color={alarm.level === 'CRITICAL' ? 'red' : 'orange'}>
                              {alarm.level}
                            </Tag>
                            <strong>{alarm.message}</strong>
                          </Space>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            设备: {alarm.device} | {new Date(alarm.timestamp).toLocaleString()}
                          </div>
                          {alarm.acknowledged && (
                            <div style={{ fontSize: '11px', color: '#52c41a', marginTop: '2px' }}>
                              已确认 by {alarm.acknowledgedBy}
                            </div>
                          )}
                        </div>
                      </Timeline.Item>
                    )) : (
                      <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                        <CheckCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <div>系统运行正常，暂无报警</div>
                      </div>
                    )}
                  </Timeline>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card title="报警统计" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic
                      title="严重报警"
                      value={alarms.filter(a => a.level === 'CRITICAL' && !a.acknowledged).length}
                      valueStyle={{ color: '#cf1322' }}
                    />
                    <Statistic
                      title="高级报警"
                      value={alarms.filter(a => a.level === 'HIGH' && !a.acknowledged).length}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                    <Statistic
                      title="已确认报警"
                      value={alarms.filter(a => a.acknowledged).length}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Space>
                </Card>
              </Col>
            </Row>
              )
            }
          ]}
        />
      </Card>

      {/* 设置抽屉 */}
      <Drawer
        title="系统设置"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <h4>数据更新频率</h4>
            <Slider
              min={500}
              max={5000}
              step={500}
              value={updateInterval}
              onChange={setUpdateInterval}
              marks={{
                500: '0.5s',
                1000: '1s',
                2000: '2s',
                5000: '5s'
              }}
            />
          </div>
          
          <div>
            <h4>显示选项</h4>
            <Space direction="vertical">
              <Switch 
                checkedChildren="全屏模式" 
                unCheckedChildren="窗口模式"
                checked={fullscreenMode}
                onChange={setFullscreenMode}
              />
              <Switch 
                checkedChildren="自动刷新" 
                unCheckedChildren="手动刷新"
                checked={isSimulatorRunning}
                onChange={toggleSimulator}
              />
            </Space>
          </div>

          <div>
            <h4>系统操作</h4>
            <Space direction="vertical" className="settings-section">
              <Button block onClick={resetSystem}>
                重置系统数据
              </Button>
              <Button block type="primary" onClick={() => setSettingsVisible(false)}>
                应用设置
              </Button>
            </Space>
          </div>
        </Space>
      </Drawer>
    </div>
  );
};

export default EnhancedDigitalTwinDashboard;
