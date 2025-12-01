/**
 * AI智能助手服务
 * 提供自然语言处理、智能预测、风险识别等AI功能
 */

import { apiService } from './api';
import { logger } from '../utils/EnhancedLogger';

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  suggestedAssignee?: string;
  dependencies?: string[];
  confidence: number;
}

export interface AIRiskAssessment {
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskType: string;
  description: string;
  mitigation: string;
  probability: number;
  impact: number;
}

export interface AIProgressPrediction {
  predictedCompletionDate: Date;
  confidenceLevel: number;
  bottlenecks: string[];
  recommendations: string[];
}

export interface AIResourceOptimization {
  currentUtilization: number;
  optimalAllocation: Map<string, string[]>;
  costSavings: number;
  efficiencyGain: number;
}

class AIAssistantService {
  private context: Map<string, any> = new Map();
  private learningData: any[] = [];

  /**
   * 自然语言解析任务
   */
  async parseNaturalLanguageTask(input: string): Promise<AITaskSuggestion> {
    // 本地NLP处理
    const keywords = this.extractKeywords(input);
    const priority = this.detectPriority(input);
    const duration = this.estimateDuration(keywords);
    
    // 智能任务建议
    const suggestion: AITaskSuggestion = {
      title: this.generateTitle(keywords),
      description: this.enhanceDescription(input),
      priority,
      estimatedDuration: duration,
      suggestedAssignee: this.suggestAssignee(keywords),
      dependencies: this.identifyDependencies(keywords),
      confidence: this.calculateConfidence(keywords, input)
    };

    // 如果后端可用，获取更精确的建议
    try {
      const enhancedSuggestion = await apiService.post<any>('/api/v1/ai/parse-task', {
        input,
        context: Object.fromEntries(this.context)
      });
      return { ...suggestion, ...(enhancedSuggestion || {}) };
    } catch {
      return suggestion;
    }
  }

  /**
   * 智能进度预测
   */
  async predictProjectProgress(projectId: string): Promise<AIProgressPrediction> {
    try {
      // 获取项目数据
      const [project, tasks, history] = await Promise.all([
        apiService.get<any>(`/api/v1/projects/${projectId}`),
        apiService.get<any[]>(`/api/v1/tasks?project_id=${projectId}`),
        this.getProjectHistory(projectId)
      ]);

      // 分析进度模式
      const velocityTrend = this.analyzeVelocity(history);
      const criticalPath = this.findCriticalPath(tasks as any[]);
      const riskFactors = this.assessRiskFactors(project, tasks as any[]);

      // 预测完成时间
      const prediction = this.calculatePrediction(
        project,
        tasks as any[],
        velocityTrend,
        criticalPath,
        riskFactors
      );

      return prediction;
    } catch (error) {
      // 降级到简单预测
      return this.simplePrediction(projectId);
    }
  }

  /**
   * 风险自动识别
   */
  async identifyRisks(projectId: string): Promise<AIRiskAssessment[]> {
    const risks: AIRiskAssessment[] = [];

    try {
      const [project, tasks, resources] = await Promise.all([
        apiService.get<any>(`/api/v1/projects/${projectId}`),
        apiService.get<any[]>(`/api/v1/tasks?project_id=${projectId}`),
        apiService.get<any[]>(`/api/v1/resources?project_id=${projectId}`)
      ]);

      // 进度风险
      const scheduleRisks = this.assessScheduleRisks(tasks as any[]);
      risks.push(...scheduleRisks);

      // 资源风险
      const resourceRisks = this.assessResourceRisks(resources as any[]);
      risks.push(...resourceRisks);

      // 依赖风险
      const dependencyRisks = this.assessDependencyRisks(tasks as any[]);
      risks.push(...dependencyRisks);

      // 成本风险
      const costRisks = this.assessCostRisks(project, tasks as any[]);
      risks.push(...costRisks);

      // 质量风险
      const qualityRisks = this.assessQualityRisks(project, tasks as any[]);
      risks.push(...qualityRisks);

    } catch (error) {
      logger.error('Risk assessment failed:', error);
      // 返回基础风险评估
      risks.push(this.getDefaultRiskAssessment());
    }

    return risks.sort((a, b) => {
      const scoreA = a.probability * a.impact;
      const scoreB = b.probability * b.impact;
      return scoreB - scoreA;
    });
  }

  /**
   * 资源优化建议
   */
  async optimizeResources(projectId: string): Promise<AIResourceOptimization> {
    try {
      const [tasks, resources, constraints] = await Promise.all([
        apiService.get<any[]>(`/api/v1/tasks?project_id=${projectId}`),
        apiService.get<any[]>(`/api/v1/resources?project_id=${projectId}`),
        this.getResourceConstraints(projectId)
      ]);

      // 分析当前资源利用率
      const currentUtilization = this.calculateUtilization(resources as any[], tasks as any[]);

      // 优化算法
      const optimalAllocation = this.runOptimizationAlgorithm(
        tasks as any[],
        resources as any[],
        constraints
      );

      // 计算优化收益
      const { costSavings, efficiencyGain } = this.calculateOptimizationBenefits(
        currentUtilization,
        optimalAllocation
      );

      return {
        currentUtilization,
        optimalAllocation,
        costSavings,
        efficiencyGain
      };
    } catch (error) {
      logger.error('Resource optimization failed:', error);
      return this.getDefaultOptimization();
    }
  }

  /**
   * 智能任务分配
   */
  async suggestTaskAssignment(taskId: string): Promise<string[]> {
    try {
      const [task, team, workload] = await Promise.all([
        apiService.get<any>(`/api/v1/tasks/${taskId}`),
        apiService.get<any[]>('/api/v1/team'),
        this.getTeamWorkload()
      ]);

      // 技能匹配
      const skillMatches = this.matchSkills(task, team as any[]);
      
      // 工作负载平衡
      const availableMembers = this.filterByWorkload(skillMatches, workload);
      
      // 历史表现
      const performanceScores = await this.getPerformanceScores(availableMembers, (task as any).type || 'default');
      
      // 综合排序
      return this.rankAssignees(availableMembers, performanceScores);
    } catch {
      return [];
    }
  }

  /**
   * 学习用户行为
   */
  learnFromUserAction(action: string, data: any): void {
    this.learningData.push({
      action,
      data,
      timestamp: new Date(),
      context: Object.fromEntries(this.context)
    });

    // 定期处理学习数据
    if (this.learningData.length >= 100) {
      this.processLearningData();
    }
  }

  /**
   * 获取智能建议
   */
  async getSmartSuggestions(context: string): Promise<string[]> {
    const suggestions: string[] = [];

    // 基于上下文的建议
    switch (context) {
      case 'task_creation':
        suggestions.push(...this.getTaskCreationSuggestions());
        break;
      case 'resource_planning':
        suggestions.push(...this.getResourcePlanningSuggestions());
        break;
      case 'risk_management':
        suggestions.push(...this.getRiskManagementSuggestions());
        break;
      case 'progress_tracking':
        suggestions.push(...this.getProgressTrackingSuggestions());
        break;
    }

    // 基于历史数据的个性化建议
    const personalizedSuggestions = this.getPersonalizedSuggestions(context);
    suggestions.push(...personalizedSuggestions);

    return suggestions;
  }

  // ========== 私有辅助方法 ==========

  private extractKeywords(input: string): string[] {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter(word => !stopWords.has(word) && word.length > 2);
  }

  private detectPriority(input: string): 'high' | 'medium' | 'low' {
    const highPriorityKeywords = ['urgent', 'critical', 'asap', 'immediately', '紧急', '重要'];
    const lowPriorityKeywords = ['low', 'minor', 'optional', 'nice-to-have', '次要', '可选'];
    
    const lowerInput = input.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => lowerInput.includes(keyword))) {
      return 'high';
    }
    if (lowPriorityKeywords.some(keyword => lowerInput.includes(keyword))) {
      return 'low';
    }
    return 'medium';
  }

  private estimateDuration(keywords: string[]): number {
    // 基于关键词估算工期（小时）
    const complexityKeywords = {
      simple: ['simple', 'quick', 'easy', 'minor', '简单', '快速'],
      medium: ['moderate', 'standard', 'normal', '标准', '常规'],
      complex: ['complex', 'difficult', 'major', 'comprehensive', '复杂', '困难']
    };

    for (const keyword of keywords) {
      if (complexityKeywords.simple.includes(keyword)) return 4;
      if (complexityKeywords.complex.includes(keyword)) return 40;
    }
    return 16; // 默认中等复杂度
  }

  private generateTitle(keywords: string[]): string {
    // 生成简洁的任务标题
    const importantWords = keywords.slice(0, 5);
    return importantWords
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private enhanceDescription(input: string): string {
    // 增强任务描述
    return input.trim() + '\n\n[AI Enhanced]';
  }

  private suggestAssignee(keywords: string[]): string | undefined {
    // 基于关键词建议负责人
    const skillMapping: Record<string, string[]> = {
      frontend: ['ui', 'react', 'css', 'design', '前端', '界面'],
      backend: ['api', 'database', 'server', 'python', '后端', '数据库'],
      devops: ['deploy', 'docker', 'ci', 'cd', '部署', '运维'],
      testing: ['test', 'qa', 'quality', 'bug', '测试', '质量']
    };

    for (const [role, roleKeywords] of Object.entries(skillMapping)) {
      if (keywords.some(keyword => roleKeywords.includes(keyword.toLowerCase()))) {
        return role;
      }
    }
    return undefined;
  }

  private identifyDependencies(keywords: string[]): string[] {
    // 识别可能的依赖
    const dependencies: string[] = [];
    const dependencyKeywords = ['after', 'requires', 'depends', 'needs', '依赖', '需要'];
    
    // 简化的依赖识别逻辑
    if (keywords.some(k => dependencyKeywords.includes(k))) {
      dependencies.push('Previous task completion');
    }
    
    return dependencies;
  }

  private calculateConfidence(keywords: string[], input: string): number {
    // 计算置信度
    const keywordCount = keywords.length;
    const inputLength = input.length;
    
    if (keywordCount < 3 || inputLength < 20) return 0.3;
    if (keywordCount < 5 || inputLength < 50) return 0.5;
    if (keywordCount < 10 || inputLength < 100) return 0.7;
    return 0.9;
  }

  private async getProjectHistory(projectId: string): Promise<any[]> {
    // 获取项目历史数据
    try {
      return await apiService.get(`/api/v1/projects/${projectId}/history`);
    } catch {
      return [];
    }
  }

  private analyzeVelocity(history: any[]): number {
    // 分析速度趋势
    if (history.length < 2) return 1.0;
    
    // 简化的速度分析
    return 0.8 + Math.random() * 0.4;
  }

  private findCriticalPath(tasks: any[]): string[] {
    // 查找关键路径
    return tasks
      .filter(t => t.priority === 'high')
      .map(t => t.id);
  }

  private assessRiskFactors(project: any, tasks: any[]): number {
    // 评估风险因素
    let riskScore = 0;
    
    // 延期任务
    const delayedTasks = tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'completed');
    riskScore += delayedTasks.length * 0.1;
    
    // 高优先级未完成任务
    const highPriorityPending = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
    riskScore += highPriorityPending.length * 0.15;
    
    return Math.min(riskScore, 1.0);
  }

  private calculatePrediction(
    project: any,
    tasks: any[],
    velocity: number,
    criticalPath: string[],
    riskFactor: number
  ): AIProgressPrediction {
    const remainingTasks = tasks.filter(t => t.status !== 'completed');
    const avgCompletionTime = 7; // 平均7天完成一个任务
    
    const baseDays = remainingTasks.length * avgCompletionTime;
    const adjustedDays = baseDays / velocity * (1 + riskFactor);
    
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + adjustedDays);
    
    return {
      predictedCompletionDate: predictedDate,
      confidenceLevel: 0.75 - riskFactor * 0.3,
      bottlenecks: this.identifyBottlenecks(tasks, criticalPath),
      recommendations: this.generateRecommendations(project, tasks, riskFactor)
    };
  }

  private simplePrediction(projectId: string): AIProgressPrediction {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    
    return {
      predictedCompletionDate: futureDate,
      confidenceLevel: 0.5,
      bottlenecks: ['Unable to analyze'],
      recommendations: ['Ensure regular progress updates']
    };
  }

  private assessScheduleRisks(tasks: any[]): AIRiskAssessment[] {
    const risks: AIRiskAssessment[] = [];
    
    // 检查延期任务
    const delayedTasks = tasks.filter(t => 
      new Date(t.due_date) < new Date() && t.status !== 'completed'
    );
    
    if (delayedTasks.length > 0) {
      risks.push({
        riskLevel: delayedTasks.length > 5 ? 'high' : 'medium',
        riskType: 'Schedule Delay',
        description: `${delayedTasks.length} tasks are behind schedule`,
        mitigation: 'Reallocate resources or adjust timeline',
        probability: 0.8,
        impact: 0.7
      });
    }
    
    return risks;
  }

  private assessResourceRisks(resources: any[]): AIRiskAssessment[] {
    const risks: AIRiskAssessment[] = [];
    
    // 检查资源过载
    const overloadedResources = resources.filter(r => r.utilization > 100);
    
    if (overloadedResources.length > 0) {
      risks.push({
        riskLevel: 'high',
        riskType: 'Resource Overload',
        description: `${overloadedResources.length} resources are over-allocated`,
        mitigation: 'Balance workload or hire additional resources',
        probability: 0.9,
        impact: 0.8
      });
    }
    
    return risks;
  }

  private assessDependencyRisks(tasks: any[]): AIRiskAssessment[] {
    const risks: AIRiskAssessment[] = [];
    
    // 检查复杂依赖链
    const tasksWithManyDeps = tasks.filter(t => 
      t.dependencies && t.dependencies.length > 3
    );
    
    if (tasksWithManyDeps.length > 0) {
      risks.push({
        riskLevel: 'medium',
        riskType: 'Complex Dependencies',
        description: 'Multiple tasks have complex dependency chains',
        mitigation: 'Simplify dependencies or run tasks in parallel where possible',
        probability: 0.6,
        impact: 0.5
      });
    }
    
    return risks;
  }

  private assessCostRisks(project: any, tasks: any[]): AIRiskAssessment[] {
    const risks: AIRiskAssessment[] = [];
    
    // 简化的成本风险评估
    if (project.budget && project.spent > project.budget * 0.8) {
      risks.push({
        riskLevel: 'high',
        riskType: 'Budget Overrun',
        description: 'Project spending approaching budget limit',
        mitigation: 'Review and optimize resource allocation',
        probability: 0.7,
        impact: 0.9
      });
    }
    
    return risks;
  }

  private assessQualityRisks(project: any, tasks: any[]): AIRiskAssessment[] {
    const risks: AIRiskAssessment[] = [];
    
    // 检查未测试的任务
    const untestedTasks = tasks.filter(t => 
      t.status === 'completed' && !t.tested
    );
    
    if (untestedTasks.length > 0) {
      risks.push({
        riskLevel: 'medium',
        riskType: 'Quality Assurance',
        description: `${untestedTasks.length} completed tasks not tested`,
        mitigation: 'Implement testing procedures',
        probability: 0.5,
        impact: 0.6
      });
    }
    
    return risks;
  }

  private getDefaultRiskAssessment(): AIRiskAssessment {
    return {
      riskLevel: 'low',
      riskType: 'General',
      description: 'Unable to perform detailed risk assessment',
      mitigation: 'Monitor project closely',
      probability: 0.3,
      impact: 0.3
    };
  }

  private async getResourceConstraints(projectId: string): Promise<any> {
    try {
      return await apiService.get(`/api/v1/projects/${projectId}/constraints`);
    } catch {
      return { maxResources: 10, maxBudget: 1000000 };
    }
  }

  private calculateUtilization(resources: any[], tasks: any[]): number {
    if (resources.length === 0) return 0;
    
    const totalCapacity = resources.reduce((sum, r) => sum + (r.capacity || 40), 0);
    const totalAllocated = tasks.reduce((sum, t) => sum + (t.effort || 8), 0);
    
    return (totalAllocated / totalCapacity) * 100;
  }

  private runOptimizationAlgorithm(
    tasks: any[],
    resources: any[],
    constraints: any
  ): Map<string, string[]> {
    const allocation = new Map<string, string[]>();
    
    // 简化的资源分配算法
    resources.forEach(resource => {
      const assignedTasks = tasks
        .filter(t => t.assignee === resource.id)
        .map(t => t.id);
      allocation.set(resource.id, assignedTasks);
    });
    
    return allocation;
  }

  private calculateOptimizationBenefits(
    currentUtilization: number,
    optimalAllocation: Map<string, string[]>
  ): { costSavings: number; efficiencyGain: number } {
    // 简化的收益计算
    const baselineCost = 100000;
    const utilizationImprovement = Math.min(100 - currentUtilization, 20);
    
    return {
      costSavings: baselineCost * (utilizationImprovement / 100),
      efficiencyGain: utilizationImprovement
    };
  }

  private getDefaultOptimization(): AIResourceOptimization {
    return {
      currentUtilization: 70,
      optimalAllocation: new Map(),
      costSavings: 0,
      efficiencyGain: 0
    };
  }

  private async getTeamWorkload(): Promise<Map<string, number>> {
    const workload = new Map<string, number>();
    
    try {
      const data = await apiService.get<Record<string, number>>('/api/v1/team/workload');
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([member, load]) => {
          workload.set(member, load as number);
        });
      }
    } catch {
      // 默认工作负载
    }
    
    return workload;
  }

  private matchSkills(task: any, team: any[]): string[] {
    // 技能匹配逻辑
    return team
      .filter(member => {
        const requiredSkills = task.required_skills || [];
        const memberSkills = member.skills || [];
        return requiredSkills.some((skill: string) => memberSkills.includes(skill));
      })
      .map(member => member.id);
  }

  private filterByWorkload(members: string[], workload: Map<string, number>): string[] {
    return members.filter(member => {
      const load = workload.get(member) || 0;
      return load < 80; // 80%以下负载
    });
  }

  private async getPerformanceScores(members: string[], taskType: string): Promise<Map<string, number>> {
    const scores = new Map<string, number>();
    
    // 模拟性能评分
    members.forEach(member => {
      scores.set(member, 0.5 + Math.random() * 0.5);
    });
    
    return scores;
  }

  private rankAssignees(members: string[], scores: Map<string, number>): string[] {
    return members.sort((a, b) => {
      const scoreA = scores.get(a) || 0;
      const scoreB = scores.get(b) || 0;
      return scoreB - scoreA;
    });
  }

  private processLearningData(): void {
    // 处理学习数据
    console.log('Processing learning data:', this.learningData.length, 'entries');
    
    // 这里可以实现更复杂的机器学习逻辑
    // 例如：模式识别、用户偏好学习等
    
    // 清理旧数据
    this.learningData = this.learningData.slice(-50);
  }

  private getTaskCreationSuggestions(): string[] {
    return [
      'Break down large tasks into smaller subtasks',
      'Set clear deadlines and milestones',
      'Assign tasks based on team member expertise',
      'Consider task dependencies'
    ];
  }

  private getResourcePlanningSuggestions(): string[] {
    return [
      'Balance workload across team members',
      'Reserve buffer time for unexpected issues',
      'Consider resource availability calendars',
      'Plan for skill development needs'
    ];
  }

  private getRiskManagementSuggestions(): string[] {
    return [
      'Identify risks early in the project',
      'Create contingency plans',
      'Regular risk assessment reviews',
      'Document lessons learned'
    ];
  }

  private getProgressTrackingSuggestions(): string[] {
    return [
      'Update task status daily',
      'Use burndown charts for sprint tracking',
      'Regular team stand-ups',
      'Track actual vs estimated time'
    ];
  }

  private getPersonalizedSuggestions(context: string): string[] {
    // 基于用户历史行为的个性化建议
    const suggestions: string[] = [];
    
    // 分析学习数据
    const recentActions = this.learningData.slice(-10);
    const patterns = this.identifyPatterns(recentActions);
    
    // 生成个性化建议
    if (patterns.frequentDelays) {
      suggestions.push('Consider adding buffer time to estimates');
    }
    if (patterns.resourceConflicts) {
      suggestions.push('Review resource allocation for conflicts');
    }
    
    return suggestions;
  }

  private identifyPatterns(actions: any[]): any {
    return {
      frequentDelays: actions.filter(a => a.action === 'delay_task').length > 2,
      resourceConflicts: actions.filter(a => a.action === 'resource_conflict').length > 1
    };
  }

  private identifyBottlenecks(tasks: any[], criticalPath: string[]): string[] {
    const bottlenecks: string[] = [];
    
    // 识别瓶颈
    const blockedTasks = tasks.filter(t => 
      t.status === 'blocked' || 
      (t.dependencies && t.dependencies.length > 2)
    );
    
    blockedTasks.forEach(task => {
      bottlenecks.push(`Task ${task.name} is blocking progress`);
    });
    
    return bottlenecks;
  }

  private generateRecommendations(project: any, tasks: any[], riskFactor: number): string[] {
    const recommendations: string[] = [];
    
    if (riskFactor > 0.5) {
      recommendations.push('High risk detected - consider mitigation strategies');
    }
    
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    if (incompleteTasks.length > 20) {
      recommendations.push('Large number of pending tasks - prioritize critical items');
    }
    
    const overdueTasks = tasks.filter(t => 
      new Date(t.due_date) < new Date() && t.status !== 'completed'
    );
    if (overdueTasks.length > 0) {
      recommendations.push(`${overdueTasks.length} overdue tasks need immediate attention`);
    }
    
    return recommendations;
  }
}

// 导出单例
export const aiAssistant = new AIAssistantService();

// 导出类型
export type { AIAssistantService };
