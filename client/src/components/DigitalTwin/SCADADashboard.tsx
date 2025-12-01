import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, Timeline, Badge, Space, Progress, Tabs, Button } from 'antd';
import {
  DashboardOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CloudOutlined
} from '@ant-design/icons';
import type { SCADAAlarm, DeviceStatus } from '../../types/industrial';
import PLCControlPanel from './PLCControlPanel';
import './SCADADashboard.css';

const { TabPane } = Tabs;

const SCADADashboard: React.FC = () => {
  const [alarms, setAlarms] = useState<SCADAAlarm[]>([
    {
      id: 'alarm_1',
      timestamp: Date.now() - 300000,
      level: 'HIGH',
      type: 'PROCESS',
      message: '温度超过设定值上限',
      device: 'PLC-001',
      acknowledged: false
    },
    {
      id: 'alarm_2',
      timestamp: Date.now() - 600000,
      level: 'MEDIUM',
      type: 'EQUIPMENT',
      message: '泵运行时间超过维护周期',
      device: 'PUMP-002',
      acknowledged: true,
      acknowledgedBy: 'Operator',
      acknowledgedAt: Date.now() - 300000
    }
  ]);

  const [systemStats, setSystemStats] = useState({
    totalDevices: 12,
    runningDevices: 8,
    stoppedDevices: 3,
    faultDevices: 1,
    dataPoints: 48,
    activeAlarms: 1,
    systemUptime: 99.8
  });

  const acknowledgeAlarm = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm =>
      alarm.id === alarmId
        ? {
            ...alarm,
            acknowledged: true,
            acknowledgedBy: 'Current User',
            acknowledgedAt: Date.now()
          }
        : alarm
    ));
  };

  const getAlarmColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'processing';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const getAlarmIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL': return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'HIGH': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'MEDIUM': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default: return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
  };

  return (
    <div className="scada-dashboard">
      <Card
        title={
          <Space>
            <DashboardOutlined />
            <span>SCADA监控系统</span>
            <Badge status="processing" text="实时监控中" />
          </Space>
        }
      >
        {/* 系统概览 */}
        <Row gutter={[16, 16]} className="system-overview">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="设备总数"
                value={systemStats.totalDevices}
                prefix={<DashboardOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="运行设备"
                value={systemStats.runningDevices}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="故障设备"
                value={systemStats.faultDevices}
                prefix={<WarningOutlined />}
                valueStyle={{ color: systemStats.faultDevices > 0 ? '#ff4d4f' : '#999' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="系统可用性"
                value={systemStats.systemUptime}
                suffix="%"
                precision={2}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 活动报警 */}
        {alarms.filter(a => !a.acknowledged).length > 0 && (
          <Alert
            message={`当前有 ${alarms.filter(a => !a.acknowledged).length} 个未确认报警`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            closable
            className="alarm-alert"
          />
        )}

        {/* 主要内容区域 */}
        <Tabs defaultActiveKey="1" className="scada-tabs">
          <TabPane tab="PLC控制" key="1">
            <PLCControlPanel deviceId="PLC-001" />
          </TabPane>

          <TabPane tab="报警管理" key="2">
            <Card title="报警列表" size="small">
              <Timeline>
                {alarms.map(alarm => (
                  <Timeline.Item
                    key={alarm.id}
                    dot={getAlarmIcon(alarm.level)}
                    color={getAlarmColor(alarm.level)}
                  >
                    <div className="alarm-item">
                      <div className="alarm-header">
                        <Space>
                          <Badge status={getAlarmColor(alarm.level)} />
                          <strong>{alarm.message}</strong>
                          {!alarm.acknowledged && (
                            <Button 
                              type="link" 
                              size="small"
                              onClick={() => acknowledgeAlarm(alarm.id)}
                            >
                              确认
                            </Button>
                          )}
                        </Space>
                      </div>
                      <div className="alarm-details">
                        <Space split="|">
                          <span>设备: {alarm.device}</span>
                          <span>类型: {alarm.type}</span>
                          <span>级别: {alarm.level}</span>
                          <span>{new Date(alarm.timestamp).toLocaleString()}</span>
                        </Space>
                      </div>
                      {alarm.acknowledged && (
                        <div className="alarm-ack">
                          已确认 by {alarm.acknowledgedBy} at{' '}
                          {new Date(alarm.acknowledgedAt!).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </TabPane>

          <TabPane tab="系统状态" key="3">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="设备状态分布" size="small">
                  <div className="device-distribution">
                    <div className="distribution-item">
                      <span className="label">运行中</span>
                      <Progress
                        percent={(systemStats.runningDevices / systemStats.totalDevices) * 100}
                        strokeColor="#52c41a"
                        format={() => systemStats.runningDevices}
                      />
                    </div>
                    <div className="distribution-item">
                      <span className="label">已停止</span>
                      <Progress
                        percent={(systemStats.stoppedDevices / systemStats.totalDevices) * 100}
                        strokeColor="#d9d9d9"
                        format={() => systemStats.stoppedDevices}
                      />
                    </div>
                    <div className="distribution-item">
                      <span className="label">故障</span>
                      <Progress
                        percent={(systemStats.faultDevices / systemStats.totalDevices) * 100}
                        strokeColor="#ff4d4f"
                        format={() => systemStats.faultDevices}
                      />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="数据采集状态" size="small">
                  <Statistic
                    title="数据点总数"
                    value={systemStats.dataPoints}
                    prefix={<CloudOutlined />}
                  />
                  <Statistic
                    title="采集频率"
                    value={1}
                    suffix="秒/次"
                    prefix={<ClockCircleOutlined />}
                    className="stat-margin"
                  />
                  <Statistic
                    title="数据质量"
                    value={98.5}
                    suffix="%"
                    precision={1}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                    className="stat-margin"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SCADADashboard;
