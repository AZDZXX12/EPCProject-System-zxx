import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { CableResult } from '../types';
import { Paper, Typography, Box } from '@mui/material';

interface CableModelViewerProps {
  cableSpec: CableResult | null;
}

function CableModel({ cableSpec }: { cableSpec: CableResult }) {
  const coreRadius = Math.sqrt(cableSpec.cross_section / Math.PI) * 0.05;
  const insulationRadius = coreRadius + 0.15;

  return (
    <group>
      {/* 核心导体 */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[coreRadius, coreRadius, 5, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 绝缘层 */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[insulationRadius, insulationRadius, 5, 32]} />
        <meshStandardMaterial
          color={cableSpec.insulationColor || "#2E8B57"}
          transparent
          opacity={0.7}
          roughness={0.5}
        />
      </mesh>

      {/* 外护套 */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[insulationRadius + 0.1, insulationRadius + 0.1, 5, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          transparent
          opacity={0.6}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

export default function CableModelViewer({ cableSpec }: CableModelViewerProps) {
  if (!cableSpec) {
    return (
      <Paper elevation={3} sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          请先输入参数并计算以查看3D模型
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        电缆3D结构
      </Typography>
      <Box sx={{ height: 400, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[3, 3, 5]} fov={50} />
          <CableModel cableSpec={cableSpec} />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={2}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="warehouse" />
        </Canvas>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          提示：鼠标拖拽旋转，滚轮缩放
        </Typography>
      </Box>
    </Paper>
  );
}

