/**
 * WebGL上下文恢复组件
 * 处理WebGL context lost事件并自动恢复
 */

import { useEffect, useRef } from 'react';
import { message } from 'antd';
import { logger } from '../../utils/logger';

interface WebGLRecoveryOptions {
  onContextLost?: () => void;
  onContextRestored?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  enableAutoRecovery?: boolean;
}

export const useWebGLRecovery = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: WebGLRecoveryOptions = {}
) => {
  const {
    onContextLost,
    onContextRestored,
    maxRetries = 3,
    retryDelay = 1000,
    enableAutoRecovery = true
  } = options;

  const retryCount = useRef(0);
  const recoveryTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: WebGLContextEvent) => {
      event.preventDefault();
      logger.warn('[WebGL恢复] WebGL上下文丢失', { 
        retryCount: retryCount.current,
        timestamp: new Date().toISOString()
      });

      message.warning('3D渲染上下文暂时丢失，正在恢复...', 2);

      if (onContextLost) {
        onContextLost();
      }

      // 自动恢复
      if (enableAutoRecovery && retryCount.current < maxRetries) {
        recoveryTimer.current = setTimeout(() => {
          attemptRecovery(canvas);
        }, retryDelay);
      } else if (retryCount.current >= maxRetries) {
        logger.error('[WebGL恢复] 已达最大重试次数', { maxRetries });
        message.error('3D渲染恢复失败，请刷新页面', 5);
      }
    };

    const handleContextRestored = () => {
      logger.info('[WebGL恢复] WebGL上下文已恢复', {
        retryCount: retryCount.current,
        timestamp: new Date().toISOString()
      });

      retryCount.current = 0;
      message.success('3D渲染已恢复', 2);

      if (onContextRestored) {
        onContextRestored();
      }
    };

    const attemptRecovery = (canvas: HTMLCanvasElement) => {
      try {
        retryCount.current++;
        logger.info('[WebGL恢复] 尝试恢复WebGL上下文', { 
          attempt: retryCount.current 
        });

        // 尝试获取新的WebGL上下文
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (gl && !gl.isContextLost()) {
          handleContextRestored();
        } else if (retryCount.current < maxRetries) {
          // 继续重试
          recoveryTimer.current = setTimeout(() => {
            attemptRecovery(canvas);
          }, retryDelay);
        }
      } catch (error) {
        logger.error('[WebGL恢复] 恢复失败', error);
      }
    };

    // 添加事件监听器
    canvas.addEventListener('webglcontextlost', handleContextLost as EventListener);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // 清理
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost as EventListener);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      
      if (recoveryTimer.current) {
        clearTimeout(recoveryTimer.current);
      }
    };
  }, [canvasRef, onContextLost, onContextRestored, maxRetries, retryDelay, enableAutoRecovery]);

  const forceRecovery = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      logger.info('[WebGL恢复] 手动触发恢复');
      const event = new Event('webglcontextrestored');
      canvas.dispatchEvent(event);
    }
  };

  return { forceRecovery };
};

/**
 * 优化的WebGL上下文配置
 */
export const getOptimizedWebGLContextAttributes = (): WebGLContextAttributes => {
  return {
    alpha: true,
    antialias: true,
    depth: true,
    failIfMajorPerformanceCaveat: false, // 不要因性能问题而失败
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
    preserveDrawingBuffer: false, // 减少内存使用
    stencil: false,
    desynchronized: false,
    xrCompatible: false
  };
};

/**
 * 检测WebGL支持情况
 */
export const detectWebGLSupport = (): {
  webgl1: boolean;
  webgl2: boolean;
  vendor?: string;
  renderer?: string;
  maxTextureSize?: number;
} => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return { webgl1: false, webgl2: false };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : undefined;
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : undefined;
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    const result = {
      webgl1: !!gl,
      webgl2: !!(canvas.getContext('webgl2')),
      vendor,
      renderer,
      maxTextureSize
    };

    logger.info('[WebGL检测] WebGL支持情况', result);

    return result;
  } catch (error) {
    logger.error('[WebGL检测] 检测失败', error);
    return { webgl1: false, webgl2: false };
  }
};

/**
 * WebGL性能监控
 */
export class WebGLPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private memoryUsage = 0;

  getFPS(): number {
    return this.fps;
  }

  getMemoryUsage(): number {
    return this.memoryUsage;
  }

  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;

      // 获取内存使用（如果可用）
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        this.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // MB
      }
    }
  }

  logStats(): void {
    logger.debug('[WebGL性能] 当前FPS和内存使用', {
      fps: this.fps,
      memoryMB: this.memoryUsage
    });
  }
}

export default useWebGLRecovery;
