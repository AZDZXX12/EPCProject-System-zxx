/**
 * 项目生命周期服务 - 增强版
 * 整合Zustand状态管理和EventBus，实现完整的项目流程管理
 */

import {
  ProjectPhase,
  PhaseStatus,
  ProjectPhaseData,
  DeliverableItem,
  MilestoneItem,
  RiskItem,
  PhaseDeliverables,
  getNextPhase,
  canTransitionToPhase,
  calculatePhaseProgress,
} from '../types/projectLifecycle';
import { eventBus, EVENTS } from '../utils/EventBus';
import { useProjectStore } from '../store/projectStore';
import { message } from 'antd';

/**
 * 项目生命周期管理服务
 */
export class ProjectLifecycleService {
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  /**
   * 初始化项目生命周期
   */
  initializeLifecycle(): ProjectPhaseData[] {
    const allPhases = Object.values(ProjectPhase);
    return allPhases.map((phase, index) => ({
      phase,
      status: index === 0 ? PhaseStatus.IN_PROGRESS : PhaseStatus.NOT_STARTED,
      progress: index === 0 ? 0 : 0,
      startDate: index === 0 ? new Date().toISOString().split('T')[0] : undefined,
      deliverables: this.initializeDeliverables(phase),
      milestones: [],
      risks: [],
    }));
  }

  /**
   * 初始化阶段交付物
   */
  private initializeDeliverables(phase: ProjectPhase): DeliverableItem[] {
    return PhaseDeliverables[phase].map((name, idx) => ({
      id: `${phase}-deliverable-${idx}-${Date.now()}`,
      name,
      status: 'pending',
    }));
  }

  /**
   * 阶段转换
   */
  async transitionToNextPhase(
    currentPhase: ProjectPhase,
    phases: ProjectPhaseData[]
  ): Promise<{ success: boolean; message: string; nextPhase?: ProjectPhase }> {
    const nextPhase = getNextPhase(currentPhase);
    
    if (!nextPhase) {
      return { success: false, message: '当前已是最后阶段' };
    }

    // 检查当前阶段是否可以转换
    const currentPhaseData = phases.find((p) => p.phase === currentPhase);
    if (!currentPhaseData) {
      return { success: false, message: '未找到当前阶段数据' };
    }

    // 检查交付物完成情况
    const completionRate = this.calculateDeliverableCompletion(currentPhaseData);
    if (completionRate < 80) {
      return {
        success: false,
        message: `当前阶段交付物完成率仅${completionRate}%，建议至少完成80%后再转换`,
      };
    }

    // 检查是否有高风险项未关闭
    const openHighRisks = currentPhaseData.risks.filter(
      (r) => r.status !== 'closed' && (r.probability === 'high' || r.impact === 'high')
    );
    if (openHighRisks.length > 0) {
      return {
        success: false,
        message: `当前阶段还有${openHighRisks.length}个高风险项未关闭`,
      };
    }

    // 执行阶段转换
    const updatedPhases = phases.map((p) => {
      if (p.phase === currentPhase) {
        return {
          ...p,
          status: PhaseStatus.COMPLETED,
          progress: 100,
          endDate: new Date().toISOString().split('T')[0],
        };
      }
      if (p.phase === nextPhase) {
        return {
          ...p,
          status: PhaseStatus.IN_PROGRESS,
          startDate: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });

    // 触发EventBus事件
    eventBus.emit(EVENTS.PHASE_CHANGED, {
      projectId: this.projectId,
      fromPhase: currentPhase,
      toPhase: nextPhase,
      timestamp: new Date().toISOString(),
    });

    // 触发阶段完成事件
    eventBus.emit(EVENTS.PHASE_COMPLETED, {
      projectId: this.projectId,
      phase: currentPhase,
      completionRate,
      timestamp: new Date().toISOString(),
    });

    // 触发阶段开始事件
    eventBus.emit(EVENTS.PHASE_STARTED, {
      projectId: this.projectId,
      phase: nextPhase,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: '阶段转换成功',
      nextPhase,
    };
  }

  /**
   * 计算交付物完成率
   */
  calculateDeliverableCompletion(phaseData: ProjectPhaseData): number {
    if (phaseData.deliverables.length === 0) return 100;
    
    const completedCount = phaseData.deliverables.filter(
      (d) => d.status === 'completed'
    ).length;
    
    return Math.round((completedCount / phaseData.deliverables.length) * 100);
  }

  /**
   * 更新交付物状态
   */
  updateDeliverable(
    phases: ProjectPhaseData[],
    phaseKey: ProjectPhase,
    deliverableId: string,
    updates: Partial<DeliverableItem>
  ): ProjectPhaseData[] {
    const updatedPhases = phases.map((p) => {
      if (p.phase === phaseKey) {
        const updatedDeliverables = p.deliverables.map((d) =>
          d.id === deliverableId ? { ...d, ...updates } : d
        );
        const newProgress = calculatePhaseProgress({ ...p, deliverables: updatedDeliverables });
        
        // 触发交付物更新事件
        eventBus.emit(EVENTS.DELIVERABLE_UPDATED, {
          projectId: this.projectId,
          phase: phaseKey,
          deliverableId,
          updates,
          timestamp: new Date().toISOString(),
        });

        return { ...p, deliverables: updatedDeliverables, progress: newProgress };
      }
      return p;
    });

    return updatedPhases;
  }

  /**
   * 添加里程碑
   */
  addMilestone(
    phases: ProjectPhaseData[],
    phaseKey: ProjectPhase,
    milestone: Omit<MilestoneItem, 'id'>
  ): ProjectPhaseData[] {
    const newMilestone: MilestoneItem = {
      ...milestone,
      id: `milestone-${Date.now()}`,
    };

    const updatedPhases = phases.map((p) => {
      if (p.phase === phaseKey) {
        return {
          ...p,
          milestones: [...p.milestones, newMilestone],
        };
      }
      return p;
    });

    // 触发里程碑添加事件
    eventBus.emit(EVENTS.MILESTONE_CREATED, {
      projectId: this.projectId,
      phase: phaseKey,
      milestone: newMilestone,
      timestamp: new Date().toISOString(),
    });

    return updatedPhases;
  }

  /**
   * 更新里程碑状态
   */
  updateMilestone(
    phases: ProjectPhaseData[],
    phaseKey: ProjectPhase,
    milestoneId: string,
    updates: Partial<MilestoneItem>
  ): ProjectPhaseData[] {
    const updatedPhases = phases.map((p) => {
      if (p.phase === phaseKey) {
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, ...updates } : m
        );
        return { ...p, milestones: updatedMilestones };
      }
      return p;
    });

    // 触发里程碑更新事件
    eventBus.emit(EVENTS.MILESTONE_UPDATED, {
      projectId: this.projectId,
      phase: phaseKey,
      milestoneId,
      updates,
      timestamp: new Date().toISOString(),
    });

    return updatedPhases;
  }

  /**
   * 添加风险
   */
  addRisk(
    phases: ProjectPhaseData[],
    phaseKey: ProjectPhase,
    risk: Omit<RiskItem, 'id'>
  ): ProjectPhaseData[] {
    const newRisk: RiskItem = {
      ...risk,
      id: `risk-${Date.now()}`,
    };

    const updatedPhases = phases.map((p) => {
      if (p.phase === phaseKey) {
        return {
          ...p,
          risks: [...p.risks, newRisk],
        };
      }
      return p;
    });

    // 触发风险添加事件
    eventBus.emit(EVENTS.RISK_IDENTIFIED, {
      projectId: this.projectId,
      phase: phaseKey,
      risk: newRisk,
      timestamp: new Date().toISOString(),
    });

    // 如果是高风险，发送警告通知
    if (risk.probability === 'high' || risk.impact === 'high') {
      message.warning(`识别到高风险项：${risk.description}`);
    }

    return updatedPhases;
  }

  /**
   * 更新风险状态
   */
  updateRisk(
    phases: ProjectPhaseData[],
    phaseKey: ProjectPhase,
    riskId: string,
    updates: Partial<RiskItem>
  ): ProjectPhaseData[] {
    const updatedPhases = phases.map((p) => {
      if (p.phase === phaseKey) {
        const updatedRisks = p.risks.map((r) =>
          r.id === riskId ? { ...r, ...updates } : r
        );
        return { ...p, risks: updatedRisks };
      }
      return p;
    });

    // 触发风险更新事件
    eventBus.emit(EVENTS.RISK_UPDATED, {
      projectId: this.projectId,
      phase: phaseKey,
      riskId,
      updates,
      timestamp: new Date().toISOString(),
    });

    return updatedPhases;
  }

  /**
   * 生成阶段报告
   */
  generatePhaseReport(phaseData: ProjectPhaseData): {
    summary: string;
    completionRate: number;
    risks: number;
    milestones: { total: number; achieved: number };
    recommendations: string[];
  } {
    const completionRate = this.calculateDeliverableCompletion(phaseData);
    const openRisks = phaseData.risks.filter((r) => r.status !== 'closed').length;
    const achievedMilestones = phaseData.milestones.filter((m) => m.status === 'achieved').length;

    const recommendations: string[] = [];

    if (completionRate < 50) {
      recommendations.push('交付物完成率较低，建议加快进度');
    }

    if (openRisks > 3) {
      recommendations.push(`当前有${openRisks}个未关闭风险，建议重点关注`);
    }

    if (phaseData.milestones.length > 0 && achievedMilestones === 0) {
      recommendations.push('尚未达成任何里程碑，建议检查项目进度');
    }

    return {
      summary: `阶段进度${phaseData.progress}%，交付物完成率${completionRate}%`,
      completionRate,
      risks: openRisks,
      milestones: {
        total: phaseData.milestones.length,
        achieved: achievedMilestones,
      },
      recommendations,
    };
  }

  /**
   * 检查阶段健康度
   */
  checkPhaseHealth(phaseData: ProjectPhaseData): {
    score: number;
    level: 'excellent' | 'good' | 'warning' | 'critical';
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查交付物完成率
    const completionRate = this.calculateDeliverableCompletion(phaseData);
    if (completionRate < 30) {
      score -= 30;
      issues.push('交付物完成率过低');
    } else if (completionRate < 60) {
      score -= 15;
      issues.push('交付物完成率偏低');
    }

    // 检查风险
    const highRisks = phaseData.risks.filter(
      (r) => r.status !== 'closed' && (r.probability === 'high' || r.impact === 'high')
    );
    if (highRisks.length > 0) {
      score -= highRisks.length * 10;
      issues.push(`存在${highRisks.length}个高风险项`);
    }

    // 检查里程碑延期
    const delayedMilestones = phaseData.milestones.filter((m) => m.status === 'delayed');
    if (delayedMilestones.length > 0) {
      score -= delayedMilestones.length * 5;
      issues.push(`有${delayedMilestones.length}个里程碑延期`);
    }

    // 确定健康等级
    let level: 'excellent' | 'good' | 'warning' | 'critical';
    if (score >= 90) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 50) level = 'warning';
    else level = 'critical';

    return { score: Math.max(0, score), level, issues };
  }
}

/**
 * 模块衔接检查器
 */
export class ModuleIntegrationChecker {
  /**
   * 检查设计→采购衔接
   */
  static checkDesignToProcurement(designPhase: ProjectPhaseData): {
    ready: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    const equipmentList = designPhase.deliverables.find((d) => d.name.includes('设备选型'));
    if (!equipmentList || equipmentList.status !== 'completed') {
      missing.push('设备选型清单未完成');
    }

    const drawings = designPhase.deliverables.find((d) => d.name.includes('施工图'));
    if (!drawings || drawings.status !== 'completed') {
      missing.push('施工图设计未完成');
    }

    return {
      ready: missing.length === 0,
      missing,
    };
  }

  /**
   * 检查采购→施工衔接
   */
  static checkProcurementToConstruction(procurementPhase: ProjectPhaseData): {
    ready: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    const contracts = procurementPhase.deliverables.find((d) => d.name.includes('采购合同'));
    if (!contracts || contracts.status !== 'completed') {
      missing.push('采购合同未签订');
    }

    const arrival = procurementPhase.deliverables.find((d) => d.name.includes('到货验收'));
    if (!arrival || arrival.status !== 'completed') {
      missing.push('设备未到货验收');
    }

    return {
      ready: missing.length === 0,
      missing,
    };
  }

  /**
   * 检查施工→调试衔接
   */
  static checkConstructionToCommissioning(constructionPhase: ProjectPhaseData): {
    ready: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    const qualityRecords = constructionPhase.deliverables.find((d) => d.name.includes('质量检验'));
    if (!qualityRecords || qualityRecords.status !== 'completed') {
      missing.push('质量检验记录不完整');
    }

    const safetyCheck = constructionPhase.deliverables.find((d) => d.name.includes('安全检查'));
    if (!safetyCheck || safetyCheck.status !== 'completed') {
      missing.push('安全检查未完成');
    }

    return {
      ready: missing.length === 0,
      missing,
    };
  }

  /**
   * 全面检查模块衔接
   */
  static checkAllIntegrations(phases: ProjectPhaseData[]): {
    phase: ProjectPhase;
    nextPhase: ProjectPhase;
    ready: boolean;
    missing: string[];
  }[] {
    const results: {
      phase: ProjectPhase;
      nextPhase: ProjectPhase;
      ready: boolean;
      missing: string[];
    }[] = [];

    const designPhase = phases.find((p) => p.phase === ProjectPhase.DESIGN);
    if (designPhase) {
      const check = this.checkDesignToProcurement(designPhase);
      results.push({
        phase: ProjectPhase.DESIGN,
        nextPhase: ProjectPhase.PROCUREMENT,
        ...check,
      });
    }

    const procurementPhase = phases.find((p) => p.phase === ProjectPhase.PROCUREMENT);
    if (procurementPhase) {
      const check = this.checkProcurementToConstruction(procurementPhase);
      results.push({
        phase: ProjectPhase.PROCUREMENT,
        nextPhase: ProjectPhase.CONSTRUCTION,
        ...check,
      });
    }

    const constructionPhase = phases.find((p) => p.phase === ProjectPhase.CONSTRUCTION);
    if (constructionPhase) {
      const check = this.checkConstructionToCommissioning(constructionPhase);
      results.push({
        phase: ProjectPhase.CONSTRUCTION,
        nextPhase: ProjectPhase.COMMISSIONING,
        ...check,
      });
    }

    return results;
  }
}
