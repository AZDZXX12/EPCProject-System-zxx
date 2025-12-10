/**
 * 模型编辑器 - 管理场景中的3D对象
 * 支持添加、删除、复制、变换对象
 */

import React, { useState, useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EditorControls, TransformMode } from './EditorControls';

export interface SceneObject {
  id: string;
  name: string;
  type: 'mesh' | 'group' | 'light' | 'camera';
  object: THREE.Object3D;
  visible: boolean;
  locked: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

interface ModelEditorProps {
  children?: React.ReactNode;
  onObjectsChange?: (objects: SceneObject[]) => void;
}

export const ModelEditor: React.FC<ModelEditorProps> = ({ 
  children,
  onObjectsChange 
}) => {
  const { scene } = useThree();
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const objectIdCounter = useRef(0);

  // 添加基础几何体
  const addPrimitive = useCallback((type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus') => {
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
    }

    const material = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      metalness: 0.5,
      roughness: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(0, 1, 0);

    const id = `object_${objectIdCounter.current++}`;
    mesh.name = `${name}_${id}`;
    mesh.userData.id = id;

    scene.add(mesh);

    const newObject: SceneObject = {
      id,
      name: mesh.name,
      type: 'mesh',
      object: mesh,
      visible: true,
      locked: false,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    };

    setObjects(prev => {
      const updated = [...prev, newObject];
      onObjectsChange?.(updated);
      return updated;
    });

    setSelectedObject(mesh);
    return mesh;
  }, [scene, onObjectsChange]);

  // 删除对象
  const deleteObject = useCallback((id: string) => {
    const obj = objects.find(o => o.id === id);
    if (obj) {
      scene.remove(obj.object);
      setObjects(prev => {
        const updated = prev.filter(o => o.id !== id);
        onObjectsChange?.(updated);
        return updated;
      });
      if (selectedObject === obj.object) {
        setSelectedObject(null);
      }
    }
  }, [objects, scene, selectedObject, onObjectsChange]);

  // 复制对象
  const duplicateObject = useCallback((id: string) => {
    const obj = objects.find(o => o.id === id);
    if (obj && obj.object instanceof THREE.Mesh) {
      const cloned = obj.object.clone();
      cloned.position.add(new THREE.Vector3(1, 0, 1));
      
      const newId = `object_${objectIdCounter.current++}`;
      cloned.name = `${obj.name}_copy`;
      cloned.userData.id = newId;

      scene.add(cloned);

      const newObject: SceneObject = {
        id: newId,
        name: cloned.name,
        type: 'mesh',
        object: cloned,
        visible: true,
        locked: false,
        position: [cloned.position.x, cloned.position.y, cloned.position.z],
        rotation: [cloned.rotation.x, cloned.rotation.y, cloned.rotation.z],
        scale: [cloned.scale.x, cloned.scale.y, cloned.scale.z]
      };

      setObjects(prev => {
        const updated = [...prev, newObject];
        onObjectsChange?.(updated);
        return updated;
      });

      setSelectedObject(cloned);
    }
  }, [objects, scene, onObjectsChange]);

  // 更新对象变换
  const handleTransform = useCallback((object: THREE.Object3D) => {
    setObjects(prev => {
      const updated = prev.map(obj => {
        if (obj.object === object) {
          return {
            ...obj,
            position: [object.position.x, object.position.y, object.position.z] as [number, number, number],
            rotation: [object.rotation.x, object.rotation.y, object.rotation.z] as [number, number, number],
            scale: [object.scale.x, object.scale.y, object.scale.z] as [number, number, number]
          };
        }
        return obj;
      });
      onObjectsChange?.(updated);
      return updated;
    });
  }, [onObjectsChange]);

  // 切换对象可见性
  const toggleVisibility = useCallback((id: string) => {
    setObjects(prev => {
      const updated = prev.map(obj => {
        if (obj.id === id) {
          obj.object.visible = !obj.visible;
          return { ...obj, visible: !obj.visible };
        }
        return obj;
      });
      onObjectsChange?.(updated);
      return updated;
    });
  }, [onObjectsChange]);

  // 暴露API给父组件（通过context或props传递ref）
  // 注意：这里需要父组件传递ref才能使用
  // React.useImperativeHandle(ref, () => ({
  //   addPrimitive,
  //   deleteObject,
  //   duplicateObject,
  //   setTransformMode,
  //   setSelectedObject,
  //   getObjects: () => objects,
  //   getSelectedObject: () => selectedObject
  // }));

  return (
    <>
      {children}
      <EditorControls
        selectedObject={selectedObject}
        mode={transformMode}
        onTransform={handleTransform}
        enabled={true}
      />
    </>
  );
};

export default ModelEditor;
