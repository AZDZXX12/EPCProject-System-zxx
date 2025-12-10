/**
 * 齿轮传动系统组件
 * 展示一对啮合传动的齿轮，带有真实的旋转动画
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GearProps {
  position: [number, number, number];
  rotation: [number, number, number];
  teeth: number;
  radius: number;
  thickness: number;
  color: string;
  rotationSpeed: number;
}

// 单个齿轮组件
const Gear: React.FC<GearProps> = ({ 
  position, 
  rotation: initialRotation, 
  teeth, 
  radius, 
  thickness, 
  color,
  rotationSpeed 
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // 创建齿轮几何体
  const gearGeometry = React.useMemo(() => {
    const shape = new THREE.Shape();
    const innerRadius = radius * 0.7; // 齿根圆半径
    const outerRadius = radius; // 齿顶圆半径
    const toothAngle = (Math.PI * 2) / teeth; // 每个齿的角度
    const toothWidth = toothAngle * 0.4; // 齿宽
    
    // 绘制齿轮轮廓
    for (let i = 0; i < teeth; i++) {
      const baseAngle = i * toothAngle;
      
      // 齿根圆弧起点
      const angle1 = baseAngle - toothWidth / 2;
      const x1 = Math.cos(angle1) * innerRadius;
      const y1 = Math.sin(angle1) * innerRadius;
      
      // 齿根到齿顶的过渡点
      const angle2 = baseAngle - toothWidth / 4;
      const x2 = Math.cos(angle2) * outerRadius;
      const y2 = Math.sin(angle2) * outerRadius;
      
      // 齿顶中心
      const angle3 = baseAngle;
      const x3 = Math.cos(angle3) * outerRadius;
      const y3 = Math.sin(angle3) * outerRadius;
      
      // 齿顶到齿根的过渡点
      const angle4 = baseAngle + toothWidth / 4;
      const x4 = Math.cos(angle4) * outerRadius;
      const y4 = Math.sin(angle4) * outerRadius;
      
      // 齿根圆弧终点
      const angle5 = baseAngle + toothWidth / 2;
      const x5 = Math.cos(angle5) * innerRadius;
      const y5 = Math.sin(angle5) * innerRadius;
      
      if (i === 0) {
        shape.moveTo(x1, y1);
      } else {
        shape.lineTo(x1, y1);
      }
      
      // 绘制齿形
      shape.lineTo(x2, y2);
      shape.lineTo(x3, y3);
      shape.lineTo(x4, y4);
      shape.lineTo(x5, y5);
      
      // 齿根圆弧（连接到下一个齿）
      if (i < teeth - 1) {
        const nextAngle = (i + 1) * toothAngle - toothWidth / 2;
        const arcX = Math.cos(nextAngle) * innerRadius;
        const arcY = Math.sin(nextAngle) * innerRadius;
        shape.absarc(0, 0, innerRadius, angle5, nextAngle, false);
      }
    }
    
    shape.closePath();
    
    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [teeth, radius, thickness]);

  // 动画旋转
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += rotationSpeed * delta;
    }
  });

  // 材质
  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.8,
    roughness: 0.3,
    emissive: color,
    emissiveIntensity: 0.2
  });

  return (
    <group ref={meshRef} position={position} rotation={initialRotation}>
      <mesh geometry={gearGeometry} material={material} castShadow receiveShadow>
        <meshStandardMaterial 
          color={color}
          metalness={0.8}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* 中心轴 */}
      <mesh position={[0, 0, thickness / 2]} castShadow>
        <cylinderGeometry args={[radius * 0.3, radius * 0.3, thickness * 1.5, 32]} />
        <meshStandardMaterial 
          color="#1e293b"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* 轴承环 */}
      <mesh position={[0, 0, thickness / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.35, 0.08, 16, 32]} />
        <meshStandardMaterial 
          color="#475569"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// 齿轮传动系统
interface GearSystemProps {
  position?: [number, number, number];
  scale?: number;
}

export const GearSystem: React.FC<GearSystemProps> = ({ 
  position = [0, 0, 0],
  scale = 1 
}) => {
  // 齿轮参数
  const gear1Teeth = 24;
  const gear2Teeth = 16;
  const gear1Radius = 2 * scale;
  const gear2Radius = (gear1Radius * gear2Teeth) / gear1Teeth;
  const thickness = 0.4 * scale;
  
  // 计算齿轮间距（确保齿轮啮合）
  const gearDistance = gear1Radius + gear2Radius;
  
  // 计算转速比（反向旋转）
  const gear1Speed = 1.0;
  const gear2Speed = -(gear1Speed * gear1Teeth) / gear2Teeth;

  return (
    <group position={position}>
      {/* 主动齿轮（左侧，青色） */}
      <Gear
        position={[-gearDistance / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        teeth={gear1Teeth}
        radius={gear1Radius}
        thickness={thickness}
        color="#06b6d4"
        rotationSpeed={gear1Speed}
      />
      
      {/* 从动齿轮（右侧，橙色） */}
      <Gear
        position={[gearDistance / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        teeth={gear2Teeth}
        radius={gear2Radius}
        thickness={thickness}
        color="#f97316"
        rotationSpeed={gear2Speed}
      />
      
      {/* 支撑底座 */}
      <mesh position={[0, -gear1Radius - 0.5, 0]} receiveShadow>
        <boxGeometry args={[gearDistance + 2, 0.3, thickness + 1]} />
        <meshStandardMaterial 
          color="#334155"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* 左侧支架 */}
      <mesh position={[-gearDistance / 2, -gear1Radius / 2, 0]}>
        <boxGeometry args={[0.3, gear1Radius, thickness + 0.5]} />
        <meshStandardMaterial 
          color="#475569"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* 右侧支架 */}
      <mesh position={[gearDistance / 2, -gear2Radius / 2, 0]}>
        <boxGeometry args={[0.3, gear2Radius, thickness + 0.5]} />
        <meshStandardMaterial 
          color="#475569"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* 传动指示灯光 */}
      <pointLight 
        position={[-gearDistance / 2, 0, 2]} 
        intensity={5} 
        color="#06b6d4" 
        distance={8} 
      />
      <pointLight 
        position={[gearDistance / 2, 0, 2]} 
        intensity={5} 
        color="#f97316" 
        distance={8} 
      />
    </group>
  );
};

export default GearSystem;
