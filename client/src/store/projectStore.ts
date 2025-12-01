/**
 * Zustand全局状态管理 - 项目状态
 * 统一管理项目、任务、设备等核心数据
 * 自动持久化到LocalStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eventBus, EVENTS } from '../utils/EventBus';

// ============ 类型定义 ============

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'design' | 'procurement' | 'construction' | 'completed';
  progress: number;
  startDate: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  projectId: string;
  name: string;
  type: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  status: 'planned' | 'ordered' | 'delivered' | 'installed' | 'selected';
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementPlan {
  id: string;
  projectId: string;
  materialId: string;
  materialName: string;
  specification: string;
  quantity: number;
  estimatedPrice: number;
  urgency: 'high' | 'medium' | 'low';
  reason?: string;
  status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'delivered';
  items?: any[];
  orderId?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Store接口 ============

interface ProjectStore {
  // 状态
  currentProject: Project | null;
  projects: Project[];
  tasks: Task[];
  equipments: Equipment[];
  procurementPlans: ProcurementPlan[];
  
  // 项目操作
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // 任务操作
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  
  // 设备操作
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  getEquipmentsByProject: (projectId: string) => Equipment[];
  
  // 采购计划操作
  addProcurementPlan: (plan: Omit<ProcurementPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProcurementPlan: (id: string, updates: Partial<ProcurementPlan>) => void;
  deleteProcurementPlan: (id: string) => void;
  getProcurementPlansByProject: (projectId: string) => ProcurementPlan[];
  
  // 工具方法
  clearAll: () => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
}

// ============ Store实现 ============

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentProject: null,
      projects: [],
      tasks: [],
      equipments: [],
      procurementPlans: [],

      // 项目操作
      setCurrentProject: (project) => {
        set({ currentProject: project });
        if (project) {
          eventBus.emit(EVENTS.PROJECT_SELECTED, { id: project.id, name: project.name });
        }
      },

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: `PRJ-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        eventBus.emit(EVENTS.PROJECT_CREATED, newProject);
        return newProject;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
              : state.currentProject,
        }));
        eventBus.emit(EVENTS.PROJECT_UPDATED, { id, ...updates });
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          equipments: state.equipments.filter((e) => e.projectId !== id),
          procurementPlans: state.procurementPlans.filter((pp) => pp.projectId !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
        eventBus.emit(EVENTS.PROJECT_DELETED, { id });
      },

      // 任务操作
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: `TASK-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        eventBus.emit(EVENTS.TASK_CREATED, newTask);
        return newTask;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
        eventBus.emit(EVENTS.TASK_UPDATED, { id, ...updates });
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        eventBus.emit(EVENTS.TASK_DELETED, { id });
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((t) => t.projectId === projectId);
      },

      // 设备操作
      addEquipment: (equipmentData) => {
        const newEquipment: Equipment = {
          ...equipmentData,
          id: `EQ-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ equipments: [...state.equipments, newEquipment] }));
        eventBus.emit(EVENTS.DEVICE_CREATED, newEquipment);
        return newEquipment;
      },

      updateEquipment: (id, updates) => {
        set((state) => ({
          equipments: state.equipments.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));
        eventBus.emit(EVENTS.DEVICE_UPDATED, { id, ...updates });
      },

      deleteEquipment: (id) => {
        set((state) => ({ equipments: state.equipments.filter((e) => e.id !== id) }));
      },

      getEquipmentsByProject: (projectId) => {
        return get().equipments.filter((e) => e.projectId === projectId);
      },

      // 采购计划操作
      addProcurementPlan: (planData) => {
        const newPlan: ProcurementPlan = {
          ...planData,
          id: `PP-${Date.now()}`,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ procurementPlans: [...state.procurementPlans, newPlan] }));
        eventBus.emit(EVENTS.PROCUREMENT_PLAN_CREATED, newPlan);
        return newPlan;
      },

      updateProcurementPlan: (id, updates) => {
        set((state) => ({
          procurementPlans: state.procurementPlans.map((pp) =>
            pp.id === id ? { ...pp, ...updates, updatedAt: new Date().toISOString() } : pp
          ),
        }));
      },

      deleteProcurementPlan: (id) => {
        set((state) => ({
          procurementPlans: state.procurementPlans.filter((pp) => pp.id !== id),
        }));
      },

      getProcurementPlansByProject: (projectId) => {
        return get().procurementPlans.filter((pp) => pp.projectId === projectId);
      },

      // 工具方法
      clearAll: () => {
        set({
          currentProject: null,
          projects: [],
          tasks: [],
          equipments: [],
          procurementPlans: [],
        });
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          projects: state.projects,
          tasks: state.tasks,
          equipments: state.equipments,
          procurementPlans: state.procurementPlans,
          exportedAt: new Date().toISOString(),
        }, null, 2);
      },

      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          set({
            projects: data.projects || [],
            tasks: data.tasks || [],
            equipments: data.equipments || [],
            procurementPlans: data.procurementPlans || [],
          });
        } catch (error) {
          console.error('导入数据失败:', error);
          throw new Error('数据格式错误');
        }
      },
    }),
    {
      name: 'epc-project-storage', // LocalStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 只持久化这些字段
        currentProject: state.currentProject,
        projects: state.projects,
        tasks: state.tasks,
        equipments: state.equipments,
        procurementPlans: state.procurementPlans,
      }),
    }
  )
);

// ============ Hooks ============

// 获取当前项目的所有数据
export const useCurrentProjectData = () => {
  const currentProject = useProjectStore((state) => state.currentProject);
  const tasks = useProjectStore((state) =>
    currentProject ? state.getTasksByProject(currentProject.id) : []
  );
  const equipments = useProjectStore((state) =>
    currentProject ? state.getEquipmentsByProject(currentProject.id) : []
  );
  const procurementPlans = useProjectStore((state) =>
    currentProject ? state.getProcurementPlansByProject(currentProject.id) : []
  );

  return {
    project: currentProject,
    tasks,
    equipments,
    procurementPlans,
  };
};

// 项目统计
export const useProjectStats = (projectId?: string) => {
  const tasks = useProjectStore((state) =>
    projectId ? state.getTasksByProject(projectId) : state.tasks
  );
  const equipments = useProjectStore((state) =>
    projectId ? state.getEquipmentsByProject(projectId) : state.equipments
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const totalEquipments = equipments.length;
  const totalCost = equipments.reduce((sum, e) => sum + e.totalPrice, 0);

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    totalEquipments,
    totalCost,
  };
};
