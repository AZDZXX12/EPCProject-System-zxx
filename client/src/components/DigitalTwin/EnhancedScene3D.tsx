import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  ContactShadows,
  Sky,
  Stars,
  Cloud,
} from '@react-three/drei';
import { Progress } from 'antd';
import * as THREE from 'three';

interface ModelProps {
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  highlight?: boolean;
  progress?: number;
  type?: 'reactor' | 'tank' | 'pump' | 'tower' | 'building';
  label?: string;
  status?: 'idle' | 'working' | 'warning' | 'error';
}

// 反应釜设备
function ReactorModel({
  position = [0, 0, 0],
  scale = 1,
  onClick,
  highlight,
  progress = 0,
  label,
  status = 'idle',
}: ModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      if (highlight || hovered) {
        meshRef.current.rotation.y += 0.005;
      }
      // 工作状态下的振动效果
      if (status === 'working') {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.02;
      }
    }
  });

  const getStatusColor = () => {
    switch (status) {
      case 'working':
        return '#00ff88';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#ff4444';
      default:
        return hovered ? '#0088ff' : '#888888';
    }
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 主体容器 */}
      <mesh castShadow receiveShadow scale={scale}>
        <cylinderGeometry args={[1, 1.2, 3, 32]} />
        <meshStandardMaterial
          color={getStatusColor()}
          metalness={0.9}
          roughness={0.1}
          emissive={getStatusColor()}
          emissiveIntensity={highlight || status === 'working' ? 0.3 : 0}
        />
      </mesh>

      {/* 顶部盖 */}
      <mesh position={[0, 1.8, 0]} castShadow scale={scale}>
        <cylinderGeometry args={[1, 0.8, 0.6, 32]} />
        <meshStandardMaterial color="#666666" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* 底部支架 */}
      <mesh position={[0, -1.8, 0]} castShadow scale={scale}>
        <cylinderGeometry args={[1.2, 1.4, 0.4, 32]} />
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 管道连接口 */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.1 * scale;
        const z = Math.sin(rad) * 1.1 * scale;
        return (
          <mesh
            key={i}
            position={[x, 0.5, z]}
            rotation={[0, rad, Math.PI / 2]}
            castShadow
            scale={scale}
          >
            <cylinderGeometry args={[0.1, 0.15, 0.5, 16]} />
            <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
          </mesh>
        );
      })}

      {/* 进度环 */}
      {progress > 0 && (
        <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={scale}>
          <ringGeometry args={[1.2, 1.4, 64, 1, 0, (progress / 100) * Math.PI * 2]} />
          <meshBasicMaterial
            color={getStatusColor()}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* 状态指示灯 */}
      <mesh position={[0, 2.2, 0]} scale={scale}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={status === 'working' ? 1 : 0.3}
        />
      </mesh>

      {/* 信息标签 */}
      {(hovered || highlight) && (
        <Html distanceFactor={10} position={[0, 3, 0]}>
          <div
            style={{
              background: 'rgba(0,0,0,0.9)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `2px solid ${getStatusColor()}`,
              minWidth: '180px',
              fontSize: '13px',
              fontFamily: 'system-ui',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: getStatusColor() }}>
              {label || '反应釜设备'}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>
              进度: {progress}%<br />
              状态:{' '}
              {status === 'working'
                ? '运行中'
                : status === 'warning'
                  ? '预警'
                  : status === 'error'
                    ? '故障'
                    : '待机'}
            </div>
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={progress}
                size="small"
                strokeColor={getStatusColor()}
                showInfo={false}
              />
            </div>
          </div>
        </Html>
      )}

      {/* 粒子效果 - 工作状态 */}
      {status === 'working' && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50}
              array={
                new Float32Array(Array.from({ length: 50 * 3 }, () => (Math.random() - 0.5) * 2))
              }
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color={getStatusColor()} transparent opacity={0.6} />
        </points>
      )}
    </group>
  );
}

// 储罐设备
function TankModel({
  position = [0, 0, 0],
  scale = 1,
  onClick,
  highlight,
  progress = 0,
  label,
  status = 'idle',
}: ModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'working':
        return '#00ff88';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#ff4444';
      default:
        return hovered ? '#0088ff' : '#888888';
    }
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 主体 */}
      <mesh castShadow receiveShadow scale={scale}>
        <cylinderGeometry args={[0.8, 0.8, 4, 32]} />
        <meshStandardMaterial
          color={getStatusColor()}
          metalness={0.85}
          roughness={0.15}
          emissive={getStatusColor()}
          emissiveIntensity={highlight ? 0.2 : 0}
        />
      </mesh>

      {/* 液位指示 */}
      <mesh position={[0, -2 + (progress / 100) * 4, 0]} scale={[scale * 0.79, 1, scale * 0.79]}>
        <cylinderGeometry args={[1, 1, (progress / 100) * 4, 32]} />
        <meshStandardMaterial
          color={getStatusColor()}
          transparent
          opacity={0.5}
          emissive={getStatusColor()}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 顶盖 */}
      <mesh position={[0, 2.2, 0]} castShadow scale={scale}>
        <cylinderGeometry args={[0.8, 0.6, 0.4, 32]} />
        <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 信息标签 */}
      {(hovered || highlight) && (
        <Html distanceFactor={10} position={[0, 3, 0]}>
          <div
            style={{
              background: 'rgba(0,0,0,0.9)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `2px solid ${getStatusColor()}`,
              minWidth: '160px',
              fontSize: '13px',
              fontFamily: 'system-ui',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: getStatusColor() }}>
              {label || '储罐'}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>液位: {progress}%</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 泵设备
function PumpModel({ position = [0, 0, 0], scale = 1, onClick, highlight, label, status = 'idle' }: ModelProps) {
  const [hovered, setHovered] = useState(false);
  const color = status === 'working' ? '#00ff88' : status === 'warning' ? '#ff9800' : status === 'error' ? '#ff4444' : hovered || highlight ? '#0088ff' : '#888888';
  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* 泵体 */}
      <mesh castShadow receiveShadow scale={scale} position={[0, 0.2, 0]}>
        <torusGeometry args={[0.7, 0.2, 16, 100]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} emissive={color} emissiveIntensity={highlight ? 0.3 : 0} />
      </mesh>
      {/* 电机 */}
      <mesh castShadow receiveShadow scale={scale} position={[1.2, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 24]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
      </mesh>
      {(hovered || highlight) && (
        <Html distanceFactor={10} position={[0, 1.2, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.9)', color: '#fff', padding: '10px 12px', borderRadius: 8, border: `2px solid ${color}`, fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color }}>{label || '离心泵'}</div>
            <div style={{ color: '#ccc' }}>状态：{status === 'working' ? '运行中' : status === 'warning' ? '预警' : status === 'error' ? '故障' : '待机'}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 塔设备
function TowerModel({ position = [0, 0, 0], scale = 1, onClick, highlight, label, status = 'idle' }: ModelProps) {
  const [hovered, setHovered] = useState(false);
  const color = status === 'working' ? '#00ff88' : status === 'warning' ? '#ff9800' : status === 'error' ? '#ff4444' : hovered || highlight ? '#0088ff' : '#888888';
  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh castShadow receiveShadow scale={scale}>
        <cylinderGeometry args={[0.6, 0.6, 6, 24]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} emissive={color} emissiveIntensity={highlight ? 0.25 : 0} />
      </mesh>
      {/* 平台与扶梯 */}
      <mesh position={[0, 2, 0]} scale={scale}>
        <torusGeometry args={[0.8, 0.05, 16, 64]} />
        <meshStandardMaterial color="#777" metalness={0.8} roughness={0.2} />
      </mesh>
      {(hovered || highlight) && (
        <Html distanceFactor={10} position={[0, 3.5, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.9)', color: '#fff', padding: '10px 12px', borderRadius: 8, border: `2px solid ${color}`, fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color }}>{label || '精馏塔'}</div>
            <div style={{ color: '#ccc' }}>状态：{status === 'working' ? '运行中' : status === 'warning' ? '预警' : status === 'error' ? '故障' : '待机'}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 建筑物
function BuildingModel({ position = [0, 0, 0], scale = 1, onClick, highlight, label }: ModelProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow scale={scale}>
        <boxGeometry args={[3, 4, 2]} />
        <meshStandardMaterial
          color={hovered || highlight ? '#0088ff' : '#555555'}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* 窗户 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = -1.2 + col * 0.8;
        const y = -1.5 + row * 1;
        return (
          <mesh key={i} position={[1.51 * scale, y * scale, x * scale]} scale={scale}>
            <boxGeometry args={[0.02, 0.4, 0.3]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
          </mesh>
        );
      })}

      {(hovered || highlight) && (
        <Html distanceFactor={10} position={[0, 3, 0]}>
          <div
            style={{
              background: 'rgba(0,0,0,0.9)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #0088ff',
              fontSize: '13px',
              fontFamily: 'system-ui',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#0088ff' }}>{label || '控制中心'}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 粒子背景
function ParticleField() {
  const points = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const particleCount = 200; // 从1000减少到200，优化性能
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#0088ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

interface Scene3DProps {
  equipment?: Array<{
    id: string;
    name: string;
    position: [number, number, number];
    progress: number;
    highlight?: boolean;
    type?: 'reactor' | 'tank' | 'pump' | 'tower' | 'building';
    status?: 'idle' | 'working' | 'warning' | 'error';
  }>;
  onEquipmentClick?: (id: string) => void;
}

const EnhancedScene3D: React.FC<Scene3DProps> = ({ equipment = [], onEquipmentClick }) => {
  const [showStats] = useState(true);

  const renderEquipment = (item: any) => {
    const commonProps = {
      position: item.position,
      progress: item.progress,
      highlight: item.highlight,
      label: item.name,
      status: item.status,
      onClick: () => onEquipmentClick?.(item.id),
    };

    switch (item.type) {
      case 'tank':
        return <TankModel key={item.id} {...commonProps} />;
      case 'pump':
        return <PumpModel key={item.id} {...commonProps} />;
      case 'tower':
        return <TowerModel key={item.id} {...commonProps} />;
      case 'building':
        return <BuildingModel key={item.id} {...commonProps} />;
      case 'reactor':
      default:
        return <ReactorModel key={item.id} {...commonProps} />;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [15, 12, 15], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #0a0a20 0%, #1a1a40 50%, #2a1a3a 100%)' }}
      >
        <Suspense fallback={null}>
          {/* 星空背景 */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* 环境光照 */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[20, 20, 10]}
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
          <pointLight position={[-15, 10, -15]} intensity={0.8} color="#0088ff" />
          <pointLight position={[15, 10, 15]} intensity={0.8} color="#ff0088" />
          <spotLight
            position={[0, 25, 0]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
            color="#00ff88"
          />

          {/* 天空与环境 */}
          <Sky distance={450000} sunPosition={[0, 1, 0]} turbidity={8} rayleigh={2} mieCoefficient={0.005} mieDirectionalG={0.8} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Cloud position={[-10, 15, -20]} opacity={0.2} speed={0.2} />
          <Cloud position={[20, 12, 10]} opacity={0.2} speed={0.15} />

          {/* 粒子场 */}
          <ParticleField />

          {/* 地面 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
          </mesh>

          {/* 网格线 */}
          <gridHelper args={[100, 50, '#00ff88', '#0088ff']} position={[0, 0.01, 0]} />

          {/* 接触阴影 */}
          <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={50} blur={2} far={10} />

          {/* 渲染设备 */}
          {equipment.map(renderEquipment)}

          {/* 相机控制 */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={60}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>

      {/* 控制面板 */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.85)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '2px solid #00ff88',
          color: '#00ff88',
          fontFamily: 'system-ui',
          fontSize: '13px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,255,136,0.2)',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 12 }}>
          🎮 数字孪生控制台
        </div>
        <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '20px' }}>
          • 左键拖拽：旋转视角
          <br />
          • 右键拖拽：平移视角
          <br />
          • 滚轮：缩放视角
          <br />• 悬停/点击设备：查看详情
        </div>
      </div>

      {/* 状态统计 */}
      {showStats && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(0,0,0,0.85)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '2px solid #0088ff',
            color: '#fff',
            fontFamily: 'system-ui',
            fontSize: '13px',
            backdropFilter: 'blur(10px)',
            minWidth: '200px',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: 12, color: '#0088ff' }}>
            📊 设备统计
          </div>
          <div style={{ fontSize: '12px', lineHeight: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>总设备数:</span>
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{equipment.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>运行中:</span>
              <span style={{ color: '#00ff88' }}>
                {equipment.filter((e) => e.status === 'working').length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>待机:</span>
              <span style={{ color: '#888' }}>
                {equipment.filter((e) => e.status === 'idle').length}
              </span>
            </div>
            {equipment.filter((e) => e.status === 'warning').length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>预警:</span>
                <span style={{ color: '#ff9800' }}>
                  {equipment.filter((e) => e.status === 'warning').length}
                </span>
              </div>
            )}
            {equipment.filter((e) => e.status === 'error').length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>故障:</span>
                <span style={{ color: '#ff4444' }}>
                  {equipment.filter((e) => e.status === 'error').length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 图例 */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(0,0,0,0.85)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #555',
          color: '#fff',
          fontFamily: 'system-ui',
          fontSize: '12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>状态图例</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00ff88' }} />
            <span>运行中</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#888' }} />
            <span>待机</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff9800' }} />
            <span>预警</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff4444' }} />
            <span>故障</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedScene3D;
