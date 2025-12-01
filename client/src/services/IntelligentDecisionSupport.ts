/**
 * 智能决策支持系统
 * 基于数据分析和AI算法提供决策建议
 */

import { eventBus, EVENTS } from '../utils/EventBus';
import { useProjectStore } from '../store/projectStore';
import { supplierRecommendationService } from './SupplierRecommendationService';
import { procurementAutomation } from './ProcurementAutomation';
import { moduleDataBus } from './ModuleDataBus';

export interface DecisionContext {
  id: string;
  type: 'procurement' | 'risk' | 'schedule' | 'resource' | 'quality';
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  deadline?: string;
  relatedData: any;
  constraints: Constraint[];
  objectives: Objective[];
}

export interface Constraint {
  type: 'budget' | 'time' | 'resource' | 'quality' | 'regulatory';
  description: string;
  value: any;
  flexibility: 'fixed' | 'negotiable' | 'flexible';
}

export interface Objective {
  name: string;
  weight: number; // 0-1
  targetValue: any;
  currentValue: any;
  unit?: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  risks: RiskAssessment[];
  impact: ImpactAnalysis;
  confidence: number; // 0-100
  recommendationScore: number; // 0-100
  estimatedCost?: number;
  estimatedTime?: number;
  requiredResources?: string[];
}

export interface RiskAssessment {
  factor: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface ImpactAnalysis {
  cost: number; // -100 to 100 (negative = savings)
  time: number; // -100 to 100 (negative = time saved)
  quality: number; // -100 to 100
  risk: number; // -100 to 100 (negative = risk reduction)
}

export interface DecisionRecommendation {
  id: string;
  contextId: string;
  timestamp: string;
  options: DecisionOption[];
  recommendedOption: DecisionOption;
  reasoning: string;
  dataPoints: DataPoint[];
  similarCases: SimilarCase[];
  confidenceLevel: number;
}

export interface DataPoint {
  source: string;
  metric: string;
  value: any;
  trend: 'up' | 'down' | 'stable';
  significance: 'high' | 'medium' | 'low';
}

export interface SimilarCase {
  id: string;
  project: string;
  situation: string;
  decision: string;
  outcome: 'success' | 'partial' | 'failure';
  lessons: string[];
  similarity: number; // 0-100
}

export interface PredictiveInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'pattern' | 'forecast';
  category: string;
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  recommendations: string[];
  visualData?: any;
}

/**
 * 智能决策支持服务
 */
export class IntelligentDecisionSupportService {
  private decisionHistory: Map<string, DecisionRecommendation> = new Map();
  private caseDatabase: SimilarCase[] = [];
  private insights: PredictiveInsight[] = [];
  private learningData: Map<string, any> = new Map();

  constructor() {
    this.initializeCaseDatabase();
    this.setupAnalytics();
    this.startPredictiveAnalysis();
  }

  /**
   * 初始化案例数据库
   */
  private initializeCaseDatabase() {
    this.caseDatabase = [
      {
        id: 'case-001',
        project: '风电场A项目',
        situation: '钢材价格上涨20%',
        decision: '提前批量采购，锁定价格',
        outcome: 'success',
        lessons: ['价格趋势预测准确', '供应商合作良好', '节省成本15%'],
        similarity: 0,
      },
      {
        id: 'case-002',
        project: '风电场B项目',
        situation: '施工延期风险',
        decision: '增加施工队伍，加班赶工',
        outcome: 'partial',
        lessons: ['成本增加10%', '按时完成', '质量需要额外检查'],
        similarity: 0,
      },
      {
        id: 'case-003',
        project: '风电场C项目',
        situation: '供应商交付延迟',
        decision: '启用备选供应商',
        outcome: 'success',
        lessons: ['多供应商策略有效', '成本略有增加', '确保项目进度'],
        similarity: 0,
      },
    ];
  }

  /**
   * 设置分析系统
   */
  private setupAnalytics() {
    // 监听各种事件进行学习
    eventBus.on(EVENTS.PRICE_ALERT_TRIGGERED, (data) => {
      this.learnFromPriceEvent(data);
    });

    eventBus.on(EVENTS.RISK_IDENTIFIED, (data) => {
      this.learnFromRiskEvent(data);
    });

    eventBus.on(EVENTS.PHASE_COMPLETED, (data) => {
      this.learnFromPhaseCompletion(data);
    });
  }

  /**
   * 启动预测分析
   */
  private startPredictiveAnalysis() {
    // 定期执行预测分析
    setInterval(() => {
      this.performTrendAnalysis();
      this.detectAnomalies();
      this.generateForecasts();
    }, 60000); // 每分钟执行一次
  }

  /**
   * 请求决策支持
   */
  async requestDecisionSupport(context: DecisionContext): Promise<DecisionRecommendation> {
    // 生成决策选项
    const options = await this.generateDecisionOptions(context);

    // 评估每个选项
    const evaluatedOptions = options.map(option => 
      this.evaluateOption(option, context)
    );

    // 选择最佳选项
    const recommendedOption = this.selectBestOption(evaluatedOptions, context);

    // 查找相似案例
    const similarCases = this.findSimilarCases(context);

    // 收集相关数据点
    const dataPoints = this.collectRelevantDataPoints(context);

    // 生成推理说明
    const reasoning = this.generateReasoning(recommendedOption, context, similarCases);

    const recommendation: DecisionRecommendation = {
      id: this.generateId('REC'),
      contextId: context.id,
      timestamp: new Date().toISOString(),
      options: evaluatedOptions,
      recommendedOption,
      reasoning,
      dataPoints,
      similarCases,
      confidenceLevel: this.calculateConfidence(recommendedOption, similarCases),
    };

    this.decisionHistory.set(recommendation.id, recommendation);

    // 发送决策建议事件
    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
      type: 'info',
      message: '智能决策建议已生成',
      description: recommendedOption.title,
    });

    return recommendation;
  }

  /**
   * 生成决策选项
   */
  private async generateDecisionOptions(context: DecisionContext): Promise<DecisionOption[]> {
    const options: DecisionOption[] = [];

    switch (context.type) {
      case 'procurement':
        options.push(...this.generateProcurementOptions(context));
        break;
      case 'risk':
        options.push(...this.generateRiskOptions(context));
        break;
      case 'schedule':
        options.push(...this.generateScheduleOptions(context));
        break;
      case 'resource':
        options.push(...this.generateResourceOptions(context));
        break;
      case 'quality':
        options.push(...this.generateQualityOptions(context));
        break;
    }

    return options;
  }

  /**
   * 生成采购决策选项
   */
  private generateProcurementOptions(context: DecisionContext): DecisionOption[] {
    const options: DecisionOption[] = [];

    // 选项1: 立即采购
    options.push({
      id: 'opt-1',
      title: '立即批量采购',
      description: '立即下单采购所需材料，锁定当前价格',
      pros: ['锁定当前价格', '确保供应', '避免价格上涨风险'],
      cons: ['占用资金', '库存成本增加', '可能错过降价机会'],
      risks: [
        { factor: '资金占用', probability: 'high', impact: 'medium', mitigation: '申请专项资金' },
        { factor: '库存积压', probability: 'low', impact: 'low', mitigation: '分批交付' },
      ],
      impact: { cost: -20, time: 10, quality: 0, risk: -30 },
      confidence: 85,
      recommendationScore: 0,
      estimatedCost: context.relatedData?.estimatedCost || 100000,
      estimatedTime: 5,
    });

    // 选项2: 分批采购
    options.push({
      id: 'opt-2',
      title: '分批采购策略',
      description: '分3批采购，降低资金压力和库存风险',
      pros: ['资金压力小', '灵活调整', '降低库存风险'],
      cons: ['价格可能上涨', '管理复杂度增加', '可能供应不足'],
      risks: [
        { factor: '价格波动', probability: 'medium', impact: 'medium', mitigation: '签订价格协议' },
        { factor: '供应中断', probability: 'low', impact: 'high', mitigation: '多供应商备选' },
      ],
      impact: { cost: 0, time: 0, quality: 0, risk: 0 },
      confidence: 75,
      recommendationScore: 0,
      estimatedCost: context.relatedData?.estimatedCost || 100000,
      estimatedTime: 15,
    });

    // 选项3: 等待观望
    options.push({
      id: 'opt-3',
      title: '等待市场回调',
      description: '暂缓采购，等待价格回调后再行动',
      pros: ['可能获得更低价格', '资金灵活', '有时间优化方案'],
      cons: ['价格可能继续上涨', '影响项目进度', '供应风险'],
      risks: [
        { factor: '价格继续上涨', probability: 'medium', impact: 'high', mitigation: '设置止损点' },
        { factor: '项目延期', probability: 'medium', impact: 'medium', mitigation: '调整项目计划' },
      ],
      impact: { cost: 20, time: -20, quality: 0, risk: 30 },
      confidence: 60,
      recommendationScore: 0,
      estimatedCost: context.relatedData?.estimatedCost || 100000,
      estimatedTime: 20,
    });

    return options;
  }

  /**
   * 生成风险决策选项
   */
  private generateRiskOptions(context: DecisionContext): DecisionOption[] {
    return [
      {
        id: 'risk-opt-1',
        title: '主动缓解策略',
        description: '立即采取措施降低风险',
        pros: ['风险可控', '损失最小化', '增强信心'],
        cons: ['成本增加', '资源占用', '可能过度反应'],
        risks: [],
        impact: { cost: -10, time: -5, quality: 10, risk: -40 },
        confidence: 80,
        recommendationScore: 0,
      },
      {
        id: 'risk-opt-2',
        title: '风险转移策略',
        description: '通过保险或合同条款转移风险',
        pros: ['风险转移', '成本可控', '专业处理'],
        cons: ['需要额外成本', '不完全覆盖', '依赖第三方'],
        risks: [],
        impact: { cost: -15, time: 0, quality: 0, risk: -30 },
        confidence: 70,
        recommendationScore: 0,
      },
    ];
  }

  /**
   * 生成进度决策选项
   */
  private generateScheduleOptions(context: DecisionContext): DecisionOption[] {
    return [
      {
        id: 'schedule-opt-1',
        title: '加速推进计划',
        description: '增加资源投入，加快项目进度',
        pros: ['提前完成', '抢占先机', '提高效率'],
        cons: ['成本增加', '质量风险', '团队压力'],
        risks: [],
        impact: { cost: -20, time: 30, quality: -10, risk: 10 },
        confidence: 75,
        recommendationScore: 0,
      },
      {
        id: 'schedule-opt-2',
        title: '优化关键路径',
        description: '重新安排任务顺序，优化关键路径',
        pros: ['不增加成本', '提高效率', '降低风险'],
        cons: ['需要重新规划', '协调复杂', '可能有遗漏'],
        risks: [],
        impact: { cost: 0, time: 15, quality: 5, risk: -10 },
        confidence: 85,
        recommendationScore: 0,
      },
    ];
  }

  /**
   * 生成资源决策选项
   */
  private generateResourceOptions(context: DecisionContext): DecisionOption[] {
    return [
      {
        id: 'resource-opt-1',
        title: '外包非核心任务',
        description: '将非核心任务外包，集中内部资源',
        pros: ['专业化', '灵活性', '降低管理成本'],
        cons: ['控制力降低', '沟通成本', '质量风险'],
        risks: [],
        impact: { cost: -5, time: 10, quality: 0, risk: 5 },
        confidence: 70,
        recommendationScore: 0,
      },
    ];
  }

  /**
   * 生成质量决策选项
   */
  private generateQualityOptions(context: DecisionContext): DecisionOption[] {
    return [
      {
        id: 'quality-opt-1',
        title: '加强质量控制',
        description: '增加质检频次和范围',
        pros: ['质量保证', '减少返工', '客户满意'],
        cons: ['成本增加', '进度影响', '资源占用'],
        risks: [],
        impact: { cost: -10, time: -10, quality: 30, risk: -20 },
        confidence: 90,
        recommendationScore: 0,
      },
    ];
  }

  /**
   * 评估选项
   */
  private evaluateOption(option: DecisionOption, context: DecisionContext): DecisionOption {
    // 计算推荐分数
    let score = 0;

    // 基于影响分析
    score += (100 + option.impact.cost) * 0.25;
    score += (100 + option.impact.time) * 0.25;
    score += (100 + option.impact.quality) * 0.25;
    score += (100 - option.impact.risk) * 0.25;

    // 基于置信度
    score = (score * option.confidence) / 100;

    // 基于约束条件
    context.constraints.forEach(constraint => {
      if (constraint.type === 'budget' && option.estimatedCost) {
        if (option.estimatedCost > constraint.value) {
          score -= 20;
        }
      }
      if (constraint.type === 'time' && option.estimatedTime) {
        if (option.estimatedTime > constraint.value) {
          score -= 15;
        }
      }
    });

    // 基于目标
    context.objectives.forEach(objective => {
      // 简化的目标匹配逻辑
      score += objective.weight * 10;
    });

    option.recommendationScore = Math.max(0, Math.min(100, score));
    return option;
  }

  /**
   * 选择最佳选项
   */
  private selectBestOption(options: DecisionOption[], context: DecisionContext): DecisionOption {
    // 根据推荐分数排序
    const sorted = options.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    // 如果是高紧急度，优先选择快速选项
    if (context.urgency === 'critical' || context.urgency === 'high') {
      const fastOption = sorted.find(opt => opt.estimatedTime && opt.estimatedTime < 10);
      if (fastOption && fastOption.recommendationScore > 60) {
        return fastOption;
      }
    }

    return sorted[0];
  }

  /**
   * 查找相似案例
   */
  private findSimilarCases(context: DecisionContext): SimilarCase[] {
    return this.caseDatabase
      .map(case_ => {
        // 计算相似度
        let similarity = 0;
        
        // 基于类型匹配
        if (context.type === 'procurement' && case_.situation.includes('采购')) {
          similarity += 30;
        }
        if (context.type === 'risk' && case_.situation.includes('风险')) {
          similarity += 30;
        }
        
        // 基于关键词匹配
        const keywords = context.description.split(' ');
        keywords.forEach(keyword => {
          if (case_.situation.includes(keyword)) {
            similarity += 10;
          }
        });

        return { ...case_, similarity: Math.min(100, similarity) };
      })
      .filter(case_ => case_.similarity > 30)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  /**
   * 收集相关数据点
   */
  private collectRelevantDataPoints(context: DecisionContext): DataPoint[] {
    const dataPoints: DataPoint[] = [];

    // 从项目存储获取数据
    const store = useProjectStore.getState();
    
    if (context.type === 'procurement') {
      // 采购相关数据
      const stats = procurementAutomation.getStatistics();
      dataPoints.push({
        source: 'procurement',
        metric: '活跃订单数',
        value: stats.activeOrders,
        trend: 'stable',
        significance: 'medium',
      });
      dataPoints.push({
        source: 'procurement',
        metric: '平均交付时间',
        value: `${stats.averageLeadTime}天`,
        trend: 'stable',
        significance: 'high',
      });
    }

    // 从模块数据总线获取数据
    const connectionHealth = moduleDataBus.getConnectionHealth();
    dataPoints.push({
      source: 'system',
      metric: '系统健康度',
      value: `${connectionHealth.health.toFixed(1)}%`,
      trend: connectionHealth.health > 80 ? 'up' : 'down',
      significance: 'high',
    });

    return dataPoints;
  }

  /**
   * 生成推理说明
   */
  private generateReasoning(
    option: DecisionOption,
    context: DecisionContext,
    similarCases: SimilarCase[]
  ): string {
    let reasoning = `基于当前${context.type}场景分析，推荐采用"${option.title}"策略。\n\n`;
    
    reasoning += `主要考虑因素：\n`;
    reasoning += `1. 紧急程度：${context.urgency}\n`;
    reasoning += `2. 预期影响：成本${option.impact.cost > 0 ? '增加' : '降低'}，`;
    reasoning += `时间${option.impact.time > 0 ? '节省' : '延长'}，`;
    reasoning += `质量${option.impact.quality > 0 ? '提升' : '下降'}，`;
    reasoning += `风险${option.impact.risk > 0 ? '增加' : '降低'}\n`;
    
    if (similarCases.length > 0) {
      reasoning += `\n参考案例：\n`;
      similarCases.forEach((case_, index) => {
        reasoning += `${index + 1}. ${case_.project}：${case_.situation} - ${case_.outcome === 'success' ? '成功' : '部分成功'}\n`;
      });
    }
    
    reasoning += `\n置信度：${option.confidence}%`;
    
    return reasoning;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(option: DecisionOption, similarCases: SimilarCase[]): number {
    let confidence = option.confidence;
    
    // 基于相似案例调整
    if (similarCases.length > 0) {
      const avgSimilarity = similarCases.reduce((sum, c) => sum + c.similarity, 0) / similarCases.length;
      const successRate = similarCases.filter(c => c.outcome === 'success').length / similarCases.length;
      confidence = confidence * 0.7 + avgSimilarity * 0.2 + successRate * 100 * 0.1;
    }
    
    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * 执行趋势分析
   */
  private performTrendAnalysis() {
    const store = useProjectStore.getState();
    const projects = store.projects;
    
    if (projects.length === 0) return;

    // 分析项目进度趋势
    const progressTrend = this.analyzeProgressTrend(projects);
    if (progressTrend) {
      this.insights.push(progressTrend);
    }

    // 分析成本趋势
    const costTrend = this.analyzeCostTrend();
    if (costTrend) {
      this.insights.push(costTrend);
    }
  }

  /**
   * 分析进度趋势
   */
  private analyzeProgressTrend(projects: any[]): PredictiveInsight | null {
    // 简化的进度分析
    const currentProject = projects[0];
    if (!currentProject) return null;

    const progress = currentProject.progress || 0;
    const expectedProgress = this.calculateExpectedProgress(currentProject);
    
    if (progress < expectedProgress - 10) {
      return {
        id: this.generateId('INSIGHT'),
        type: 'trend',
        category: 'schedule',
        title: '项目进度滞后',
        description: `当前进度${progress}%，低于预期${expectedProgress}%`,
        confidence: 75,
        timeframe: '本周',
        recommendations: [
          '增加资源投入',
          '优化任务分配',
          '考虑并行作业',
        ],
      };
    }

    return null;
  }

  /**
   * 分析成本趋势
   */
  private analyzeCostTrend(): PredictiveInsight | null {
    const stats = procurementAutomation.getStatistics();
    
    if (stats.totalAmount > 1000000) {
      return {
        id: this.generateId('INSIGHT'),
        type: 'trend',
        category: 'cost',
        title: '采购成本偏高',
        description: `当前采购总额${stats.totalAmount}，超出预期`,
        confidence: 80,
        timeframe: '本月',
        recommendations: [
          '审查采购计划',
          '寻找替代供应商',
          '批量采购谈判',
        ],
      };
    }

    return null;
  }

  /**
   * 检测异常
   */
  private detectAnomalies() {
    // 检测数据异常
    const connectionHealth = moduleDataBus.getConnectionHealth();
    
    if (connectionHealth.error > 0) {
      const anomaly: PredictiveInsight = {
        id: this.generateId('ANOMALY'),
        type: 'anomaly',
        category: 'system',
        title: '系统连接异常',
        description: `检测到${connectionHealth.error}个连接错误`,
        confidence: 95,
        timeframe: '立即',
        recommendations: [
          '检查系统连接',
          '重启相关服务',
          '联系技术支持',
        ],
      };
      
      this.insights.push(anomaly);
      
      // 发送警告
      eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
        type: 'warning',
        message: '系统异常检测',
        description: anomaly.description,
      });
    }
  }

  /**
   * 生成预测
   */
  private generateForecasts() {
    // 简化的预测逻辑
    const forecast: PredictiveInsight = {
      id: this.generateId('FORECAST'),
      type: 'forecast',
      category: 'general',
      title: '下周工作重点预测',
      description: '基于当前进度和计划，预测下周需要重点关注的工作',
      confidence: 70,
      timeframe: '下周',
      recommendations: [
        '准备采购评审会议',
        '完成阶段性验收',
        '更新项目文档',
      ],
    };
    
    this.insights.push(forecast);
  }

  /**
   * 从价格事件学习
   */
  private learnFromPriceEvent(data: any) {
    this.learningData.set(`price-${Date.now()}`, data);
  }

  /**
   * 从风险事件学习
   */
  private learnFromRiskEvent(data: any) {
    this.learningData.set(`risk-${Date.now()}`, data);
  }

  /**
   * 从阶段完成学习
   */
  private learnFromPhaseCompletion(data: any) {
    this.learningData.set(`phase-${Date.now()}`, data);
  }

  /**
   * 计算预期进度
   */
  private calculateExpectedProgress(project: any): number {
    if (!project.startDate || !project.endDate) return 50;
    
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const now = Date.now();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  /**
   * 获取洞察
   */
  getInsights(limit: number = 10): PredictiveInsight[] {
    return this.insights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * 获取决策历史
   */
  getDecisionHistory(): DecisionRecommendation[] {
    return Array.from(this.decisionHistory.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * 生成ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例
export const intelligentDecisionSupport = new IntelligentDecisionSupportService();
