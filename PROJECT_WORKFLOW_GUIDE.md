# 🚀 EPC项目管理系统 - 完整工作流程指南

## 📋 目录
1. [甘特图任务添加方法](#1-甘特图任务添加方法)
2. [整体项目工作流程](#2-整体项目工作流程)
3. [核心代码架构](#3-核心代码架构)
4. [模块间协同机制](#4-模块间协同机制)
5. [数据流转详解](#5-数据流转详解)

---

## 1. 甘特图任务添加方法

### 方法一：甘特图界面直接添加 ⭐推荐

**操作步骤**:
```
1. 访问甘特图页面: /gantt
2. 点击左上角 "➕ 新增任务" 按钮
3. 自动弹出任务编辑弹窗
4. 填写任务信息并保存
```

**代码实现** (`OptimizedGanttChart.tsx:789-808`):
```typescript
<Button
  type="primary"
  icon={<PlusOutlined />}
  onClick={() => {
    if (window.gantt) {
      // 创建新任务
      const newTaskId = window.gantt.createTask({
        text: '新任务',
        start_date: new Date(),
        duration: 3,
        progress: 0,
        owner: '',
        priority: 'medium'
      });
      // 打开编辑弹窗
      window.gantt.showLightbox(newTaskId);
    }
  }}
/>
```

**自动保存机制**:
```typescript
// 任务保存后自动触发
gantt.attachEvent("onAfterTaskAdd", (id, task) => {
  saveTaskToBackend(task);
  eventBus.emit(EVENTS.TASK_CREATED, task);
});
```

---

### 方法二：任务管理中心创建

**操作步骤**:
```
1. 访问任务中心: /task-center
2. 点击 "新建任务" 按钮
3. 填写任务表单
4. 保存后自动同步到甘特图
```

**代码实现** (`TaskManagementCenter.tsx`):
```typescript
const handleTaskSubmit = async (values: any) => {
  // 创建任务
  const newTask = await taskApi.create({
    ...values,
    project_id: currentProject.id
  });
  
  // 触发事件，通知甘特图更新
  eventBus.emit(EVENTS.TASK_CREATED, newTask);
  
  message.success('任务创建成功');
};
```

---

### 方法三：项目生命周期创建

**操作步骤**:
```
1. 访问项目生命周期: /project-lifecycle
2. 选择项目阶段（如：设计阶段）
3. 点击 "添加任务"
4. 任务自动关联到当前阶段和甘特图
```

**代码实现** (`ProjectLifecycleManager.tsx`):
```typescript
const addPhaseTask = (phaseKey: string) => {
  const task = {
    name: '新任务',
    phase: phaseKey,
    start_date: new Date(),
    duration: 5
  };
  
  // 保存并触发事件
  taskApi.create(task).then(newTask => {
    eventBus.emit(EVENTS.TASK_CREATED, newTask);
    eventBus.emit(EVENTS.PHASE_UPDATED, { key: phaseKey });
  });
};
```

---

## 2. 整体项目工作流程

### 完整业务流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     EPC项目管理系统                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 项目立项 (Project Initiation)                            │
│     - 创建项目基本信息                                        │
│     - 设置项目预算、周期                                      │
│     - 分配项目经理                                           │
│     路由: /project-lifecycle                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 项目规划 (Planning)                                      │
│     - 创建WBS工作分解结构                                     │
│     - 制定项目进度计划（甘特图）                              │
│     - 资源分配和预算编制                                      │
│     路由: /gantt, /task-center                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 设计阶段 (Design)                                        │
│     - 方案设计、施工图设计                                    │
│     - 设备选型（风机、电缆等）                                │
│     - 技术文档编制                                           │
│     路由: /selection, /documents                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 采购阶段 (Procurement)                                   │
│     - 材料价格监控                                           │
│     - 供应商评估和选择                                        │
│     - 采购合同签订                                           │
│     路由: /procurement, /material-price                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 施工阶段 (Construction)                                  │
│     - 施工日志记录                                           │
│     - 进度跟踪和更新                                         │
│     - 质量安全管理                                           │
│     路由: /construction-management, /quality, /safety        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. 调试验收 (Testing & Acceptance)                          │
│     - 设备调试                                               │
│     - 性能测试                                               │
│     - 验收文档准备                                           │
│     路由: /devices, /documents                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. 项目移交 (Handover)                                      │
│     - 竣工文档整理                                           │
│     - 项目总结报告                                           │
│     - 资料归档                                               │
│     路由: /reports, /documents                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 核心代码架构

### 3.1 前端架构

```
client/
├── src/
│   ├── pages/                    # 页面组件
│   │   ├── OptimizedGanttChart.tsx      # 甘特图（核心）
│   │   ├── TaskManagementCenter.tsx     # 任务中心
│   │   ├── ProjectLifecycleManager.tsx  # 生命周期管理
│   │   ├── ProcurementManagement.tsx    # 采购管理
│   │   ├── ConstructionManagement.tsx   # 施工管理
│   │   ├── UnifiedEquipmentSelection.tsx # 设备选型
│   │   ├── MaterialPriceMonitor.tsx     # 价格监控
│   │   └── ...
│   │
│   ├── contexts/                 # 全局状态管理
│   │   └── ProjectContext.tsx    # 项目上下文（核心）
│   │
│   ├── utils/                    # 工具函数
│   │   ├── EventBus.ts           # 事件总线（核心）
│   │   ├── StorageManager.ts     # 缓存管理
│   │   └── logger.ts             # 日志系统
│   │
│   ├── services/                 # API服务
│   │   └── api.ts                # 统一API接口
│   │
│   └── App.tsx                   # 应用入口
```

### 3.2 后端架构

```
server/
├── app/
│   ├── api/                      # API路由
│   │   ├── projects.py           # 项目接口
│   │   ├── tasks.py              # 任务接口
│   │   ├── procurement.py        # 采购接口
│   │   └── ...
│   │
│   ├── models/                   # 数据模型
│   │   ├── project.py
│   │   ├── task.py
│   │   └── ...
│   │
│   └── main.py                   # FastAPI入口
```

---

## 4. 模块间协同机制

### 4.1 核心协同架构

```typescript
┌─────────────────────────────────────────────────────────────┐
│                    ProjectContext                            │
│              (全局状态管理 - 单一数据源)                      │
│                                                              │
│  - currentProject: Project                                   │
│  - tasks: Task[]                                             │
│  - devices: Device[]                                         │
│  - logs: Log[]                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      EventBus                                │
│              (事件总线 - 模块解耦通信)                        │
│                                                              │
│  发布/订阅模式:                                               │
│  - emit(event, data)  // 发布事件                            │
│  - on(event, handler) // 订阅事件                            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐      ┌──────────────┐
│  甘特图模块   │    │  任务中心     │      │  施工管理     │
│              │    │              │      │              │
│ 监听:        │    │ 监听:        │      │ 监听:        │
│ TASK_CREATED │    │ TASK_UPDATED │      │ LOG_CREATED  │
│ TASK_UPDATED │    │ PHASE_CHANGED│      │ TASK_UPDATED │
└──────────────┘    └──────────────┘      └──────────────┘
```

### 4.2 事件定义 (`EventBus.ts`)

```typescript
export const EVENTS = {
  // 项目事件
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_SELECTED: 'project:selected',
  
  // 任务事件
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_PROGRESS_CHANGED: 'task:progress',
  
  // 生命周期事件
  PHASE_CHANGED: 'lifecycle:phase_changed',
  PHASE_COMPLETED: 'lifecycle:phase_completed',
  MILESTONE_ACHIEVED: 'lifecycle:milestone_achieved',
  
  // 采购事件
  PROCUREMENT_ITEM_ADDED: 'procurement:item_added',
  PRICE_ALERT_TRIGGERED: 'price:alert_triggered',
  
  // 设备事件
  DEVICE_CREATED: 'device:created',
  DEVICE_STATUS_CHANGED: 'device:status',
  
  // 施工事件
  LOG_CREATED: 'log:created',
  PROGRESS_CHANGED: 'progress:changed',
};
```

### 4.3 使用示例

#### 发布事件（任务创建）
```typescript
// 在任务中心创建任务后
const handleTaskSubmit = async (values: any) => {
  const newTask = await taskApi.create(values);
  
  // 发布事件，通知所有订阅者
  eventBus.emit(EVENTS.TASK_CREATED, newTask);
  eventBus.emit(EVENTS.PROGRESS_CHANGED, {
    projectId: newTask.project_id,
    progress: calculateProgress()
  });
};
```

#### 订阅事件（甘特图监听）
```typescript
// 在甘特图组件中监听任务创建
useEffect(() => {
  const handleTaskCreated = (task: any) => {
    // 添加到甘特图
    window.gantt.addTask({
      id: task.id,
      text: task.name,
      start_date: task.start_date,
      duration: task.duration
    });
    window.gantt.render();
  };
  
  // 订阅事件
  eventBus.on(EVENTS.TASK_CREATED, handleTaskCreated);
  
  // 清理函数
  return () => {
    eventBus.off(EVENTS.TASK_CREATED, handleTaskCreated);
  };
}, []);
```

---

## 5. 数据流转详解

### 5.1 任务创建完整流程

```
用户操作
   │
   ▼
┌─────────────────────┐
│ 1. 点击新建任务按钮  │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 2. 填写任务表单     │
│   - 任务名称        │
│   - 开始日期        │
│   - 持续时间        │
│   - 负责人          │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 3. 调用API保存      │
│   taskApi.create()  │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 4. 后端保存到数据库  │
│   SQLite/PostgreSQL │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 5. 返回新任务数据    │
│   { id, name, ... } │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 6. 发布事件         │
│   TASK_CREATED      │
└─────────────────────┘
   │
   ├──────────────────┬──────────────────┬──────────────────┐
   ▼                  ▼                  ▼                  ▼
┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
│甘特图   │      │任务列表 │      │看板视图 │      │日历视图 │
│自动更新 │      │自动更新 │      │自动更新 │      │自动更新 │
└────────┘      └────────┘      └────────┘      └────────┘
```

### 5.2 进度同步流程

```
施工日志更新
   │
   ▼
┌─────────────────────┐
│ 1. 记录施工进度     │
│   progress: 65%     │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 2. 触发事件         │
│   PROGRESS_CHANGED  │
└─────────────────────┘
   │
   ├──────────────────┬──────────────────┐
   ▼                  ▼                  ▼
┌────────┐      ┌────────┐      ┌────────┐
│任务进度 │      │阶段进度 │      │项目进度 │
│更新     │      │更新     │      │更新     │
└────────┘      └────────┘      └────────┘
   │                  │                  │
   └──────────────────┴──────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ 3. 更新甘特图显示    │
            │   自动重新渲染      │
            └─────────────────────┘
```

### 5.3 设备选型到采购流程

```
设备选型
   │
   ▼
┌─────────────────────┐
│ 1. 选择设备型号     │
│   (风机/电缆等)     │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 2. 保存选型结果     │
│   DEVICE_CREATED    │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 3. 导出到采购清单   │
│   PROCUREMENT_ITEM  │
│   _ADDED            │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 4. 采购模块接收     │
│   自动创建采购计划  │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 5. 价格监控启动     │
│   实时跟踪材料价格  │
└─────────────────────┘
```

---

## 6. 关键代码片段

### 6.1 ProjectContext 实现

```typescript
// contexts/ProjectContext.tsx
export const ProjectProvider: React.FC = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      // 优先使用缓存
      const cached = localStorage.getItem('projects_cache');
      if (cached) {
        const cachedProjects = JSON.parse(cached);
        setProjects(cachedProjects);
        if (cachedProjects.length > 0 && !currentProject) {
          setCurrentProject(cachedProjects[0]);
        }
      }

      // 后台同步
      const data = await projectApi.getAll();
      if (Array.isArray(data)) {
        setProjects(data);
        localStorage.setItem('projects_cache', JSON.stringify(data));
        if (data.length > 0 && !currentProject) {
          setCurrentProject(data[0]);
        }
      }
    } catch (error) {
      console.warn('Failed to load projects:', error);
    }
  }, [currentProject]);

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        currentProject, 
        setCurrentProject, 
        loadProjects 
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
```

### 6.2 EventBus 实现

```typescript
// utils/EventBus.ts
class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  // 订阅事件
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  // 取消订阅
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 触发事件
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`事件回调错误: ${event}`, error);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
```

### 6.3 甘特图任务保存

```typescript
// pages/OptimizedGanttChart.tsx
const saveTaskToBackend = async (task: any) => {
  try {
    const taskData = {
      id: task.id,
      name: task.text,  // 注意字段映射
      start_date: task.start_date,
      end_date: gantt.calculateEndDate(task.start_date, task.duration),
      duration: task.duration,
      progress: task.progress * 100,
      owner: task.owner || '',
      priority: task.priority || 'medium',
      project_id: currentProject?.id
    };

    // 保存到后端
    if (task.id.toString().startsWith('temp_')) {
      await taskApi.create(taskData);
    } else {
      await taskApi.update(task.id, taskData);
    }

    // 触发事件
    eventBus.emit(EVENTS.TASK_UPDATED, taskData);
    
    setSaveStatus('saved');
    setLastSaveTime(new Date());
  } catch (error) {
    console.error('保存任务失败:', error);
    setSaveStatus('error');
  }
};
```

---

## 7. 常见问题

### Q1: 任务创建后甘特图没有更新？
**A**: 检查EventBus事件是否正确触发和监听：
```typescript
// 创建任务后必须触发事件
eventBus.emit(EVENTS.TASK_CREATED, newTask);

// 甘特图必须监听事件
eventBus.on(EVENTS.TASK_CREATED, handleTaskCreated);
```

### Q2: 数据保存了吗？
**A**: 查看甘特图右上角保存状态指示器：
- "正在保存..." - 保存中
- "已保存 (14:32)" - 已成功保存
- "保存失败" - 保存出错

### Q3: 如何查看模块间通信？
**A**: 打开浏览器控制台，EventBus会输出事件日志（开发模式）

### Q4: 离线时能否使用？
**A**: 可以！系统使用离线优先策略：
1. 立即显示缓存数据（10ms）
2. 后台静默同步最新数据
3. 支持离线编辑，联网后自动同步

---

## 8. 最佳实践

### 8.1 创建任务
✅ **推荐**: 使用甘特图界面直接添加（最直观）
✅ **推荐**: 从项目生命周期创建（自动关联阶段）
⚠️ **注意**: 确保选择了当前项目

### 8.2 模块协同
✅ **推荐**: 使用EventBus进行模块间通信
✅ **推荐**: 通过ProjectContext共享全局状态
❌ **避免**: 直接调用其他模块的内部方法

### 8.3 数据同步
✅ **推荐**: 依赖自动保存机制
✅ **推荐**: 观察保存状态指示器
⚠️ **注意**: 网络异常时会自动重试3次

---

## 9. 快速参考

### 路由速查表
```
/workspace              - 工作台首页
/project-lifecycle      - 项目生命周期管理
/gantt                 - 独立甘特图
/task-center           - 任务管理中心
/selection             - 设备选型中心
/procurement           - 采购管理
/construction-management - 施工管理
/material-price        - 材料价格监控
/settings-enhanced     - 个人设置
/system-management-enhanced - 后台管理
```

### API速查表
```typescript
// 项目API
projectApi.getAll()
projectApi.create(data)
projectApi.update(id, data)

// 任务API
taskApi.getAll(projectId)
taskApi.create(data)
taskApi.update(id, data)
taskApi.delete(id)

// 设备API
deviceApi.getAll()
deviceApi.create(data)
```

### 事件速查表
```typescript
// 任务事件
EVENTS.TASK_CREATED
EVENTS.TASK_UPDATED
EVENTS.TASK_DELETED

// 项目事件
EVENTS.PROJECT_SELECTED
EVENTS.PHASE_CHANGED

// 进度事件
EVENTS.PROGRESS_CHANGED
```

---

## 📚 相关文档

- `MODULE_INTEGRATION_GUIDE.md` - 模块集成指南
- `OPTIMIZATION_COMPLETE_REPORT.md` - 优化完成报告
- `MODULE_ARCHITECTURE_OPTIMIZATION.md` - 架构优化方案

---

**文档版本**: v1.0
**最后更新**: 2025-11-23
**维护者**: EPC项目团队
