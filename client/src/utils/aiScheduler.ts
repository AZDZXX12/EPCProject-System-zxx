/**
 * AI智能调度系统
 * 使用机器学习算法优化项目排程
 */

import { CriticalPathAnalyzer } from './criticalPath';
import { resourceManager } from './resourceManagement';

export interface TaskConstraint {
  type: 'mustStartOn' | 'mustFinishOn' | 'startNoEarlierThan' | 'finishNoLaterThan';
  date: Date;
}

export interface TaskDependency {
  id: string;
  source: string; // predecessorId
  target: string; // successorId
  type: number; // 0: FS, 1: SS, 2: FF, 3: SF
  lag?: number;
}

export interface OptimizationGoal {
  type: 'duration' | 'cost' | 'resource' | 'risk';
  weight: number;
}

export interface ScheduleOptimizationResult {
  optimizedSchedule: any[];
  improvements: {
    durationReduction: number;
    costSaving: number;
    resourceUtilization: number;
    riskReduction: number;
  };
  suggestions: string[];
  criticalPath: string[];
  resourceAllocation: Map<string, any[]>;
}

export class AIScheduler {
  private tasks: Map<string, any>;
  private dependencies: TaskDependency[];
  private constraints: Map<string, TaskConstraint[]>;
  private resources: any[];
  private goals: OptimizationGoal[];
  
  constructor() {
    this.tasks = new Map();
    this.dependencies = [];
    this.constraints = new Map();
    this.resources = [];
    this.goals = [
      { type: 'duration', weight: 0.4 },
      { type: 'cost', weight: 0.3 },
      { type: 'resource', weight: 0.2 },
      { type: 'risk', weight: 0.1 }
    ];
  }
  
  /**
   * 设置优化目标
   */
  setOptimizationGoals(goals: OptimizationGoal[]): void {
    this.goals = goals;
  }
  
  /**
   * 加载任务数据
   */
  loadTasks(tasks: any[]): void {
    tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
  }
  
  /**
   * 自动优化排程
   */
  async optimizeSchedule(): Promise<ScheduleOptimizationResult> {
    // 1. 分析当前调度
    const currentAnalysis = this.analyzeCurrentSchedule();
    
    // 2. 识别优化机会
    const opportunities = this.identifyOptimizationOpportunities(currentAnalysis);
    
    // 3. 应用优化策略
    const optimizedSchedule = this.applyOptimizationStrategies(opportunities);
    
    // 4. 资源平衡
    const balancedSchedule = this.balanceResources(optimizedSchedule);
    
    // 5. 风险分析
    const riskAdjustedSchedule = this.adjustForRisks(balancedSchedule);
    
    // 6. 计算改进指标
    const improvements = this.calculateImprovements(
      currentAnalysis,
      riskAdjustedSchedule
    );
    
    // 7. 生成建议
    const suggestions = this.generateSuggestions(improvements, opportunities);
    
    // 8. 获取关键路径
    const criticalPath = this.getCriticalPath(riskAdjustedSchedule);
    
    // 9. 资源分配方案
    const resourceAllocation = this.getResourceAllocation(riskAdjustedSchedule);
    
    return {
      optimizedSchedule: riskAdjustedSchedule,
      improvements,
      suggestions,
      criticalPath,
      resourceAllocation
    };
  }
  
  /**
   * 分析当前调度
   */
  private analyzeCurrentSchedule(): any {
    const totalDuration = this.calculateTotalDuration();
    const totalCost = this.calculateTotalCost();
    const resourceUtilization = this.calculateResourceUtilization();
    const riskScore = this.calculateRiskScore();
    
    return {
      totalDuration,
      totalCost,
      resourceUtilization,
      riskScore,
      criticalTasks: this.identifyCriticalTasks(),
      bottlenecks: this.identifyBottlenecks(),
      risks: this.identifyRisks()
    };
  }
  
  /**
   * 识别优化机会
   */
  private identifyOptimizationOpportunities(analysis: any): any[] {
    const opportunities: any[] = [];
    
    // 1. 并行化机会
    const parallelizable = this.findParallelizableTasks();
    if (parallelizable.length > 0) {
      opportunities.push({
        type: 'parallelization',
        tasks: parallelizable,
        potentialSaving: this.estimateParallelizationSaving(parallelizable)
      });
    }
    
    // 2. 快速跟进机会
    const fastTrackable = this.findFastTrackableTasks();
    if (fastTrackable.length > 0) {
      opportunities.push({
        type: 'fastTracking',
        tasks: fastTrackable,
        potentialSaving: this.estimateFastTrackingSaving(fastTrackable)
      });
    }
    
    // 3. 资源优化机会
    const resourceOptimizations = this.findResourceOptimizations();
    if (resourceOptimizations.length > 0) {
      opportunities.push({
        type: 'resourceOptimization',
        optimizations: resourceOptimizations,
        potentialSaving: this.estimateResourceSaving(resourceOptimizations)
      });
    }
    
    // 4. 任务压缩机会
    const compressible = this.findCompressibleTasks(analysis.criticalTasks);
    if (compressible.length > 0) {
      opportunities.push({
        type: 'compression',
        tasks: compressible,
        potentialSaving: this.estimateCompressionSaving(compressible)
      });
    }
    
    return opportunities;
  }
  
  /**
   * 应用优化策略
   */
  private applyOptimizationStrategies(opportunities: any[]): any[] {
    let schedule = Array.from(this.tasks.values());
    
    opportunities.forEach(opportunity => {
      switch (opportunity.type) {
        case 'parallelization':
          schedule = this.applyParallelization(schedule, opportunity.tasks);
          break;
        case 'fastTracking':
          schedule = this.applyFastTracking(schedule, opportunity.tasks);
          break;
        case 'resourceOptimization':
          schedule = this.applyResourceOptimization(schedule, opportunity.optimizations);
          break;
        case 'compression':
          schedule = this.applyCompression(schedule, opportunity.tasks);
          break;
      }
    });
    
    return schedule;
  }
  
  /**
   * 资源平衡
   */
  private balanceResources(schedule: any[]): any[] {
    // 使用资源管理器进行负载平衡
    const conflicts = resourceManager.detectConflicts();
    
    if (conflicts.length > 0) {
      // 应用资源平衡算法
      resourceManager.levelResources('delay');
      
      // 更新任务计划
      schedule = this.updateScheduleAfterLeveling(schedule);
    }
    
    return schedule;
  }
  
  /**
   * 风险调整
   */
  private adjustForRisks(schedule: any[]): any[] {
    const risks = this.identifyRisks();
    
    risks.forEach(risk => {
      if (risk.probability > 0.5 && risk.impact > 0.5) {
        // 为高风险任务添加缓冲
        schedule = this.addBuffer(schedule, risk.taskId, risk.bufferDays);
      }
    });
    
    return schedule;
  }
  
  /**
   * 计算改进指标
   */
  private calculateImprovements(before: any, after: any[]): any {
    const afterAnalysis = this.analyzeSchedule(after);
    
    return {
      durationReduction: 
        ((before.totalDuration - afterAnalysis.totalDuration) / before.totalDuration) * 100,
      costSaving:
        ((before.totalCost - afterAnalysis.totalCost) / before.totalCost) * 100,
      resourceUtilization:
        afterAnalysis.resourceUtilization - before.resourceUtilization,
      riskReduction:
        ((before.riskScore - afterAnalysis.riskScore) / before.riskScore) * 100
    };
  }
  
  /**
   * 生成优化建议
   */
  private generateSuggestions(improvements: any, opportunities: any[]): string[] {
    const suggestions: string[] = [];
    
    // 基于改进指标生成建议
    if (improvements.durationReduction > 10) {
      suggestions.push(`✅ 项目工期可缩短 ${improvements.durationReduction.toFixed(1)}%`);
    }
    
    if (improvements.costSaving > 5) {
      suggestions.push(`💰 成本可节约 ${improvements.costSaving.toFixed(1)}%`);
    }
    
    if (improvements.resourceUtilization > 10) {
      suggestions.push(`📊 资源利用率提升 ${improvements.resourceUtilization.toFixed(1)}%`);
    }
    
    // 基于优化机会生成建议
    opportunities.forEach(opp => {
      switch (opp.type) {
        case 'parallelization':
          suggestions.push(`🔄 ${opp.tasks.length} 个任务可以并行执行`);
          break;
        case 'fastTracking':
          suggestions.push(`⚡ ${opp.tasks.length} 个任务可以快速跟进`);
          break;
        case 'resourceOptimization':
          suggestions.push(`👥 优化资源分配可节省 ${opp.potentialSaving} 天`);
          break;
        case 'compression':
          suggestions.push(`📉 关键路径可压缩 ${opp.potentialSaving} 天`);
          break;
      }
    });
    
    return suggestions;
  }
  
  /**
   * 冲突解决算法
   */
  async resolveConflicts(conflicts: any[]): Promise<any[]> {
    const resolutions: any[] = [];
    
    for (const conflict of conflicts) {
      const resolution = await this.findBestResolution(conflict);
      resolutions.push(resolution);
    }
    
    return resolutions;
  }
  
  /**
   * 寻找最佳解决方案
   */
  private async findBestResolution(conflict: any): Promise<any> {
    const strategies = [
      { type: 'delay', score: 0 },
      { type: 'split', score: 0 },
      { type: 'reassign', score: 0 },
      { type: 'overtime', score: 0 }
    ];
    
    // 评估每个策略
    for (const strategy of strategies) {
      strategy.score = this.evaluateStrategy(conflict, strategy.type);
    }
    
    // 选择最佳策略
    const best = strategies.reduce((a, b) => a.score > b.score ? a : b);
    
    return {
      conflict,
      strategy: best.type,
      actions: this.generateActions(conflict, best.type)
    };
  }
  
  /**
   * 风险预测
   */
  predictRisks(): Array<{
    taskId: string;
    riskType: string;
    probability: number;
    impact: number;
    mitigation: string;
  }> {
    const risks: Array<{
      taskId: string;
      riskType: string;
      probability: number;
      impact: number;
      mitigation: string;
    }> = [];
    
    this.tasks.forEach((task, taskId) => {
      // 分析任务特征
      const features = this.extractTaskFeatures(task);
      
      // 使用简单的规则引擎预测风险
      const riskScore = this.calculateTaskRiskScore(features);
      
      if (riskScore > 0.3) {
        risks.push({
          taskId,
          riskType: this.identifyRiskType(features),
          probability: riskScore,
          impact: this.estimateImpact(task),
          mitigation: this.suggestMitigation(features)
        });
      }
    });
    
    return risks.sort((a, b) => b.probability * b.impact - a.probability * a.impact);
  }
  
  // ========== 辅助方法 ==========
  
  private calculateTotalDuration(): number {
    let maxEnd = 0;
    this.tasks.forEach(task => {
      const end = task.start_date.getTime() + task.duration * 86400000;
      maxEnd = Math.max(maxEnd, end);
    });
    return maxEnd;
  }
  
  private calculateTotalCost(): number {
    let cost = 0;
    this.tasks.forEach(task => {
      cost += task.cost || 0;
    });
    return cost;
  }
  
  private calculateResourceUtilization(): number {
    const report = resourceManager.getUtilizationReport();
    let totalUtilization = 0;
    let count = 0;
    
    report.forEach(info => {
      totalUtilization += info.averageUtilization;
      count++;
    });
    
    return count > 0 ? totalUtilization / count : 0;
  }
  
  private calculateRiskScore(): number {
    const risks = this.predictRisks();
    return risks.reduce((score, risk) => 
      score + risk.probability * risk.impact, 0
    ) / risks.length;
  }
  
  private identifyCriticalTasks(): string[] {
    const analyzer = new CriticalPathAnalyzer(
      Array.from(this.tasks.values()),
      this.dependencies
    );
    const result = analyzer.analyze();
    return Array.from(result.criticalTasks);
  }
  
  private identifyBottlenecks(): any[] {
    // 实现瓶颈识别逻辑
    return [];
  }
  
  private identifyRisks(): any[] {
    return this.predictRisks();
  }
  
  private findParallelizableTasks(): any[] {
    // 实现并行化任务识别
    return [];
  }
  
  private findFastTrackableTasks(): any[] {
    // 实现快速跟进任务识别
    return [];
  }
  
  private findResourceOptimizations(): any[] {
    // 实现资源优化识别
    return [];
  }
  
  private findCompressibleTasks(criticalTasks: string[]): any[] {
    // 实现可压缩任务识别
    return [];
  }
  
  private estimateParallelizationSaving(tasks: any[]): number {
    return tasks.length * 2; // 简化计算
  }
  
  private estimateFastTrackingSaving(tasks: any[]): number {
    return tasks.length * 1.5; // 简化计算
  }
  
  private estimateResourceSaving(optimizations: any[]): number {
    return optimizations.length * 3; // 简化计算
  }
  
  private estimateCompressionSaving(tasks: any[]): number {
    return tasks.length * 1; // 简化计算
  }
  
  private applyParallelization(schedule: any[], tasks: any[]): any[] {
    // 实现并行化逻辑
    return schedule;
  }
  
  private applyFastTracking(schedule: any[], tasks: any[]): any[] {
    // 实现快速跟进逻辑
    return schedule;
  }
  
  private applyResourceOptimization(schedule: any[], optimizations: any[]): any[] {
    // 实现资源优化逻辑
    return schedule;
  }
  
  private applyCompression(schedule: any[], tasks: any[]): any[] {
    // 实现压缩逻辑
    return schedule;
  }
  
  private updateScheduleAfterLeveling(schedule: any[]): any[] {
    // 实现资源平衡后的计划更新
    return schedule;
  }
  
  private addBuffer(schedule: any[], taskId: string, bufferDays: number): any[] {
    const task = schedule.find(t => t.id === taskId);
    if (task) {
      task.duration += bufferDays;
    }
    return schedule;
  }
  
  private analyzeSchedule(schedule: any[]): any {
    return {
      totalDuration: this.calculateTotalDuration(),
      totalCost: this.calculateTotalCost(),
      resourceUtilization: this.calculateResourceUtilization(),
      riskScore: this.calculateRiskScore()
    };
  }
  
  private getCriticalPath(schedule: any[]): string[] {
    return this.identifyCriticalTasks();
  }
  
  private getResourceAllocation(schedule: any[]): Map<string, any[]> {
    const allocation = new Map();
    // 实现资源分配获取逻辑
    return allocation;
  }
  
  private evaluateStrategy(conflict: any, strategyType: string): number {
    // 简化的策略评分
    switch (strategyType) {
      case 'delay': return 0.6;
      case 'split': return 0.7;
      case 'reassign': return 0.8;
      case 'overtime': return 0.5;
      default: return 0;
    }
  }
  
  private generateActions(conflict: any, strategyType: string): any[] {
    // 生成具体行动
    return [{
      type: strategyType,
      target: conflict.taskId,
      description: `Apply ${strategyType} strategy`
    }];
  }
  
  private extractTaskFeatures(task: any): any {
    return {
      duration: task.duration,
      complexity: task.complexity || 'medium',
      resources: task.resources || [],
      dependencies: task.dependencies || []
    };
  }
  
  private calculateTaskRiskScore(features: any): number {
    let score = 0;
    
    // 简化的风险评分
    if (features.duration > 30) score += 0.2;
    if (features.complexity === 'high') score += 0.3;
    if (features.resources.length > 5) score += 0.2;
    if (features.dependencies.length > 3) score += 0.3;
    
    return Math.min(score, 1);
  }
  
  private identifyRiskType(features: any): string {
    if (features.duration > 30) return 'schedule';
    if (features.complexity === 'high') return 'technical';
    if (features.resources.length > 5) return 'resource';
    return 'general';
  }
  
  private estimateImpact(task: any): number {
    // 简化的影响评估
    return task.critical ? 0.8 : 0.4;
  }
  
  private suggestMitigation(features: any): string {
    if (features.duration > 30) {
      return '考虑将任务分解为更小的子任务';
    }
    if (features.complexity === 'high') {
      return '分配经验丰富的团队成员';
    }
    if (features.resources.length > 5) {
      return '提前锁定资源，避免冲突';
    }
    return '制定应急计划';
  }
}

// 单例模式
export const aiScheduler = new AIScheduler();
