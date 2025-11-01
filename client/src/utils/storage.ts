/**
 * LocalStorage 工具函数
 * 用于管理任务、项目、用户偏好设置等本地数据
 */

const STORAGE_VERSION = '1.0.0';

// 存储键名
export const STORAGE_KEYS = {
  TASKS: 'epc_tasks',
  PROJECTS: 'epc_projects',
  CURRENT_PROJECT: 'epc_current_project',
  USER_PREFERENCES: 'epc_user_preferences',
  VERSION: 'epc_storage_version'
};

/**
 * 保存任务到本地存储
 */
export const saveTasks = (tasks: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
    return true;
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
    return false;
  }
};

/**
 * 从本地存储加载任务
 */
export const loadTasks = (): any[] => {
  try {
    const tasksStr = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasksStr ? JSON.parse(tasksStr) : [];
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
};

/**
 * 保存当前项目
 */
export const saveCurrentProject = (project: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(project));
    return true;
  } catch (error) {
    console.error('Failed to save current project:', error);
    return false;
  }
};

/**
 * 加载当前项目
 */
export const loadCurrentProject = (): any | null => {
  try {
    const projectStr = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
    return projectStr ? JSON.parse(projectStr) : null;
  } catch (error) {
    console.error('Failed to load current project:', error);
    return null;
  }
};

/**
 * 保存用户偏好设置
 */
export const saveUserPreferences = (preferences: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    return false;
  }
};

/**
 * 加载用户偏好设置
 */
export const loadUserPreferences = (): any => {
  try {
    const preferencesStr = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return preferencesStr ? JSON.parse(preferencesStr) : {
      theme: 'light',
      language: 'zh-CN',
      notifications: true
    };
  } catch (error) {
    console.error('Failed to load user preferences:', error);
    return {
      theme: 'light',
      language: 'zh-CN',
      notifications: true
    };
  }
};

/**
 * 清除所有本地存储数据
 */
export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
};

/**
 * 获取存储使用情况
 */
export const getStorageInfo = () => {
  const total = JSON.stringify(localStorage).length;
  const byKey: { [key: string]: number } = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);
    byKey[name] = value ? value.length : 0;
  });

  return {
    total,
    byKey,
    version: localStorage.getItem(STORAGE_KEYS.VERSION) || 'unknown'
  };
};

export default {
  saveTasks,
  loadTasks,
  saveCurrentProject,
  loadCurrentProject,
  saveUserPreferences,
  loadUserPreferences,
  clearAllStorage,
  getStorageInfo
};






