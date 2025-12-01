import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Switch, InputNumber, Badge, Statistic, Progress, Space, Tag, Tooltip } from 'antd';
import {
  ThunderboltOutlined,
  PoweroffOutlined,
  SettingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import type { PLCDataPoint, DeviceStatus } from '../../types/industrial';
import { plcSimulator } from '../../services/plcSimulator';
import './PLCControlPanel.css';

interface PLCControlPanelProps {
  deviceId: string;
  onCommand?: (command: any) => void;
}

const PLCControlPanel: React.FC<PLCControlPanelProps> = ({ deviceId, onCommand }) => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    id: deviceId,
    name: '主控PLC',
    type: 'MOTOR',
    status: 'STOPPED',
    parameters: {}
  });

  const [dataPoints, setDataPoints] = useState<PLCDataPoint[]>([
    {
      id: 'temp_1',
      name: '温度传感器1',
      address: 'DB1.DBW0',
      type: 'REAL',
      value: 85.5,
      unit: '°C',
      min: 0,
      max: 150,
      quality: 'GOOD',
      timestamp: Date.now()
    },
    {
      id: 'pressure_1',
      name: '压力传感器1',
      address: 'DB1.DBW4',
      type: 'REAL',
      value: 2.5,
      unit: 'MPa',
      min: 0,
      max: 10,
      quality: 'GOOD',
      timestamp: Date.now()
    },
    {
      id: 'flow_1',
      name: '流量计1',
      address: 'DB1.DBW8',
      type: 'REAL',
      value: 120,
      unit: 'L/h',
      min: 0,
      max: 500,
      quality: 'GOOD',
      timestamp: Date.now()
    },
    {
      id: 'motor_status',
      name: '电机状态',
      address: 'DB1.DBX12.0',
      type: 'BOOL',
      value: false,
      quality: 'GOOD',
      timestamp: Date.now()
    }
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);

  // 初始化模拟器并订阅数据更新
  useEffect(() => {
    // 启动模拟器
    plcSimulator.start(1000);

    // 订阅数据更新
    const handleDataUpdate = (updatedPoint: PLCDataPoint) => {
      setDataPoints(prev => 
        prev.map(point => point.id === updatedPoint.id ? updatedPoint : point)
      );
    };

    plcSimulator.addListener(handleDataUpdate);

    // 从模拟器加载初始数据
    const simulatorData = plcSimulator.getAllDataPoints();
    if (simulatorData.length > 0) {
      setDataPoints(simulatorData.slice(0, 4)); // 取前4个数据点
    }

    return () => {
      plcSimulator.removeListener(handleDataUpdate);
      plcSimulator.stop();
    };
  }, []);

  // 自动刷新控制
  useEffect(() => {
    if (autoRefresh) {
      plcSimulator.start(1000);
    } else {
      plcSimulator.stop();
    }
  }, [autoRefresh]);

  const handleStartStop = () => {
    const newStatus = deviceStatus.status === 'RUNNING' ? 'STOPPED' : 'RUNNING';
    setDeviceStatus(prev => ({ ...prev, status: newStatus }));
    
    // 更新电机状态数据点
    setDataPoints(prev => prev.map(point => 
      point.id === 'motor_status' 
        ? { ...point, value: newStatus === 'RUNNING', timestamp: Date.now() }
        : point
    ));

    onCommand?.({
      deviceId,
      action: newStatus === 'RUNNING' ? 'START' : 'STOP',
      operator: 'System',
      timestamp: Date.now()
    });
  };

  const handleReset = () => {
    setDeviceStatus(prev => ({ ...prev, status: 'STOPPED' }));
    onCommand?.({
      deviceId,
      action: 'RESET',
      operator: 'System',
      timestamp: Date.now()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'success';
      case 'STOPPED': return 'default';
      case 'FAULT': return 'error';
      case 'MAINTENANCE': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING': return <CheckCircleOutlined />;
      case 'STOPPED': return <PoweroffOutlined />;
      case 'FAULT': return <WarningOutlined />;
      default: return <SyncOutlined spin />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'GOOD': return 'success';
      case 'BAD': return 'error';
      case 'UNCERTAIN': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="plc-control-panel">
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            <span>PLC控制面板</span>
            <Badge 
              status={deviceStatus.status === 'RUNNING' ? 'processing' : 'default'} 
              text={deviceStatus.name}
            />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="自动刷新">
              <Switch 
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="自动"
                unCheckedChildren="手动"
              />
            </Tooltip>
            <Tag color={getStatusColor(deviceStatus.status)}>
              {getStatusIcon(deviceStatus.status)}
              <span style={{ marginLeft: 4 }}>{deviceStatus.status}</span>
            </Tag>
          </Space>
        }
      >
        {/* 设备状态概览 */}
        <Row gutter={[16, 16]} className="status-overview">
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="设备状态"
                value={deviceStatus.status}
                valueStyle={{ color: deviceStatus.status === 'RUNNING' ? '#3f8600' : '#999' }}
                prefix={getStatusIcon(deviceStatus.status)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="数据点数量"
                value={dataPoints.length}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="正常数据点"
                value={dataPoints.filter(p => p.quality === 'GOOD').length}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="异常数据点"
                value={dataPoints.filter(p => p.quality !== 'GOOD').length}
                valueStyle={{ color: dataPoints.filter(p => p.quality !== 'GOOD').length > 0 ? '#cf1322' : '#999' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 实时数据显示 */}
        <Card 
          title="实时数据" 
          size="small" 
          style={{ marginTop: 16 }}
          className="data-points-card"
        >
          <Row gutter={[16, 16]}>
            {dataPoints.map(point => (
              <Col xs={24} sm={12} md={8} lg={6} key={point.id}>
                <Card 
                  size="small" 
                  className="data-point-card"
                  hoverable
                >
                  <div className="data-point-header">
                    <Tooltip title={`地址: ${point.address}`}>
                      <span className="data-point-name">{point.name}</span>
                    </Tooltip>
                    <Tag color={getQualityColor(point.quality)} className="quality-tag">
                      {point.quality}
                    </Tag>
                  </div>
                  
                  {point.type === 'BOOL' ? (
                    <div className="bool-value">
                      <Badge 
                        status={point.value ? 'processing' : 'default'}
                        text={point.value ? 'ON' : 'OFF'}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="numeric-value">
                        <span className="value">{point.value}</span>
                        {point.unit && <span className="unit">{point.unit}</span>}
                      </div>
                      {point.min !== undefined && point.max !== undefined && (
                        <Progress
                          percent={((point.value as number - point.min) / (point.max - point.min)) * 100}
                          size="small"
                          showInfo={false}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                      )}
                      <div className="range-info">
                        范围: {point.min} - {point.max} {point.unit}
                      </div>
                    </>
                  )}
                  
                  <div className="timestamp">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 控制按钮 */}
        <Card title="设备控制" size="small" style={{ marginTop: 16 }}>
          <Space size="large" wrap>
            <Button
              type={deviceStatus.status === 'RUNNING' ? 'default' : 'primary'}
              icon={deviceStatus.status === 'RUNNING' ? <PoweroffOutlined /> : <ThunderboltOutlined />}
              onClick={handleStartStop}
              size="large"
              danger={deviceStatus.status === 'RUNNING'}
            >
              {deviceStatus.status === 'RUNNING' ? '停止' : '启动'}
            </Button>
            
            <Button
              icon={<SyncOutlined />}
              onClick={handleReset}
              size="large"
            >
              复位
            </Button>
            
            <Button
              icon={<SettingOutlined />}
              size="large"
            >
              参数设置
            </Button>
          </Space>
        </Card>

        {/* PLC地址映射 */}
        <Card title="PLC地址映射" size="small" style={{ marginTop: 16 }}>
          <div className="address-mapping">
            {dataPoints.map(point => (
              <div key={point.id} className="address-item">
                <Tag color="blue">{point.address}</Tag>
                <span className="arrow">→</span>
                <span className="point-name">{point.name}</span>
                <Tag>{point.type}</Tag>
              </div>
            ))}
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default PLCControlPanel;
