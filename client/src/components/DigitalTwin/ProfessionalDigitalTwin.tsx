/**
 * 专业级数字孪生系统
 * 参考: Siemens MindSphere, GE Predix, 阿里云IoT平台
 * 特点: 实时监控、智能分析、预测性维护、能效管理
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Row, Col, Tabs, Statistic, Badge, Space, Button, Tag, Tooltip,
  Select, DatePicker, Switch, Progress, Timeline, Table, Alert, Drawer,
  Descriptions, Modal, message, InputNumber
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  AlertOutlined,
  SafetyOutlined,
  ApiOutlined,
  CloudServerOutlined,
  MonitorOutlined,
  RobotOutlined,
  FireOutlined,
  LineChartOutlined,
  FundOutlined,
  ControlOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Column, Gauge, Area } from '@ant-design/plots';
import dayjs from 'dayjs';
import { plcSimulator } from '../../services/plcSimulator';
import type { PLCDataPoint, SCADAAlarm } from '../../types/industrial';
import './ProfessionalDigitalTwin.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface EquipmentStatus {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'fault' | 'maintenance';
  efficiency: number;
  temperature: number;
  vibration: number;
  power: number;
  runningHours: number;
  lastMaintenance: string;
}

interface EnergyData {
  timestamp: number;
  electricity: number;
  water: number;
  gas: number;
}

interface QualityMetrics {
  passRate: number;
  defectRate: number;
  avgCycleTime: number;
  yield: number;
}

const ProfessionalDigitalTwin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<EquipmentStatus | null>(null);
  
  // 实时数据
  const [realTimeData, setRealTimeData] = useState<PLCDataPoint[]>([]);
  const [alarms, setAlarms] = useState<SCADAAlarm[]>([]);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  
  // 设备状态
  const [equipmentList, setEquipmentList] = useState<EquipmentStatus[]>([
    {
      id: 'EQ001',
      name: '聚合反应釜',
      status: 'running',
      efficiency: 92.5,
      temperature: 85.3,
      vibration: 0.5,
      power: 45.2,
      runningHours: 2450,
      lastMaintenance: '2024-11-15'
    },
    {
      id: 'EQ002',
      name: '离心泵组',
      status: 'running',
      efficiency: 88.7,
      temperature: 62.1,
      vibration: 0.3,
      power: 32.8,
      runningHours: 3200,
      lastMaintenance: '2024-11-10'
    },
    {
      id: 'EQ003',
      name: '换热器',
      status: 'running',
      efficiency: 95.2,
      temperature: 75.4,
      vibration: 0.2,
      power: 18.5,
      runningHours: 2100,
      lastMaintenance: '2024-11-20'
    },
    {
      id: 'EQ004',
      name: '压缩机',
      status: 'idle',
      efficiency: 0,
      temperature: 35.2,
      vibration: 0.1,
      power: 2.3,
      runningHours: 1850,
      lastMaintenance: '2024-11-18'
    },
    {
      id: 'EQ005',
      name: '储罐',
      status: 'running',
      efficiency: 78.3,
      temperature: 45.6,
      vibration: 0.0,
      power: 5.2,
      runningHours: 4500,
      lastMaintenance: '2024-11-05'
    },
    {
      id: 'EQ006',
      name: '分离器',
      status: 'maintenance',
      efficiency: 0,
      temperature: 28.5,
      vibration: 0.0,
      power: 0.5,
      runningHours: 2800,
      lastMaintenance: '2024-11-24'
    }
  ]);

  // 质量指标
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    passRate: 98.5,
    defectRate: 1.5,
    avgCycleTime: 45.2,
    yield: 96.8
  });

  // 系统统计
  const [systemStats, setSystemStats] = useState({
    totalEquipment: 6,
    runningEquipment: 3,
    idleEquipment: 1,
    faultEquipment: 0,
    maintenanceEquipment: 2,
    avgEfficiency: 85.6,
    energyConsumption: 124.5,
    productionOutput: 1250,
    oee: 82.4, // Overall Equipment Effectiveness
    availability: 95.2,
    performance: 89.5,
    quality: 96.8
  });

  useEffect(() => {
    // 初始化模拟器
    const handleDataUpdate = (data: PLCDataPoint) => {
      setRealTimeData(prev => {
        const updated = prev.map(item => item.id === data.id ? data : item);
        if (!updated.find(item => item.id === data.id)) {
          updated.push(data);
        }
        return updated.slice(-20);
      });

      // 更新趋势数据
      setTrendData(prev => {
        const newPoint = {
          timestamp: Date.now(),
          value: data.value as number,
          type: data.name
        };
        return [...prev, newPoint].slice(-50);
      });
    };

    plcSimulator.addListener(handleDataUpdate);
    
    // 模拟能源数据
    const energyInterval = setInterval(() => {
      setEnergyData(prev => {
        const newData: EnergyData = {
          timestamp: Date.now(),
          electricity: 120 + Math.random() * 20,
          water: 45 + Math.random() * 10,
          gas: 35 + Math.random() * 8
        };
        return [...prev, newData].slice(-30);
      });
    }, 5000);

    return () => {
      plcSimulator.removeListener(handleDataUpdate);
      clearInterval(energyInterval);
    };
  }, []);

  // 启动/停止模拟器
  const toggleSimulator = () => {
    if (isSimulatorRunning) {
      plcSimulator.stop();
      message.success('模拟器已停止');
    } else {
      plcSimulator.start(1000);
      message.success('模拟器已启动');
    }
    setIsSimulatorRunning(!isSimulatorRunning);
  };

  // 查看设备详情
  const viewDeviceDetails = (device: EquipmentStatus) => {
    setSelectedDevice(device);
    setDrawerVisible(true);
  };

  // 导出报表
  const exportReport = () => {
    message.success('报表导出成功');
  };

  // 刷新数据
  const refreshData = () => {
    message.info('正在刷新数据...');
    // 模拟刷新
    setTimeout(() => {
      message.success('数据刷新完成');
    }, 1000);
  };

  // 设备状态表格列
  const equipmentColumns = [
    {
      title: '设备编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          running: { color: 'green', text: '运行中' },
          idle: { color: 'blue', text: '待机' },
          fault: { color: 'red', text: '故障' },
          maintenance: { color: 'orange', text: '维护中' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 100,
      render: (val: number) => (
        <Progress
          percent={val}
          size="small"
          strokeColor={val > 90 ? '#52c41a' : val > 70 ? '#faad14' : '#f5222d'}
        />
      )
    },
    {
      title: '温度(°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100,
      render: (val: number) => <span>{val.toFixed(1)}</span>
    },
    {
      title: '功率(kW)',
      dataIndex: 'power',
      key: 'power',
      width: 100,
      render: (val: number) => <span>{val.toFixed(1)}</span>
    },
    {
      title: '运行时长(h)',
      dataIndex: 'runningHours',
      key: 'runningHours',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: EquipmentStatus) => (
        <Button type="link" size="small" onClick={() => viewDeviceDetails(record)}>
          详情
        </Button>
      )
    }
  ];

  // 趋势图配置
  const trendChartConfig = {
    data: trendData,
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    xAxis: {
      type: 'time',
      tickCount: 5,
    },
  };

  // 能源消耗图配置
  const energyChartConfig = {
    data: energyData.flatMap(item => [
      { time: item.timestamp, type: '电力', value: item.electricity },
      { time: item.timestamp, type: '水', value: item.water },
      { time: item.timestamp, type: '天然气', value: item.gas }
    ]),
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    xAxis: {
      type: 'time',
    },
  };

  return (
    <div className={`professional-digital-twin ${fullscreen ? 'fullscreen' : ''}`}>
      {/* 顶部工具栏 */}
      <Card className="toolbar-card" size="small">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <div className="system-brand">
                <RobotOutlined className="brand-icon" />
                <span className="brand-text">工业数字孪生平台</span>
                <Tag color={isSimulatorRunning ? 'processing' : 'default'}>
                  {isSimulatorRunning ? '实时运行' : '离线'}
                </Tag>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <RangePicker
                value={timeRange}
                onChange={(dates) => dates && setTimeRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                size="small"
              />
              <Select
                value={selectedEquipment}
                onChange={setSelectedEquipment}
                style={{ width: 150 }}
                size="small"
              >
                <Option value="all">全部设备</Option>
                {equipmentList.map(eq => (
                  <Option key={eq.id} value={eq.id}>{eq.name}</Option>
                ))}
              </Select>
              <Tooltip title="刷新数据">
                <Button icon={<ReloadOutlined />} onClick={refreshData} size="small" />
              </Tooltip>
              <Tooltip title="导出报表">
                <Button icon={<DownloadOutlined />} onClick={exportReport} size="small" />
              </Tooltip>
              <Tooltip title="全屏">
                <Button 
                  icon={<FullscreenOutlined />} 
                  onClick={() => setFullscreen(!fullscreen)} 
                  size="small"
                />
              </Tooltip>
              <Button
                type={isSimulatorRunning ? 'default' : 'primary'}
                icon={isSimulatorRunning ? <SyncOutlined spin /> : <ThunderboltOutlined />}
                onClick={toggleSimulator}
              >
                {isSimulatorRunning ? '停止' : '启动'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} className="kpi-cards">
        <Col xs={24} sm={12} md={6}>
          <Card className="kpi-card kpi-blue" hoverable>
            <Statistic
              title="设备总数"
              value={systemStats.totalEquipment}
              suffix="台"
              prefix={<MonitorOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="kpi-footer">
              <span>运行: {systemStats.runningEquipment}</span>
              <span>待机: {systemStats.idleEquipment}</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="kpi-card kpi-green" hoverable>
            <Statistic
              title="设备综合效率(OEE)"
              value={systemStats.oee}
              suffix="%"
              prefix={<FundOutlined />}
              valueStyle={{ color: '#52c41a' }}
              precision={1}
            />
            <div className="kpi-footer">
              <span>可用性: {systemStats.availability}%</span>
              <span>性能: {systemStats.performance}%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="kpi-card kpi-orange" hoverable>
            <Statistic
              title="能源消耗"
              value={systemStats.energyConsumption}
              suffix="kWh"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#faad14' }}
              precision={1}
            />
            <div className="kpi-footer">
              <span>日均: 124.5 kWh</span>
              <span>月均: 3,735 kWh</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="kpi-card kpi-purple" hoverable>
            <Statistic
              title="生产产量"
              value={systemStats.productionOutput}
              suffix="件"
              prefix={<ControlOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="kpi-footer">
              <span>合格率: {qualityMetrics.passRate}%</span>
              <span>良率: {qualityMetrics.yield}%</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card className="main-content-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* 实时监控 */}
          <TabPane tab={<span><DashboardOutlined />实时监控</span>} key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="实时趋势分析" size="small" extra={<Tag color="processing">实时更新</Tag>}>
                  <div className="chart-wrapper">
                    {trendData.length > 0 ? (
                      <Line {...trendChartConfig} height={300} />
                    ) : (
                      <div className="empty-chart">
                        <LineChartOutlined />
                        <div>启动模拟器查看实时数据</div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="设备状态分布" size="small">
                  <div className="status-grid">
                    <div className="status-item status-running">
                      <div className="status-icon">
                        <CheckCircleOutlined />
                      </div>
                      <div className="status-info">
                        <div className="status-value">{systemStats.runningEquipment}</div>
                        <div className="status-label">运行中</div>
                      </div>
                    </div>
                    <div className="status-item status-idle">
                      <div className="status-icon">
                        <ClockCircleOutlined />
                      </div>
                      <div className="status-info">
                        <div className="status-value">{systemStats.idleEquipment}</div>
                        <div className="status-label">待机</div>
                      </div>
                    </div>
                    <div className="status-item status-fault">
                      <div className="status-icon">
                        <WarningOutlined />
                      </div>
                      <div className="status-info">
                        <div className="status-value">{systemStats.faultEquipment}</div>
                        <div className="status-label">故障</div>
                      </div>
                    </div>
                    <div className="status-item status-maintenance">
                      <div className="status-icon">
                        <SettingOutlined />
                      </div>
                      <div className="status-info">
                        <div className="status-value">{systemStats.maintenanceEquipment}</div>
                        <div className="status-label">维护中</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24}>
                <Card title="设备监控列表" size="small">
                  <Table
                    columns={equipmentColumns}
                    dataSource={equipmentList}
                    rowKey="id"
                    size="small"
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 能效分析 */}
          <TabPane tab={<span><BarChartOutlined />能效分析</span>} key="energy">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="能源消耗趋势" size="small">
                  <div className="chart-wrapper">
                    {energyData.length > 0 ? (
                      <Area {...energyChartConfig} height={300} />
                    ) : (
                      <div className="empty-chart">
                        <BarChartOutlined />
                        <div>等待能源数据加载...</div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="能效指标" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                      <div className="metric-label">电力消耗</div>
                      <Progress
                        percent={75}
                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                        format={() => '124.5 kWh'}
                      />
                    </div>
                    <div>
                      <div className="metric-label">水消耗</div>
                      <Progress
                        percent={60}
                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                        format={() => '45.2 m³'}
                      />
                    </div>
                    <div>
                      <div className="metric-label">天然气消耗</div>
                      <Progress
                        percent={45}
                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                        format={() => '35.8 m³'}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 质量分析 */}
          <TabPane tab={<span><ExperimentOutlined />质量分析</span>} key="quality">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Card>
                  <Statistic
                    title="合格率"
                    value={qualityMetrics.passRate}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card>
                  <Statistic
                    title="缺陷率"
                    value={qualityMetrics.defectRate}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card>
                  <Statistic
                    title="平均周期时间"
                    value={qualityMetrics.avgCycleTime}
                    suffix="秒"
                    precision={1}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card>
                  <Statistic
                    title="良率"
                    value={qualityMetrics.yield}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 报警管理 */}
          <TabPane tab={<span><AlertOutlined />报警管理</span>} key="alarms">
            <Card>
              <Timeline>
                {alarms.length > 0 ? alarms.map(alarm => (
                  <Timeline.Item
                    key={alarm.id}
                    color={alarm.level === 'CRITICAL' ? 'red' : 'orange'}
                    dot={<WarningOutlined />}
                  >
                    <div>
                      <Space>
                        <Tag color={alarm.level === 'CRITICAL' ? 'red' : 'orange'}>
                          {alarm.level}
                        </Tag>
                        <strong>{alarm.message}</strong>
                      </Space>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        {alarm.device} | {new Date(alarm.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </Timeline.Item>
                )) : (
                  <div className="empty-state">
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                    <div>系统运行正常，暂无报警</div>
                  </div>
                )}
              </Timeline>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 设备详情抽屉 */}
      <Drawer
        title="设备详情"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedDevice && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="设备编号">{selectedDevice.id}</Descriptions.Item>
              <Descriptions.Item label="设备名称">{selectedDevice.name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status="processing" text="运行中" />
              </Descriptions.Item>
              <Descriptions.Item label="效率">{selectedDevice.efficiency}%</Descriptions.Item>
              <Descriptions.Item label="温度">{selectedDevice.temperature}°C</Descriptions.Item>
              <Descriptions.Item label="振动">{selectedDevice.vibration} mm/s</Descriptions.Item>
              <Descriptions.Item label="功率">{selectedDevice.power} kW</Descriptions.Item>
              <Descriptions.Item label="运行时长">{selectedDevice.runningHours} h</Descriptions.Item>
              <Descriptions.Item label="最后维护" span={2}>
                {selectedDevice.lastMaintenance}
              </Descriptions.Item>
            </Descriptions>

            <Card title="实时参数" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div>温度</div>
                  <Progress percent={85} strokeColor="#ff4d4f" />
                </div>
                <div>
                  <div>压力</div>
                  <Progress percent={72} strokeColor="#1890ff" />
                </div>
                <div>
                  <div>流量</div>
                  <Progress percent={68} strokeColor="#52c41a" />
                </div>
              </Space>
            </Card>

            <Card title="维护建议" size="small">
              <Alert
                message="预防性维护提醒"
                description="该设备预计在200小时后需要进行例行维护检查"
                type="warning"
                showIcon
              />
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default ProfessionalDigitalTwin;
