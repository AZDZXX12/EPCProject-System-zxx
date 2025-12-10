import React, { useState } from 'react';
import { Card, List, Badge, Space, Descriptions, Progress, Avatar, Alert, Row, Col, Statistic, message } from 'antd';
import {
  AppstoreOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  ProductOutlined,
  WarningOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { DigitalTwinProvider, useDigitalTwin } from '../contexts/DigitalTwinContext';
import TopControlBar from '../components/DigitalTwin/TopControlBar';
import DashboardToolbar from '../components/DigitalTwin/DashboardToolbar';
import BottomStats from '../components/DigitalTwin/BottomStats';
import Interactive3DScene from '../components/DigitalTwin/Interactive3DSceneSimple';
import './NewDigitalTwinDashboard.css';

const NewDigitalTwinContent: React.FC = () => {
  const {
    isSimulatorRunning,
    startSimulator,
    stopSimulator,
    systemStats,
    alarms,
    equipmentList
  } = useDigitalTwin();

  const [viewMode, setViewMode] = useState<'scene' | 'data' | 'split'>('scene');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  const handleToggleSimulator = () => {
    if (isSimulatorRunning) {
      stopSimulator();
      message.success('模拟器已停止');
    } else {
      startSimulator();
      message.success('模拟器已启动');
    }
  };

  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleRefresh = () => {
    message.success('数据已刷新');
  };

  const handleStatusClick = (status: string) => {
    const filtered = equipmentList
      .filter(eq => {
        if (status === 'running') return eq.status === 'running';
        if (status === 'idle') return eq.status === 'idle';
        if (status === 'fault') return eq.status === 'fault' || eq.status === 'offline';
        if (status === 'maintenance') return eq.status === 'warning';
        return false;
      })
      .map(eq => eq.id);
    setSelectedEquipment(filtered);
    message.info(`已筛选${filtered.length}台${getStatusLabel(status)}设备`);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      running: '运行中',
      idle: '待机',
      fault: '故障',
      maintenance: '维护中'
    };
    return labels[status] || status;
  };

  const equipmentOptions = equipmentList.map(eq => ({
    label: eq.name,
    value: eq.id
  }));

  const unacknowledgedAlarms = alarms.filter(a => !a.acknowledged);
  const selectedEquipmentData = selectedEquipmentId
    ? equipmentList.find(eq => eq.id === selectedEquipmentId)
    : null;

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'processing' | 'success' | 'error' | 'warning' | 'default'> = {
      running: 'processing',
      idle: 'default',
      fault: 'error',
      offline: 'error',
      warning: 'warning'
    };
    return map[status] || 'default';
  };

  const getTempColor = (temp: number) => {
    if (temp >= 80) return '#ff4d4f';
    if (temp >= 60) return '#faad14';
    return '#52c41a';
  };

  const getStatusIcon = (status: string) => {
    return <DashboardOutlined />;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      running: '#52c41a',
      idle: '#1890ff',
      fault: '#ff4d4f',
      offline: '#ff4d4f',
      warning: '#faad14'
    };
    return map[status] || '#8c8c8c';
  };

  const getAlarmType = (level: string): 'error' | 'warning' | 'info' => {
    if (level === 'CRITICAL') return 'error';
    if (level === 'WARNING') return 'warning';
    return 'info';
  };

  const handleAcknowledge = (id: string) => {
    message.success('告警已确认');
  };

  const equipmentStats = {
    running: equipmentList.filter(e => e.status === 'running').length,
    idle: equipmentList.filter(e => e.status === 'idle').length,
    fault: equipmentList.filter(e => e.status === 'fault' || e.status === 'offline').length,
    maintenance: equipmentList.filter(e => e.status === 'warning').length
  };

  return (
    <div className="new-digital-twin-dashboard">
      {/* 顶部控制栏 */}
      <TopControlBar
        isRunning={isSimulatorRunning}
        onToggle={handleToggleSimulator}
        stats={{
          runningCount: systemStats.runningCount,
          totalEfficiency: systemStats.totalEfficiency,
          alarmCount: unacknowledgedAlarms.length,
          totalPower: systemStats.totalPower
        }}
      />

      {/* 工具栏 */}
      <DashboardToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedEquipment={selectedEquipment}
        onEquipmentChange={setSelectedEquipment}
        equipmentOptions={equipmentOptions}
        onExport={handleExport}
        onFullscreen={handleFullscreen}
        onRefresh={handleRefresh}
      />

      {/* 主内容区域 */}
      <div className="main-content">
        {/* 左侧：3D场景 */}
        <div className="scene-area">
          <Interactive3DScene />
        </div>

        {/* 右侧：数据面板 */}
        <div className="data-panel">
          {/* 系统概览 */}
          <Card title="系统概览" size="small" className="overview-card">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Statistic
                  title="设备总数"
                  value={equipmentList.length}
                  suffix="台"
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="综合效率"
                  value={systemStats.totalEfficiency.toFixed(1)}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="能源消耗"
                  value={(systemStats.totalPower * 0.8).toFixed(1)}
                  suffix="kWh"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="生产产量"
                  value={1250}
                  suffix="件"
                  prefix={<ProductOutlined />}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Col>
            </Row>
          </Card>

          {/* 设备详情 */}
          {selectedEquipmentData && (
            <Card title="设备详情" size="small" className="detail-card">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="设备名称">
                  {selectedEquipmentData.name}
                </Descriptions.Item>
                <Descriptions.Item label="运行状态">
                  <Badge
                    status={getStatusBadge(selectedEquipmentData.status)}
                    text={selectedEquipmentData.status}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="温度">
                  <div>
                    <span>{selectedEquipmentData.temperature}°C</span>
                    <Progress
                      percent={selectedEquipmentData.temperature}
                      strokeColor={getTempColor(selectedEquipmentData.temperature)}
                      showInfo={false}
                      className="detail-progress"
                    />
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="效率">
                  <div>
                    <span>{selectedEquipmentData.efficiency}%</span>
                    <Progress
                      percent={selectedEquipmentData.efficiency}
                      strokeColor="#1890ff"
                      showInfo={false}
                      className="detail-progress"
                    />
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* 设备列表 */}
          <Card title="设备列表" size="small" className="list-card">
            <List
              dataSource={equipmentList}
              split={false}
              size="small"
              renderItem={item => (
                <List.Item
                  className={selectedEquipmentId === item.id ? 'selected' : ''}
                  onClick={() => setSelectedEquipmentId(item.id)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={getStatusIcon(item.status)}
                        className={`equipment-avatar equipment-avatar-${item.status}`}
                      />
                    }
                    title={item.name}
                    description={`${item.type} | ${item.status}`}
                  />
                  <div>{item.efficiency}%</div>
                </List.Item>
              )}
            />
          </Card>

          {/* 告警信息 */}
          <Card
            title={
              <Space>
                <WarningOutlined />
                告警信息
                <Badge count={unacknowledgedAlarms.length} />
              </Space>
            }
            size="small"
            className="alarm-card"
          >
            {unacknowledgedAlarms.length === 0 ? (
              <div className="alarm-empty-state">
                暂无告警信息
              </div>
            ) : (
              <List
                dataSource={unacknowledgedAlarms.slice(0, 5)}
                split={false}
                size="small"
                renderItem={alarm => (
                  <List.Item>
                    <Alert
                      message={alarm.message}
                      type={getAlarmType(alarm.level)}
                      showIcon
                      closable
                      onClose={() => handleAcknowledge(alarm.id)}
                      className="alarm-alert"
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </div>

      {/* 底部统计区域 */}
      <BottomStats stats={equipmentStats} onStatusClick={handleStatusClick} />
    </div>
  );
};

// 导出包装了Provider的组件
const NewDigitalTwinDashboard: React.FC = () => {
  return (
    <DigitalTwinProvider>
      <NewDigitalTwinContent />
    </DigitalTwinProvider>
  );
};

export default NewDigitalTwinDashboard;
