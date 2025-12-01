/**
 * 🗂️ 统一数据管理器
 *
 * 职责：
 * 1. 集中管理所有模块的数据
 * 2. 实现模块间的联动逻辑
 * 3. 提供统一的数据计算方法
 * 4. 处理数据持久化
 *
 * 参考：单一数据源原则（Single Source of Truth）
 */

import {
  eventBus,
  EVENTS,
  TaskEventData,
  LogEventData,
  PhaseEventData,
  ProgressEventData,
} from '../utils/EventBus';
import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';

// ============ 类型定义 ============

interface Task {
  id: string;
  project_id: string;
  text: string;
  progress: number;
  start_date: string;
  end_date: string;
  duration?: number;
  parent?: string;
}

interface ConstructionLog {
  id: string;
  project_id: string;
  task_id?: string;
  date: string;
  task_name: string;
  progress_today: number;
  work_content: string;
  worker_count: number;
  weather: string;
  temperature: string;
  reporter: string;
}

interface Phase {
  key: string;
  name: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  responsible?: string;
  start_date?: string;
  end_date?: string;
  team?: string[];
}

interface Device {
  device_id: string;
  project_id: string;
  device_name: string;
  status: string;
  progress?: number;
  related_task_id?: string;
}

// ============ 数据管理器 ============

class DataManager {
  private debug: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * 🔧 初始化事件监听
   */
  private initializeEventListeners(): void {
    // 监听任务更新
    eventBus.on(EVENTS.TASK_UPDATED, (data: TaskEventData) => {
      this.onTaskUpdate(data);
    });

    // 监听日志创建
    eventBus.on(EVENTS.LOG_CREATED, (data: LogEventData) => {
      this.onLogCreate(data);
    });

    // 监听阶段更新
    eventBus.on(EVENTS.PHASE_UPDATED, (data: PhaseEventData) => {
      this.onPhaseUpdate(data);
    });

    if (this.debug) {
      logger.info('[DataManager] 事件监听器已初始化');
    }
  }

  // ============ 核心计算方法 ============

  /**
   * 📊 计算项目总进度（多数据源加权平均）
   *
   * 策略：
   * - 任务进度（甘特图）: 40%
   * - 阶段进度（总包管理）: 40%
   * - 日志进度（施工日志）: 20%
   */
  calculateProjectProgress(projectId: string): number {
    try {
      // 1. 获取甘特图任务进度
      const tasks = this.getTasksByProject(projectId);
      const taskProgress = this.calculateTaskProgress(tasks);

      // 2. 获取阶段进度
      const phases = this.getPhasesByProject(projectId);
      const phaseProgress = this.calculatePhaseProgress(phases);

      // 3. 获取施工日志最新进度
      const logs = this.getLogsByProject(projectId);
      const logProgress = this.calculateLogProgress(logs);

      // 4. 权重配置
      const weights = {
        task: 0.4, // 任务进度权重 40%
        phase: 0.4, // 阶段进度权重 40%
        log: 0.2, // 日志进度权重 20%
      };

      // 5. 加权平均
      const totalProgress =
        taskProgress * weights.task + phaseProgress * weights.phase + logProgress * weights.log;

      const finalProgress = Math.round(totalProgress);

      if (this.debug) {
        logger.debug('[DataManager] 项目进度计算:', {
          projectId,
          taskProgress: Math.round(taskProgress),
          phaseProgress: Math.round(phaseProgress),
          logProgress: Math.round(logProgress),
          finalProgress,
        });
      }

      return finalProgress;
    } catch (error) {
      logger.error('[DataManager] 计算项目进度失败:', error);
      return 0;
    }
  }

  /**
   * 计算任务进度（甘特图）
   */
  private calculateTaskProgress(tasks: Task[]): number {
    if (!tasks || tasks.length === 0) return 0;

    // 过滤掉父任务（避免重复计算）
    const leafTasks = tasks.filter((t) => !tasks.some((child) => child.parent === t.id));

    if (leafTasks.length === 0) return 0;

    const totalProgress = leafTasks.reduce((sum, task) => {
      return sum + task.progress * 100; // progress是0-1，转为0-100
    }, 0);

    return totalProgress / leafTasks.length;
  }

  /**
   * 计算阶段进度（总包管理）
   */
  private calculatePhaseProgress(phases: Phase[]): number {
    if (!phases || phases.length === 0) return 0;

    // EPC阶段权重
    const weights: Record<string, number> = {
      design: 0.15, // 设计阶段 15%
      procurement: 0.2, // 采购阶段 20%
      construction: 0.4, // 施工阶段 40%
      commissioning: 0.15, // 调试阶段 15%
      acceptance: 0.1, // 验收阶段 10%
    };

    const totalProgress = phases.reduce((total, phase) => {
      const weight = weights[phase.key] || 1 / phases.length;
      return total + phase.progress * weight;
    }, 0);

    return totalProgress;
  }

  /**
   * 计算日志进度（施工日志）
   */
  private calculateLogProgress(logs: ConstructionLog[]): number {
    if (!logs || logs.length === 0) return 0;

    // 获取最近7天的日志
    const recentLogs = logs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    if (recentLogs.length === 0) return 0;

    // 计算平均进度
    const avgProgress =
      recentLogs.reduce((sum, log) => sum + log.progress_today, 0) / recentLogs.length;

    return avgProgress;
  }

  // ============ 联动逻辑 ============

  /**
   * 🔗 任务更新联动
   */
  private async onTaskUpdate(taskData: TaskEventData): Promise<void> {
    try {
      if (this.debug) {
        logger.debug('[DataManager] 任务更新联动:', taskData);
      }

      // 1. 更新关联的施工日志
      const relatedLogs = this.getLogsByTask(taskData.id);
      if (relatedLogs.length > 0) {
        relatedLogs.forEach((log) => {
          // 如果任务进度更新，同步日志
          if (taskData.progress > log.progress_today) {
            eventBus.emit(EVENTS.LOG_UPDATED, {
              ...log,
              progress_today: taskData.progress,
              updated_from_task: true,
            });
          }
        });
      }

      // 2. 更新关联的设备状态
      const relatedDevices = this.getDevicesByTask(taskData.id);
      if (relatedDevices.length > 0) {
        relatedDevices.forEach((device) => {
          const newStatus = this.calculateDeviceStatus(taskData.progress);
          if (newStatus !== device.status) {
            eventBus.emit(EVENTS.DEVICE_STATUS_CHANGED, {
              deviceId: device.device_id,
              status: newStatus,
              progress: taskData.progress,
            });
          }
        });
      }

      // 3. 重新计算项目进度
      const newProgress = this.calculateProjectProgress(taskData.projectId);
      eventBus.emit(EVENTS.PROGRESS_CHANGED, {
        projectId: taskData.projectId,
        progress: newProgress,
        source: 'task',
        metadata: { taskId: taskData.id },
      } as ProgressEventData);

      // 4. 更新相关阶段
      await this.updatePhaseProgress(taskData.projectId, taskData);
    } catch (error) {
      logger.error('[DataManager] 任务更新联动失败:', error);
    }
  }

  /**
   * 🔗 施工日志创建联动
   */
  private async onLogCreate(logData: LogEventData): Promise<void> {
    try {
      if (this.debug) {
        logger.debug('[DataManager] 施工日志创建联动:', logData);
      }

      // 1. 如果关联了任务，更新任务进度
      if (logData.taskId) {
        const task = this.getTask(logData.taskId);
        if (task && logData.progress > task.progress * 100) {
          eventBus.emit(EVENTS.TASK_UPDATED, {
            id: task.id,
            projectId: task.project_id,
            name: task.text,
            progress: logData.progress,
            updated_from_log: true,
          } as TaskEventData);
        }
      }

      // 2. 重新计算项目进度
      const newProgress = this.calculateProjectProgress(logData.projectId);
      eventBus.emit(EVENTS.PROGRESS_CHANGED, {
        projectId: logData.projectId,
        progress: newProgress,
        source: 'log',
        metadata: { logId: logData.id },
      } as ProgressEventData);

      // 3. 显示通知
      eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
        type: 'info',
        message: '施工日志已创建',
        description: `进度: ${logData.progress}%`,
        duration: 3,
      });
    } catch (error) {
      logger.error('[DataManager] 施工日志创建联动失败:', error);
    }
  }

  /**
   * 🔗 阶段更新联动
   */
  private async onPhaseUpdate(phaseData: PhaseEventData): Promise<void> {
    try {
      if (this.debug) {
        logger.debug('[DataManager] 阶段更新联动:', phaseData);
      }

      // 1. 重新计算项目进度
      const newProgress = this.calculateProjectProgress(phaseData.projectId);

      // 2. 触发进度变更事件
      eventBus.emit(EVENTS.PROGRESS_CHANGED, {
        projectId: phaseData.projectId,
        progress: newProgress,
        source: 'phase',
        metadata: { phaseKey: phaseData.key },
      } as ProgressEventData);

      // 3. 如果阶段完成，触发完成事件
      if (phaseData.progress === 100) {
        eventBus.emit(EVENTS.PHASE_COMPLETED, phaseData);

        eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
          type: 'success',
          message: `${phaseData.name}阶段已完成`,
          description: '项目进度已自动更新',
          duration: 5,
        });
      }
    } catch (error) {
      logger.error('[DataManager] 阶段更新联动失败:', error);
    }
  }

  /**
   * 更新阶段进度（基于任务）
   */
  private async updatePhaseProgress(projectId: string, taskData: TaskEventData): Promise<void> {
    // 根据任务名称判断所属阶段
    const taskName = taskData.name.toLowerCase();
    let phaseKey: string | null = null;

    if (taskName.includes('设计') || taskName.includes('图纸')) {
      phaseKey = 'design';
    } else if (taskName.includes('采购') || taskName.includes('设备')) {
      phaseKey = 'procurement';
    } else if (taskName.includes('施工') || taskName.includes('安装')) {
      phaseKey = 'construction';
    } else if (taskName.includes('调试') || taskName.includes('测试')) {
      phaseKey = 'commissioning';
    } else if (taskName.includes('验收')) {
      phaseKey = 'acceptance';
    }

    if (phaseKey) {
      const phases = this.getPhasesByProject(projectId);
      const phase = phases.find((p) => p.key === phaseKey);

      if (phase) {
        // 获取该阶段所有任务的平均进度
        const phaseTasks = this.getTasksByPhase(projectId, phaseKey);
        if (phaseTasks.length > 0) {
          const avgProgress =
            phaseTasks.reduce((sum, t) => sum + t.progress * 100, 0) / phaseTasks.length;

          if (avgProgress !== phase.progress) {
            eventBus.emit(EVENTS.PHASE_UPDATED, {
              key: phaseKey,
              projectId,
              name: phase.name,
              progress: Math.round(avgProgress),
              auto_calculated: true,
            } as PhaseEventData);
          }
        }
      }
    }
  }

  /**
   * 根据任务进度计算设备状态
   */
  private calculateDeviceStatus(progress: number): string {
    if (progress >= 100) return 'installed';
    if (progress >= 50) return 'installing';
    if (progress > 0) return 'preparing';
    return 'pending';
  }

  // ============ 数据获取方法 ============

  /**
   * 获取项目的所有任务
   */
  private getTasksByProject(projectId: string): Task[] {
    try {
      const cacheKey = `gantt_tasks_${projectId}`;
      const cachedData = StorageManager.load(cacheKey);

      if (cachedData && cachedData.data) {
        return cachedData.data.filter((t: Task) => t.project_id === projectId);
      }

      return [];
    } catch (error) {
      logger.error('[DataManager] 获取任务失败:', error);
      return [];
    }
  }

  /**
   * 获取项目的所有阶段
   */
  private getPhasesByProject(projectId: string): Phase[] {
    try {
      const cacheKey = `epc_phases_${projectId}`;
      const phases = StorageManager.load(cacheKey);
      return phases || [];
    } catch (error) {
      logger.error('[DataManager] 获取阶段失败:', error);
      return [];
    }
  }

  /**
   * 获取项目的所有施工日志
   */
  private getLogsByProject(projectId: string): ConstructionLog[] {
    try {
      const allLogs = StorageManager.load('construction_logs') || [];
      return allLogs.filter((log: ConstructionLog) => log.project_id === projectId);
    } catch (error) {
      logger.error('[DataManager] 获取日志失败:', error);
      return [];
    }
  }

  /**
   * 获取任务关联的施工日志
   */
  private getLogsByTask(taskId: string): ConstructionLog[] {
    try {
      const allLogs = StorageManager.load('construction_logs') || [];
      return allLogs.filter((log: ConstructionLog) => log.task_id === taskId);
    } catch (error) {
      logger.error('[DataManager] 获取任务日志失败:', error);
      return [];
    }
  }

  /**
   * 获取单个任务
   */
  private getTask(taskId: string): Task | null {
    try {
      const allTasks = StorageManager.load('gantt_tasks_all') || [];
      return allTasks.find((t: Task) => t.id === taskId) || null;
    } catch (error) {
      logger.error('[DataManager] 获取任务失败:', error);
      return null;
    }
  }

  /**
   * 获取阶段相关的任务
   */
  private getTasksByPhase(projectId: string, phaseKey: string): Task[] {
    const allTasks = this.getTasksByProject(projectId);
    const keywords: Record<string, string[]> = {
      design: ['设计', '图纸'],
      procurement: ['采购', '设备'],
      construction: ['施工', '安装'],
      commissioning: ['调试', '测试'],
      acceptance: ['验收'],
    };

    const phaseKeywords = keywords[phaseKey] || [];
    return allTasks.filter((task) => phaseKeywords.some((keyword) => task.text.includes(keyword)));
  }

  /**
   * 获取任务关联的设备
   */
  private getDevicesByTask(taskId: string): Device[] {
    try {
      const allDevices = StorageManager.load('devices_all') || [];
      return allDevices.filter((d: Device) => d.related_task_id === taskId);
    } catch (error) {
      logger.error('[DataManager] 获取设备失败:', error);
      return [];
    }
  }

  // ============ 公共API ============

  /**
   * 手动触发进度同步
   */
  public async syncProjectProgress(projectId: string): Promise<number> {
    const progress = this.calculateProjectProgress(projectId);
    eventBus.emit(EVENTS.PROGRESS_CHANGED, {
      projectId,
      progress,
      source: 'manual',
    } as ProgressEventData);
    return progress;
  }

  /**
   * 获取项目统计信息
   */
  public getProjectStats(projectId: string): any {
    const tasks = this.getTasksByProject(projectId);
    const logs = this.getLogsByProject(projectId);
    const phases = this.getPhasesByProject(projectId);

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.progress === 1).length,
      totalLogs: logs.length,
      completedPhases: phases.filter((p) => p.progress === 100).length,
      totalPhases: phases.length,
      progress: this.calculateProjectProgress(projectId),
    };
  }
}

// 创建全局单例
export const dataManager = new DataManager();

export default dataManager;
