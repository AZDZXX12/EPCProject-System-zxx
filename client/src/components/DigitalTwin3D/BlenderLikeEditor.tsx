/**
 * 简化版Blender编辑器
 * 保留基础编辑功能：移动、旋转、缩放、添加对象
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Box, Circle, Activity, Move, RotateCw, Maximize2, 
  Trash2, Copy, Eye, EyeOff, Lock, Unlock, Layers,
  Camera, Play, Square as StopIcon, Undo, Redo, Download,
  FolderOpen, Save, FileText, Package, MousePointer, Hand,
  ZoomIn, Pen, Settings
} from 'lucide-react';
import './BlenderLikeEditor.css';

interface EditorObject {
  id: string;
  name: string;
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'torus_knot';
  mesh: THREE.Mesh;
  visible: boolean;
  locked: boolean;
  animation?: 'rotate' | 'float' | null;
}

type ViewPreset = 'perspective' | 'front' | 'right' | 'top';

// 带动画的对象组件
const AnimatedObject: React.FC<{
  obj: EditorObject;
  isAnimating: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ obj, isAnimating, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(obj.mesh);

  useFrame((state) => {
    if (!meshRef.current || !isAnimating || !obj.animation) return;

    const time = state.clock.getElapsedTime();

    switch (obj.animation) {
      case 'rotate':
        meshRef.current.rotation.y = time;
        break;
      case 'float':
        meshRef.current.position.y = obj.mesh.position.y + Math.sin(time * 2) * 0.2;
        break;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={obj.mesh}
      onClick={(e: any) => {
        e.stopPropagation();
        if (!obj.locked) {
          onSelect();
        }
      }}
    />
  );
};

// 历史状态接口
interface HistoryState {
  objects: EditorObject[];
  selectedId: string | null;
  timestamp: number;
}

export const BlenderLikeEditor: React.FC = () => {
  const [objects, setObjects] = useState<EditorObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [showGrid, setShowGrid] = useState(true);
  const [showGizmo, setShowGizmo] = useState(true);
  const [materialColor, setMaterialColor] = useState('#06b6d4');
  const [currentView, setCurrentView] = useState<ViewPreset>('perspective');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [objectMode, setObjectMode] = useState<'object' | 'edit'>('object');
  
  // 撤销/重做系统
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const objectIdCounter = useRef(0);
  const controlsRef = useRef<any>(null);

  // 添加基础几何体
  const addObject = (type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'torus_knot') => {
    let geometry: THREE.BufferGeometry;
    let name = '';

    switch (type) {
      case 'box':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        name = 'Cube';
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        name = 'Sphere';
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        name = 'Cylinder';
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        name = 'Cone';
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
        name = 'Torus';
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(2, 2);
        name = 'Plane';
        break;
      case 'torus_knot':
        geometry = new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
        name = 'TorusKnot';
        break;
    }

    const material = new THREE.MeshStandardMaterial({
      color: materialColor,
      metalness: 0.5,
      roughness: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(0, 0.5, 0);

    const id = `object_${objectIdCounter.current++}`;
    const newObject: EditorObject = {
      id,
      name: `${name}_${id}`,
      type,
      mesh,
      visible: true,
      locked: false
    };

    setObjects(prev => [...prev, newObject]);
    setSelectedId(id);
  };

  // 删除对象
  const deleteObject = (id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // 复制对象
  const duplicateObject = (id: string) => {
    const obj = objects.find(o => o.id === id);
    if (obj) {
      const clonedMesh = obj.mesh.clone();
      clonedMesh.position.add(new THREE.Vector3(1, 0, 1));
      
      const newId = `object_${objectIdCounter.current++}`;
      const newObject: EditorObject = {
        id: newId,
        name: `${obj.name}_copy`,
        type: obj.type,
        mesh: clonedMesh,
        visible: true,
        locked: false
      };

      setObjects(prev => [...prev, newObject]);
      setSelectedId(newId);
    }
  };

  // 切换可见性
  const toggleVisibility = (id: string) => {
    setObjects(prev => prev.map(obj => {
      if (obj.id === id) {
        obj.mesh.visible = !obj.visible;
        return { ...obj, visible: !obj.visible };
      }
      return obj;
    }));
  };

  // 切换锁定
  const toggleLock = (id: string) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, locked: !obj.locked } : obj
    ));
  };

  // 视图切换
  const switchView = (view: ViewPreset) => {
    setCurrentView(view);
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const distance = 10;

    switch (view) {
      case 'front':
        controls.object.position.set(0, 0, distance);
        controls.object.lookAt(0, 0, 0);
        break;
      case 'right':
        controls.object.position.set(distance, 0, 0);
        controls.object.lookAt(0, 0, 0);
        break;
      case 'top':
        controls.object.position.set(0, distance, 0);
        controls.object.lookAt(0, 0, 0);
        break;
      case 'perspective':
        controls.object.position.set(5, 5, 5);
        controls.object.lookAt(0, 0, 0);
        break;
    }
    controls.update();
  };

  // 切换动画
  const toggleAnimation = (id: string, type: 'rotate' | 'float') => {
    setObjects(prev => prev.map(obj => {
      if (obj.id === id) {
        const newAnimation = obj.animation === type ? null : type;
        return { ...obj, animation: newAnimation };
      }
      return obj;
    }));
  };

  // 全局播放/停止动画
  const toggleGlobalAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // 保存历史状态
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      objects: JSON.parse(JSON.stringify(objects.map(obj => ({
        ...obj,
        mesh: undefined // 不保存mesh对象，只保存数据
      })))),
      selectedId,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-50); // 最多保存50个状态
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [objects, selectedId, historyIndex]);

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      const prevState = history[historyIndex - 1];
      if (prevState) {
        // 这里需要重建mesh对象
        console.log('撤销到:', prevState.timestamp);
      }
    }
  }, [history, historyIndex]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const nextState = history[historyIndex + 1];
      if (nextState) {
        console.log('重做到:', nextState.timestamp);
      }
    }
  }, [history, historyIndex]);

  // 导出场景为JSON
  const exportScene = () => {
    const sceneData = {
      objects: objects.map(obj => ({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        position: obj.mesh.position.toArray(),
        rotation: obj.mesh.rotation.toArray(),
        scale: obj.mesh.scale.toArray(),
        visible: obj.visible,
        locked: obj.locked,
        animation: obj.animation,
        material: {
          color: (obj.mesh.material as THREE.MeshStandardMaterial).color.getHexString()
        }
      })),
      metadata: {
        version: '3.0',
        created: new Date().toISOString(),
        objectCount: objects.length
      }
    };

    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blender-scene-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 保存场景到本地文件
  const saveScene = () => {
    const sceneData = {
      objects: objects.map(obj => ({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        position: obj.mesh.position.toArray(),
        rotation: obj.mesh.rotation.toArray(),
        scale: obj.mesh.scale.toArray(),
        visible: obj.visible,
        locked: obj.locked,
        animation: obj.animation,
        material: {
          color: (obj.mesh.material as THREE.MeshStandardMaterial).color.getHexString()
        }
      })),
      metadata: {
        version: '3.0',
        created: new Date().toISOString(),
        objectCount: objects.length,
        savedAt: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.blend3d';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 创建几何体的辅助函数
  const createGeometry = (type: string): THREE.BufferGeometry => {
    switch (type) {
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(0.5, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      case 'cone':
        return new THREE.ConeGeometry(0.5, 1, 32);
      case 'torus':
        return new THREE.TorusGeometry(0.5, 0.2, 16, 100);
      case 'plane':
        return new THREE.PlaneGeometry(2, 2);
      case 'torus_knot':
        return new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // 从本地文件加载场景
  const loadScene = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.blend3d,.json,.blend';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      console.log('📂 开始加载文件:', file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const sceneData = JSON.parse(event.target?.result as string);
          console.log('📝 解析文件数据:', sceneData);
          
          // 验证文件格式
          if (!sceneData.objects || !Array.isArray(sceneData.objects)) {
            alert('无效的场景文件格式');
            return;
          }

          // 清空当前场景
          setObjects([]);
          setSelectedId(null);

          // 重建对象
          const newObjects: EditorObject[] = [];
          sceneData.objects.forEach((objData: any) => {
            try {
              const geometry = createGeometry(objData.type);

              // 修复颜色格式处理
              let colorValue = objData.material?.color || '06b6d4';
              // 如果颜色已经包含#，移除它
              colorValue = colorValue.replace('#', '');
              // 确保颜色值是6位十六进制
              if (!/^[0-9A-Fa-f]{6}$/.test(colorValue)) {
                colorValue = '06b6d4';
              }

              const material = new THREE.MeshStandardMaterial({
                color: `#${colorValue}`,
                metalness: objData.material?.metalness || 0.5,
                roughness: objData.material?.roughness || 0.5,
                transparent: objData.material?.opacity < 1,
                opacity: objData.material?.opacity || 1
              });

              const mesh = new THREE.Mesh(geometry, material);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              
              // 恢复变换
              if (objData.position) mesh.position.fromArray(objData.position);
              if (objData.rotation) mesh.rotation.fromArray(objData.rotation);
              if (objData.scale) mesh.scale.fromArray(objData.scale);

              const newObj: EditorObject = {
                id: objData.id || `object_${objectIdCounter.current++}`,
                name: objData.name || 'Object',
                type: objData.type || 'box',
                mesh,
                visible: objData.visible !== false,
                locked: objData.locked || false,
                animation: objData.animation || null
              };

              newObjects.push(newObj);
              console.log('✅ 成功加载对象:', newObj.name);
            } catch (objError) {
              console.error('❌ 加载对象失败:', objData, objError);
            }
          });

          setObjects(newObjects);
          console.log(`✅ 场景加载完成：${newObjects.length}个对象`);
          alert(`成功加载 ${newObjects.length} 个对象！`);
          
        } catch (error) {
          console.error('❌ 加载场景失败:', error);
          alert(`加载场景文件失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
      };
      reader.onerror = () => {
        console.error('❌ 文件读取失败');
        alert('文件读取失败，请重试');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 导出为OBJ格式
  const exportOBJ = () => {
    if (objects.length === 0) {
      alert('场景中没有对象可导出');
      return;
    }

    let objContent = '# Exported from Blender Editor v4.0\n';
    objContent += `# Date: ${new Date().toISOString()}\n\n`;

    let vertexOffset = 1;

    objects.forEach((obj, index) => {
      if (!obj.visible) return;

      objContent += `# Object: ${obj.name}\n`;
      objContent += `o ${obj.name}\n`;

      const geometry = obj.mesh.geometry;
      const position = geometry.attributes.position;
      const vertices = position.array;

      // 写入顶点
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        objContent += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
      }

      // 写入面
      const vertexCount = vertices.length / 3;
      for (let i = 0; i < vertexCount; i += 3) {
        const v1 = vertexOffset + i;
        const v2 = vertexOffset + i + 1;
        const v3 = vertexOffset + i + 2;
        objContent += `f ${v1} ${v2} ${v3}\n`;
      }

      vertexOffset += vertexCount;
      objContent += '\n';
    });

    const blob = new Blob([objContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${Date.now()}.obj`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出为STL格式
  const exportSTL = () => {
    if (objects.length === 0) {
      alert('场景中没有对象可导出');
      return;
    }

    let stlContent = 'solid BlenderEditorExport\n';

    objects.forEach((obj) => {
      if (!obj.visible) return;

      const geometry = obj.mesh.geometry;
      const position = geometry.attributes.position;
      const vertices = position.array;

      // 计算法向量并写入三角面
      for (let i = 0; i < vertices.length; i += 9) {
        // 三个顶点
        const v1 = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        const v2 = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
        const v3 = new THREE.Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);

        // 计算法向量
        const normal = new THREE.Vector3();
        const edge1 = v2.clone().sub(v1);
        const edge2 = v3.clone().sub(v1);
        normal.crossVectors(edge1, edge2).normalize();

        stlContent += `  facet normal ${normal.x.toFixed(6)} ${normal.y.toFixed(6)} ${normal.z.toFixed(6)}\n`;
        stlContent += '    outer loop\n';
        stlContent += `      vertex ${v1.x.toFixed(6)} ${v1.y.toFixed(6)} ${v1.z.toFixed(6)}\n`;
        stlContent += `      vertex ${v2.x.toFixed(6)} ${v2.y.toFixed(6)} ${v2.z.toFixed(6)}\n`;
        stlContent += `      vertex ${v3.x.toFixed(6)} ${v3.y.toFixed(6)} ${v3.z.toFixed(6)}\n`;
        stlContent += '    endloop\n';
        stlContent += '  endfacet\n';
      }
    });

    stlContent += 'endsolid BlenderEditorExport\n';

    const blob = new Blob([stlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${Date.now()}.stl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 快捷键处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 防止在输入框中触发
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key.toLowerCase()) {
      case 'g':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setTransformMode('translate');
        }
        break;
      case 'r':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setTransformMode('rotate');
        }
        break;
      case 'x':
      case 'delete':
        if (selectedId) {
          e.preventDefault();
          deleteObject(selectedId);
        }
        break;
      case 'd':
        if (e.shiftKey && selectedId) {
          e.preventDefault();
          duplicateObject(selectedId);
        }
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;
      case 'o':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          loadScene();
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (objects.length > 0) {
            saveScene();
          }
        } else {
          e.preventDefault();
          setTransformMode('scale');
        }
        break;
      case 'a':
        if (e.shiftKey) {
          e.preventDefault();
          // 显示添加菜单（这里简化为添加立方体）
          addObject('box');
        }
        break;
    }
  }, [selectedId, undo, redo]);

  // 注册快捷键
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selectedObject = objects.find(obj => obj.id === selectedId);

  return (
    <div className="blender-editor">
      {/* 顶部菜单栏 (Blender风格) */}
      <div className="blender-menubar">
        <div className="menu-item">
          <span>文件</span>
          <div className="submenu">
            <button onClick={loadScene}>
              <FolderOpen size={14} />
              打开... (Ctrl+O)
            </button>
            <button onClick={saveScene} disabled={objects.length === 0}>
              <Save size={14} />
              保存 (Ctrl+S)
            </button>
            <div className="menu-divider" />
            <button onClick={exportScene} disabled={objects.length === 0}>
              <Download size={14} />
              导出 →
            </button>
          </div>
        </div>
        <div className="menu-item">
          <span>编辑</span>
          <div className="submenu">
            <button onClick={undo} disabled={historyIndex <= 0}>
              <Undo size={14} />
              撤销 (Ctrl+Z)
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo size={14} />
              重做 (Ctrl+Shift+Z)
            </button>
          </div>
        </div>
        <div className="menu-item">
          <span>添加</span>
          <div className="submenu">
            <button onClick={() => addObject('box')}>
              <Box size={14} />
              立方体
            </button>
            <button onClick={() => addObject('sphere')}>
              <Circle size={14} />
              球体
            </button>
            <button onClick={() => addObject('cylinder')}>
              <Activity size={14} />
              圆柱
            </button>
            <button onClick={() => addObject('cone')}>▲ 圆锥</button>
            <button onClick={() => addObject('torus')}>⭕ 圆环</button>
            <button onClick={() => addObject('plane')}>▢ 平面</button>
          </div>
        </div>
        <div className="menu-item">
          <span>对象</span>
          <div className="submenu">
            <button onClick={() => selectedId && duplicateObject(selectedId)} disabled={!selectedId}>
              <Copy size={14} />
              复制 (Shift+D)
            </button>
            <button onClick={() => selectedId && deleteObject(selectedId)} disabled={!selectedId}>
              <Trash2 size={14} />
              删除 (X)
            </button>
            <div className="menu-divider" />
            <button onClick={() => selectedId && toggleVisibility(selectedId)} disabled={!selectedId}>
              <Eye size={14} />
              切换可见性 (H)
            </button>
            <button onClick={() => selectedId && toggleLock(selectedId)} disabled={!selectedId}>
              <Lock size={14} />
              切换锁定 (L)
            </button>
          </div>
        </div>
        <div className="menu-item">
          <span>视图</span>
          <div className="submenu">
            <button onClick={() => switchView('perspective')}>📐 透视图</button>
            <button onClick={() => switchView('front')}>⬜ 前视图</button>
            <button onClick={() => switchView('right')}>⬛ 右视图</button>
            <button onClick={() => switchView('top')}>🔲 顶视图</button>
            <div className="menu-divider" />
            <button onClick={() => setShowGrid(!showGrid)}>
              {showGrid ? '✓' : ''} 网格
            </button>
            <button onClick={() => setShowGizmo(!showGizmo)}>
              {showGizmo ? '✓' : ''} 坐标轴
            </button>
          </div>
        </div>
        <div className="mode-selector">
          <button 
            className={objectMode === 'object' ? 'active' : ''}
            onClick={() => setObjectMode('object')}
          >
            对象模式
          </button>
          <button 
            className={objectMode === 'edit' ? 'active' : ''}
            onClick={() => setObjectMode('edit')}
          >
            编辑模式
          </button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="blender-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">添加</span>
          <button onClick={() => addObject('box')} title="立方体">
            <Box size={18} />
          </button>
          <button onClick={() => addObject('sphere')} title="球体">
            <Circle size={18} />
          </button>
          <button onClick={() => addObject('cylinder')} title="圆柱">
            <Activity size={18} />
          </button>
          <button onClick={() => addObject('cone')} title="圆锥">
            ▲
          </button>
          <button onClick={() => addObject('torus')} title="圆环">
            ⭕
          </button>
          <button onClick={() => addObject('plane')} title="平面">
            ▢
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <span className="toolbar-label">颜色</span>
          <input 
            type="color" 
            value={materialColor}
            onChange={(e) => setMaterialColor(e.target.value)}
            title="选择材质颜色"
          />
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <span className="toolbar-label">变换</span>
          <button 
            className={transformMode === 'translate' ? 'active' : ''}
            onClick={() => setTransformMode('translate')}
            title="移动 (G)"
          >
            <Move size={18} />
          </button>
          <button 
            className={transformMode === 'rotate' ? 'active' : ''}
            onClick={() => setTransformMode('rotate')}
            title="旋转 (R)"
          >
            <RotateCw size={18} />
          </button>
          <button 
            className={transformMode === 'scale' ? 'active' : ''}
            onClick={() => setTransformMode('scale')}
            title="缩放 (S)"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <span className="toolbar-label">视图</span>
          <button 
            className={currentView === 'perspective' ? 'active' : ''}
            onClick={() => switchView('perspective')}
            title="透视图"
          >
            📐
          </button>
          <button 
            className={currentView === 'front' ? 'active' : ''}
            onClick={() => switchView('front')}
            title="前视图"
          >
            ⬜
          </button>
          <button 
            className={currentView === 'right' ? 'active' : ''}
            onClick={() => switchView('right')}
            title="右视图"
          >
            ⬛
          </button>
          <button 
            className={currentView === 'top' ? 'active' : ''}
            onClick={() => switchView('top')}
            title="顶视图"
          >
            🔲
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <span className="toolbar-label">动画</span>
          <button 
            className={isAnimating ? 'active' : ''}
            onClick={toggleGlobalAnimation}
            title={isAnimating ? '停止动画' : '播放动画'}
          >
            {isAnimating ? <StopIcon size={18} /> : <Play size={18} />}
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <span className="toolbar-label">历史</span>
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            title="撤销 (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="重做 (Ctrl+Shift+Z)"
          >
            <Redo size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section file-section">
          <span className="toolbar-label">文件</span>
          <button 
            onClick={loadScene}
            className="import-btn"
            title="导入场景文件 (Ctrl+O)"
          >
            <FolderOpen size={18} />
            <span className="btn-text">导入</span>
          </button>
          <button 
            onClick={saveScene}
            disabled={objects.length === 0}
            className="save-btn"
            title="保存场景文件 (Ctrl+S)"
          >
            <Save size={18} />
            <span className="btn-text">保存</span>
          </button>
          <div className="export-dropdown">
            <button 
              className="export-main-btn"
              onClick={exportScene}
              disabled={objects.length === 0}
              title="导出选项"
            >
              <Download size={18} />
              <span className="btn-text">导出</span>
            </button>
            <div className="export-menu">
              <button onClick={exportScene} disabled={objects.length === 0}>
                <FileText size={14} />
                <span>JSON格式</span>
              </button>
              <button onClick={exportOBJ} disabled={objects.length === 0}>
                <Package size={14} />
                <span>OBJ格式</span>
              </button>
              <button onClick={exportSTL} disabled={objects.length === 0}>
                <Package size={14} />
                <span>STL格式</span>
              </button>
            </div>
          </div>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <span className="toolbar-label">操作</span>
          <button 
            onClick={() => selectedId && duplicateObject(selectedId)}
            disabled={!selectedId}
            title="复制 (Shift+D)"
          >
            <Copy size={18} />
          </button>
          <button 
            onClick={() => selectedId && deleteObject(selectedId)}
            disabled={!selectedId}
            title="删除 (X)"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-section">
          <span className="toolbar-label">视图</span>
          <button 
            className={showGrid ? 'active' : ''}
            onClick={() => setShowGrid(!showGrid)}
            title="网格"
          >
            <Layers size={18} />
          </button>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="blender-viewport">
        {/* 左侧工具栏 (Blender风格) */}
        {showLeftPanel && (
          <div className="left-toolbar">
            <button 
              className={transformMode === 'translate' ? 'active' : ''}
              onClick={() => setTransformMode('translate')}
              title="选择/移动工具 (G)"
            >
              <MousePointer size={20} />
            </button>
            <button title="光标工具">
              <Hand size={20} />
            </button>
            <button 
              className={transformMode === 'translate' ? 'active' : ''}
              onClick={() => setTransformMode('translate')}
              title="移动 (G)"
            >
              <Move size={20} />
            </button>
            <button 
              className={transformMode === 'rotate' ? 'active' : ''}
              onClick={() => setTransformMode('rotate')}
              title="旋转 (R)"
            >
              <RotateCw size={20} />
            </button>
            <button 
              className={transformMode === 'scale' ? 'active' : ''}
              onClick={() => setTransformMode('scale')}
              title="缩放 (S)"
            >
              <Maximize2 size={20} />
            </button>
            <div className="toolbar-divider-vertical" />
            <button title="测量工具">
              <Pen size={20} />
            </button>
            <button title="注释">
              <FileText size={20} />
            </button>
            <div className="toolbar-divider-vertical" />
            <button 
              onClick={() => setShowLeftPanel(false)}
              title="隐藏工具栏"
            >
              <Settings size={20} />
            </button>
          </div>
        )}
        
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 50 }}
          gl={{ antialias: true }}
        >
          {/* 环境光 */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* 网格 */}
          {showGrid && (
            <Grid
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#06b6d4"
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={true}
            />
          )}

          {/* 渲染所有对象 */}
          {objects.map(obj => (
            obj.visible && (
              <AnimatedObject
                key={obj.id}
                obj={obj}
                isAnimating={isAnimating}
                isSelected={selectedId === obj.id}
                onSelect={() => setSelectedId(obj.id)}
              />
            )
          ))}

          {/* Transform控制器 */}
          {selectedObject && !selectedObject.locked && (
            <TransformControls
              object={selectedObject.mesh}
              mode={transformMode}
              size={1}
            />
          )}

          {/* 轨道控制器 */}
          <OrbitControls ref={controlsRef} makeDefault />

          {/* 坐标轴辅助器 */}
          {showGizmo && (
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport
                axisColors={['#ef4444', '#22c55e', '#3b82f6']}
                labelColor="white"
              />
            </GizmoHelper>
          )}
        </Canvas>

        {/* 视图角度快捷按钮 */}
        <div className="viewport-controls">
          <div className="view-angles">
            <button title="前视图 (Numpad 1)">前</button>
            <button title="右视图 (Numpad 3)">右</button>
            <button title="顶视图 (Numpad 7)">顶</button>
          </div>
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="blender-outliner">
        <div className="outliner-tabs">
          <button 
            className={!showProperties ? 'active' : ''}
            onClick={() => setShowProperties(false)}
          >
            <Layers size={14} />
            <span>大纲</span>
          </button>
          <button 
            className={showProperties ? 'active' : ''}
            onClick={() => setShowProperties(true)}
          >
            <Settings size={14} />
            <span>属性</span>
          </button>
        </div>

        {!showProperties ? (
          /* 对象列表视图 */
          <>
            <div className="outliner-header">
              <Layers size={16} />
              <span>场景对象</span>
              <span className="object-count">{objects.length}</span>
            </div>

            <div className="outliner-list">
          {objects.length === 0 ? (
            <div className="outliner-empty">
              <Box size={32} opacity={0.3} />
              <p>场景中暂无对象</p>
              <p className="hint">点击顶部"添加"按钮创建</p>
            </div>
          ) : (
            objects.map(obj => (
              <div
                key={obj.id}
                className={`outliner-item ${selectedId === obj.id ? 'selected' : ''} ${obj.locked ? 'locked' : ''}`}
                onClick={() => !obj.locked && setSelectedId(obj.id)}
              >
                <div className="item-icon">
                  {obj.type === 'box' && <Box size={14} />}
                  {obj.type === 'sphere' && <Circle size={14} />}
                  {obj.type === 'cylinder' && <Activity size={14} />}
                </div>
                
                <div className="item-name">{obj.name}</div>

                <div className="item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAnimation(obj.id, 'rotate');
                    }}
                    className={obj.animation === 'rotate' ? 'active' : ''}
                    title="旋转动画"
                  >
                    🔄
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAnimation(obj.id, 'float');
                    }}
                    className={obj.animation === 'float' ? 'active' : ''}
                    title="浮动动画"
                  >
                    ⬆️
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(obj.id);
                    }}
                    title={obj.visible ? '隐藏' : '显示'}
                  >
                    {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(obj.id);
                    }}
                    title={obj.locked ? '解锁' : '锁定'}
                  >
                    {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                </div>
              </div>
            ))
          )}
            </div>
          </>
        ) : (
          /* 属性面板视图 */
          <div className="properties-panel">
            <div className="outliner-header">
              <Settings size={16} />
              <span>对象属性</span>
            </div>

            {selectedObject ? (
              <div className="properties-content">
                {/* 对象信息 */}
                <div className="property-section">
                  <div className="section-title">对象</div>
                  <div className="property-row">
                    <label>名称:</label>
                    <span>{selectedObject.name}</span>
                  </div>
                  <div className="property-row">
                    <label>类型:</label>
                    <span>{selectedObject.type}</span>
                  </div>
                </div>

                {/* 变换属性 */}
                <div className="property-section">
                  <div className="section-title">变换</div>
                  
                  <div className="transform-group">
                    <label>位置 X</label>
                    <input 
                      type="number" 
                      value={selectedObject.mesh.position.x.toFixed(3)} 
                      readOnly 
                      step="0.1"
                    />
                  </div>
                  <div className="transform-group">
                    <label>位置 Y</label>
                    <input 
                      type="number" 
                      value={selectedObject.mesh.position.y.toFixed(3)} 
                      readOnly 
                      step="0.1"
                    />
                  </div>
                  <div className="transform-group">
                    <label>位置 Z</label>
                    <input 
                      type="number" 
                      value={selectedObject.mesh.position.z.toFixed(3)} 
                      readOnly 
                      step="0.1"
                    />
                  </div>

                  <div className="transform-group">
                    <label>旋转 X</label>
                    <input 
                      type="number" 
                      value={(selectedObject.mesh.rotation.x * 180 / Math.PI).toFixed(1)} 
                      readOnly 
                      step="1"
                    />
                  </div>
                  <div className="transform-group">
                    <label>旋转 Y</label>
                    <input 
                      type="number" 
                      value={(selectedObject.mesh.rotation.y * 180 / Math.PI).toFixed(1)} 
                      readOnly 
                      step="1"
                    />
                  </div>
                  <div className="transform-group">
                    <label>旋转 Z</label>
                    <input 
                      type="number" 
                      value={(selectedObject.mesh.rotation.z * 180 / Math.PI).toFixed(1)} 
                      readOnly 
                      step="1"
                    />
                  </div>

                  <div className="transform-group">
                    <label>缩放 X</label>
                    <input 
                      type="number" 
                      value={selectedObject.mesh.scale.x.toFixed(3)} 
                      readOnly 
                      step="0.1"
                    />
                  </div>
                  <div className="transform-group">
                    <label>缩放 Y</label>
                    <input 
                      type="number" 
                      value={selectedObject.mesh.scale.y.toFixed(3)} 
                      readOnly 
                      step="0.1"
                    />
                  </div>
                  <div className="transform-group">
                    <label>缩放 Z</label>
                    <input 
                      type="number" 
                      value={selectedObject.mesh.scale.z.toFixed(3)} 
                      readOnly 
                      step="0.1"
                    />
                  </div>
                </div>

                {/* 材质属性 */}
                <div className="property-section">
                  <div className="section-title">材质</div>
                  <div className="property-row">
                    <label>颜色:</label>
                    <div className="color-preview" style={{
                      background: `#${(selectedObject.mesh.material as THREE.MeshStandardMaterial).color.getHexString()}`,
                      width: '40px',
                      height: '20px',
                      border: '1px solid #444',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="properties-empty">
                <p>请选择一个对象</p>
                <p className="hint">在大纲中点击对象</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="blender-statusbar">
        <div className="status-info">
          <span>对象: {objects.length}</span>
          <span>|</span>
          <span>选中: {selectedObject ? selectedObject.name : '无'}</span>
          <span>|</span>
          <span>模式: {transformMode === 'translate' ? '移动' : transformMode === 'rotate' ? '旋转' : '缩放'}</span>
        </div>
        <div className="status-tips">
          <span>💡 G=移动 | R=旋转 | S=缩放 | X=删除 | Shift+D=复制</span>
        </div>
      </div>
    </div>
  );
};

export default BlenderLikeEditor;
