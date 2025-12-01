/**
 * 浮动时间分析器 - Ganttable 高级分析功能
 * Float Time Analysis (松弛时间分析)
 * 
 * 核心概念：
 * 浮动时间是指在不影响项目总工期的前提下，
 * 任务可以延迟或提前的时间范围
 */

export interface FloatTimeResult {
  taskId: string;
  taskName: string;
  totalFloat: number;      // 总浮动时间
  freeFloat: number;        // 自由浮动时间
  earliestStart: Date;      // 最早开始时间
  latestStart: Date;        // 最晚开始时间
  earliestFinish: Date;     // 最早完成时间
  latestFinish: Date;       // 最晚完成时间
  isCritical: boolean;      // 是否在关键路径上
  flexibility: 'high' | 'medium' | 'low' | 'none'; // 灵活度
}

export class FloatTimeAnalyzer {
  private gantt: any;

  constructor(gantt: any) {
    this.gantt = gantt;
  }

  /**
   * 分析所有任务的浮动时间
   */
  analyze(): FloatTimeResult[] {
    const tasks = this.gantt.getTaskByTime();
    const results: FloatTimeResult[] = [];

    tasks.forEach((task: any) => {
      const result = this.analyzeTask(task);
      results.push(result);
    });

    return results.sort((a, b) => a.totalFloat - b.totalFloat);
  }

  /**
   * 分析单个任务的浮动时间
   */
  private analyzeTask(task: any): FloatTimeResult {
    // 获取任务的最早/最晚时间
    const es = new Date(task.start_date);
    const ef = new Date(task.end_date);
    
    // 计算最晚开始和最晚完成时间
    const { latestStart, latestFinish } = this.calculateLatestTimes(task);
    
    // 计算总浮动时间（天）
    const totalFloat = this.daysBetween(es, latestStart);
    
    // 计算自由浮动时间
    const freeFloat = this.calculateFreeFloat(task);
    
    // 判断是否在关键路径上
    const isCritical = totalFloat === 0;
    
    // 判断灵活度
    let flexibility: 'high' | 'medium' | 'low' | 'none';
    if (totalFloat === 0) flexibility = 'none';
    else if (totalFloat < 3) flexibility = 'low';
    else if (totalFloat < 7) flexibility = 'medium';
    else flexibility = 'high';

    return {
      taskId: task.id,
      taskName: task.text,
      totalFloat,
      freeFloat,
      earliestStart: es,
      latestStart,
      earliestFinish: ef,
      latestFinish,
      isCritical,
      flexibility
    };
  }

  /**
   * 计算最晚开始和最晚完成时间
   */
  private calculateLatestTimes(task: any): { latestStart: Date; latestFinish: Date } {
    // 获取所有后续任务
    const successors = this.getSuccessors(task.id);
    
    if (successors.length === 0) {
      // 如果没有后续任务，最晚时间等于最早时间
      return {
        latestStart: new Date(task.start_date),
        latestFinish: new Date(task.end_date)
      };
    }

    // 找到后续任务中最早的最晚开始时间
    let minLatestStart = new Date(8640000000000000); // 最大日期
    
    successors.forEach(successor => {
      const successorTask = this.gantt.getTask(successor);
      const successorLs = new Date(successorTask.start_date);
      
      if (successorLs < minLatestStart) {
        minLatestStart = successorLs;
      }
    });

    // 最晚完成时间 = 后续任务最早开始时间
    const latestFinish = new Date(minLatestStart);
    
    // 最晚开始时间 = 最晚完成时间 - 持续时间
    const latestStart = new Date(latestFinish);
    latestStart.setDate(latestStart.getDate() - (task.duration || 1));

    return { latestStart, latestFinish };
  }

  /**
   * 计算自由浮动时间
   * 自由浮动时间 = 后续任务最早开始时间 - 本任务最早完成时间
   */
  private calculateFreeFloat(task: any): number {
    const successors = this.getSuccessors(task.id);
    
    if (successors.length === 0) {
      return 0;
    }

    const ef = new Date(task.end_date);
    let minSuccessorStart = new Date(8640000000000000);
    
    successors.forEach(successor => {
      const successorTask = this.gantt.getTask(successor);
      const successorStart = new Date(successorTask.start_date);
      
      if (successorStart < minSuccessorStart) {
        minSuccessorStart = successorStart;
      }
    });

    return this.daysBetween(ef, minSuccessorStart);
  }

  /**
   * 获取任务的所有后续任务
   */
  private getSuccessors(taskId: string): string[] {
    const successors: string[] = [];
    const links = this.gantt.getLinks();
    
    links.forEach((link: any) => {
      if (link.source === taskId) {
        successors.push(link.target);
      }
    });
    
    return successors;
  }

  /**
   * 计算两个日期之间的天数
   */
  private daysBetween(date1: Date, date2: Date): number {
    const diff = date2.getTime() - date1.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

/**
 * 应用浮动时间分析到甘特图
 */
export function applyFloatTimeToGantt(gantt: any): FloatTimeResult[] {
  const analyzer = new FloatTimeAnalyzer(gantt);
  const results = analyzer.analyze();

  // 更新任务数据
  results.forEach(result => {
    const task = gantt.getTask(result.taskId);
    if (task) {
      task.totalFloat = result.totalFloat;
      task.freeFloat = result.freeFloat;
      task.flexibility = result.flexibility;
      gantt.updateTask(result.taskId);
    }
  });

  return results;
}

/**
 * 生成浮动时间分析报告
 */
export function generateFloatTimeReport(results: FloatTimeResult[]): string {
  const critical = results.filter(r => r.isCritical);
  const highFlex = results.filter(r => r.flexibility === 'high');
  const mediumFlex = results.filter(r => r.flexibility === 'medium');
  const lowFlex = results.filter(r => r.flexibility === 'low');

  return `
# 浮动时间分析报告

## 总体情况
- 总任务数: ${results.length}
- 关键任务: ${critical.length} (${((critical.length / results.length) * 100).toFixed(1)}%)
- 高灵活度: ${highFlex.length}
- 中灵活度: ${mediumFlex.length}
- 低灵活度: ${lowFlex.length}

## 关键任务（无浮动时间）
${critical.map(r => `- ${r.taskName}`).join('\n') || '无'}

## 调整建议
### 可优先调整的任务（高灵活度）
${highFlex.map(r => `- ${r.taskName} (浮动${r.totalFloat}天)`).join('\n') || '无'}

### 需谨慎调整的任务（低灵活度）
${lowFlex.map(r => `- ${r.taskName} (浮动${r.totalFloat}天)`).join('\n') || '无'}
  `.trim();
}
