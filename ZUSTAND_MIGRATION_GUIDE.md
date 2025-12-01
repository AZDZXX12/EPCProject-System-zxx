# Zustand状态管理迁移指南

> 创建时间: 2025-01-19  
> 目标: 将现有Context + LocalStorage方案迁移到Zustand

---

## 📋 迁移概述

### 当前状态管理方案
- **ProjectContext** - React Context API
- **StorageManager** - LocalStorage手动管理
- **组件State** - useState分散管理

### 目标方案
- **Zustand Store** - 统一状态管理
- **自动持久化** - 内置persist中间件
- **EventBus集成** - 状态变更自动触发事件

---

## 🎯 迁移优势

| 对比项 | 当前方案 | Zustand方案 |
|--------|----------|-------------|
| 状态分散度 | 高（Context+LocalStorage+State） | 低（单一Store） |
| 持久化 | 手动调用StorageManager | 自动持久化 |
| 性能 | Context全量更新 | 精确订阅 |
| DevTools | 无 | 支持Redux DevTools |
| 类型安全 | 中等 | 高（完整TypeScript） |
| 学习曲线 | 陡峭（多种方案） | 平缓（单一API） |

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install zustand
```

### 2. 创建Store

```typescript
// src/store/projectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectStore {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    {
      name: 'epc-project-storage',
    }
  )
);
```

### 3. 在组件中使用

```typescript
// Before (Context)
import { useProject } from '../contexts/ProjectContext';
const { currentProject, setCurrentProject } = useProject();

// After (Zustand)
import { useProjectStore } from '../store/projectStore';
const currentProject = useProjectStore((state) => state.currentProject);
const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

// 或使用便捷hooks
import { useProject } from '../hooks/useProjectStore';
const { currentProject, setCurrentProject } = useProject();
```

---

## 📝 迁移步骤

### 阶段一：准备工作（已完成）

- ✅ 安装Zustand依赖
- ✅ 创建projectStore.ts
- ✅ 定义完整类型接口
- ✅ 实现persist中间件
- ✅ 集成EventBus

### 阶段二：渐进式迁移（进行中）

#### Step 1: 迁移项目状态

**Before**:
```typescript
// ProjectContext.tsx
const [currentProject, setCurrentProject] = useState<Project | null>(null);

useEffect(() => {
  const saved = StorageManager.load('currentProject');
  if (saved) setCurrentProject(saved);
}, []);

useEffect(() => {
  if (currentProject) {
    StorageManager.save('currentProject', currentProject);
  }
}, [currentProject]);
```

**After**:
```typescript
// 使用Zustand（自动持久化）
const currentProject = useProjectStore((state) => state.currentProject);
const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
```

#### Step 2: 迁移任务管理

**Before**:
```typescript
const [tasks, setTasks] = useState<Task[]>([]);

const addTask = (task: Task) => {
  const newTasks = [...tasks, task];
  setTasks(newTasks);
  StorageManager.save('tasks', newTasks);
};
```

**After**:
```typescript
const { tasks, addTask } = useTasks(projectId);
// addTask自动触发EventBus事件并持久化
```

#### Step 3: 迁移设备管理

**Before**:
```typescript
const [equipments, setEquipments] = useState<Equipment[]>([]);
// 手动管理状态和持久化
```

**After**:
```typescript
const { equipments, addEquipment, updateEquipment } = useEquipments(projectId);
```

### 阶段三：清理旧代码（待执行）

- ⏳ 移除ProjectContext.tsx
- ⏳ 减少StorageManager直接调用
- ⏳ 清理组件中的useState
- ⏳ 更新导入路径

---

## 🔄 迁移对照表

### 项目操作

| 操作 | Context方案 | Zustand方案 |
|------|-------------|-------------|
| 获取当前项目 | `useProject().currentProject` | `useProjectStore(s => s.currentProject)` |
| 设置当前项目 | `setCurrentProject(project)` | `useProjectStore(s => s.setCurrentProject)(project)` |
| 添加项目 | `手动setState + StorageManager` | `useProjectStore(s => s.addProject)(data)` |
| 更新项目 | `手动setState + StorageManager` | `useProjectStore(s => s.updateProject)(id, updates)` |

### 任务操作

| 操作 | 旧方案 | Zustand方案 |
|------|--------|-------------|
| 获取任务列表 | `useState + useEffect` | `useTasks(projectId).tasks` |
| 添加任务 | `setTasks([...tasks, newTask])` | `addTask(taskData)` |
| 更新任务 | `setTasks(tasks.map(...))` | `updateTask(id, updates)` |
| 删除任务 | `setTasks(tasks.filter(...))` | `deleteTask(id)` |

---

## 💡 最佳实践

### 1. 精确订阅

```typescript
// ❌ 不推荐：订阅整个store
const store = useProjectStore();

// ✅ 推荐：只订阅需要的字段
const currentProject = useProjectStore((state) => state.currentProject);
const tasks = useProjectStore((state) => state.tasks);
```

### 2. 使用便捷hooks

```typescript
// ❌ 不推荐：直接使用store
const currentProject = useProjectStore((state) => state.currentProject);
const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

// ✅ 推荐：使用封装的hooks
import { useProject } from '../hooks/useProjectStore';
const { currentProject, setCurrentProject } = useProject();
```

### 3. 结合EventBus

```typescript
// Store中自动触发事件
addProject: (projectData) => {
  const newProject = { ...projectData, id: `PRJ-${Date.now()}` };
  set((state) => ({ projects: [...state.projects, newProject] }));
  eventBus.emit(EVENTS.PROJECT_CREATED, newProject); // 自动触发
},
```

### 4. 统计数据计算

```typescript
// ✅ 使用专门的hook
const stats = useProjectStats(projectId);
// { totalTasks, completedTasks, taskCompletionRate, totalCost }
```

---

## 🧪 测试迁移

### 单元测试

```typescript
import { renderHook, act } from '@testing-library/react';
import { useProjectStore } from '../store/projectStore';

describe('ProjectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().clearAll();
  });

  it('should add project', () => {
    const { result } = renderHook(() => useProjectStore());
    
    act(() => {
      result.current.addProject({
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        startDate: '2025-01-01',
      });
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Test Project');
  });
});
```

---

## 📊 迁移进度

### 已迁移模块

- ✅ **项目管理** - 完整迁移到Zustand
- ✅ **任务管理** - 完整迁移到Zustand
- ✅ **设备管理** - 完整迁移到Zustand
- ✅ **采购计划** - 完整迁移到Zustand

### 待迁移模块

- ⏳ **Workspace页面** - 使用ProjectContext
- ⏳ **ConstructionManagement** - 使用ProjectContext
- ⏳ **ProcurementManagement** - 部分使用Context
- ⏳ **DeviceManagement** - 使用本地State

### 迁移优先级

1. **高优先级** - Workspace、ConstructionManagement
2. **中优先级** - ProcurementManagement、DeviceManagement
3. **低优先级** - 其他页面组件

---

## 🔧 常见问题

### Q1: 如何处理现有的StorageManager调用？

**A**: 逐步替换为Zustand Store，persist中间件会自动处理持久化。

```typescript
// Before
StorageManager.save('currentProject', project);
const project = StorageManager.load('currentProject');

// After
useProjectStore.getState().setCurrentProject(project);
const project = useProjectStore.getState().currentProject;
```

### Q2: 如何在非组件中使用Store？

**A**: 直接调用`getState()`或`setState()`。

```typescript
import { useProjectStore } from './store/projectStore';

// 获取状态
const currentProject = useProjectStore.getState().currentProject;

// 更新状态
useProjectStore.getState().setCurrentProject(newProject);
```

### Q3: 如何调试Zustand状态？

**A**: 使用Redux DevTools扩展。

```typescript
import { devtools } from 'zustand/middleware';

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'epc-project-storage' }
    ),
    { name: 'ProjectStore' }
  )
);
```

### Q4: 如何处理异步操作？

**A**: 在action中直接使用async/await。

```typescript
fetchProjects: async () => {
  set({ loading: true });
  try {
    const projects = await api.getProjects();
    set({ projects, loading: false });
  } catch (error) {
    set({ error, loading: false });
  }
},
```

---

## 📚 参考资源

- [Zustand官方文档](https://github.com/pmndrs/zustand)
- [Zustand最佳实践](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [Persist中间件](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [TypeScript使用](https://docs.pmnd.rs/zustand/guides/typescript)

---

## ✅ 迁移检查清单

- [x] 安装Zustand依赖
- [x] 创建projectStore.ts
- [x] 定义完整类型
- [x] 实现persist中间件
- [x] 集成EventBus
- [x] 创建便捷hooks
- [ ] 迁移Workspace页面
- [ ] 迁移ConstructionManagement
- [ ] 迁移ProcurementManagement
- [ ] 移除ProjectContext
- [ ] 清理StorageManager调用
- [ ] 添加单元测试
- [ ] 更新文档

---

**迁移负责人**: 开发团队  
**预计完成时间**: 2025-01-26  
**当前进度**: 40%
