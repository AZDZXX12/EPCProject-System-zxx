/**
 * 自动规划任务时间
 * 根据依赖关系和工作日配置自动计算任务的开始和结束时间
 */

interface Task {
  id: string;
  text: string;
  duration: number;
  start_date?: Date;
  end_date?: Date;
  [key: string]: any;
}

interface Link {
  id: string;
  source: string;
  target: string;
  type: number; // 0: FS, 1: SS, 2: FF, 3: SF
  lag?: number; // 延迟天数
}

interface ScheduleConfig {
  projectStartDate: Date;
  workingDays: number[]; // 0-6, 0=周日
  holidays: Date[];
  hoursPerDay: number;
}

export class AutoScheduler {
  private tasks: Map<string, Task>;
  private links: Link[];
  private config: ScheduleConfig;
  
  constructor(tasks: Task[], links: Link[], config: Partial<ScheduleConfig> = {}) {
    this.tasks = new Map(tasks.map(t => [t.id, t]));
    this.links = links;
    this.config = {
      projectStartDate: config.projectStartDate || new Date(),
      workingDays: config.workingDays || [1, 2, 3, 4, 5], // 周一到周五
      holidays: config.holidays || [],
      hoursPerDay: config.hoursPerDay || 8
    };
  }
  
  /**
   * 执行自动规划
   */
  schedule(): Task[] {
    // 1. 拓扑排序
    const sorted = this.topologicalSort();
    
    // 2. 按依赖顺序计算每个任务的时间
    sorted.forEach(taskId => {
      this.scheduleTask(taskId);
    });
    
    // 3. 返回更新后的任务列表
    return Array.from(this.tasks.values());
  }
  
  /**
   * 拓扑排序
   */
  private topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    
    // 初始化
    this.tasks.forEach((_, id) => {
      inDegree.set(id, 0);
      adjList.set(id, []);
    });
    
    // 构建邻接表
    this.links.forEach(link => {
      adjList.get(link.source)?.push(link.target);
      inDegree.set(link.target, (inDegree.get(link.target) || 0) + 1);
    });
    
    // Kahn算法
    const queue: string[] = [];
    const result: string[] = [];
    
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      
      adjList.get(current)?.forEach(next => {
        const newDegree = (inDegree.get(next) || 0) - 1;
        inDegree.set(next, newDegree);
        if (newDegree === 0) {
          queue.push(next);
        }
      });
    }
    
    return result;
  }
  
  /**
   * 规划单个任务
   */
  private scheduleTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    // 获取所有前置任务
    const predecessors = this.links.filter(l => l.target === taskId);
    
    let startDate: Date;
    
    if (predecessors.length === 0) {
      // 没有前置任务，从项目开始日期开始
      startDate = new Date(this.config.projectStartDate);
    } else {
      // 根据前置任务和依赖类型计算开始时间
      const possibleStarts = predecessors.map(link => 
        this.calculateStartDate(link)
      );
      
      // 取最晚的开始时间
      startDate = new Date(Math.max(...possibleStarts.map(d => d.getTime())));
    }
    
    // 计算结束时间（考虑工作日）
    const endDate = this.addWorkingDays(startDate, task.duration);
    
    // 更新任务
    task.start_date = startDate;
    task.end_date = endDate;
  }
  
  /**
   * 根据依赖关系计算开始日期
   */
  private calculateStartDate(link: Link): Date {
    const predTask = this.tasks.get(link.source);
    if (!predTask || !predTask.start_date || !predTask.end_date) {
      return this.config.projectStartDate;
    }
    
    const lag = link.lag || 0;
    let baseDate: Date;
    
    switch (link.type) {
      case 0: // FS (Finish-to-Start)
        baseDate = new Date(predTask.end_date);
        break;
      case 1: // SS (Start-to-Start)
        baseDate = new Date(predTask.start_date);
        break;
      case 2: // FF (Finish-to-Finish)
        // 需要后续任务的duration，这里简化处理
        baseDate = new Date(predTask.end_date);
        break;
      case 3: // SF (Start-to-Finish)
        baseDate = new Date(predTask.start_date);
        break;
      default:
        baseDate = new Date(predTask.end_date);
    }
    
    // 应用延迟
    return this.addWorkingDays(baseDate, lag);
  }
  
  /**
   * 添加工作日（跳过周末和节假日）
   */
  private addWorkingDays(startDate: Date, days: number): Date {
    const result = new Date(startDate);
    let remainingDays = Math.abs(days);
    const direction = days >= 0 ? 1 : -1;
    
    while (remainingDays > 0) {
      result.setDate(result.getDate() + direction);
      
      if (this.isWorkingDay(result)) {
        remainingDays--;
      }
    }
    
    return result;
  }
  
  /**
   * 判断是否为工作日
   */
  private isWorkingDay(date: Date): boolean {
    // 检查是否为配置的工作日
    if (!this.config.workingDays.includes(date.getDay())) {
      return false;
    }
    
    // 检查是否为节假日
    const dateStr = this.formatDate(date);
    if (this.config.holidays.some(h => this.formatDate(h) === dateStr)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 格式化日期为 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * 计算两个日期之间的工作日天数
   */
  calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (this.isWorkingDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}

/**
 * 应用自动规划到甘特图
 */
export function applyAutoScheduleToGantt(
  gantt: any, 
  config: Partial<ScheduleConfig> = {}
): void {
  if (!gantt) return;
  
  try {
    // 获取所有任务和连接
    const tasks = gantt.getTaskByTime() as Task[];
    const links = gantt.getLinks ? gantt.getLinks() : [];
    
    // 创建调度器
    const scheduler = new AutoScheduler(tasks, links, config);
    
    // 执行调度
    const scheduledTasks = scheduler.schedule();
    
    // 更新甘特图
    scheduledTasks.forEach(task => {
      try {
        const ganttTask = gantt.getTask(task.id);
        if (ganttTask) {
          ganttTask.start_date = task.start_date;
          ganttTask.end_date = task.end_date;
          gantt.updateTask(task.id);
        }
      } catch (e) {
        // 任务不存在
      }
    });
    
    gantt.render();
  } catch (error) {
    console.error('自动规划失败:', error);
  }
}
