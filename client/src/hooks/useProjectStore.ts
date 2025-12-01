/**
 * 便捷的Store Hooks
 * 简化组件中的状态访问
 */

import { useProjectStore, useCurrentProjectData, useProjectStats } from '../store/projectStore';

// 重新导出常用hooks
export { useProjectStore, useCurrentProjectData, useProjectStats };

// 项目操作hooks
export const useProject = () => {
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);

  return {
    currentProject,
    setCurrentProject,
    addProject,
    updateProject,
    deleteProject,
  };
};

// 任务操作hooks
export const useTasks = (projectId?: string) => {
  const tasks = useProjectStore((state) =>
    projectId ? state.getTasksByProject(projectId) : state.tasks
  );
  const addTask = useProjectStore((state) => state.addTask);
  const updateTask = useProjectStore((state) => state.updateTask);
  const deleteTask = useProjectStore((state) => state.deleteTask);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
  };
};

// 设备操作hooks
export const useEquipments = (projectId?: string) => {
  const equipments = useProjectStore((state) =>
    projectId ? state.getEquipmentsByProject(projectId) : state.equipments
  );
  const addEquipment = useProjectStore((state) => state.addEquipment);
  const updateEquipment = useProjectStore((state) => state.updateEquipment);
  const deleteEquipment = useProjectStore((state) => state.deleteEquipment);

  return {
    equipments,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  };
};

// 采购计划操作hooks
export const useProcurementPlans = (projectId?: string) => {
  const plans = useProjectStore((state) =>
    projectId ? state.getProcurementPlansByProject(projectId) : state.procurementPlans
  );
  const addPlan = useProjectStore((state) => state.addProcurementPlan);
  const updatePlan = useProjectStore((state) => state.updateProcurementPlan);
  const deletePlan = useProjectStore((state) => state.deleteProcurementPlan);

  return {
    plans,
    addPlan,
    updatePlan,
    deletePlan,
  };
};
