/**
 * 3D编辑器控制组件 - 类似Blender的变换控制
 * 支持移动(G)、旋转(R)、缩放(S)
 */

import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { TransformControls as DreiTransformControls } from '@react-three/drei';
import * as THREE from 'three';

export type TransformMode = 'translate' | 'rotate' | 'scale';

interface EditorControlsProps {
  selectedObject: THREE.Object3D | null;
  mode: TransformMode;
  onTransform?: (object: THREE.Object3D) => void;
  enabled?: boolean;
}

export const EditorControls: React.FC<EditorControlsProps> = ({
  selectedObject,
  mode,
  onTransform,
  enabled = true
}) => {
  const controlsRef = useRef<any>(null);
  const { camera, gl } = useThree();

  useEffect(() => {
    if (controlsRef.current && selectedObject) {
      controlsRef.current.attach(selectedObject);
    }
    
    return () => {
      if (controlsRef.current) {
        controlsRef.current.detach();
      }
    };
  }, [selectedObject]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleChange = () => {
      if (onTransform && selectedObject) {
        onTransform(selectedObject);
      }
    };

    controls.addEventListener('change', handleChange);
    return () => {
      controls.removeEventListener('change', handleChange);
    };
  }, [onTransform, selectedObject]);

  if (!selectedObject || !enabled) return null;

  return (
    <DreiTransformControls
      ref={controlsRef}
      object={selectedObject}
      mode={mode}
      size={1}
      showX={true}
      showY={true}
      showZ={true}
      space="world"
    />
  );
};

export default EditorControls;
