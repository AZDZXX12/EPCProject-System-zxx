# 🔗 EPC项目模块衔接与使用指南

## 一、甘特图任务添加

### 方法1：通过甘特图界面添加
```
1. 进入甘特图页面（/gantt 或 任务中心-甘特图视图）
2. 点击工具栏"➕ 新增任务"按钮
3. 填写任务信息：
   - 任务名称
   - 开始日期
   - 持续时间
   - 负责人
   - 优先级
4. 点击保存，自动同步到后端
```

### 方法2：从任务列表创建
```
任务中心 → 列表视图 → 新建任务 → 自动同步到甘特图
```

### 方法3：从项目生命周期创建
```
项目生命周期 → 选择阶段 → 添加任务 → 自动关联到甘特图
```

---

## 二、任务管理模块衔接

### 数据流架构
```
TaskManagementCenter（任务中心）
├── 列表视图（TaskList）
├── 看板视图（KanbanBoard）
├── 甘特图视图（OptimizedGanttChart） ← 核心
└── 日历视图（Calendar）

↓ 统一数据源
ProjectContext + EventBus
↓ 实时同步
后端API（/api/tasks）
```

### 事件驱动同步
```typescript
// 任务创建时
eventBus.emit(EVENTS.TASK_CREATED, taskData);

// 任务更新时
eventBus.emit(EVENTS.TASK_UPDATED, taskData);

// 任务删除时
eventBus.emit(EVENTS.TASK_DELETED, taskId);

// 所有视图自动监听这些事件并更新
```

### 实施步骤
```typescript
// 1. 在OptimizedGanttChart.tsx中
useEffect(() => {
  const handleTaskCreated = (task: any) => {
    window.gantt.addTask(task);
    window.gantt.render();
  };
  
  eventBus.on(EVENTS.TASK_CREATED, handleTaskCreated);
  return () => eventBus.off(EVENTS.TASK_CREATED, handleTaskCreated);
}, []);

// 2. 在任务列表中创建任务后
taskApi.create(taskData).then(newTask => {
  eventBus.emit(EVENTS.TASK_CREATED, newTask);
});
```

---

## 三、整体项目模块衔接

### 核心衔接机制

#### 1. 统一数据流（ProjectContext）
```typescript
// contexts/ProjectContext.tsx
export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [devices, setDevices] = useState([]);
  
  // 所有模块共享这些状态
  return (
    <ProjectContext.Provider value={{
      currentProject,
      tasks,
      devices,
      updateTask,
      createDevice,
      // ... 统一的CRUD方法
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
```

#### 2. 事件总线（EventBus）
```typescript
// 采购模块 → 设备管理
eventBus.emit(EVENTS.PROCUREMENT_COMPLETED, {
  deviceId: '123',
  arrivalDate: '2025-11-25'
});

// 设备管理监听
eventBus.on(EVENTS.PROCUREMENT_COMPLETED, (data) => {
  updateDeviceStatus(data.deviceId, 'arrived');
});
```

### 模块间数据流

```
工作台（Workspace）
├── 显示项目概览
├── 快捷入口到各模块
└── 实时统计数据

↓ ↑ 双向同步

项目生命周期（ProjectLifecycle）
├── 8个标准阶段
├── 里程碑管理
└── 交付物跟踪
    ↓
    触发 EVENTS.PHASE_CHANGED
    ↓
任务管理（TaskManagement）
├── 根据阶段创建任务
├── 甘特图展示进度
└── 看板跟踪状态
    ↓
    触发 EVENTS.TASK_CREATED
    ↓
施工管理（Construction）
├── 施工日志记录
├── 进度同步到任务
└── 质量安全检查
    ↓
    触发 EVENTS.CONSTRUCTION_UPDATED
    ↓
采购管理（Procurement）
├── 材料采购申请
├── 价格监控
└── 到货管理
    ↓
    触发 EVENTS.MATERIAL_ARRIVED
    ↓
设备管理（Device）
├── 设备台账
├── 维保记录
└── 状态监控
```

---

## 四、后台管理页面优化

### SystemManagement.tsx 增强
```typescript
// 新增功能模块
const modules = [
  {
    key: 'users',
    title: '用户管理',
    icon: <TeamOutlined />,
    component: <UserManagement />,
    features: ['新增用户', '权限分配', '角色管理']
  },
  {
    key: 'projects',
    title: '项目管理',
    icon: <ProjectOutlined />,
    component: <ProjectAdminPanel />,
    features: ['项目创建', '项目归档', '数据统计']
  },
  {
    key: 'system',
    title: '系统配置',
    icon: <SettingOutlined />,
    component: <SystemConfig />,
    features: ['基础设置', '通知配置', '备份恢复']
  },
  {
    key: 'logs',
    title: '操作日志',
    icon: <FileTextOutlined />,
    component: <AuditLogs />,
    features: ['登录日志', '操作记录', '异常追踪']
  }
];
```

### Settings.tsx 个人设置优化
```typescript
// 分类设置
const settingCategories = [
  {
    key: 'profile',
    title: '个人信息',
    items: [
      { label: '用户名', type: 'input', key: 'username' },
      { label: '邮箱', type: 'input', key: 'email' },
      { label: '手机号', type: 'input', key: 'phone' },
      { label: '头像', type: 'upload', key: 'avatar' }
    ]
  },
  {
    key: 'preferences',
    title: '偏好设置',
    items: [
      { label: '主题', type: 'select', key: 'theme', options: ['亮色', '暗色', '自动'] },
      { label: '语言', type: 'select', key: 'language', options: ['中文', 'English'] },
      { label: '时区', type: 'select', key: 'timezone' },
      { label: '日期格式', type: 'select', key: 'dateFormat' }
    ]
  },
  {
    key: 'notifications',
    title: '通知设置',
    items: [
      { label: '任务提醒', type: 'switch', key: 'taskNotify' },
      { label: '邮件通知', type: 'switch', key: 'emailNotify' },
      { label: '桌面通知', type: 'switch', key: 'desktopNotify' }
    ]
  },
  {
    key: 'security',
    title: '安全设置',
    items: [
      { label: '修改密码', type: 'button', key: 'changePassword' },
      { label: '双因素认证', type: 'switch', key: '2fa' },
      { label: '登录历史', type: 'button', key: 'loginHistory' }
    ]
  }
];
```

---

## 五、快速集成代码

### 1. 甘特图添加任务按钮
```typescript
// OptimizedGanttChart.tsx
const handleAddTask = () => {
  if (!window.gantt) return;
  
  const newTask = {
    id: gantt.uid(),
    text: '新任务',
    start_date: dayjs().format('YYYY-MM-DD'),
    duration: 3,
    progress: 0,
    owner: '',
    priority: 'medium'
  };
  
  window.gantt.addTask(newTask);
  window.gantt.showLightbox(newTask.id); // 打开编辑弹窗
};
```

### 2. EventBus事件注册
```typescript
// utils/EventBus.ts
export const EVENTS = {
  // 任务相关
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  
  // 项目相关
  PROJECT_CHANGED: 'project:changed',
  PHASE_CHANGED: 'phase:changed',
  
  // 采购相关
  PROCUREMENT_CREATED: 'procurement:created',
  MATERIAL_ARRIVED: 'material:arrived',
  
  // 设备相关
  DEVICE_CREATED: 'device:created',
  DEVICE_UPDATED: 'device:updated',
  
  // 施工相关
  CONSTRUCTION_UPDATED: 'construction:updated',
  LOG_CREATED: 'log:created'
};
```

### 3. 模块间通信示例
```typescript
// 在采购模块中
const handlePurchaseComplete = (material) => {
  // 更新本地状态
  updateMaterial(material);
  
  // 触发事件通知其他模块
  eventBus.emit(EVENTS.MATERIAL_ARRIVED, {
    materialId: material.id,
    name: material.name,
    quantity: material.quantity,
    arrivalDate: new Date()
  });
  
  // 显示通知
  notification.success({
    message: '采购完成',
    description: `${material.name} 已到货`
  });
};

// 在设备管理模块监听
useEffect(() => {
  const handleMaterialArrived = (data) => {
    // 自动更新设备库存
    updateDeviceInventory(data);
    
    // 触发施工模块通知
    eventBus.emit(EVENTS.DEVICE_UPDATED, {
      type: 'inventory_update',
      materialId: data.materialId
    });
  };
  
  eventBus.on(EVENTS.MATERIAL_ARRIVED, handleMaterialArrived);
  return () => eventBus.off(EVENTS.MATERIAL_ARRIVED, handleMaterialArrived);
}, []);
```

---

## 六、实施优先级

### Phase 1: 立即修复
- ✅ 修复 groupBy 错误
- ✅ 更新 Button.Group → Space.Compact
- ⏳ 添加任务按钮到甘特图

### Phase 2: 增强衔接（本周）
- ⏳ 完善 EventBus 事件定义
- ⏳ 各模块添加事件监听
- ⏳ 测试模块间数据流

### Phase 3: 页面优化（下周）
- ⏳ SystemManagement 功能完善
- ⏳ Settings 个人设置优化
- ⏳ 添加用户权限管理

---

## 七、使用文档

### 给用户的操作指南
1. **添加任务**: 任务中心 → 甘特图视图 → 点击"新增任务"
2. **查看进度**: 工作台 → 项目概览 → 查看实时统计
3. **采购流程**: 采购管理 → 新建申请 → 自动同步到设备管理
4. **施工日志**: 施工管理 → 记录日志 → 自动更新任务进度

### 给开发者的集成指南
1. 所有模块必须使用 `ProjectContext` 获取共享状态
2. 关键操作必须触发 `EventBus` 事件
3. 使用 `taskApi` 等统一API客户端
4. 遵循错误处理规范（Result类型）
