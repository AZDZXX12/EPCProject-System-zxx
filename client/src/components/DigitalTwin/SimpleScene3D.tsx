import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';

// 简化的3D场景组件，不使用任何可能导致HDR加载的组件
const SimpleScene3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #98FB98)' }}
      >
        <Suspense fallback={null}>
          {/* 基础光照 */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          {/* 简单的天空 */}
          <Sky distance={450000} sunPosition={[0, 1, 0]} />
          
          {/* 基础几何体 */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#4CAF50" />
          </mesh>
          
          {/* 地面 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#8BC34A" />
          </mesh>
          
          {/* 相机控制 */}
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SimpleScene3D;
