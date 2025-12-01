/**
 * 项目基线管理器
 * 用于创建、对比、回滚项目基线
 */

interface Task {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  duration: number;
  [key: string]: any;
}

interface ProjectBaseline {
  id: string;
  name: string;
  createdAt: Date;
  createdBy?: string;
  snapshot: {
    tasks: Task[];
  };
  description?: string;
}

interface TaskDelay {
  taskId: string;
  taskName: string;
  baselineStart: Date;
  baselineEnd: Date;
  actualStart: Date;
  actualEnd: Date;
  delayDays: number;
  status: 'on-time' | 'delayed' | 'early';
  criticalLevel: 'high' | 'medium' | 'low';
}

class BaselineManager {
  private baselines: ProjectBaseline[] = [];
  private storageKey = 'project_baselines';
  
  constructor() {
    this.loadBaselines();
  }
  
  /**
   * 加载基线数据
   */
  private loadBaselines(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.baselines = JSON.parse(data, (key, value) => {
          if (key === 'createdAt' || key.includes('date') || key.includes('Date')) {
            return new Date(value);
          }
          return value;
        });
      }
    } catch (error) {
      console.error('加载基线数据失败:', error);
    }
  }
  
  /**
   * 保存基线数据
   */
  private saveBaselines(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.baselines));
    } catch (error) {
      console.error('保存基线数据失败:', error);
    }
  }
  
  /**
   * 创建新基线
   */
  createBaseline(name: string, tasks: Task[], description?: string): ProjectBaseline {
    const baseline: ProjectBaseline = {
      id: `baseline_${Date.now()}`,
      name,
      createdAt: new Date(),
      snapshot: {
        tasks: JSON.parse(JSON.stringify(tasks)) // 深拷贝
      },
      description
    };
    
    this.baselines.push(baseline);
    this.saveBaselines();
    
    return baseline;
  }
  
  /**
   * 对比当前任务与基线
   */
  compareWithBaseline(baselineId: string, currentTasks: Task[]): TaskDelay[] {
    const baseline = this.baselines.find(b => b.id === baselineId);
    if (!baseline) {
      throw new Error('基线不存在');
    }
    
    const delays: TaskDelay[] = [];
    
    baseline.snapshot.tasks.forEach(baselineTask => {
      const currentTask = currentTasks.find(t => t.id === baselineTask.id);
      if (!currentTask) return;
      
      const baselineStart = new Date(baselineTask.start_date);
      const baselineEnd = new Date(baselineTask.end_date);
      const actualStart = new Date(currentTask.start_date);
      const actualEnd = new Date(currentTask.end_date);
      
      const delayDays = this.daysBetween(actualEnd, baselineEnd);
      
      let status: 'on-time' | 'delayed' | 'early';
      if (delayDays > 0) status = 'delayed';
      else if (delayDays < 0) status = 'early';
      else status = 'on-time';
      
      let criticalLevel: 'high' | 'medium' | 'low';
      if (Math.abs(delayDays) >= 7) criticalLevel = 'high';
      else if (Math.abs(delayDays) >= 3) criticalLevel = 'medium';
      else criticalLevel = 'low';
      
      delays.push({
        taskId: currentTask.id,
        taskName: currentTask.text,
        baselineStart,
        baselineEnd,
        actualStart,
        actualEnd,
        delayDays,
        status,
        criticalLevel
      });
    });
    
    return delays;
  }
  
  /**
   * 计算两个日期之间的天数差
   */
  private daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date1.getTime() - date2.getTime()) / oneDay);
  }
  
  /**
   * 回滚到基线
   */
  rollbackToBaseline(baselineId: string): Task[] {
    const baseline = this.baselines.find(b => b.id === baselineId);
    if (!baseline) {
      throw new Error('基线不存在');
    }
    
    return JSON.parse(JSON.stringify(baseline.snapshot.tasks));
  }
  
  /**
   * 删除基线
   */
  deleteBaseline(baselineId: string): void {
    const index = this.baselines.findIndex(b => b.id === baselineId);
    if (index !== -1) {
      this.baselines.splice(index, 1);
      this.saveBaselines();
    }
  }
  
  /**
   * 获取所有基线
   */
  getAllBaselines(): ProjectBaseline[] {
    return this.baselines;
  }
  
  /**
   * 获取单个基线
   */
  getBaseline(baselineId: string): ProjectBaseline | undefined {
    return this.baselines.find(b => b.id === baselineId);
  }
}

export const baselineManager = new BaselineManager();
export type { ProjectBaseline, TaskDelay };
