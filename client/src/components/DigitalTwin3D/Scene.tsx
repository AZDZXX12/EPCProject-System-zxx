/**
 * 3D场景组件 - 使用React Three Fiber渲染3D模型
 */

import React, { Component, Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  Stage, 
  OrbitControls, 
  useGLTF, 
  Html, 
  useProgress,
  Grid,
  Environment,
  Float,
  useAnimations
} from '@react-three/drei';
import { ViewerSettings, ModelStats, ViewMode } from './types';
import * as THREE from 'three';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { GearSystem } from './GearSystem';
import { useWebGLCleanup } from '../../hooks/useWebGLCleanup';
import './DigitalTwin3D.css';

// Poly Haven HDRI映射
const HDRI_URLS: Record<string, string> = {
  studio: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
  royal_esplanade: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/royal_esplanade_1k.hdr',
  venice_sunset: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
  moonless_golf: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr',
  peppermint_powerplant: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_1k.hdr',
  forest_slope: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/forest_slope_1k.hdr',
  brown_photostudio: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_02_1k.hdr',
  aerodynamics_workshop: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr',
  city: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/royal_esplanade_1k.hdr',
};

// 错误边界
class ErrorBoundary extends Component<{children?: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Viewer Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="error-container">
            <AlertTriangle className="error-icon" />
            <h3 className="error-title">加载失败</h3>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="error-retry-btn"
            >
              重试
            </button>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

// 加载指示器
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-spinner-wrapper">
          <div className="loader-spinner-track" />
          <div className="loader-spinner-ring" />
        </div>
        <div className="loader-info">
          <div className="loader-progress">{progress.toFixed(0)}%</div>
          <div className="loader-text">LOADING</div>
        </div>
      </div>
    </Html>
  );
}

// 智能标签
const SmartLabel: React.FC<{ position: [number, number, number]; label: string; value: string; unit?: string }> = ({ position, label, value, unit }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Html position={position} distanceFactor={15}>
      <div 
        className="smart-label"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="smart-label-dot">
           <div className="smart-label-dot-inner" />
        </div>
        
        <div className={`smart-label-line ${hovered ? 'smart-label-line-visible' : ''}`} />
        
        <div className={`smart-label-content ${hovered ? 'smart-label-content-visible' : ''}`}>
           <div className="smart-label-title">{label}</div>
           <div className="smart-label-value-container">
             <span className="smart-label-value">{value}</span>
             <span className="smart-label-unit">{unit}</span>
           </div>
        </div>
      </div>
    </Html>
  );
};

// 巡检路径动画
const InspectionPath: React.FC<{ active: boolean }> = ({ active }) => {
  const { camera } = useThree();
  const timeRef = useRef(0);
  const initialPos = useRef<THREE.Vector3>(new THREE.Vector3());
  
  useEffect(() => {
    if (active) {
      timeRef.current = 0;
      initialPos.current.copy(camera.position);
    }
  }, [active, camera]);

  useFrame((state, delta) => {
    if (active) {
      timeRef.current += delta * 0.2;
      const t = timeRef.current;
      
      const radius = 15;
      const x = Math.sin(t) * radius;
      const z = Math.cos(t) * radius;
      const y = 8 + Math.sin(t * 2) * 2;

      camera.position.lerp(new THREE.Vector3(x, y, z), 0.05);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

// 演示工厂场景
const DemoFactory: React.FC<{ onStatsUpdate?: (stats: ModelStats) => void; viewMode: ViewMode }> = ({ onStatsUpdate, viewMode }) => {
  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate({
        triangles: '45,210',
        materials: 12,
        dimensions: '12m x 8m x 6m'
      });
    }
  }, [onStatsUpdate]);

  const materialGlass = new THREE.MeshPhysicalMaterial({
    color: '#3b82f6',
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 1,
    transparent: true,
    opacity: 0.8
  });

  const materialMetal = new THREE.MeshStandardMaterial({ 
    color: '#1e293b', 
    roughness: 0.3, 
    metalness: 0.9 
  });
  
  const materialGlow = new THREE.MeshStandardMaterial({ 
    color: '#000000', 
    emissive: '#06b6d4', 
    emissiveIntensity: 3
  });

  return (
    <group position={[0, -3, 0]} scale={[0.5, 0.5, 0.5]}>
      
      {viewMode === 'monitor' && (
        <group>
          <SmartLabel position={[0, 9, 0]} label="F-101 裂解炉" value="842.5" unit="°C" />
          <SmartLabel position={[5, 5, -2]} label="TK-201 乙烯储罐" value="88.9" unit="%" />
          <SmartLabel position={[-5, 5, -2]} label="TK-101 粗汽油" value="72.5" unit="%" />
        </group>
      )}

      {/* 主反应器 */}
      <mesh position={[0, 4, 0]} castShadow receiveShadow material={materialMetal}>
        <cylinderGeometry args={[2.5, 2.5, 7, 64]} />
      </mesh>
      {/* 发光环 */}
      <mesh position={[0, 7.6, 0]} material={materialGlow}>
        <torusGeometry args={[2.6, 0.05, 16, 100]} />
      </mesh>
      <mesh position={[0, 0.6, 0]} material={materialGlow}>
        <torusGeometry args={[2.6, 0.05, 16, 100]} />
      </mesh>
      
      {/* 玻璃储罐 */}
      <group position={[5, 3, -2]}>
        <mesh castShadow material={materialGlass}>
          <cylinderGeometry args={[1.8, 1.8, 5, 32]} />
        </mesh>
        <mesh position={[0, -1, 0]} material={new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#06b6d4', emissiveIntensity: 0.5 })}>
           <cylinderGeometry args={[1.7, 1.7, 3, 32]} />
        </mesh>
        <mesh position={[0, 2.6, 0]} material={materialMetal} rotation={[Math.PI/2, 0, 0]}>
           <sphereGeometry args={[1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} />
        </mesh>
      </group>

      <group position={[-5, 3, -2]}>
        <mesh castShadow material={materialGlass}>
          <cylinderGeometry args={[1.8, 1.8, 5, 32]} />
        </mesh>
        <mesh position={[0, -1.5, 0]} material={new THREE.MeshStandardMaterial({ color: '#eab308', emissive: '#eab308', emissiveIntensity: 0.5 })}>
           <cylinderGeometry args={[1.7, 1.7, 2, 32]} />
        </mesh>
        <mesh position={[0, 2.6, 0]} material={materialMetal} rotation={[Math.PI/2, 0, 0]}>
           <sphereGeometry args={[1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} />
        </mesh>
      </group>

      {/* 连接管道 */}
      <mesh position={[2.5, 1, -2]} rotation={[0, 0, Math.PI / 2]} material={materialGlow}>
        <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
      </mesh>
      <mesh position={[-2.5, 1, -2]} rotation={[0, 0, Math.PI / 2]} material={materialGlow}>
        <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
      </mesh>

      {/* 齿轮传动系统 */}
      <GearSystem position={[0, 0, 5]} scale={0.8} />

      <pointLight position={[0, 8, 5]} intensity={10} color="#06b6d4" distance={20} />
    </group>
  );
};

// 模型包装器
const Model: React.FC<{ url: string; settings: ViewerSettings; onStatsUpdate?: (stats: ModelStats) => void }> = ({ url, settings, onStatsUpdate }) => {
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, scene);
  
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((mat: any) => {
          mat.wireframe = settings.wireframe;

          if (settings.materialConfig) {
            const { color, metalness, roughness, opacity, transparent, blending } = settings.materialConfig;
            
            if (mat.color) mat.color.set(color);
            if (mat.metalness !== undefined) mat.metalness = metalness;
            if (mat.roughness !== undefined) mat.roughness = roughness;
            
            if (mat.opacity !== undefined) {
              mat.opacity = opacity;
              mat.transparent = transparent || opacity < 1; 
            }

            const blendingMap: Record<string, THREE.Blending> = {
              'normal': THREE.NormalBlending,
              'additive': THREE.AdditiveBlending,
              'subtractive': THREE.SubtractiveBlending,
              'multiply': THREE.MultiplyBlending
            };
            
            if (blending && blendingMap[blending] !== undefined) {
              mat.blending = blendingMap[blending];
            }

            mat.needsUpdate = true;
          }
        });
      }
    });
  }, [clonedScene, settings]);

  useEffect(() => {
    if (onStatsUpdate) {
      let triangles = 0;
      let materials = 0;
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = new THREE.Vector3();
      box.getSize(size);

      clonedScene.traverse((obj: any) => {
        if (obj.isMesh) {
          triangles += obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3;
          if (Array.isArray(obj.material)) materials += obj.material.length;
          else materials += 1;
        }
      });

      onStatsUpdate({
        triangles: triangles.toLocaleString(),
        materials: materials,
        dimensions: `${size.x.toFixed(1)}m x ${size.y.toFixed(1)}m x ${size.z.toFixed(1)}m` 
      });
    }
  }, [clonedScene, onStatsUpdate]);

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      actions[names[0]]?.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  return <primitive object={clonedScene} scale={[settings.scale, settings.scale, settings.scale]} />;
};

// 背景处理器
const BackgroundHandler: React.FC<{ settings: ViewerSettings }> = ({ settings }) => {
  const { scene } = useThree();
  useEffect(() => {
    if (!settings.showEnvBackground) {
      scene.background = new THREE.Color(settings.backgroundColor);
    }
  }, [settings.showEnvBackground, settings.backgroundColor, scene]);
  return null;
};

// WebGL上下文丢失处理器
const WebGLContextHandler: React.FC = () => {
  const { gl } = useThree();
  const { registerDisposable } = useWebGLCleanup();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('[WebGL] Context lost, attempting recovery...');
    };

    const handleContextRestored = () => {
      console.log('[WebGL] Context restored successfully');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // 注册renderer用于清理
    registerDisposable(gl, 'object3d');

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, registerDisposable]);

  return null;
};

// 主场景组件
interface SceneProps {
  fileUrl: string | null;
  settings: ViewerSettings;
  onStatsUpdate?: (stats: ModelStats) => void;
  viewMode: ViewMode;
  isInspecting: boolean;
  onAddObject?: (type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus') => void;
  transformMode?: 'translate' | 'rotate' | 'scale';
}

const Scene: React.FC<SceneProps> = ({ fileUrl, settings, onStatsUpdate, viewMode, isInspecting }) => {
  const hdriUrl = HDRI_URLS[settings.preset] || HDRI_URLS['city'];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 45, position: [10, 10, 10] }} 
      className="twin-canvas"
      gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <BackgroundHandler settings={settings} />
      <WebGLContextHandler />
      
      <InspectionPath active={isInspecting} />

      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          {fileUrl ? (
            <Stage environment={null} intensity={settings.intensity}>
              <Model url={fileUrl} settings={settings} onStatsUpdate={onStatsUpdate} />
            </Stage>
          ) : (
             <group>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                   <DemoFactory onStatsUpdate={onStatsUpdate} viewMode={viewMode} />
                </Float>
             </group>
          )}
          
          <Environment 
             files={hdriUrl} 
             background={settings.showEnvBackground}
             environmentRotation={[0, THREE.MathUtils.degToRad(settings.envRotation), 0]}
             key={hdriUrl}
          />
        </Suspense>
      </ErrorBoundary>

      {settings.grid && (
        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          fadeStrength={1.5}
          sectionColor="#1e3a8a" 
          cellColor="#111827"    
          sectionSize={1}
          cellSize={0.25}
          position={[0, -4, 0]} 
        />
      )}
      
      {settings.axes && <primitive object={new THREE.AxesHelper(5)} />}

      <OrbitControls 
        autoRotate={viewMode === 'monitor' ? false : settings.autoRotate} 
        makeDefault 
        enabled={!isInspecting}
      />
    </Canvas>
  );
};

export default Scene;
