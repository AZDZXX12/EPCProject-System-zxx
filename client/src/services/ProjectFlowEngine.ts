/**
 * 项目流程引擎 - 统一管理所有模块的协同工作流
 * 实现模块间深度集成和数据流转
 */

import { eventBus, EVENTS } from '../utils/EventBus';
import { taskApi } from './api';
import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';
import { aiScheduler } from '../utils/aiScheduler';
import { resourceManager } from '../utils/resourceManagement';
import { CriticalPathAnalyzer } from '../utils/criticalPath';

// ==================== 类型定义 ====================

export interface ProjectPhase {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'active' | 'completed';
  modules: string[];
  deliverables: string[];
  gates: GateCondition[];
  startDate?: Date;
  endDate?: Date;
  progress: number;
}

export interface GateCondition {
  id: string;
  type: 'document' | 'approval' | 'milestone' | 'quality' | 'payment';
  description: string;
  required: boolean;
  status: 'pending' | 'passed' | 'failed';
  checker?: string;
  checkDate?: Date;
}

export interface ModuleFlow {
  sourceModule: string;
  targetModule: string;
  dataType: string;
  trigger: 'auto' | 'manual' | 'event' | 'schedule';
  condition?: string;
  transformer?: (data: any) => any;
}

export interface WorkflowStep {
  id: string;
  name: string;
  module: string;
  action: string;
  inputs: any;
  outputs: any;
  status: 'waiting' | 'running' | 'completed' | 'failed';
  dependencies: string[];
  nextSteps: string[];
}

export interface ProjectContext {
  projectId: string;
  currentPhase: string;
  activeModules: Set<string>;
  moduleStates: Map<string, any>;
  globalData: Map<string, any>;
  flowHistory: WorkflowStep[];
}

// ==================== 项目流程引擎 ====================

export class ProjectFlowEngine {
  private static instance: ProjectFlowEngine;
  private context: ProjectContext | null = null;
  private phases: ProjectPhase[] = [];
  private moduleFlows: ModuleFlow[] = [];
  private workflows: Map<string, WorkflowStep[]> = new Map();
  private moduleHandlers: Map<string, any> = new Map();
  
  private constructor() {
    this.initializePhases();
    this.initializeFlows();
    this.registerEventHandlers();
  }
  
  static getInstance(): ProjectFlowEngine {
    if (!ProjectFlowEngine.instance) {
      ProjectFlowEngine.instance = new ProjectFlowEngine();
    }
    return ProjectFlowEngine.instance;
  }
  
  /**
   * 初始化项目阶段
   */
  private initializePhases(): void {
    this.phases = [
      {
        id: 'phase-1',
        name: '项目启动',
        order: 1,
        status: 'pending',
        modules: ['workspace', 'project-lifecycle'],
        deliverables: ['项目章程', '可行性研究报告', '项目计划书'],
        gates: [
          {
            id: 'gate-1-1',
            type: 'document',
            description: '项目章程审批',
            required: true,
            status: 'pending'
          },
          {
            id: 'gate-1-2',
            type: 'approval',
            description: '管理层批准',
            required: true,
            status: 'pending'
          }
        ],
        progress: 0
      },
      {
        id: 'phase-2',
        name: '设计阶段',
        order: 2,
        status: 'pending',
        modules: ['tasks', 'equipment-selection', 'knowledge-base'],
        deliverables: ['初步设计', '详细设计', '设备选型清单'],
        gates: [
          {
            id: 'gate-2-1',
            type: 'quality',
            description: '设计评审',
            required: true,
            status: 'pending'
          },
          {
            id: 'gate-2-2',
            type: 'milestone',
            description: '设计冻结',
            required: true,
            status: 'pending'
          }
        ],
        progress: 0
      },
      {
        id: 'phase-3',
        name: '采购阶段',
        order: 3,
        status: 'pending',
        modules: ['procurement', 'material-price', 'suppliers'],
        deliverables: ['采购计划', '合同文件', '供应商评估报告'],
        gates: [
          {
            id: 'gate-3-1',
            type: 'approval',
            description: '采购审批',
            required: true,
            status: 'pending'
          }
        ],
        progress: 0
      },
      {
        id: 'phase-4',
        name: '施工阶段',
        order: 4,
        status: 'pending',
        modules: ['construction', 'safety', 'quality', 'tasks'],
        deliverables: ['施工日志', '质量检查报告', '安全巡检记录'],
        gates: [
          {
            id: 'gate-4-1',
            type: 'quality',
            description: '质量验收',
            required: true,
            status: 'pending'
          },
          {
            id: 'gate-4-2',
            type: 'milestone',
            description: '关键节点完成',
            required: true,
            status: 'pending'
          }
        ],
        progress: 0
      },
      {
        id: 'phase-5',
        name: '调试阶段',
        order: 5,
        status: 'pending',
        modules: ['devices', 'digital-twin', 'monitoring'],
        deliverables: ['调试报告', '性能测试报告', '运行记录'],
        gates: [
          {
            id: 'gate-5-1',
            type: 'quality',
            description: '性能验收',
            required: true,
            status: 'pending'
          }
        ],
        progress: 0
      },
      {
        id: 'phase-6',
        name: '验收交付',
        order: 6,
        status: 'pending',
        modules: ['reports', 'documents', 'handover'],
        deliverables: ['竣工报告', '质保文件', '操作手册'],
        gates: [
          {
            id: 'gate-6-1',
            type: 'approval',
            description: '最终验收',
            required: true,
            status: 'pending'
          }
        ],
        progress: 0
      }
    ];
  }
  
  /**
   * 初始化模块间数据流
   */
  private initializeFlows(): void {
    this.moduleFlows = [
      // 任务管理 -> 施工管理
      {
        sourceModule: 'tasks',
        targetModule: 'construction',
        dataType: 'task_progress',
        trigger: 'event',
        transformer: (data) => ({
          taskId: data.id,
          taskName: data.name,
          progress: data.progress,
          assignee: data.assignee,
          updateTime: new Date()
        })
      },
      // 施工管理 -> 质量管理
      {
        sourceModule: 'construction',
        targetModule: 'quality',
        dataType: 'quality_check',
        trigger: 'auto',
        condition: 'daily_report_submitted',
        transformer: (data) => ({
          constructionId: data.id,
          checkPoints: data.qualityPoints,
          inspector: data.supervisor,
          date: data.date
        })
      },
      // 质量管理 -> 任务管理
      {
        sourceModule: 'quality',
        targetModule: 'tasks',
        dataType: 'quality_issue',
        trigger: 'event',
        transformer: (data) => ({
          type: 'quality_task',
          name: `质量整改: ${data.issue}`,
          priority: 'high',
          assignee: data.responsible,
          dueDate: data.deadline
        })
      },
      // 采购管理 -> 材料价格
      {
        sourceModule: 'procurement',
        targetModule: 'material-price',
        dataType: 'price_inquiry',
        trigger: 'manual',
        transformer: (data) => ({
          materials: data.items,
          quantities: data.quantities,
          urgency: data.priority,
          budget: data.budget
        })
      },
      // 设备管理 -> 数字孪生
      {
        sourceModule: 'devices',
        targetModule: 'digital-twin',
        dataType: 'device_status',
        trigger: 'schedule',
        transformer: (data) => ({
          deviceId: data.id,
          status: data.status,
          parameters: data.realTimeData,
          timestamp: new Date()
        })
      },
      // 安全管理 -> 施工管理
      {
        sourceModule: 'safety',
        targetModule: 'construction',
        dataType: 'safety_alert',
        trigger: 'event',
        transformer: (data) => ({
          alertLevel: data.severity,
          location: data.area,
          measures: data.actions,
          deadline: data.responseTime
        })
      }
    ];
  }
  
  /**
   * 注册事件处理器
   */
  private registerEventHandlers(): void {
    // 任务更新事件
    eventBus.on(EVENTS.TASK_UPDATED, (data) => {
      this.handleTaskUpdate(data);
    });
    
    // 施工日志提交
    eventBus.on(EVENTS.CONSTRUCTION_LOG_SUBMITTED, (data) => {
      this.handleConstructionLog(data);
    });
    
    // 质量问题发现
    eventBus.on(EVENTS.QUALITY_ISSUE_FOUND, (data) => {
      this.handleQualityIssue(data);
    });
    
    // 采购申请
    eventBus.on(EVENTS.PROCUREMENT_REQUEST, (data) => {
      this.handleProcurementRequest(data);
    });
    
    // 安全预警
    eventBus.on(EVENTS.SAFETY_ALERT, (data) => {
      this.handleSafetyAlert(data);
    });
    
    // 阶段转换
    eventBus.on(EVENTS.PHASE_TRANSITION, (data) => {
      this.handlePhaseTransition(data);
    });
  }
  
  /**
   * 初始化项目上下文
   */
  initializeProject(projectId: string): void {
    this.context = {
      projectId,
      currentPhase: 'phase-1',
      activeModules: new Set(),
      moduleStates: new Map(),
      globalData: new Map(),
      flowHistory: []
    };
    
    // 激活第一阶段的模块
    const firstPhase = this.phases[0];
    firstPhase.modules.forEach(module => {
      this.activateModule(module);
    });
    
    // 保存上下文
    this.saveContext();
    
    logger.info('[FlowEngine] 项目初始化完成', { projectId });
  }
  
  /**
   * 激活模块
   */
  private activateModule(moduleId: string): void {
    if (!this.context) return;
    
    this.context.activeModules.add(moduleId);
    
    // 初始化模块状态
    this.context.moduleStates.set(moduleId, {
      active: true,
      lastUpdate: new Date(),
      data: {}
    });
    
    // 通知模块激活
    eventBus.emit(EVENTS.MODULE_ACTIVATED, { moduleId });
    
    logger.info('[FlowEngine] 模块激活', { moduleId });
  }
  
  /**
   * 处理任务更新
   */
  private async handleTaskUpdate(data: any): Promise<void> {
    if (!this.context) return;
    
    // 记录到流程历史
    const step: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: '任务更新',
      module: 'tasks',
      action: 'update',
      inputs: data,
      outputs: null,
      status: 'running',
      dependencies: [],
      nextSteps: []
    };
    
    this.context.flowHistory.push(step);
    
    // 查找相关的数据流
    const flows = this.moduleFlows.filter(
      f => f.sourceModule === 'tasks' && f.trigger === 'event'
    );
    
    // 执行数据流转
    for (const flow of flows) {
      await this.executeFlow(flow, data);
    }
    
    // 更新步骤状态
    step.status = 'completed';
    
    // 检查是否需要AI优化
    if (data.type === 'schedule_change') {
      await this.triggerAIOptimization();
    }
    
    // 保存上下文
    this.saveContext();
  }
  
  /**
   * 处理施工日志
   */
  private async handleConstructionLog(data: any): Promise<void> {
    if (!this.context) return;
    
    // 更新施工进度
    const progress = data.progress || 0;
    
    // 同步到任务管理
    const taskFlow = this.moduleFlows.find(
      f => f.sourceModule === 'construction' && 
           f.targetModule === 'tasks' &&
           f.dataType === 'progress_update'
    );
    
    if (taskFlow) {
      await this.executeFlow(taskFlow, {
        progress,
        date: data.date,
        workItems: data.workItems
      });
    }
    
    // 触发质量检查
    if (data.qualityCheckRequired) {
      const qualityFlow = this.moduleFlows.find(
        f => f.sourceModule === 'construction' && 
             f.targetModule === 'quality'
      );
      
      if (qualityFlow) {
        await this.executeFlow(qualityFlow, data);
      }
    }
    
    // 更新阶段进度
    await this.updatePhaseProgress();
  }
  
  // 其他方法见 ProjectFlowEngineHandlers.ts
  
  /**
   * 保存上下文
   */
  private saveContext(): void {
    if (!this.context) return;
    
    StorageManager.save('project_context', {
      projectId: this.context.projectId,
      currentPhase: this.context.currentPhase,
      activeModules: Array.from(this.context.activeModules),
      moduleStates: Array.from(this.context.moduleStates.entries()),
      globalData: Array.from(this.context.globalData.entries()),
      flowHistory: this.context.flowHistory.slice(-100) // 只保留最近100条
    });
  }
  
  /**
   * 恢复上下文
   */
  restoreContext(): boolean {
    const saved = StorageManager.load<any>('project_context');
    if (!saved) return false;
    
    this.context = {
      projectId: saved.projectId,
      currentPhase: saved.currentPhase,
      activeModules: new Set(saved.activeModules),
      moduleStates: new Map(saved.moduleStates),
      globalData: new Map(saved.globalData),
      flowHistory: saved.flowHistory || []
    };
    
    return true;
  }
  
  /**
   * 获取当前阶段信息
   */
  getCurrentPhase(): ProjectPhase | null {
    if (!this.context) return null;
    return this.phases.find(p => p.id === this.context?.currentPhase) || null;
  }
  
  /**
   * 获取所有阶段
   */
  getAllPhases(): ProjectPhase[] {
    return this.phases;
  }
  
  /**
   * 检查阶段门条件
   */
  checkPhaseGates(phaseId: string): boolean {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return false;
    
    return phase.gates.every(gate => 
      gate.status === 'passed' || !gate.required
    );
  }
  
  /**
   * 更新阶段门状态
   */
  updateGateStatus(phaseId: string, gateId: string, status: 'passed' | 'failed'): void {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return;
    
    const gate = phase.gates.find(g => g.id === gateId);
    if (gate) {
      gate.status = status;
      gate.checkDate = new Date();
      this.saveContext();
    }
  }
  
  /**
   * 执行数据流
   */
  private async executeFlow(flow: ModuleFlow, data: any): Promise<void> {
    try {
      // 转换数据
      const transformedData = flow.transformer 
        ? flow.transformer(data)
        : data;
      
      // 发送到目标模块
      eventBus.emit(`${flow.targetModule}_receive_data`, {
        source: flow.sourceModule,
        dataType: flow.dataType,
        data: transformedData
      });
      
      logger.info('[FlowEngine] 数据流执行', {
        from: flow.sourceModule,
        to: flow.targetModule,
        dataType: flow.dataType
      });
    } catch (error) {
      logger.error('[FlowEngine] 数据流执行失败', error);
    }
  }
  
  /**
   * 触发AI优化
   */
  private async triggerAIOptimization(): Promise<void> {
    logger.info('[FlowEngine] 触发AI优化');
    
    // 获取所有任务
    const tasks = (await taskApi.getAll(this.context?.projectId)) as any[];
    
    // 执行优化
    aiScheduler.loadTasks(tasks);
    const result = await aiScheduler.optimizeSchedule();
    
    // 应用优化结果
    if (result.improvements.durationReduction > 5) {
      eventBus.emit(EVENTS.SCHEDULE_OPTIMIZED, {
        optimizedSchedule: result.optimizedSchedule,
        improvements: result.improvements,
        suggestions: result.suggestions
      });
    }
  }
  
  /**
   * 更新阶段进度
   */
  private async updatePhaseProgress(): Promise<void> {
    const currentPhase = this.phases.find(
      p => p.id === this.context?.currentPhase
    );
    
    if (!currentPhase) return;
    
    // 计算进度
    let totalProgress = 0;
    let count = 0;
    
    for (const moduleId of currentPhase.modules) {
      const state = this.context?.moduleStates.get(moduleId);
      if (state?.data?.progress !== undefined) {
        totalProgress += state.data.progress;
        count++;
      }
    }
    
    currentPhase.progress = count > 0 ? totalProgress / count : 0;
    
    // 检查是否可以进入下一阶段
    if (currentPhase.progress >= 100) {
      const allGatesPassed = currentPhase.gates.every(
        g => g.status === 'passed' || !g.required
      );
      
      if (allGatesPassed) {
        const nextPhase = this.phases.find(
          p => p.order === currentPhase.order + 1
        );
        
        if (nextPhase) {
          eventBus.emit(EVENTS.PHASE_READY_FOR_TRANSITION, {
            currentPhase: currentPhase.id,
            nextPhase: nextPhase.id
          });
        }
      }
    }
  }
  
  // 处理质量问题等其他方法见其他文件
  private handleQualityIssue(data: any): void {
    // 实现见 ProjectFlowEngineHandlers.ts
  }
  
  private handleProcurementRequest(data: any): void {
    // 实现见 ProjectFlowEngineHandlers.ts
  }
  
  private handleSafetyAlert(data: any): void {
    // 实现见 ProjectFlowEngineHandlers.ts
  }
  
  private handlePhaseTransition(data: any): void {
    // 实现见 ProjectFlowEngineHandlers.ts
  }
}

// 导出单例
export const projectFlowEngine = ProjectFlowEngine.getInstance();
