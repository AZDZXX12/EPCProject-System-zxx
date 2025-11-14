/**
 * 项目工作流和模块衔接服务
 * 管理项目各模块间的数据流转和业务协同
 */

import { ProjectPhase } from '../types/projectLifecycle';
import { message } from 'antd';

// 工作流步骤
export interface WorkflowStep {
  id: string;
  name: string;
  phase: ProjectPhase;
  module: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dependencies: string[]; // 依赖的步骤ID
  requiredData: string[]; // 需要的数据
  outputData: string[]; // 产出的数据
  assignee?: string;
  dueDate?: string;
}

// 模块间数据传递
export interface ModuleDataTransfer {
  sourceModule: string;
  targetModule: string;
  dataType: string;
  data: any;
  timestamp: string;
  status: 'pending' | 'transferred' | 'failed';
}

// 业务事件
export interface BusinessEvent {
  id: string;
  type: string;
  module: string;
  phase: ProjectPhase;
  description: string;
  data: any;
  timestamp: string;
  subscribers: string[]; // 订阅此事件的模块
}

/**
 * 项目工作流管理器
 */
export class ProjectWorkflowManager {
  private projectId: string;
  private workflows: Map<string, WorkflowStep[]> = new Map();
  private dataTransfers: ModuleDataTransfer[] = [];
  private eventSubscribers: Map<string, Set<(event: BusinessEvent) => void>> = new Map();

  constructor(projectId: string) {
    this.projectId = projectId;
    this.initializeWorkflows();
  }

  /**
   * 初始化标准工作流
   */
  private initializeWorkflows() {
    // 立项阶段工作流
    this.workflows.set(ProjectPhase.INITIATION, [
      {
        id: 'init-001',
        name: '项目建议书编制',
        phase: ProjectPhase.INITIATION,
        module: 'documents',
        status: 'pending',
        dependencies: [],
        requiredData: [],
        outputData: ['project_proposal'],
      },
      {
        id: 'init-002',
        name: '可行性研究',
        phase: ProjectPhase.INITIATION,
        module: 'analysis',
        status: 'pending',
        dependencies: ['init-001'],
        requiredData: ['project_proposal'],
        outputData: ['feasibility_report'],
      },
      {
        id: 'init-003',
        name: '项目团队组建',
        phase: ProjectPhase.INITIATION,
        module: 'personnel',
        status: 'pending',
        dependencies: ['init-002'],
        requiredData: ['feasibility_report'],
        outputData: ['team_structure'],
      },
    ]);

    // 设计阶段工作流
    this.workflows.set(ProjectPhase.DESIGN, [
      {
        id: 'design-001',
        name: '初步设计',
        phase: ProjectPhase.DESIGN,
        module: 'design',
        status: 'pending',
        dependencies: [],
        requiredData: ['project_proposal', 'feasibility_report'],
        outputData: ['preliminary_design'],
      },
      {
        id: 'design-002',
        name: '设备选型',
        phase: ProjectPhase.DESIGN,
        module: 'devices',
        status: 'pending',
        dependencies: ['design-001'],
        requiredData: ['preliminary_design'],
        outputData: ['equipment_list', 'equipment_specs'],
      },
      {
        id: 'design-003',
        name: '施工图设计',
        phase: ProjectPhase.DESIGN,
        module: 'design',
        status: 'pending',
        dependencies: ['design-002'],
        requiredData: ['preliminary_design', 'equipment_specs'],
        outputData: ['construction_drawings'],
      },
    ]);

    // 采购阶段工作流
    this.workflows.set(ProjectPhase.PROCUREMENT, [
      {
        id: 'proc-001',
        name: '采购计划编制',
        phase: ProjectPhase.PROCUREMENT,
        module: 'procurement',
        status: 'pending',
        dependencies: [],
        requiredData: ['equipment_list', 'construction_drawings'],
        outputData: ['procurement_plan'],
      },
      {
        id: 'proc-002',
        name: '供应商评估',
        phase: ProjectPhase.PROCUREMENT,
        module: 'procurement',
        status: 'pending',
        dependencies: ['proc-001'],
        requiredData: ['procurement_plan'],
        outputData: ['supplier_evaluation'],
      },
      {
        id: 'proc-003',
        name: '设备采购',
        phase: ProjectPhase.PROCUREMENT,
        module: 'procurement',
        status: 'pending',
        dependencies: ['proc-002'],
        requiredData: ['supplier_evaluation', 'equipment_list'],
        outputData: ['purchase_orders', 'equipment_contracts'],
      },
    ]);

    // 施工阶段工作流
    this.workflows.set(ProjectPhase.CONSTRUCTION, [
      {
        id: 'const-001',
        name: '施工组织设计',
        phase: ProjectPhase.CONSTRUCTION,
        module: 'construction',
        status: 'pending',
        dependencies: [],
        requiredData: ['construction_drawings', 'equipment_contracts'],
        outputData: ['construction_plan'],
      },
      {
        id: 'const-002',
        name: '现场施工',
        phase: ProjectPhase.CONSTRUCTION,
        module: 'construction',
        status: 'pending',
        dependencies: ['const-001'],
        requiredData: ['construction_plan'],
        outputData: ['construction_logs', 'quality_records'],
      },
      {
        id: 'const-003',
        name: '质量安全检查',
        phase: ProjectPhase.CONSTRUCTION,
        module: 'quality',
        status: 'pending',
        dependencies: ['const-002'],
        requiredData: ['construction_logs'],
        outputData: ['inspection_reports'],
      },
    ]);
  }

  /**
   * 获取指定阶段的工作流步骤
   */
  getWorkflowSteps(phase: ProjectPhase): WorkflowStep[] {
    return this.workflows.get(phase) || [];
  }

  /**
   * 更新工作流步骤状态
   */
  updateStepStatus(stepId: string, status: WorkflowStep['status']): void {
    for (const [phaseKey, steps] of this.workflows.entries()) {
      const phase = phaseKey as ProjectPhase;
      const step = steps.find((s) => s.id === stepId);
      if (step) {
        step.status = status;
        
        // 如果步骤完成，检查依赖此步骤的其他步骤
        if (status === 'completed') {
          this.checkDependentSteps(stepId, phase);
        }
        
        // 触发状态变更事件
        this.publishEvent({
          id: `event-${Date.now()}`,
          type: 'workflow_step_updated',
          module: step.module,
          phase: step.phase,
          description: `步骤 ${step.name} 状态更新为 ${status}`,
          data: { stepId, status },
          timestamp: new Date().toISOString(),
          subscribers: [],
        });
        
        break;
      }
    }
  }

  /**
   * 检查依赖步骤并自动启动
   */
  private checkDependentSteps(completedStepId: string, phase: ProjectPhase): void {
    const steps = this.workflows.get(phase);
    if (!steps) return;

    steps.forEach((step) => {
      if (step.dependencies.includes(completedStepId) && step.status === 'pending') {
        // 检查所有依赖是否都已完成
        const allDependenciesCompleted = step.dependencies.every((depId) => {
          const depStep = steps.find((s) => s.id === depId);
          return depStep?.status === 'completed';
        });

        if (allDependenciesCompleted) {
          // 自动启动此步骤
          step.status = 'in_progress';
          message.info(`步骤"${step.name}"已自动启动`);
          
          // 触发步骤启动事件
          this.publishEvent({
            id: `event-${Date.now()}`,
            type: 'workflow_step_started',
            module: step.module,
            phase: phase,
            description: `步骤 ${step.name} 已自动启动`,
            data: { stepId: step.id },
            timestamp: new Date().toISOString(),
            subscribers: [],
          });
        }
      }
    });
  }

  /**
   * 数据传递：从源模块传递数据到目标模块
   */
  transferData(
    sourceModule: string,
    targetModule: string,
    dataType: string,
    data: any
  ): void {
    const transfer: ModuleDataTransfer = {
      sourceModule,
      targetModule,
      dataType,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    this.dataTransfers.push(transfer);

    // 触发数据传递事件
    this.publishEvent({
      id: `event-${Date.now()}`,
      type: 'data_transferred',
      module: sourceModule,
      phase: ProjectPhase.INITIATION, // 需要从上下文获取当前阶段
      description: `数据从 ${sourceModule} 传递到 ${targetModule}`,
      data: { dataType, transfer },
      timestamp: new Date().toISOString(),
      subscribers: [targetModule],
    });

    transfer.status = 'transferred';
  }

  /**
   * 订阅业务事件
   */
  subscribe(eventType: string, callback: (event: BusinessEvent) => void): void {
    if (!this.eventSubscribers.has(eventType)) {
      this.eventSubscribers.set(eventType, new Set());
    }
    this.eventSubscribers.get(eventType)!.add(callback);
  }

  /**
   * 取消订阅
   */
  unsubscribe(eventType: string, callback: (event: BusinessEvent) => void): void {
    const subscribers = this.eventSubscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
    }
  }

  /**
   * 发布事件
   */
  publishEvent(event: BusinessEvent): void {
    const subscribers = this.eventSubscribers.get(event.type);
    if (subscribers) {
      subscribers.forEach((callback) => callback(event));
    }

    // 同时通知通用订阅者
    const allSubscribers = this.eventSubscribers.get('*');
    if (allSubscribers) {
      allSubscribers.forEach((callback) => callback(event));
    }
  }

  /**
   * 获取模块间数据传递历史
   */
  getDataTransferHistory(module?: string): ModuleDataTransfer[] {
    if (module) {
      return this.dataTransfers.filter(
        (t) => t.sourceModule === module || t.targetModule === module
      );
    }
    return this.dataTransfers;
  }

  /**
   * 检查数据是否可用
   */
  isDataAvailable(dataType: string): boolean {
    return this.dataTransfers.some(
      (t) => t.dataType === dataType && t.status === 'transferred'
    );
  }

  /**
   * 获取指定类型的数据
   */
  getData(dataType: string): any {
    const transfer = this.dataTransfers
      .filter((t) => t.dataType === dataType && t.status === 'transferred')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return transfer?.data;
  }
}

/**
 * 模块协同助手
 */
export class ModuleCollaborationHelper {
  /**
   * 检查模块前置条件
   */
  static checkPrerequisites(
    _targetModule: string,
    requiredData: string[],
    workflowManager: ProjectWorkflowManager
  ): { ready: boolean; missing: string[] } {
    const missing = requiredData.filter((dataType) => !workflowManager.isDataAvailable(dataType));
    
    return {
      ready: missing.length === 0,
      missing,
    };
  }

  /**
   * 生成模块协同建议
   */
  static generateCollaborationSuggestions(
    currentPhase: ProjectPhase,
    workflowManager: ProjectWorkflowManager
  ): string[] {
    const suggestions: string[] = [];
    const steps = workflowManager.getWorkflowSteps(currentPhase);

    // 检查待启动的步骤
    steps.forEach((step) => {
      if (step.status === 'pending' && step.dependencies.length > 0) {
        const pendingDeps = step.dependencies.filter((depId) => {
          const depStep = steps.find((s) => s.id === depId);
          return depStep?.status !== 'completed';
        });

        if (pendingDeps.length > 0) {
          suggestions.push(
            `步骤"${step.name}"等待依赖完成，建议先完成前置步骤`
          );
        }
      }
    });

    return suggestions;
  }

  /**
   * 获取模块数据流图
   */
  static getDataFlowMap(): Record<string, { inputs: string[]; outputs: string[] }> {
    return {
      initiation: {
        inputs: [],
        outputs: ['project_proposal', 'feasibility_report', 'team_structure'],
      },
      design: {
        inputs: ['project_proposal', 'feasibility_report'],
        outputs: ['preliminary_design', 'construction_drawings', 'equipment_list'],
      },
      procurement: {
        inputs: ['equipment_list', 'construction_drawings'],
        outputs: ['procurement_plan', 'purchase_orders', 'equipment_contracts'],
      },
      construction: {
        inputs: ['construction_drawings', 'equipment_contracts'],
        outputs: ['construction_logs', 'quality_records', 'inspection_reports'],
      },
      commissioning: {
        inputs: ['construction_logs', 'equipment_contracts'],
        outputs: ['commissioning_reports', 'performance_test_results'],
      },
      acceptance: {
        inputs: ['quality_records', 'commissioning_reports'],
        outputs: ['acceptance_reports', 'completion_certificate'],
      },
      handover: {
        inputs: ['acceptance_reports', 'completion_certificate'],
        outputs: ['handover_documents', 'training_records'],
      },
      closure: {
        inputs: ['handover_documents'],
        outputs: ['project_summary', 'lessons_learned'],
      },
    };
  }
}

// 导出单例实例创建函数
let workflowManagerInstance: ProjectWorkflowManager | null = null;

export function getWorkflowManager(projectId: string): ProjectWorkflowManager {
  if (!workflowManagerInstance || workflowManagerInstance['projectId'] !== projectId) {
    workflowManagerInstance = new ProjectWorkflowManager(projectId);
  }
  return workflowManagerInstance;
}

export function resetWorkflowManager(): void {
  workflowManagerInstance = null;
}
