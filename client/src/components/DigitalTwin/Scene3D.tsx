import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

interface ModelProps {
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  highlight?: boolean;
  progress?: number;
}

function EquipmentModel({
  position = [0, 0, 0],
  scale = 1,
  onClick,
  highlight,
  progress = 0,
}: ModelProps) {
  const meshRef = useRef<any>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // 使用基础几何体替代GLB模型，避免加载错误

  return (
    <group position={position} onClick={onClick}>
      {/* 使用基础几何体，避免GLB加载问题 */}
      <mesh ref={meshRef} scale={scale}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial 
          color={highlight ? '#ff6b6b' : '#4ecdc4'} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* 进度指示器 */}
      <Html position={[0, 1.5, 0]} center>
        <div
          style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          {Math.round(progress * 100)}%
        </div>
      </Html>
    </group>
  );
}

interface Scene3DProps {
  equipment?: Array<{
    id: string;
    name: string;
    position: [number, number, number];
    progress: number;
    highlight?: boolean;
  }>;
  onEquipmentClick?: (id: string) => void;
}

const Scene3D: React.FC<Scene3DProps> = ({ equipment = [], onEquipmentClick }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
      <Canvas
        shadows
        camera={{ position: [10, 8, 10], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #0a0a1f 0%, #1a1a3f 100%)' }}
      >
        <Suspense fallback={null}>
          {/* 环境光照 - 简化版无需加载外部文件 */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#0088ff" />
          <pointLight position={[-10, 10, -10]} intensity={0.8} color="#0088ff" />
          <pointLight position={[10, 5, 10]} intensity={0.8} color="#ff0088" />
          <pointLight position={[0, 15, 0]} intensity={1} color="#fff" />
          <hemisphereLight args={['#0088ff', '#ff0088', 0.5]} />

          {/* 3D网格地面 - Grid removed to fix import error */}
          
          {/* 渲染设备模型 */}
          {equipment.map((item) => (
            <EquipmentModel
              key={item.id}
              position={item.position}
              scale={0.8}
              progress={item.progress}
              highlight={item.highlight}
              onClick={() => onEquipmentClick?.(item.id)}
            />
          ))}

          {/* 辅助坐标轴 */}
          <axesHelper args={[5]} />

          {/* 相机控制 */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>

      {/* 控制面板 */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.7)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #00ff88',
          color: '#00ff88',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        <div>🎮 操作提示</div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#aaa' }}>
          • 左键拖拽：旋转视角
          <br />
          • 右键拖拽：平移视角
          <br />
          • 滚轮：缩放视角
          <br />• 点击设备：查看详情
        </div>
      </div>
    </div>
  );
};

export default Scene3D;
