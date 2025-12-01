/**
 * 简化的交互式3D可视化场景
 * 修复运行时错误，确保组件正常工作
 */

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Card, Row, Col, Statistic, Badge, Space, Button, Tag, Descriptions, Progress, Tooltip, Alert } from 'antd';
import {
  ThunderboltOutlined,
  DashboardOutlined,
  SyncOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  FullscreenOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useDigitalTwin } from '../../contexts/DigitalTwinContext';
import './Interactive3DScene.css';

// 增强的3D设备组件
const EnhancedEquipment3D: React.FC<{
  equipment: any;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}> = ({ equipment, position, isSelected, onClick }) => {
  const meshRef = useRef<any>();
  const ringRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  // 获取状态颜色
  const getStatusColor = () => {
    switch (equipment.status) {
      case 'running': return '#52c41a';
      case 'idle': return '#1890ff';
      case 'warning': return '#faad14';
      case 'fault': return '#f5222d';
      default: return '#8c8c8c';
    }
  };

  const color = getStatusColor();

  // 动画效果
  useFrame((state) => {
    if (meshRef.current) {
      // 运行状态旋转
      if (equipment.status === 'running') {
        meshRef.current.rotation.y += 0.01;
      }
      // 悬停浮动
      if (hovered) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        meshRef.current.position.y = position[1];
      }
    }
    // 选中环旋转
    if (ringRef.current && isSelected) {
      ringRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group position={position}>
      {/* 主设备体 */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.2, 2, 1.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.4 : (hovered ? 0.3 : 0.15)}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* 顶部指示灯 */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={equipment.status === 'running' ? 1.5 : 0.5}
        />
      </mesh>

      {/* 底座 */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial color="#434343" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 选中高亮环 */}
      {isSelected && (
        <mesh ref={ringRef} position={[0, -1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.4, 32]} />
          <meshBasicMaterial color="#1890ff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* 悬停光环 */}
      {hovered && (
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}

      {/* 警告效果 */}
      {equipment.status === 'warning' && (
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[0.2, 0.4, 4]} />
          <meshStandardMaterial color="#faad14" emissive="#faad14" emissiveIntensity={1} />
        </mesh>
      )}

      {/* 故障效果 */}
      {equipment.status === 'fault' && (
        <mesh position={[0, 2, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#f5222d" emissive="#f5222d" emissiveIntensity={1.5} />
        </mesh>
      )}
    </group>
  );
};

// 增强的3D场景
const Enhanced3DScene: React.FC<{
  equipmentList: any[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}> = ({ equipmentList, selectedId, onSelect }) => {
  return (
    <>
      {/* 增强环境光照系统 */}
      <ambientLight intensity={0.35} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.6} color="#60a5fa" />
      <hemisphereLight args={['#87CEEB', '#545454', 0.4]} />
      <pointLight position={[0, 10, 0]} intensity={0.6} color="#ffffff" distance={30} decay={2} />
      
      {/* 优化环境贴图 */}
      <Environment preset="sunset" background={false} />
      
      {/* 专业蓝色网格系统 */}
      <Grid
        args={[30, 30]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#4a5568"
        sectionSize={10}
        sectionThickness={1.2}
        sectionColor="#2563eb"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* 设备模型 */}
      {equipmentList.map((equipment, index) => {
        const position: [number, number, number] = [
          (index % 3 - 1) * 4,
          1,
          Math.floor(index / 3) * 4 - 4
        ];
        
        return (
          <EnhancedEquipment3D
            key={equipment.id}
            equipment={equipment}
            position={position}
            isSelected={selectedId === equipment.id}
            onClick={() => onSelect(selectedId === equipment.id ? null : equipment.id)}
          />
        );
      })}
      
      {/* 相机控制 */}
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

const Interactive3DScene: React.FC = () => {
  const {
    equipmentList,
    selectedEquipmentId,
    selectEquipment,
    systemStats,
    isSimulatorRunning
  } = useDigitalTwin();

  const [viewMode, setViewMode] = useState<'view-3d' | 'view-split'>('view-split');
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  const selectedEquipment = selectedEquipmentId 
    ? equipmentList.find(eq => eq.id === selectedEquipmentId)
    : null;

  return (
    <div className="interactive-3d-scene">
      {/* 增强工具栏 */}
      <Card className="toolbar-card" size="small">
        <Row gutter={[16, 8]} align="middle" justify="space-between">
          <Col flex="auto">
            <Space wrap>
              <Tooltip title="纯3D视图">
                <Button
                  type={viewMode === 'view-3d' ? 'primary' : 'default'}
                  onClick={() => setViewMode('view-3d')}
                  size="small"
                  icon={<EyeOutlined />}
                >
                  3D视图
                </Button>
              </Tooltip>
              <Tooltip title="分屏模式">
                <Button
                  type={viewMode === 'view-split' ? 'primary' : 'default'}
                  onClick={() => setViewMode('view-split')}
                  size="small"
                  icon={<DashboardOutlined />}
                >
                  分屏
                </Button>
              </Tooltip>
              <Tooltip title="全屏显示">
                <Button
                  size="small"
                  icon={<FullscreenOutlined />}
                  onClick={() => {
                    const elem = document.querySelector('.interactive-3d-scene');
                    if (elem) {
                      elem.requestFullscreen?.();
                    }
                  }}
                />
              </Tooltip>
              <Tooltip title="重置视角">
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                />
              </Tooltip>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Badge dot={isSimulatorRunning} offset={[-5, 5]}>
                <Tag 
                  color={isSimulatorRunning ? 'success' : 'default'}
                  icon={isSimulatorRunning ? <SyncOutlined spin /> : <ClockCircleOutlined />}
                >
                  {isSimulatorRunning ? '实时运行' : '已停止'}
                </Tag>
              </Badge>
              <Tag color="blue">
                {equipmentList.length} 设备
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 */}
      <div className={`scene-container ${viewMode}`}>
        {/* 3D场景区域 */}
        <div className="scene-3d">
          <Canvas 
            camera={{ position: [12, 12, 12], fov: 50 }}
            shadows
            gl={{ antialias: true, alpha: false }}
          >
            <Enhanced3DScene
              equipmentList={equipmentList}
              selectedId={selectedEquipmentId}
              onSelect={selectEquipment}
            />
          </Canvas>
          
          {/* 场景提示 */}
          <div className="scene-hint">
            <Tag color="blue" icon={<EyeOutlined />}>
              拖拽旋转 | 滚轮缩放 | 点击选择
            </Tag>
          </div>
        </div>

        {/* 数据面板 */}
        {viewMode === 'view-split' && (
          <div className="data-panel">
            {/* 系统概览 */}
            <Card 
              title={
                <Space>
                  <DashboardOutlined />
                  <span>系统概览</span>
                </Space>
              } 
              size="small" 
              className="panel-card"
              extra={
                <Tag color={systemStats.runningCount > 0 ? 'success' : 'default'}>
                  {systemStats.runningCount > 0 ? '正常运行' : '待启动'}
                </Tag>
              }
            >
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div className="stat-item stat-running">
                    <div className="stat-icon">
                      <ThunderboltOutlined />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{systemStats.runningCount}</div>
                      <div className="stat-label">运行设备</div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-item stat-idle">
                    <div className="stat-icon">
                      <SyncOutlined spin={isSimulatorRunning} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{systemStats.totalEfficiency.toFixed(1)}%</div>
                      <div className="stat-label">系统效率</div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-item stat-warning">
                    <div className="stat-icon">
                      <FireOutlined />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{systemStats.totalPower.toFixed(1)}</div>
                      <div className="stat-label">总功率 (kW)</div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-item stat-fault">
                    <div className="stat-icon">
                      <CheckCircleOutlined />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{systemStats.productionCount}</div>
                      <div className="stat-label">产量 (件)</div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {/* 系统健康度 */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>系统健康度</span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {((systemStats.runningCount / systemStats.totalEquipment) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  percent={(systemStats.runningCount / systemStats.totalEquipment) * 100}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  showInfo={false}
                />
              </div>
            </Card>

            {/* 设备详情 */}
            {selectedEquipment ? (
              <Card 
                title={
                  <Space>
                    {selectedEquipment.status === 'running' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    {selectedEquipment.status === 'warning' && <WarningOutlined style={{ color: '#faad14' }} />}
                    {selectedEquipment.status === 'fault' && <WarningOutlined style={{ color: '#f5222d' }} />}
                    <span>{selectedEquipment.name}</span>
                  </Space>
                } 
                size="small" 
                className="panel-card detail-card"
                extra={
                  <Tag color={
                    selectedEquipment.status === 'running' ? 'success' :
                    selectedEquipment.status === 'warning' ? 'warning' :
                    selectedEquipment.status === 'fault' ? 'error' : 'default'
                  }>
                    {selectedEquipment.status === 'running' ? '运行中' :
                     selectedEquipment.status === 'warning' ? '预警' :
                     selectedEquipment.status === 'fault' ? '故障' : '空闲'}
                  </Tag>
                }
              >
                {/* 状态警告 */}
                {selectedEquipment.status === 'warning' && (
                  <Alert
                    message="设备预警"
                    description="温度或压力接近阈值，请注意监控"
                    type="warning"
                    showIcon
                    style={{ marginBottom: '12px' }}
                  />
                )}
                {selectedEquipment.status === 'fault' && (
                  <Alert
                    message="设备故障"
                    description="设备运行异常，需要立即检修"
                    type="error"
                    showIcon
                    style={{ marginBottom: '12px' }}
                  />
                )}

                {/* 关键参数 */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#8c8c8c' }}>温度</span>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        {selectedEquipment.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <Progress
                      percent={(selectedEquipment.temperature / 100) * 100}
                      strokeColor={selectedEquipment.temperature > 80 ? '#f5222d' : '#52c41a'}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#8c8c8c' }}>压力</span>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        {selectedEquipment.pressure.toFixed(1)} bar
                      </span>
                    </div>
                    <Progress
                      percent={(selectedEquipment.pressure / 10) * 100}
                      strokeColor={selectedEquipment.pressure > 8 ? '#faad14' : '#1890ff'}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#8c8c8c' }}>效率</span>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        {selectedEquipment.efficiency}%
                      </span>
                    </div>
                    <Progress
                      percent={selectedEquipment.efficiency}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                </div>

                {/* 详细信息 */}
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="设备ID">
                    <code>{selectedEquipment.id}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="设备类型">
                    {selectedEquipment.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="功率">
                    {selectedEquipment.power.toFixed(2)} kW
                  </Descriptions.Item>
                  <Descriptions.Item label="运行时长">
                    {selectedEquipment.status === 'running' ? '2小时35分' : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ) : (
              <Card title="设备详情" size="small" className="panel-card">
                <div className="empty-hint">
                  <EyeOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <div>点击3D场景中的设备查看详情</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>支持鼠标拖拽旋转和滚轮缩放</div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interactive3DScene;
