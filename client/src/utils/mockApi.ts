/**
 * Mock API - 模拟后端API响应
 * 用于前端独立开发和演示
 */

// 模拟延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟项目数据
export const mockProjects = [
  {
    id: 'PROJ-001',
    name: '化工设备生产线安装项目',
    description: '某化工企业生产线设备采购、安装及调试',
    status: 'in_progress',
    progress: 45,
    start_date: '2025-01-01',
    end_date: '2025-06-30',
    created_at: '2024-12-01',
    updated_at: '2025-01-24',
  },
  {
    id: 'PROJ-002',
    name: '石油炼化装置改造项目',
    description: '炼油厂催化裂化装置升级改造工程',
    status: 'planning',
    progress: 15,
    start_date: '2025-03-01',
    end_date: '2025-09-30',
    created_at: '2025-01-10',
    updated_at: '2025-01-20',
  },
  {
    id: 'PROJ-003',
    name: '天然气处理站建设项目',
    description: '新建天然气净化处理站及配套设施',
    status: 'completed',
    progress: 100,
    start_date: '2024-06-01',
    end_date: '2024-12-31',
    created_at: '2024-05-15',
    updated_at: '2025-01-05',
  },
];

// 模拟任务数据
export const mockTasks = [
  {
    id: '1',
    text: '项目启动',
    start_date: '2025-01-01',
    end_date: '2025-01-15',
    duration: 14,
    progress: 1,
    parent: 0,
    type: 'project',
    project_id: 'PROJ-001',
  },
  {
    id: '2',
    text: '设备采购',
    start_date: '2025-01-16',
    end_date: '2025-02-28',
    duration: 43,
    progress: 0.6,
    parent: 0,
    project_id: 'PROJ-001',
  },
  {
    id: '3',
    text: '现场施工',
    start_date: '2025-03-01',
    end_date: '2025-05-31',
    duration: 91,
    progress: 0.3,
    parent: 0,
    project_id: 'PROJ-001',
  },
  {
    id: '4',
    text: '设备调试',
    start_date: '2025-06-01',
    end_date: '2025-06-20',
    duration: 19,
    progress: 0,
    parent: 0,
    project_id: 'PROJ-001',
  },
  {
    id: '5',
    text: '项目验收',
    start_date: '2025-06-21',
    end_date: '2025-06-30',
    duration: 9,
    progress: 0,
    parent: 0,
    type: 'milestone',
    project_id: 'PROJ-001',
  },
];

// 模拟设备数据
export const mockDevices = [
  {
    id: 1,
    device_id: 'PROJ-001-DEV-001',
    name: '聚合反应釜',
    type: '反应设备',
    status: 'installing',
    installation_progress: 90,
    location: '车间A-1区',
    assigned_task: '反应釜安装就位',
    start_date: '2025-01-18',
    expected_completion: '2025-02-05',
    responsible_person: '王五',
    project_id: 'PROJ-001',
  },
  {
    id: 2,
    device_id: 'PROJ-001-DEV-002',
    name: '离心泵P-101',
    type: '泵',
    status: 'installed',
    installation_progress: 100,
    location: '泵房-东侧',
    assigned_task: '管线联通测试',
    start_date: '2025-01-10',
    expected_completion: '2025-01-20',
    responsible_person: '赵六',
    project_id: 'PROJ-001',
  },
  {
    id: 3,
    device_id: 'PROJ-002-DEV-001',
    name: '精馏塔T-201',
    type: '塔',
    status: 'ordered',
    installation_progress: 0,
    location: '待定',
    assigned_task: '设备到货验收',
    start_date: '2025-03-12',
    expected_completion: '2025-04-15',
    responsible_person: '钱七',
    project_id: 'PROJ-002',
  },
];

// Mock API 函数
export const mockApi = {
  // 获取项目列表
  getProjects: async () => {
    await delay(300);
    return { ok: true, json: async () => mockProjects };
  },

  // 获取单个项目
  getProject: async (id: string) => {
    await delay(200);
    const project = mockProjects.find((p) => p.id === id);
    return { ok: !!project, json: async () => project };
  },

  // 创建项目
  createProject: async (data: any) => {
    await delay(500);
    const newProject = {
      id: `PROJ-${String(mockProjects.length + 1).padStart(3, '0')}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockProjects.push(newProject);
    return { ok: true, json: async () => newProject };
  },

  // 更新项目
  updateProject: async (id: string, data: any) => {
    await delay(400);
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProjects[index] = {
        ...mockProjects[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { ok: true, json: async () => mockProjects[index] };
    }
    return { ok: false };
  },

  // 删除项目
  deleteProject: async (id: string) => {
    await delay(300);
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProjects.splice(index, 1);
      return { ok: true };
    }
    return { ok: false };
  },

  // 获取任务列表
  getTasks: async (projectId?: string) => {
    await delay(300);
    const tasks = projectId ? mockTasks.filter((t) => t.project_id === projectId) : mockTasks;
    return { ok: true, json: async () => tasks };
  },

  // 创建任务
  createTask: async (data: any) => {
    await delay(400);
    const newTask = {
      id: String(mockTasks.length + 1),
      ...data,
    };
    mockTasks.push(newTask);
    return { ok: true, json: async () => newTask };
  },

  // 更新任务
  updateTask: async (id: string, data: any) => {
    await delay(300);
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...data };
      return { ok: true, json: async () => mockTasks[index] };
    }
    return { ok: false };
  },

  // 删除任务
  deleteTask: async (id: string) => {
    await delay(300);
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      mockTasks.splice(index, 1);
      return { ok: true };
    }
    return { ok: false };
  },

  // 设备列表
  getDevices: async (projectId?: string) => {
    await delay(300);
    const devices = projectId
      ? mockDevices.filter((d) => d.project_id === projectId)
      : mockDevices;
    return { ok: true, json: async () => devices };
  },

  // 创建设备
  createDevice: async (data: any) => {
    await delay(400);
    const newDevice = { id: mockDevices.length + 1, ...data };
    mockDevices.push(newDevice);
    return { ok: true, json: async () => newDevice };
  },

  // 更新设备
  updateDevice: async (id: number, data: any) => {
    await delay(300);
    const index = mockDevices.findIndex((d) => d.id === id);
    if (index !== -1) {
      mockDevices[index] = { ...mockDevices[index], ...data };
      return { ok: true, json: async () => mockDevices[index] };
    }
    return { ok: false };
  },

  // 删除设备
  deleteDevice: async (id: number) => {
    await delay(300);
    const index = mockDevices.findIndex((d) => d.id === id);
    if (index !== -1) {
      mockDevices.splice(index, 1);
      return { ok: true };
    }
    return { ok: false };
  },
};

// 检查后端是否可用
export const checkBackendAvailable = async (baseUrl: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const response = await fetch(`${baseUrl}/`, {
      signal: controller.signal,
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};
