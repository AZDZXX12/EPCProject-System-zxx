/**
 * 工业数字孪生监控界面
 * 参考山海鲸平台和工业监控系统设计
 */

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { 
  Card, Row, Col, Button, Tag, Space, DatePicker, Select, 
  Statistic, Badge, List, Avatar, Descriptions, Progress, Alert, Switch
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  WarningOutlined,
  FireOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  BarChartOutlined,
  LayoutOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  RiseOutlined,
  ProductOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useDigitalTwin } from '../../contexts/DigitalTwinContext';
import './IndustrialDashboard.css';

const { RangePicker } = DatePicker;

// 3D设备组件（简化版）
const Equipment3D: React.FC<any> = ({ equipment, position, isSelected, onClick }) => {
  const getColor = () => {
    switch (equipment.status) {
      case 'running': return '#52c41a';
      case 'idle': return '#1890ff';
      case 'warning': return '#faad14';
      case 'fault': return '#f5222d';
      default: return '#8c8c8c';
    }
  };


  return (
    <group position={position} onClick={onClick}>
      <mesh>
        <boxGeometry args={[1.2, 2, 1.2]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* 顶部指示灯 */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={equipment.status === 'running' ? 1.5 : 0.5}
        />
      </mesh>
      {/* 基座圆盘与外圈 */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 64]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.97, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.2, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={isSelected ? 0.5 : 0.25} />
      </mesh>
      {isSelected && (
        <mesh position={[0, -0.96, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.3, 64]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// 3D场景组件
const Scene3D: React.FC<{ equipmentList: any[]; selectedId: string | null; onSelect: (id: string | null) => void }> = ({
  equipmentList, selectedId, onSelect
}) => {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 15, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.6} color="#60a5fa" />
      <hemisphereLight args={['#87CEEB', '#545454', 0.4]} />
      <pointLight position={[0, 10, 0]} intensity={0.6} distance={30} decay={2} />
      <Environment preset="sunset" background={false} />
      
      <Grid
        args={[60, 60]}
        cellSize={3}
        cellThickness={0.4}
        cellColor="#0d1929"
        sectionSize={12}
        sectionThickness={1.4}
        sectionColor="#4580ff"
        fadeDistance={100}
        fadeStrength={1}
        infiniteGrid={true}
      />

      {equipmentList.map((equipment, index) => {
        const position: [number, number, number] = [
          (index % 3 - 1) * 4,
          1,
          Math.floor(index / 3) * 4 - 4
        ];
        return (
          <Equipment3D
            key={equipment.id}
            equipment={equipment}
            position={position}
            isSelected={selectedId === equipment.id}
            onClick={() => onSelect(selectedId === equipment.id ? null : equipment.id)}
          />
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
};

// 主组件
const IndustrialDashboard: React.FC = () => {
  const {
    equipmentList,
    selectedEquipmentId,
    selectEquipment,
    systemStats,
    alarms,
    isSimulatorRunning,
    startSimulator,
    stopSimulator
  } = useDigitalTwin();

  const [viewMode, setViewMode] = useState<'3d' | 'data' | 'split'>('split');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedEquipment = selectedEquipmentId
    ? equipmentList.find(eq => eq.id === selectedEquipmentId)
    : null;

  const unacknowledgedAlarms = alarms.filter(a => !a.acknowledged).length;

  // 统计各状态设备数量
  const statusCounts = {
    running: equipmentList.filter(e => e.status === 'running').length,
    idle: equipmentList.filter(e => e.status === 'idle').length,
    fault: equipmentList.filter(e => e.status === 'fault').length,
    maintenance: equipmentList.filter(e => e.status === 'warning').length
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'running':
        return 'status-running';
      case 'idle':
        return 'status-idle';
      case 'fault':
        return 'status-fault';
      case 'warning':
        return 'status-warning';
      default:
        return 'status-idle';
    }
  };

  const getEffClass = (value: number) => {
    if (value >= 85) return 'eff-green';
    if (value >= 60) return 'eff-yellow';
    return 'eff-red';
  };

  const getTypeIcon = (type: string): React.ReactNode => {
    const t = (type || '').toLowerCase();
    if (t.includes('pump')) return <RiseOutlined />;
    if (t.includes('tank')) return <AppstoreOutlined />;
    if (t.includes('compressor')) return <ThunderboltOutlined />;
    if (t.includes('separator')) return <ProductOutlined />;
    return <AppstoreOutlined />;
  };

  return (
    <div className="industrial-dashboard">
      {/* 顶部控制栏 */}
      <div className="top-control-bar">
        <div className="control-section">
          <div className="system-title">
            <span className="title-icon">🏭</span>
            <span className="title-text">工业数字孪生监控平台</span>
          </div>
          <Button
            type={isSimulatorRunning ? 'default' : 'primary'}
            size="large"
            icon={isSimulatorRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={isSimulatorRunning ? stopSimulator : startSimulator}
            className="action-btn"
          >
            {isSimulatorRunning ? '停止' : '启动'}
          </Button>
          <div className={`status-badge ${isSimulatorRunning ? 'running' : 'stopped'}`}>
            <span className="badge-dot"></span>
            <span className="badge-text">{isSimulatorRunning ? '运行中' : '已停止'}</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <ThunderboltOutlined className="stat-icon green" />
            <div className="stat-content">
              <div className="stat-label">运行设备</div>
              <div className="stat-value">{systemStats.runningCount}<span className="unit">台</span></div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <LineChartOutlined className="stat-icon blue" />
            <div className="stat-content">
              <div className="stat-label">系统效率</div>
              <div className="stat-value">{systemStats.totalEfficiency.toFixed(1)}<span className="unit">%</span></div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <FireOutlined className="stat-icon orange" />
            <div className="stat-content">
              <div className="stat-label">总功率</div>
              <div className="stat-value">{systemStats.totalPower.toFixed(1)}<span className="unit">kW</span></div>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <WarningOutlined className={`stat-icon ${unacknowledgedAlarms > 0 ? 'red pulse' : 'gray'}`} />
            <div className="stat-content">
              <div className="stat-label">未确认报警</div>
              <div className="stat-value">{unacknowledgedAlarms}<span className="unit">条</span></div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="current-time">
            <ClockCircleOutlined /> {currentTime.toLocaleString('zh-CN', { hour12: false })}
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="toolbar">
        <Space size="middle">
          <div className="view-switch">
            <Button
              className={`view-btn ${viewMode === '3d' ? 'active' : ''}`}
              icon={<EyeOutlined />}
              onClick={() => setViewMode('3d')}
            >
              3D视图
            </Button>
            <Button
              className={`view-btn ${viewMode === 'data' ? 'active' : ''}`}
              icon={<BarChartOutlined />}
              onClick={() => setViewMode('data')}
            >
              数据视图
            </Button>
            <Button
              className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
              icon={<LayoutOutlined />}
              onClick={() => setViewMode('split')}
            >
              分屏
            </Button>
          </div>

          <RangePicker showTime format="YYYY-MM-DD HH:mm" />

          <Select
            placeholder="全部设备"
            className="filter-select"
            options={[
              { label: '全部设备', value: 'all' },
              ...equipmentList.map(e => ({ label: e.name, value: e.id }))
            ]}
          />

          <Button type="primary" icon={<BarChartOutlined />}>分析</Button>

          <Button icon={<DownloadOutlined />}>导出</Button>
          <Button icon={<FullscreenOutlined />}>全屏</Button>
          <Button icon={<ReloadOutlined />}>刷新</Button>
        </Space>
      </div>

      {/* 主内容区域 */}
      <div className="main-content">
        {/* 3D场景 */}
        {(viewMode === '3d' || viewMode === 'split') && (
          <div className="scene-area">
            <div className="scene-hints">
              <span className="hint-chip">拖拽旋转</span>
              <span className="hint-chip">滚轮缩放</span>
              <span className="hint-chip">点击选择</span>
            </div>
            <Canvas
              camera={{ position: [12, 12, 12], fov: 50 }}
              shadows
              gl={{ antialias: true, alpha: false }}
            >
              <Scene3D
                equipmentList={equipmentList}
                selectedId={selectedEquipmentId}
                onSelect={selectEquipment}
              />
            </Canvas>
          </div>
        )}

        {/* 数据面板 - 右侧浮动 */}
        {(viewMode === 'data' || viewMode === 'split') && (
          <div className="data-panel-floating">
            {/* 系统概览 - 垂直大卡片 */}
            <div className="overview-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <span className="title-bar"></span>
                  系统概览
                </div>
              </div>
              
              <div className="big-metric-card green">
                <div className="metric-top">
                  <ThunderboltOutlined className="big-icon" />
                  <div className="metric-label">运行设备</div>
                </div>
                <div className="metric-bottom">
                  <div className="big-value">{systemStats.runningCount}</div>
                  <div className="metric-unit">台</div>
                </div>
              </div>

              <div className="big-metric-card blue">
                <div className="metric-top">
                  <SyncOutlined className="big-icon" />
                  <div className="metric-label">系统效率</div>
                </div>
                <div className="metric-bottom">
                  <div className="big-value">{systemStats.totalEfficiency.toFixed(1)}</div>
                  <div className="metric-unit">%</div>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar" style={{ width: `${systemStats.totalEfficiency}%` }}></div>
                </div>
              </div>

              <div className="big-metric-card orange">
                <div className="metric-top">
                  <FireOutlined className="big-icon" />
                  <div className="metric-label">总功率</div>
                </div>
                <div className="metric-bottom">
                  <div className="big-value">{systemStats.totalPower.toFixed(1)}</div>
                  <div className="metric-unit">kW</div>
                </div>
              </div>

              <div className="big-metric-card red">
                <div className="metric-top">
                  <WarningOutlined className="big-icon" />
                  <div className="metric-label">未确认报警</div>
                </div>
                <div className="metric-bottom">
                  <div className="big-value">{unacknowledgedAlarms}</div>
                  <div className="metric-unit">条</div>
                </div>
              </div>
            </div>

            {/* 设备详情 */}
            {selectedEquipment && (
              <Card title="设备详情" size="small" className="panel-card">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="设备名称">{selectedEquipment.name}</Descriptions.Item>
                  <Descriptions.Item label="设备类型">{selectedEquipment.type}</Descriptions.Item>
                  <Descriptions.Item label="运行状态">
                    <Badge
                      status={selectedEquipment.status === 'running' ? 'processing' : 'default'}
                      text={selectedEquipment.status}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="效率">
                    {selectedEquipment.efficiency}%
                    <Progress
                      percent={selectedEquipment.efficiency}
                      strokeColor="#1890ff"
                      showInfo={false}
                      size="small"
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* 设备列表 */}
            <Card title="设备列表" size="small" className="panel-card">
              <List
                size="small"
                dataSource={equipmentList}
                renderItem={item => (
                  <List.Item
                    className={selectedEquipmentId === item.id ? 'selected' : ''}
                    onClick={() => selectEquipment(item.id)}
                  >
                    <div className="device-row">
                      <div className={`device-status-icon ${getStatusClass(item.status)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="device-info">
                        <div className="device-title">{item.name}</div>
                        <div className="device-desc">{`${item.type} | ${item.status}`}</div>
                      </div>
                      <div className={`device-eff ${getEffClass(item.efficiency)}`}>{item.efficiency}%</div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            {/* 告警信息 */}
            {unacknowledgedAlarms > 0 && (
              <Card title={`告警信息 (${unacknowledgedAlarms})`} size="small" className="panel-card alarm-card">
                <List
                  size="small"
                  dataSource={alarms.filter(a => !a.acknowledged).slice(0, 5)}
                  renderItem={alarm => (
                    <List.Item>
                      <Alert
                        message={alarm.message}
                        type={alarm.level === 'CRITICAL' ? 'error' : 'warning'}
                        showIcon
                        className="full-width"
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustrialDashboard;
