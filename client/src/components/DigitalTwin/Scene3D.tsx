import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, PerspectiveCamera, Grid } from '@react-three/drei';
import { Spin } from 'antd';
import * as THREE from 'three';

interface ModelProps {
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  highlight?: boolean;
  progress?: number;
}

function EquipmentModel({ position = [0, 0, 0], scale = 1, onClick, highlight, progress = 0 }: ModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // 高亮设备旋转动画
      if (highlight) {
        meshRef.current.rotation.y += 0.01;
      }
      // 呼吸灯效果
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = highlight ? pulse : 0;
      }
    }
  });

  // 尝试加载GLB模型，如果失败则使用几何体代替
  let model = null;
  try {
    // 这里会尝试加载项目中的GLB文件
    const gltf = useGLTF('/8fb25db3-c21e-4797-a2db-a370ba039846.glb');
    model = <primitive object={gltf.scene} scale={scale} />;
  } catch (error) {
    // 如果模型加载失败，使用基础几何体
    model = (
      <mesh
        ref={meshRef}
        position={position}
        scale={scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.5, 0.7, 2, 32]} />
        <meshStandardMaterial
          color={highlight ? '#00ff88' : hovered ? '#0088ff' : '#cccccc'}
          emissive={highlight ? '#00ff88' : '#000000'}
          roughness={0.3}
          metalness={0.8}
        />
        {/* 进度指示环 */}
        {progress > 0 && (
          <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.05, 16, 100, (progress / 100) * Math.PI * 2]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
        )}
      </mesh>
    );
  }

  return (
    <group position={position}>
      {model}
      {hovered && (
        <Html distanceFactor={10}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#00ff88',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #00ff88',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}>
            进度: {progress}%
          </div>
        </Html>
      )}
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

          {/* 3D网格地面 */}
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#00ff88"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#0088ff"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />

          {/* 渲染设备模型 */}
          {equipment.map((item, index) => (
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
      <div style={{
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
      }}>
        <div>🎮 操作提示</div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#aaa' }}>
          • 左键拖拽：旋转视角<br />
          • 右键拖拽：平移视角<br />
          • 滚轮：缩放视角<br />
          • 点击设备：查看详情
        </div>
      </div>
    </div>
  );
};

export default Scene3D;

