/**
 * 属性测试：useWebGLCleanup Hook
 * Feature: console-warnings-fix
 */

import { renderHook } from '@testing-library/react';
import * as fc from 'fast-check';
import { useWebGLCleanup } from '../useWebGLCleanup';
import * as THREE from 'three';

describe('useWebGLCleanup Property Tests', () => {
  /**
   * Property 2: Dispose Methods Called on Unmount
   * 验证所有注册的dispose方法在卸载时都被调用一次
   */
  it('**Feature: console-warnings-fix, Property 2: Dispose Methods Called on Unmount**', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // 资源数量
        (resourceCount) => {
          const disposeSpy = jest.fn();
          const resources: any[] = [];

          // 创建模拟资源
          for (let i = 0; i < resourceCount; i++) {
            resources.push({
              dispose: disposeSpy,
            });
          }

          // 渲染hook
          const { result, unmount } = renderHook(() => useWebGLCleanup());

          // 注册所有资源
          resources.forEach(resource => {
            result.current.registerDisposable(resource);
          });

          // 卸载组件
          unmount();

          // 验证dispose被调用了正确的次数
          expect(disposeSpy).toHaveBeenCalledTimes(resourceCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
