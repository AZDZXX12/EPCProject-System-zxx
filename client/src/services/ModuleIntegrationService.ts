/**
 * 模块集成服务 - 负责所有模块间的数据流转和事件协调
 */

import { eventBus, EVENTS } from '../utils/EventBus';
import { logger } from '../utils/logger';
import { personnelService } from './PersonnelService';
import { documentService } from './DocumentService';
import { safetyService } from './SafetyService';
import { qualityService } from './QualityService';
import { costService } from './CostService';

// ==================== 类型定义 ====================

export interface ModuleConnection {
  sourceModule: string;
  targetModule: string;
  dataFlow: DataFlow[];
  triggers: Trigger[];
  syncInterval?: number;
}

export interface DataFlow {
  name: string;
  sourceField: string;
  targetField: string;
  transformer?: (data: any) => any;
  validator?: (data: any) => boolean;
}

export interface Trigger {
  event: string;
  condition?: (data: any) => boolean;
  action: (data: any) => void;
  async?: boolean;
}

export interface ModuleStatus {
  moduleName: string;
  isActive: boolean;
  lastSync: string;
  health: 'healthy' | 'degraded' | 'critical';
}

// ==================== 模块集成服务 ====================

export class ModuleIntegrationService {
  private connections: Map<string, ModuleConnection>;
  private moduleStatus: Map<string, ModuleStatus>;
  private static instance: ModuleIntegrationService;

  private constructor() {
    this.connections = new Map();
    this.moduleStatus = new Map();
    this.initialize();
  }

  static getInstance(): ModuleIntegrationService {
    if (!ModuleIntegrationService.instance) {
      ModuleIntegrationService.instance = new ModuleIntegrationService();
    }
    return ModuleIntegrationService.instance;
  }

  private initialize(): void {
    this.setupConnections();
    this.registerEventHandlers();
    logger.info('[ModuleIntegration] 服务初始化完成');
  }

  // ==================== 连接配置 ====================

  private setupConnections(): void {
    // 任务管理 ⟷ 施工管理
    this.addConnection({
      sourceModule: 'TaskManagement',
      targetModule: 'ConstructionManagement',
      dataFlow: [
        {
          name: 'TaskProgress',
          sourceField: 'progress',
          targetField: 'constructionProgress',
          transformer: (data) => ({
            ...data,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
      triggers: [
        {
          event: EVENTS.TASK_UPDATED,
          action: (data) => this.syncTaskToConstruction(data),
          async: true,
        },
        {
          event: EVENTS.CONSTRUCTION_LOG_SUBMITTED,
          action: (data) => this.syncConstructionToTask(data),
          async: true,
        },
      ],
      syncInterval: 60000,
    });

    // 任务管理 ⟷ 人员管理
    this.addConnection({
      sourceModule: 'TaskManagement',
      targetModule: 'PersonnelManagement',
      dataFlow: [
        {
          name: 'TaskAssignment',
          sourceField: 'assignee',
          targetField: 'workload',
        },
      ],
      triggers: [
        {
          event: EVENTS.TASK_ASSIGNED,
          action: (data) => this.updatePersonnelWorkload(data),
        },
      ],
    });

    // 施工管理 ⟷ 质量管理
    this.addConnection({
      sourceModule: 'ConstructionManagement',
      targetModule: 'QualityManagement',
      dataFlow: [
        {
          name: 'QualityInspection',
          sourceField: 'workCompleted',
          targetField: 'inspectionItems',
        },
      ],
      triggers: [
        {
          event: EVENTS.CONSTRUCTION_MILESTONE_REACHED,
          action: (data) => this.triggerQualityInspection(data),
        },
        {
          event: EVENTS.QUALITY_ISSUE_FOUND,
          action: (data) => this.handleQualityIssue(data),
        },
      ],
    });

    // 施工管理 ⟷ 安全管理
    this.addConnection({
      sourceModule: 'ConstructionManagement',
      targetModule: 'SafetyManagement',
      dataFlow: [
        {
          name: 'SafetyCheck',
          sourceField: 'workArea',
          targetField: 'inspectionArea',
        },
      ],
      triggers: [
        {
          event: EVENTS.HIGH_RISK_WORK_STARTED,
          action: (data) => this.enforceExtraSafetyMeasures(data),
        },
        {
          event: EVENTS.SAFETY_INCIDENT,
          action: (data) => this.handleSafetyIncident(data),
        },
      ],
    });

    // 成本管理 ⟷ 所有模块
    this.addConnection({
      sourceModule: 'CostManagement',
      targetModule: 'AllModules',
      dataFlow: [
        {
          name: 'BudgetControl',
          sourceField: 'budgetStatus',
          targetField: 'costConstraints',
        },
      ],
      triggers: [
        {
          event: EVENTS.BUDGET_EXCEEDED,
          condition: (data) => data.variance > 0.1,
          action: (data) => this.triggerCostAlert(data),
        },
      ],
    });
  }

  private addConnection(connection: ModuleConnection): void {
    const key = `${connection.sourceModule}-${connection.targetModule}`;
    this.connections.set(key, connection);
    
    this.initModuleStatus(connection.sourceModule);
    this.initModuleStatus(connection.targetModule);
    
    connection.triggers.forEach(trigger => {
      eventBus.on(trigger.event, (data) => {
        if (!trigger.condition || trigger.condition(data)) {
          if (trigger.async) {
            this.executeAsync(trigger.action, data);
          } else {
            trigger.action(data);
          }
        }
      });
    });
  }

  private initModuleStatus(moduleName: string): void {
    if (!this.moduleStatus.has(moduleName)) {
      this.moduleStatus.set(moduleName, {
        moduleName,
        isActive: true,
        lastSync: new Date().toISOString(),
        health: 'healthy',
      });
    }
  }

  // ==================== 事件处理 ====================

  private registerEventHandlers(): void {
    // 任务创建时的多模块联动
    eventBus.on(EVENTS.TASK_CREATED, (data) => {
      this.handleTaskCreation(data);
    });

    // 项目阶段变更
    eventBus.on(EVENTS.PHASE_TRANSITION, (data) => {
      this.handlePhaseTransition(data);
    });

    // 紧急事件
    eventBus.on(EVENTS.EMERGENCY_NOTIFICATION, (data) => {
      this.handleEmergency(data);
    });

    // 资源冲突
    eventBus.on(EVENTS.RESOURCE_CONFLICT, (data) => {
      this.resolveResourceConflict(data);
    });
  }

  private async handleTaskCreation(data: any): Promise<void> {
    logger.info('[ModuleIntegration] 处理任务创建', { taskId: data.id });

    // 1. 分配人员
    const availablePersonnel = personnelService.getAvailablePersonnel(data.skill);
    if (availablePersonnel.length > 0) {
      data.assignee = availablePersonnel[0].name;
      data.assigneeId = availablePersonnel[0].id;
    }

    // 2. 关联文档
    const docs = documentService.searchDocuments({ tags: data.tags });
    data.relatedDocuments = docs.results.map(d => d.id);

    // 3. 设置质量检查点
    if (data.deliverables && data.deliverables.length > 0) {
      this.setupQualityCheckpoints(data);
    }

    // 4. 配置安全措施
    if (data.riskLevel === 'high' || data.riskLevel === 'very_high') {
      this.configureSafetyMeasures(data);
    }

    // 5. 分配预算
    if (data.plannedCost > 0) {
      this.allocateBudget(data);
    }
  }

  private async handlePhaseTransition(data: any): Promise<void> {
    logger.info('[ModuleIntegration] 处理阶段转换', { phase: data.newPhase });

    // 通知所有模块调整
    eventBus.emit(EVENTS.PHASE_UPDATED, {
      phase: data.newPhase,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleEmergency(data: any): Promise<void> {
    logger.error('[ModuleIntegration] 紧急事件', data);

    // 停止施工
    eventBus.emit(EVENTS.CONSTRUCTION_STOP, { reason: data });

    // 通知所有相关人员
    eventBus.emit(EVENTS.BROADCAST_NOTIFICATION, {
      type: 'emergency',
      message: data.message,
      severity: 'critical',
    });
  }

  // ==================== 同步方法 ====================

  private async syncTaskToConstruction(data: any): Promise<void> {
    logger.debug('[ModuleIntegration] 同步任务到施工', { taskId: data.id });
    
    const constructionUpdate = {
      workId: data.id,
      progress: data.progress,
      resources: data.resources,
      status: data.status,
    };
    
    eventBus.emit(EVENTS.CONSTRUCTION_UPDATE, constructionUpdate);
    this.updateModuleStatus('TaskManagement');
  }

  private async syncConstructionToTask(data: any): Promise<void> {
    logger.debug('[ModuleIntegration] 同步施工到任务', { reportId: data.id });
    
    const taskUpdate = {
      taskId: data.taskId,
      progress: data.completionPercent,
      actualHours: data.workHours,
    };
    
    eventBus.emit(EVENTS.TASK_PROGRESS_UPDATE, taskUpdate);
    this.updateModuleStatus('ConstructionManagement');
  }

  // ==================== 业务处理方法 ====================

  private updatePersonnelWorkload(data: any): void {
    const personnel = personnelService.getPersonnelById(data.personnelId);
    if (personnel) {
      personnel.workload = (personnel.workload || 0) + data.effort;
      personnelService.updatePersonnel(data.personnelId, { workload: personnel.workload });
    }
  }

  private triggerQualityInspection(data: any): void {
    qualityService.performInspection({
      type: 'in_process',
      itemName: data.workName,
      itemCode: data.workId,
      quantity: 1,
      unit: 'item',
      inspectionDate: new Date().toISOString(),
      inspector: '质检员',
      standard: 'ISO 9001',
      method: 'Visual',
      parameters: [],
      result: 'pending',
      defects: [],
      attachments: [],
      followUpRequired: false,
    });
  }

  private handleQualityIssue(data: any): void {
    // 创建NCR
    qualityService.createNCR({
      number: `NCR-${Date.now()}`,
      issueDate: new Date().toISOString(),
      issuer: data.inspector,
      source: 'inspection',
      category: 'workmanship',
      description: data.description,
      affectedItems: [],
      correctiveActions: [],
      preventiveActions: [],
      status: 'open',
    });

    // 暂停施工
    eventBus.emit(EVENTS.CONSTRUCTION_PAUSE, {
      reason: 'quality_issue',
      issueId: data.id,
    });
  }

  private enforceExtraSafetyMeasures(data: any): void {
    safetyService.createInspection({
      type: 'special',
      area: data.workArea,
      inspector: '安全主管',
      datetime: new Date().toISOString(),
      checklist: [],
      findings: [],
      overallScore: 0,
      status: 'planned',
    });
  }

  private handleSafetyIncident(data: any): void {
    const incident = safetyService.reportIncident({
      type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      location: data.location,
      datetime: new Date().toISOString(),
      reporter: data.reporter,
      involvedPersonnel: data.involvedPersonnel || [],
      injuries: [],
      damages: [],
      correctiveActions: [],
      preventiveMeasures: [],
      status: 'reported',
      reportToAuthorities: data.severity === 'critical',
    });

    if (data.severity === 'critical') {
      eventBus.emit(EVENTS.CONSTRUCTION_STOP, { reason: 'safety_incident' });
    }
  }

  private triggerCostAlert(data: any): void {
    eventBus.emit(EVENTS.COST_WARNING, {
      message: `预算超支警告：${data.categoryName}`,
      variance: data.variance,
      impact: 'high',
    });
  }

  private resolveResourceConflict(data: any): void {
    logger.warn('[ModuleIntegration] 处理资源冲突', data);
    
    // 尝试重新分配资源
    const alternative = personnelService.getAvailablePersonnel();
    if (alternative.length > 0) {
      eventBus.emit(EVENTS.RESOURCE_REALLOCATED, {
        original: data.resourceId,
        replacement: alternative[0].id,
      });
    }
  }

  // ==================== 辅助方法 ====================

  private setupQualityCheckpoints(task: any): void {
    task.deliverables.forEach((deliverable: any) => {
      logger.info('[ModuleIntegration] 设置质量检查点', {
        taskId: task.id,
        deliverable: deliverable.name,
      });
    });
  }

  private configureSafetyMeasures(task: any): void {
    logger.warn('[ModuleIntegration] 配置高风险安全措施', {
      taskId: task.id,
      riskLevel: task.riskLevel,
    });
  }

  private allocateBudget(task: any): void {
    logger.info('[ModuleIntegration] 分配预算', {
      taskId: task.id,
      budget: task.plannedCost,
    });
  }

  private executeAsync(action: Function, data: any): void {
    Promise.resolve(action(data)).catch(error => {
      logger.error('[ModuleIntegration] 异步执行失败', error);
    });
  }

  private updateModuleStatus(module: string): void {
    const status = this.moduleStatus.get(module);
    if (status) {
      status.lastSync = new Date().toISOString();
    }
  }

  // ==================== 公共接口 ====================

  getModuleStatus(moduleName: string): ModuleStatus | null {
    return this.moduleStatus.get(moduleName) || null;
  }

  getAllModuleStatus(): ModuleStatus[] {
    return Array.from(this.moduleStatus.values());
  }

  async triggerSync(sourceModule: string, targetModule: string): Promise<void> {
    const key = `${sourceModule}-${targetModule}`;
    const connection = this.connections.get(key);
    
    if (connection) {
      logger.info('[ModuleIntegration] 手动触发同步', { source: sourceModule, target: targetModule });
      // 执行同步逻辑
    }
  }

  toggleModule(moduleName: string, active: boolean): void {
    const status = this.moduleStatus.get(moduleName);
    if (status) {
      status.isActive = active;
      logger.info('[ModuleIntegration] 模块状态更改', { module: moduleName, active });
    }
  }
}

export const moduleIntegrationService = ModuleIntegrationService.getInstance();
