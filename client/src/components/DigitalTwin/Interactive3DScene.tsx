/**
 * 交互式3D可视化场景 - 联动版本
 * 特点：与数字孪生上下文完全集成、实时数据联动、统一状态管理
 */

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, Row, Col, Statistic, Progress, Badge, Space, Button, Tag, Descriptions, Switch } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  SyncOutlined,
  EyeOutlined
} from '@ant-design/icons';
import * as THREE from 'three';
import { useDigitalTwin } from '../../contexts/DigitalTwinContext';
import type { EquipmentData } from '../../contexts/DigitalTwinContext';
import './Interactive3DScene.css';

// 3D设备组件
const Equipment3DModel: React.FC<{
  equipment: EquipmentData;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
  showLabels: boolean;
}> = ({ equipment, position, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // 根据状态设置颜色
  const getStatusColor = () => {
    switch (equipment.status) {
      case 'running': return '#52c41a';
      case 'idle': return '#1890ff';
      case 'warning': return '#faad14';
      case 'fault': return '#f5222d';
      default: return '#8c8c8c';
    }
  };

  // 平滑旋转动画
  useFrame(() => {
    if (meshRef.current && equipment.status === 'running') {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      {/* 主体设备 */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshStandardMaterial
          color={getStatusColor()}
          metalness={0.5}
          roughness={0.2}
          emissive={getStatusColor()}
          emissiveIntensity={isSelected ? 0.3 : (hovered ? 0.2 : 0.1)}
        />
      </mesh>

      {/* 顶部指示灯 */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={equipment.status === 'running' ? 1 : 0.3}
        />
      </mesh>

      {/* 选中高亮环 */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#1890ff" transparent opacity={0.5} />
        </mesh>
      )}

      {/* 预警效果 */}
      {equipment.status === 'warning' && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
          <ringGeometry args={[0.8, 1.0, 32]} />
          <meshBasicMaterial color="#faad14" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

// 3D场景组件
const Scene3D: React.FC<{
  equipmentList: EquipmentData[];
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string | null) => void;
  showLabels: boolean;
}> = ({ equipmentList, selectedEquipmentId, onSelectEquipment, showLabels }) => {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 地板网格 */}
      <gridHelper args={[20, 20, '#444444', '#222222']} />
      
      {/* 设备模型 */}
      {equipmentList.map((equipment, index) => {
        const position: [number, number, number] = [
          (index % 3 - 1) * 4, // x: -4, 0, 4
          1, // y: 1 (抬高到地面上)
          Math.floor(index / 3) * 4 - 4 // z: -4, 0, 4
        ];
        
        return (
          <Equipment3DModel
            key={equipment.id}
            equipment={equipment}
            position={position}
            isSelected={selectedEquipmentId === equipment.id}
            onClick={() => onSelectEquipment(
              selectedEquipmentId === equipment.id ? null : equipment.id
            )}
            showLabels={showLabels}
          />
        );
      })}
      
      {/* 相机控制 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
};

const Interactive3DScene: React.FC = () => {
  const {
    equipmentList,
    selectedEquipmentId,
    selectEquipment,
    systemStats,
    isSimulatorRunning
  } = useDigitalTwin();

  const [viewMode, setViewMode] = useState<'view-3d' | 'view-split'>('view-split');
  const [showLabels, setShowLabels] = useState(true);

  // 获取选中的设备
  const selectedEquipment = selectedEquipmentId 
    ? equipmentList.find(eq => eq.id === selectedEquipmentId)
    : null;

  return (
    <div className="interactive-3d-scene">
      {/* 工具栏 */}
      <Card className="toolbar-card" size="small">
        <Row gutter={[16, 8]} align="middle">
          <Col>
            <Space>
              <Button
                type={viewMode === 'view-3d' ? 'primary' : 'default'}
                onClick={() => setViewMode('view-3d')}
                size="small"
                icon={<EyeOutlined />}
              >
                纯3D视图
              </Button>
              <Button
                type={viewMode === 'view-split' ? 'primary' : 'default'}
                onClick={() => setViewMode('view-split')}
                size="small"
                icon={<DashboardOutlined />}
              >
                分屏模式
              </Button>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <span>标签显示:</span>
              <Switch
                checked={showLabels}
                onChange={setShowLabels}
                size="small"
              />
            </Space>
          </Col>
          
          <Col>
            <Badge dot={isSimulatorRunning} offset={[-5, 5]}>
              <Tag color={isSimulatorRunning ? 'success' : 'default'}>
                {isSimulatorRunning ? '实时运行' : '已停止'}
              </Tag>
            </Badge>
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 */}
      <div className={`scene-container ${viewMode}`}>
        {/* 3D场景区域 */}
        <div className="scene-3d">
          <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
            <Scene3D
              equipmentList={equipmentList}
              selectedEquipmentId={selectedEquipmentId}
              onSelectEquipment={selectEquipment}
              showLabels={showLabels}
            />
          </Canvas>
        </div>

        {/* 数据面板 */}
        {viewMode === 'view-split' && (
          <div className="data-panel">
            {/* 系统概览 */}
            <Card title="系统概览" size="small" className="panel-card">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="运行设备"
                    value={systemStats.runningCount}
                    suffix={`/ ${systemStats.totalEquipment}`}
                    valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="系统效率"
                    value={systemStats.totalEfficiency}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                    prefix={<SyncOutlined spin={isSimulatorRunning} />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总功率"
                    value={systemStats.totalPower}
                    precision={1}
                    suffix="kW"
                    valueStyle={{ color: '#faad14', fontSize: '16px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="产量"
                    value={systemStats.productionCount}
                    suffix="件"
                    valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* 设备详情 */}
            {selectedEquipment ? (
              <Card 
                title={`设备详情 - ${selectedEquipment.name}`} 
                size="small" 
                className="panel-card"
                extra={
                  <Tag color={
                    selectedEquipment.status === 'running' ? 'success' :
                    selectedEquipment.status === 'warning' ? 'warning' :
                    selectedEquipment.status === 'fault' ? 'error' : 'default'
                  }>
                    {selectedEquipment.status.toUpperCase()}
                  </Tag>
                }
              >
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="设备ID">
                    {selectedEquipment.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="设备类型">
                    {selectedEquipment.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="温度">
                    {selectedEquipment.temperature.toFixed(1)}°C
                  </Descriptions.Item>
                  <Descriptions.Item label="压力">
                    {selectedEquipment.pressure.toFixed(1)} bar
                  </Descriptions.Item>
                  <Descriptions.Item label="效率">
                    <Progress 
                      percent={selectedEquipment.efficiency} 
                      size="small"
                      status={selectedEquipment.efficiency > 80 ? 'success' : 'normal'}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="功率">
                    {selectedEquipment.power.toFixed(1)} kW
                  </Descriptions.Item>
                  <Descriptions.Item label="运行时间">
                    {Math.floor(selectedEquipment.runningTime / 3600)}h {Math.floor((selectedEquipment.runningTime % 3600) / 60)}m
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ) : (
              <Card title="设备详情" size="small" className="panel-card">
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <EyeOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <div>点击3D场景中的设备查看详情</div>
                </div>
              </Card>
            )}

            {/* 状态分布 */}
            <Card title="设备状态分布" size="small" className="panel-card">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div className="status-item">
                    <Badge status="success" />
                    <span>运行: {systemStats.runningCount}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="status-item">
                    <Badge status="processing" />
                    <span>空闲: {systemStats.idleCount}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="status-item">
                    <Badge status="warning" />
                    <span>预警: {systemStats.warningCount}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="status-item">
                    <Badge status="error" />
                    <span>故障: {systemStats.faultCount}</span>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interactive3DScene;
