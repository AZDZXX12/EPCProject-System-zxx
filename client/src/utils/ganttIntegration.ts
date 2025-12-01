/**
 * 甘特图与现有模块的整合
 */

import { taskApi } from '../services/api';

/**
 * 与AI助手整合
 */
export class AIGanttIntegration {
  /**
   * 从自然语言描述生成甘特图任务
   */
  static async generateGanttFromDescription(description: string): Promise<any[]> {
    // 简单的解析逻辑（可以后续接入真实AI）
    const phases = this.parseDescription(description);
    return phases.map((phase, index) => ({
      id: `task_${Date.now()}_${index}`,
      text: phase.name,
      start_date: new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000),
      duration: phase.duration || 7,
      progress: 0,
      type: phase.isMilestone ? 'milestone' : 'task'
    }));
  }
  
  private static parseDescription(description: string): any[] {
    // 简单解析，识别阶段和时间
    const phases: any[] = [];
    const lines = description.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // 提取任务名称和持续时间
      const match = trimmed.match(/^(.+?)(?:\((\d+)天\))?$/);
      if (match) {
        phases.push({
          name: match[1].trim(),
          duration: match[2] ? parseInt(match[2]) : 7,
          isMilestone: trimmed.includes('里程碑')
        });
      }
    }
    
    return phases;
  }
}

/**
 * 与材料价格模块整合
 */
export class MaterialCostIntegration {
  /**
   * 计算任务的材料成本
   */
  static async calculateTaskMaterialCost(task: any): Promise<number> {
    // 根据任务类型估算材料成本
    const costMap: Record<string, number> = {
      '设计': 0,
      '采购': 50000,
      '施工': 200000,
      '调试': 30000,
      '验收': 0
    };
    
    for (const key in costMap) {
      if (task.text.includes(key)) {
        return costMap[key];
      }
    }
    
    return 0;
  }
  
  /**
   * 为任务添加材料成本标签
   */
  static formatTaskWithCost(task: any, cost: number): string {
    if (cost > 0) {
      return `${task.text} (¥${cost.toLocaleString()})`;
    }
    return task.text;
  }
}

/**
 * 与工时模块整合
 */
export class WorkTimeIntegration {
  /**
   * 从工时记录更新任务进度
   */
  static updateProgressFromWorkTime(task: any, timeEntries: any[]): number {
    if (!task.estimatedHours) return task.progress || 0;
    
    const actualHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return Math.min(1, actualHours / task.estimatedHours);
  }
  
  /**
   * 计算任务的实际工时
   */
  static calculateActualHours(timeEntries: any[]): number {
    return timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  }
  
  /**
   * 预测任务完成时间
   */
  static predictCompletionDate(task: any, timeEntries: any[]): Date | null {
    if (!task.estimatedHours || !task.start_date) return null;
    
    const actualHours = this.calculateActualHours(timeEntries);
    const remainingHours = task.estimatedHours - actualHours;
    
    if (remainingHours <= 0) return new Date(); // 已完成
    
    // 假设每天工作8小时
    const remainingDays = Math.ceil(remainingHours / 8);
    const predictedDate = new Date(task.start_date);
    predictedDate.setDate(predictedDate.getDate() + remainingDays);
    
    return predictedDate;
  }
}

/**
 * 任务分组功能
 */
export class TaskGrouping {
  /**
   * 按阶段分组
   */
  static groupByPhase(tasks: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();
    
    tasks.forEach(task => {
      const phase = task.phase || '未分类';
      if (!grouped.has(phase)) {
        grouped.set(phase, []);
      }
      grouped.get(phase)!.push(task);
    });
    
    return grouped;
  }
  
  /**
   * 按负责人分组
   */
  static groupByOwner(tasks: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();
    
    tasks.forEach(task => {
      const owner = task.owner || '未分配';
      if (!grouped.has(owner)) {
        grouped.set(owner, []);
      }
      grouped.get(owner)!.push(task);
    });
    
    return grouped;
  }
  
  /**
   * 按优先级分组
   */
  static groupByPriority(tasks: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();
    const priorities = ['high', 'medium', 'low'];
    
    priorities.forEach(p => grouped.set(p, []));
    
    tasks.forEach(task => {
      const priority = task.priority || 'medium';
      if (!grouped.has(priority)) {
        grouped.set(priority, []);
      }
      grouped.get(priority)!.push(task);
    });
    
    return grouped;
  }
}

/**
 * 应用整合功能到甘特图
 */
export function applyIntegrations(gantt: any): void {
  // 任务文本模板 - 显示材料成本
  gantt.templates.task_text = function(start: Date, end: Date, task: any) {
    if (task.materialCost) {
      return MaterialCostIntegration.formatTaskWithCost(task, task.materialCost);
    }
    return task.text;
  };
  
  // 自动计算材料成本
  gantt.attachEvent('onTaskLoading', async (task: any) => {
    if (!task.materialCost) {
      task.materialCost = await MaterialCostIntegration.calculateTaskMaterialCost(task);
    }
    return true;
  });
}
