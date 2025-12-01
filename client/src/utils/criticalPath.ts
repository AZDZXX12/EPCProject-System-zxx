/**
 * 关键路径分析 (Critical Path Method - CPM)
 * 用于识别项目中的关键任务链
 */

interface Task {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  duration: number;
  [key: string]: any;
}

interface Link {
  id: string;
  source: string;
  target: string;
  type: number; // 0: FS, 1: SS, 2: FF, 3: SF
}

interface TaskTimes {
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number; // 松弛时间
}

interface CriticalPathResult {
  criticalTasks: Set<string>;
  criticalLinks: Set<string>;
  taskTimes: Map<string, TaskTimes>;
  totalDuration: number;
  slackAnalysis: Array<{
    taskId: string;
    taskName: string;
    slack: number;
    isCritical: boolean;
  }>;
}

export class CriticalPathAnalyzer {
  private tasks: Map<string, Task>;
  private links: Link[];
  private taskTimes: Map<string, TaskTimes>;
  
  constructor(tasks: Task[], links: Link[]) {
    this.tasks = new Map(tasks.map(t => [t.id, t]));
    this.links = links;
    this.taskTimes = new Map();
  }
  
  /**
   * 执行关键路径分析
   */
  analyze(): CriticalPathResult {
    // 1. 拓扑排序
    const sorted = this.topologicalSort();
    
    // 2. 正向遍历 - 计算最早时间
    this.forwardPass(sorted);
    
    // 3. 反向遍历 - 计算最晚时间
    this.backwardPass(sorted);
    
    // 4. 计算松弛时间
    this.calculateSlack();
    
    // 5. 识别关键路径
    const criticalTasks = this.identifyCriticalTasks();
    const criticalLinks = this.identifyCriticalLinks(criticalTasks);
    
    // 6. 生成分析报告
    const slackAnalysis = this.generateSlackAnalysis();
    
    // 7. 计算总工期
    const totalDuration = this.calculateTotalDuration();
    
    return {
      criticalTasks,
      criticalLinks,
      taskTimes: this.taskTimes,
      totalDuration,
      slackAnalysis
    };
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
    
    // 构建邻接表和入度
    this.links.forEach(link => {
      const from = link.source;
      const to = link.target;
      adjList.get(from)?.push(to);
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    });
    
    // Kahn算法
    const queue: string[] = [];
    const result: string[] = [];
    
    // 找出所有入度为0的节点
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
   * 正向遍历 - 计算最早开始和结束时间
   */
  private forwardPass(sorted: string[]): void {
    sorted.forEach(taskId => {
      const task = this.tasks.get(taskId);
      if (!task) return;
      
      // 找出所有前置任务
      const predecessors = this.links.filter(l => l.target === taskId);
      
      let earlyStart = 0;
      
      if (predecessors.length === 0) {
        // 起始任务
        earlyStart = 0;
      } else {
        // 取所有前置任务的最晚结束时间
        earlyStart = Math.max(...predecessors.map(link => {
          const predTimes = this.taskTimes.get(link.source);
          if (!predTimes) return 0;
          
          // 根据依赖类型计算
          switch (link.type) {
            case 0: // FS (Finish-to-Start)
              return predTimes.earlyFinish;
            case 1: // SS (Start-to-Start)
              return predTimes.earlyStart;
            case 2: // FF (Finish-to-Finish)
              return predTimes.earlyFinish - task.duration;
            case 3: // SF (Start-to-Finish)
              return predTimes.earlyStart - task.duration;
            default:
              return predTimes.earlyFinish;
          }
        }));
      }
      
      const earlyFinish = earlyStart + task.duration;
      
      this.taskTimes.set(taskId, {
        earlyStart,
        earlyFinish,
        lateStart: 0,
        lateFinish: 0,
        slack: 0
      });
    });
  }
  
  /**
   * 反向遍历 - 计算最晚开始和结束时间
   */
  private backwardPass(sorted: string[]): void {
    // 找出项目结束时间
    let projectEnd = 0;
    this.taskTimes.forEach(times => {
      projectEnd = Math.max(projectEnd, times.earlyFinish);
    });
    
    // 反向遍历
    for (let i = sorted.length - 1; i >= 0; i--) {
      const taskId = sorted[i];
      const task = this.tasks.get(taskId);
      if (!task) continue;
      
      const times = this.taskTimes.get(taskId)!;
      
      // 找出所有后续任务
      const successors = this.links.filter(l => l.source === taskId);
      
      let lateFinish: number;
      
      if (successors.length === 0) {
        // 结束任务
        lateFinish = projectEnd;
      } else {
        // 取所有后续任务的最早开始时间
        const endTime = projectEnd; // 提取到循环外避免闭包问题
        lateFinish = Math.min(...successors.map(link => {
          const succTimes = this.taskTimes.get(link.target);
          if (!succTimes) return endTime;
          
          // 根据依赖类型计算
          switch (link.type) {
            case 0: // FS (Finish-to-Start)
              return succTimes.lateStart;
            case 1: // SS (Start-to-Start)
              return succTimes.lateStart + task.duration;
            case 2: // FF (Finish-to-Finish)
              return succTimes.lateFinish;
            case 3: // SF (Start-to-Finish)
              return succTimes.lateFinish + task.duration;
            default:
              return succTimes.lateStart;
          }
        }));
      }
      
      const lateStart = lateFinish - task.duration;
      
      times.lateStart = lateStart;
      times.lateFinish = lateFinish;
    }
  }
  
  /**
   * 计算松弛时间
   */
  private calculateSlack(): void {
    this.taskTimes.forEach((times, taskId) => {
      times.slack = times.lateStart - times.earlyStart;
    });
  }
  
  /**
   * 识别关键任务（松弛时间为0）
   */
  private identifyCriticalTasks(): Set<string> {
    const critical = new Set<string>();
    
    this.taskTimes.forEach((times, taskId) => {
      if (Math.abs(times.slack) < 0.01) { // 浮点数比较
        critical.add(taskId);
      }
    });
    
    return critical;
  }
  
  /**
   * 识别关键路径上的连接线
   */
  private identifyCriticalLinks(criticalTasks: Set<string>): Set<string> {
    const critical = new Set<string>();
    
    this.links.forEach(link => {
      if (criticalTasks.has(link.source) && criticalTasks.has(link.target)) {
        critical.add(link.id);
      }
    });
    
    return critical;
  }
  
  /**
   * 生成松弛时间分析报告
   */
  private generateSlackAnalysis() {
    const analysis: Array<{
      taskId: string;
      taskName: string;
      slack: number;
      isCritical: boolean;
    }> = [];
    
    this.taskTimes.forEach((times, taskId) => {
      const task = this.tasks.get(taskId);
      if (!task) return;
      
      analysis.push({
        taskId,
        taskName: task.text,
        slack: times.slack,
        isCritical: Math.abs(times.slack) < 0.01
      });
    });
    
    // 按松弛时间排序
    analysis.sort((a, b) => a.slack - b.slack);
    
    return analysis;
  }
  
  /**
   * 计算总工期
   */
  private calculateTotalDuration(): number {
    let maxDuration = 0;
    
    this.taskTimes.forEach(times => {
      maxDuration = Math.max(maxDuration, times.earlyFinish);
    });
    
    return maxDuration;
  }
}

/**
 * 应用关键路径标记到甘特图
 */
export function applyCriticalPathToGantt(gantt: any, result: CriticalPathResult): void {
  if (!gantt) return;
  
  // 标记关键任务
  result.criticalTasks.forEach(taskId => {
    try {
      const task = gantt.getTask(taskId);
      if (task) {
        task.isCritical = true;
      }
    } catch (e) {
      // 任务不存在
    }
  });
  
  // 刷新视图
  gantt.render();
}
