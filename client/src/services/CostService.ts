/**
 * 成本管理服务
 * 提供预算管理、成本跟踪、偏差分析、挣值管理等功能
 */

import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';
import { eventBus, EVENTS } from '../utils/EventBus';

// ==================== 类型定义 ====================

export interface Budget {
  id: string;
  projectId: string;
  name: string;
  version: string;
  totalBudget: number;
  currency: string;
  effectiveDate: string;
  approvedBy: string;
  approvalDate: string;
  categories: BudgetCategory[];
  contingency: number;
  managementReserve: number;
  status: 'draft' | 'submitted' | 'approved' | 'active' | 'revised' | 'closed';
  baseline?: BudgetBaseline;
  revisions: BudgetRevision[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  budgetAmount: number;
  allocatedAmount: number;
  committedAmount: number;
  actualCost: number;
  forecast: number;
  variance: number;
  variancePercent: number;
  subCategories?: BudgetCategory[];
}

export interface BudgetBaseline {
  id: string;
  version: string;
  baselineDate: string;
  totalAmount: number;
  approvedBy: string;
  categories: BudgetCategory[];
}

export interface BudgetRevision {
  id: string;
  revisionNumber: string;
  revisionDate: string;
  reason: string;
  changeAmount: number;
  approvedBy: string;
  description: string;
  affectedCategories: string[];
}

export interface CostItem {
  id: string;
  projectId: string;
  categoryId: string;
  type: CostType;
  description: string;
  vendor?: string;
  poNumber?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  currency: string;
  costDate: string;
  invoiceNumber?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentDate?: string;
  approvedBy?: string;
  remarks?: string;
  attachments?: string[];
}

export type CostType = 
  | 'labor'        // 人工费
  | 'material'     // 材料费
  | 'equipment'    // 设备费
  | 'subcontract'  // 分包费
  | 'overhead'     // 管理费
  | 'other';       // 其他费用

export interface CashFlow {
  id: string;
  projectId: string;
  period: string;
  plannedInflow: number;
  actualInflow: number;
  plannedOutflow: number;
  actualOutflow: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  status: 'forecast' | 'actual';
}

export interface EarnedValue {
  id: string;
  projectId: string;
  reportDate: string;
  pv: number;  // Planned Value (计划值)
  ev: number;  // Earned Value (挣值)
  ac: number;  // Actual Cost (实际成本)
  bac: number; // Budget at Completion (完工预算)
  cv: number;  // Cost Variance (成本偏差) = EV - AC
  sv: number;  // Schedule Variance (进度偏差) = EV - PV
  cpi: number; // Cost Performance Index (成本绩效指数) = EV / AC
  spi: number; // Schedule Performance Index (进度绩效指数) = EV / PV
  eac: number; // Estimate at Completion (完工估算)
  etc: number; // Estimate to Complete (完工尚需估算)
  vac: number; // Variance at Completion (完工偏差) = BAC - EAC
  tcpi: number; // To-Complete Performance Index (完工绩效指数)
}

export interface CostForecast {
  id: string;
  projectId: string;
  forecastDate: string;
  forecastBy: string;
  totalForecast: number;
  categories: ForecastCategory[];
  assumptions: string[];
  risks: CostRisk[];
  confidence: 'high' | 'medium' | 'low';
  approvalStatus: 'draft' | 'submitted' | 'approved';
}

export interface ForecastCategory {
  categoryId: string;
  categoryName: string;
  currentSpend: number;
  remainingBudget: number;
  forecastToComplete: number;
  forecastAtComplete: number;
  variance: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface CostRisk {
  id: string;
  description: string;
  probability: number; // 0-100
  impact: number;
  exposure: number; // probability * impact
  mitigation: string;
  owner: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'closed';
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  orderNumber: string;
  requestDate: string;
  requestor: string;
  description: string;
  justification: string;
  costImpact: number;
  scheduleImpact: string;
  affectedCategories: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'implemented';
  approvals: ApprovalRecord[];
  implementationDate?: string;
}

export interface ApprovalRecord {
  approver: string;
  role: string;
  decision: 'approved' | 'rejected' | 'pending';
  date?: string;
  comments?: string;
}

export interface CostReport {
  id: string;
  projectId: string;
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc';
  reportPeriod: string;
  generatedDate: string;
  generatedBy: string;
  summary: CostSummary;
  details: CostDetail[];
  trends: CostTrend[];
  recommendations: string[];
}

export interface CostSummary {
  totalBudget: number;
  totalCommitted: number;
  totalActual: number;
  totalForecast: number;
  variance: number;
  variancePercent: number;
  cpi: number;
  completionPercent: number;
  atRisk: boolean;
}

export interface CostDetail {
  category: string;
  budget: number;
  committed: number;
  actual: number;
  forecast: number;
  variance: number;
  variancePercent: number;
}

export interface CostTrend {
  period: string;
  planned: number;
  actual: number;
  forecast: number;
  variance: number;
}

// ==================== 成本管理服务 ====================

export class CostService {
  private budgets: Map<string, Budget>;
  private costItems: Map<string, CostItem>;
  private cashFlows: Map<string, CashFlow>;
  private earnedValues: Map<string, EarnedValue>;
  private forecasts: Map<string, CostForecast>;
  private changeOrders: Map<string, ChangeOrder>;
  private static instance: CostService;

  private constructor() {
    this.budgets = new Map();
    this.costItems = new Map();
    this.cashFlows = new Map();
    this.earnedValues = new Map();
    this.forecasts = new Map();
    this.changeOrders = new Map();
    this.loadFromStorage();
  }

  static getInstance(): CostService {
    if (!CostService.instance) {
      CostService.instance = new CostService();
    }
    return CostService.instance;
  }

  private loadFromStorage(): void {
    const budgetsData = StorageManager.load<Budget[]>('cost_budgets');
    if (budgetsData) {
      budgetsData.forEach(item => this.budgets.set(item.id, item));
    }

    const costItemsData = StorageManager.load<CostItem[]>('cost_items');
    if (costItemsData) {
      costItemsData.forEach(item => this.costItems.set(item.id, item));
    }

    if (this.budgets.size === 0) {
      this.initSampleData();
    }
  }

  private saveToStorage(): void {
    StorageManager.save('cost_budgets', Array.from(this.budgets.values()));
    StorageManager.save('cost_items', Array.from(this.costItems.values()));
    StorageManager.save('cost_cashflows', Array.from(this.cashFlows.values()));
    StorageManager.save('cost_earnedvalues', Array.from(this.earnedValues.values()));
  }

  private initSampleData(): void {
    const sampleBudget: Budget = {
      id: 'BUD001',
      projectId: 'PROJ001',
      name: 'EPC项目总预算',
      version: '1.0',
      totalBudget: 10000000,
      currency: 'CNY',
      effectiveDate: '2025-01-01',
      approvedBy: '财务总监',
      approvalDate: '2025-01-01',
      categories: [
        {
          id: 'CAT001',
          name: '人工费',
          code: 'L001',
          budgetAmount: 3000000,
          allocatedAmount: 2500000,
          committedAmount: 2000000,
          actualCost: 1500000,
          forecast: 2800000,
          variance: 200000,
          variancePercent: 6.7,
        },
        {
          id: 'CAT002',
          name: '材料费',
          code: 'M001',
          budgetAmount: 4000000,
          allocatedAmount: 3500000,
          committedAmount: 3000000,
          actualCost: 2500000,
          forecast: 3900000,
          variance: 100000,
          variancePercent: 2.5,
        },
      ],
      contingency: 500000,
      managementReserve: 300000,
      status: 'active',
      revisions: [],
    };

    this.budgets.set(sampleBudget.id, sampleBudget);
    this.saveToStorage();
  }

  // ==================== 预算管理 ====================

  createBudget(budget: Omit<Budget, 'id'>): Budget {
    const id = `BUD${Date.now()}`;
    const newBudget: Budget = {
      ...budget,
      id,
      status: 'draft',
      revisions: [],
    };

    // 计算各分类的初始值
    newBudget.categories.forEach(cat => {
      cat.variance = cat.budgetAmount - cat.actualCost;
      cat.variancePercent = (cat.variance / cat.budgetAmount) * 100;
    });

    this.budgets.set(id, newBudget);
    this.saveToStorage();
    
    logger.info('[CostService] 预算创建', { id, totalBudget: budget.totalBudget });
    return newBudget;
  }

  approveBudget(budgetId: string, approver: string): boolean {
    const budget = this.budgets.get(budgetId);
    if (!budget) return false;

    budget.status = 'approved';
    budget.approvedBy = approver;
    budget.approvalDate = new Date().toISOString();

    // 创建基线
    budget.baseline = {
      id: `BSL${Date.now()}`,
      version: budget.version,
      baselineDate: new Date().toISOString(),
      totalAmount: budget.totalBudget,
      approvedBy: approver,
      categories: JSON.parse(JSON.stringify(budget.categories)), // 深拷贝
    };

    this.budgets.set(budgetId, budget);
    this.saveToStorage();
    
    return true;
  }

  // ==================== 成本记录 ====================

  recordCost(costItem: Omit<CostItem, 'id'>): CostItem {
    const id = `COST${Date.now()}`;
    const newCostItem: CostItem = {
      ...costItem,
      id,
      totalCost: costItem.quantity * costItem.unitPrice,
    };

    this.costItems.set(id, newCostItem);
    
    // 更新预算类别的实际成本
    this.updateBudgetActuals(costItem.projectId, costItem.categoryId, newCostItem.totalCost);
    
    this.saveToStorage();

    // 检查成本超支
    this.checkCostOverrun(costItem.projectId, costItem.categoryId);

    return newCostItem;
  }

  private updateBudgetActuals(projectId: string, categoryId: string, amount: number): void {
    const budget = Array.from(this.budgets.values()).find(b => b.projectId === projectId);
    if (!budget) return;

    const category = budget.categories.find(c => c.id === categoryId);
    if (!category) return;

    category.actualCost += amount;
    category.variance = category.budgetAmount - category.actualCost;
    category.variancePercent = (category.variance / category.budgetAmount) * 100;

    this.budgets.set(budget.id, budget);
  }

  private checkCostOverrun(projectId: string, categoryId: string): void {
    const budget = Array.from(this.budgets.values()).find(b => b.projectId === projectId);
    if (!budget) return;

    const category = budget.categories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.actualCost > category.budgetAmount * 0.9) {
      eventBus.emit(EVENTS.COST_WARNING, {
        projectId,
        categoryId,
        categoryName: category.name,
        actualCost: category.actualCost,
        budget: category.budgetAmount,
        percentage: (category.actualCost / category.budgetAmount) * 100,
      });

      logger.warn('[CostService] 成本预警', {
        category: category.name,
        percentage: `${((category.actualCost / category.budgetAmount) * 100).toFixed(1)}%`,
      });
    }
  }

  // ==================== 挣值管理 ====================

  calculateEarnedValue(projectId: string, completionPercent: number): EarnedValue {
    const budget = Array.from(this.budgets.values()).find(b => b.projectId === projectId);
    if (!budget) throw new Error('Budget not found');

    const totalActual = budget.categories.reduce((sum, cat) => sum + cat.actualCost, 0);
    const bac = budget.totalBudget;
    const pv = bac * (completionPercent / 100); // 简化计算
    const ev = bac * (completionPercent / 100); // 简化计算
    const ac = totalActual;

    const earnedValue: EarnedValue = {
      id: `EV${Date.now()}`,
      projectId,
      reportDate: new Date().toISOString(),
      pv,
      ev,
      ac,
      bac,
      cv: ev - ac,
      sv: ev - pv,
      cpi: ac > 0 ? ev / ac : 1,
      spi: pv > 0 ? ev / pv : 1,
      eac: 0,
      etc: 0,
      vac: 0,
      tcpi: 0,
    };

    // 计算EAC (完工估算)
    if (earnedValue.cpi > 0) {
      earnedValue.eac = earnedValue.bac / earnedValue.cpi;
    } else {
      earnedValue.eac = earnedValue.bac;
    }

    // 计算ETC (完工尚需估算)
    earnedValue.etc = earnedValue.eac - earnedValue.ac;

    // 计算VAC (完工偏差)
    earnedValue.vac = earnedValue.bac - earnedValue.eac;

    // 计算TCPI (完工绩效指数)
    if ((earnedValue.bac - earnedValue.ev) > 0) {
      earnedValue.tcpi = (earnedValue.bac - earnedValue.ev) / (earnedValue.bac - earnedValue.ac);
    } else {
      earnedValue.tcpi = 1;
    }

    this.earnedValues.set(earnedValue.id, earnedValue);
    this.saveToStorage();

    return earnedValue;
  }

  // ==================== 成本预测 ====================

  createForecast(projectId: string): CostForecast {
    const budget = Array.from(this.budgets.values()).find(b => b.projectId === projectId);
    if (!budget) throw new Error('Budget not found');

    const forecastCategories: ForecastCategory[] = budget.categories.map(cat => {
      const remainingBudget = cat.budgetAmount - cat.actualCost;
      const burnRate = cat.actualCost / 6; // 假设已过6个月
      const forecastToComplete = burnRate * 6; // 假设还需6个月
      const forecastAtComplete = cat.actualCost + forecastToComplete;
      
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        currentSpend: cat.actualCost,
        remainingBudget,
        forecastToComplete,
        forecastAtComplete,
        variance: cat.budgetAmount - forecastAtComplete,
        trend: forecastAtComplete > cat.budgetAmount ? 'increasing' : 'stable',
      };
    });

    const totalForecast = forecastCategories.reduce(
      (sum, cat) => sum + cat.forecastAtComplete, 0
    );

    const forecast: CostForecast = {
      id: `FCT${Date.now()}`,
      projectId,
      forecastDate: new Date().toISOString(),
      forecastBy: '成本分析师',
      totalForecast,
      categories: forecastCategories,
      assumptions: ['保持当前燃烧率', '无重大变更'],
      risks: [],
      confidence: totalForecast <= budget.totalBudget ? 'high' : 'medium',
      approvalStatus: 'draft',
    };

    this.forecasts.set(forecast.id, forecast);
    StorageManager.save('cost_forecasts', Array.from(this.forecasts.values()));

    return forecast;
  }

  // ==================== 变更管理 ====================

  createChangeOrder(changeOrder: Omit<ChangeOrder, 'id'>): ChangeOrder {
    const id = `CO${Date.now()}`;
    const newChangeOrder: ChangeOrder = {
      ...changeOrder,
      id,
      status: 'draft',
      approvals: [],
    };

    this.changeOrders.set(id, newChangeOrder);
    StorageManager.save('cost_changeorders', Array.from(this.changeOrders.values()));

    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
      type: 'info',
      message: '变更单已创建',
      description: `变更金额: ¥${changeOrder.costImpact.toLocaleString()}`,
    });

    return newChangeOrder;
  }

  // ==================== 报表生成 ====================

  generateCostReport(projectId: string, reportType: CostReport['reportType']): CostReport {
    const budget = Array.from(this.budgets.values()).find(b => b.projectId === projectId);
    if (!budget) throw new Error('Budget not found');

    const totalCommitted = budget.categories.reduce((sum, cat) => sum + cat.committedAmount, 0);
    const totalActual = budget.categories.reduce((sum, cat) => sum + cat.actualCost, 0);
    const totalForecast = budget.categories.reduce((sum, cat) => sum + cat.forecast, 0);

    const summary: CostSummary = {
      totalBudget: budget.totalBudget,
      totalCommitted,
      totalActual,
      totalForecast,
      variance: budget.totalBudget - totalForecast,
      variancePercent: ((budget.totalBudget - totalForecast) / budget.totalBudget) * 100,
      cpi: totalActual > 0 ? (totalActual / budget.totalBudget) : 1,
      completionPercent: (totalActual / budget.totalBudget) * 100,
      atRisk: totalForecast > budget.totalBudget,
    };

    const details: CostDetail[] = budget.categories.map(cat => ({
      category: cat.name,
      budget: cat.budgetAmount,
      committed: cat.committedAmount,
      actual: cat.actualCost,
      forecast: cat.forecast,
      variance: cat.variance,
      variancePercent: cat.variancePercent,
    }));

    const report: CostReport = {
      id: `RPT${Date.now()}`,
      projectId,
      reportType,
      reportPeriod: new Date().toISOString().slice(0, 7),
      generatedDate: new Date().toISOString(),
      generatedBy: '系统',
      summary,
      details,
      trends: [],
      recommendations: this.generateRecommendations(summary),
    };

    return report;
  }

  private generateRecommendations(summary: CostSummary): string[] {
    const recommendations: string[] = [];

    if (summary.variancePercent < -10) {
      recommendations.push('成本严重超支，建议立即采取纠正措施');
    }
    if (summary.cpi < 0.9) {
      recommendations.push('成本绩效指数偏低，需要优化资源使用');
    }
    if (summary.atRisk) {
      recommendations.push('预测成本超出预算，建议审查并调整项目范围');
    }

    return recommendations;
  }

  // ==================== 数据获取方法 ====================

  getAllBudgets(): Budget[] {
    return Array.from(this.budgets.values());
  }

  getAllCostItems(): CostItem[] {
    return Array.from(this.costItems.values());
  }

  getBudgetByProject(projectId: string): Budget | null {
    return Array.from(this.budgets.values()).find(b => b.projectId === projectId) || null;
  }

  getCostTrend(projectId: string, months: number = 12): CostTrend[] {
    const trend: CostTrend[] = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      trend.push({
        period: date.toISOString().slice(0, 7),
        planned: 800000 + Math.random() * 200000,
        actual: 750000 + Math.random() * 250000,
        forecast: 850000 + Math.random() * 150000,
        variance: -50000 + Math.random() * 100000,
      });
    }
    
    return trend;
  }
}

export const costService = CostService.getInstance();
