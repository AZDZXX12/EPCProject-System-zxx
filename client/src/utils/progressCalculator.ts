/**
 * 进度计算器 - 三种模式
 */

interface Task {
  id: string;
  start_date: Date;
  end_date: Date;
  duration: number;
  progress?: number;
  actualHours?: number;
  estimatedHours?: number;
  children?: Task[];
}

export type ProgressMode = 'manual' | 'time' | 'worktime';

export class ProgressCalculator {
  private mode: ProgressMode;
  
  constructor(mode: ProgressMode = 'manual') {
    this.mode = mode;
  }
  
  /**
   * 设置模式
   */
  setMode(mode: ProgressMode): void {
    this.mode = mode;
  }
  
  /**
   * 计算任务进度
   */
  calculate(task: Task): number {
    switch (this.mode) {
      case 'time':
        return this.calculateByTime(task);
      case 'worktime':
        return this.calculateByWorktime(task);
      case 'manual':
      default:
        return task.progress || 0;
    }
  }
  
  /**
   * 基于时间计算进度
   */
  private calculateByTime(task: Task): number {
    const now = new Date();
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    
    if (now < start) return 0;
    if (now > end) return 1;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(1, elapsed / total);
  }
  
  /**
   * 基于工时计算进度
   */
  private calculateByWorktime(task: Task): number {
    if (!task.estimatedHours) return task.progress || 0;
    
    const actual = task.actualHours || 0;
    const estimated = task.estimatedHours;
    
    return Math.min(1, actual / estimated);
  }
  
  /**
   * 批量计算所有任务进度
   */
  calculateAll(tasks: Task[]): Task[] {
    return tasks.map(task => {
      const progress = this.calculate(task);
      return { ...task, progress };
    });
  }
  
  /**
   * 计算父任务进度（子任务平均值）
   */
  calculateParentProgress(task: Task): number {
    if (!task.children || task.children.length === 0) {
      return this.calculate(task);
    }
    
    const childProgress = task.children.map(child => 
      this.calculateParentProgress(child)
    );
    
    return childProgress.reduce((a, b) => a + b, 0) / childProgress.length;
  }
}

/**
 * 应用进度计算到甘特图
 */
export function applyProgressCalculation(
  gantt: any,
  mode: ProgressMode = 'manual'
): void {
  const calculator = new ProgressCalculator(mode);
  
  gantt.eachTask((task: any) => {
    task.progress = calculator.calculate(task);
    gantt.updateTask(task.id);
  });
  
  gantt.render();
}
