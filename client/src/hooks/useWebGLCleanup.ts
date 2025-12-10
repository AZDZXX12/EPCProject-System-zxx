import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

/**
 * WebGL资源清理Hook
 * 用于管理Three.js对象的生命周期，防止内存泄漏和WebGL上下文丢失
 */

interface DisposableResource {
  type: 'geometry' | 'material' | 'texture' | 'object3d' | 'renderTarget';
  resource: any;
  disposed: boolean;
}

interface UseWebGLCleanupOptions {
  enabled?: boolean;
  onCleanup?: () => void;
}

export function useWebGLCleanup(options: UseWebGLCleanupOptions = {}) {
  const { enabled = true, onCleanup } = options;
  const resourcesRef = useRef<DisposableResource[]>([]);

  /**
   * 注册需要清理的资源
   */
  const registerDisposable = useCallback((resource: any, type?: DisposableResource['type']) => {
    if (!enabled || !resource) return;

    // 自动检测资源类型
    let detectedType: DisposableResource['type'] = 'object3d';
    if (resource instanceof THREE.BufferGeometry) {
      detectedType = 'geometry';
    } else if (resource instanceof THREE.Material) {
      detectedType = 'material';
    } else if (resource instanceof THREE.Texture) {
      detectedType = 'texture';
    } else if (resource instanceof THREE.WebGLRenderTarget) {
      detectedType = 'renderTarget';
    }

    const finalType = type || detectedType;

    resourcesRef.current.push({
      type: finalType,
      resource,
      disposed: false,
    });
  }, [enabled]);

  /**
   * 递归清理Object3D及其子对象
   */
  const disposeObject3D = useCallback((obj: THREE.Object3D) => {
    if (!obj) return;

    // 清理几何体
    if ((obj as any).geometry) {
      const geometry = (obj as any).geometry;
      if (geometry.dispose && typeof geometry.dispose === 'function') {
        geometry.dispose();
      }
    }

    // 清理材质
    if ((obj as any).material) {
      const material = (obj as any).material;
      if (Array.isArray(material)) {
        material.forEach((mat) => {
          if (mat.dispose && typeof mat.dispose === 'function') {
            mat.dispose();
          }
          // 清理材质中的纹理
          Object.keys(mat).forEach((key) => {
            const value = mat[key];
            if (value instanceof THREE.Texture) {
              value.dispose();
            }
          });
        });
      } else if (material) {
        if (material.dispose && typeof material.dispose === 'function') {
          material.dispose();
        }
        // 清理材质中的纹理
        Object.keys(material).forEach((key) => {
          const value = material[key];
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        });
      }
    }

    // 递归清理子对象
    if (obj.children && obj.children.length > 0) {
      [...obj.children].forEach((child) => {
        disposeObject3D(child);
      });
    }

    // 从父对象移除
    if (obj.parent) {
      obj.parent.remove(obj);
    }
  }, []);

  /**
   * 清理所有注册的资源
   */
  const cleanup = useCallback(() => {
    if (!enabled) return;

    console.log(`[WebGL Cleanup] Disposing ${resourcesRef.current.length} resources`);

    resourcesRef.current.forEach(({ type, resource, disposed }) => {
      if (disposed) return;

      try {
        switch (type) {
          case 'geometry':
            if (resource.dispose && typeof resource.dispose === 'function') {
              resource.dispose();
            }
            break;

          case 'material':
            if (resource.dispose && typeof resource.dispose === 'function') {
              resource.dispose();
            }
            // 清理材质中的纹理
            Object.keys(resource).forEach((key) => {
              const value = resource[key];
              if (value instanceof THREE.Texture) {
                value.dispose();
              }
            });
            break;

          case 'texture':
            if (resource.dispose && typeof resource.dispose === 'function') {
              resource.dispose();
            }
            break;

          case 'renderTarget':
            if (resource.dispose && typeof resource.dispose === 'function') {
              resource.dispose();
            }
            break;

          case 'object3d':
            disposeObject3D(resource);
            break;

          default:
            if (resource.dispose && typeof resource.dispose === 'function') {
              resource.dispose();
            }
        }
      } catch (error) {
        console.warn(`[WebGL Cleanup] Error disposing ${type}:`, error);
      }
    });

    // 清空资源列表
    resourcesRef.current = [];

    // 调用自定义清理回调
    if (onCleanup) {
      try {
        onCleanup();
      } catch (error) {
        console.warn('[WebGL Cleanup] Error in onCleanup callback:', error);
      }
    }

    console.log('[WebGL Cleanup] Cleanup completed');
  }, [enabled, onCleanup, disposeObject3D]);

  /**
   * 组件卸载时自动清理
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    registerDisposable,
    cleanup,
    getResourceCount: () => resourcesRef.current.length,
  };
}
