/**
 * 质量管理服务
 * 提供完整的质量管理体系（PDCA循环、ISO 9001）
 */

import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';
import { eventBus, EVENTS } from '../utils/EventBus';

// ==================== 类型定义 ====================

export interface QualityPlan {
  id: string;
  projectId: string;
  title: string;
  version: string;
  effectiveDate: string;
  standards: QualityStandard[];
  procedures: QualityProcedure[];
  checkpoints: QualityCheckpoint[];
  responsibilities: QualityResponsibility[];
  resources: QualityResource[];
  kpis: QualityKPI[];
  status: 'draft' | 'approved' | 'active' | 'obsolete';
  approvedBy?: string;
  approvalDate?: string;
  reviewSchedule: string;
  nextReviewDate: string;
}

export interface QualityStandard {
  id: string;
  name: string;
  code: string;
  type: 'international' | 'national' | 'industry' | 'company';
  description: string;
  requirements: string[];
  applicableAreas: string[];
  complianceStatus: 'compliant' | 'partial' | 'non_compliant' | 'na';
  lastAuditDate?: string;
}

export interface QualityProcedure {
  id: string;
  name: string;
  code: string;
  category: ProcedureCategory;
  description: string;
  steps: ProcedureStep[];
  forms: string[];
  approvalLevel: string;
  effectiveDate: string;
  revision: string;
}

export type ProcedureCategory = 
  | 'material_inspection'    // 材料检验
  | 'process_control'        // 过程控制
  | 'product_testing'        // 产品测试
  | 'equipment_calibration'  // 设备校准
  | 'document_control'       // 文档控制
  | 'nonconformance'        // 不合格品控制
  | 'corrective_action'     // 纠正措施
  | 'preventive_action';    // 预防措施

export interface ProcedureStep {
  sequence: number;
  description: string;
  responsible: string;
  checkMethod: string;
  acceptanceCriteria: string;
  records: string[];
}

export interface QualityCheckpoint {
  id: string;
  name: string;
  phase: ProjectPhase;
  type: 'hold' | 'witness' | 'review' | 'surveillance';
  description: string;
  criteria: string[];
  frequency: string;
  responsible: string;
  notificationRequired: string[];
  mandatory: boolean;
}

export type ProjectPhase = 
  | 'design' | 'procurement' | 'manufacturing' 
  | 'installation' | 'testing' | 'commissioning';

export interface QualityResponsibility {
  role: string;
  department: string;
  responsibilities: string[];
  authorities: string[];
  qualifications: string[];
}

export interface QualityResource {
  type: 'equipment' | 'software' | 'personnel' | 'facility';
  name: string;
  specification: string;
  quantity: number;
  status: 'available' | 'pending' | 'na';
  calibrationStatus?: 'valid' | 'expired' | 'due_soon';
  nextCalibrationDate?: string;
}

export interface QualityKPI {
  id: string;
  name: string;
  description: string;
  formula: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  currentValue?: number;
  trend?: 'improving' | 'stable' | 'declining';
  responsible: string;
}

export interface QualityInspection {
  id: string;
  type: InspectionType;
  itemName: string;
  itemCode: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  supplier?: string;
  inspectionDate: string;
  inspector: string;
  standard: string;
  method: string;
  parameters: InspectionParameter[];
  result: 'pass' | 'fail' | 'conditional' | 'pending';
  defects: Defect[];
  disposition?: 'accept' | 'reject' | 'rework' | 'concession';
  certificateNumber?: string;
  attachments: string[];
  remarks?: string;
  followUpRequired: boolean;
}

export type InspectionType = 
  | 'incoming'     // 进料检验
  | 'in_process'   // 过程检验
  | 'final'        // 最终检验
  | 'witness'      // 见证检验
  | 'third_party'; // 第三方检验

export interface InspectionParameter {
  name: string;
  specification: string;
  measuredValue: string;
  result: 'pass' | 'fail' | 'na';
  deviation?: number;
  comments?: string;
}

export interface Defect {
  id: string;
  type: 'critical' | 'major' | 'minor';
  description: string;
  quantity: number;
  location?: string;
  photo?: string;
  rootCause?: string;
  correctiveAction?: string;
}

export interface NCR { // Non-Conformance Report
  id: string;
  number: string;
  issueDate: string;
  issuer: string;
  source: NCRSource;
  category: NCRCategory;
  description: string;
  affectedItems: AffectedItem[];
  immediateAction?: string;
  rootCauseAnalysis?: RootCauseAnalysis;
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  status: NCRStatus;
  verificationDate?: string;
  verifiedBy?: string;
  closureDate?: string;
  cost?: number;
}

export type NCRSource = 
  | 'inspection' | 'audit' | 'customer_complaint' 
  | 'supplier' | 'production' | 'testing';

export type NCRCategory = 
  | 'material' | 'workmanship' | 'design' | 'documentation' 
  | 'procedure' | 'equipment' | 'safety' | 'environmental';

export type NCRStatus = 
  | 'open' | 'investigating' | 'action_planned' 
  | 'action_in_progress' | 'verification' | 'closed';

export interface AffectedItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  batchNumber?: string;
  location: string;
  disposition: 'quarantine' | 'scrap' | 'rework' | 'use_as_is';
}

export interface RootCauseAnalysis {
  method: 'fishbone' | '5why' | 'pareto' | 'fmea';
  findings: string[];
  primaryCause: string;
  contributingFactors: string[];
  analysisDate: string;
  analyst: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  effectiveness?: 'effective' | 'partial' | 'ineffective';
  evidence?: string;
}

export interface PreventiveAction {
  id: string;
  description: string;
  scope: string;
  responsible: string;
  implementationDate?: string;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
  monitoringPlan?: string;
}

export interface QualityAudit {
  id: string;
  type: AuditType;
  scope: string;
  standard: string;
  auditDate: string;
  leadAuditor: string;
  auditTeam: string[];
  areas: string[];
  findings: AuditFinding[];
  score?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  reportNumber?: string;
  reportDate?: string;
  followUpDate?: string;
  certificateStatus?: 'valid' | 'suspended' | 'withdrawn';
}

export type AuditType = 
  | 'internal' | 'external' | 'certification' 
  | 'supplier' | 'customer' | 'regulatory';

export interface AuditFinding {
  id: string;
  type: 'major_nc' | 'minor_nc' | 'observation' | 'improvement';
  clause: string;
  description: string;
  evidence: string;
  auditee: string;
  response?: string;
  correctiveAction?: string;
  targetDate?: string;
  status: 'open' | 'closed' | 'overdue';
}

export interface QualityStatistics {
  totalInspections: number;
  passRate: number;
  defectRate: number;
  ncrCount: number;
  openNcrs: number;
  auditScore: number;
  customerComplaints: number;
  supplierRating: number;
  processCapability: number;
  firstPassYield: number;
  costOfQuality: number;
  kpiAchievement: number;
}

// ==================== 质量管理服务 ====================

export class QualityService {
  private plans: Map<string, QualityPlan>;
  private inspections: Map<string, QualityInspection>;
  private ncrs: Map<string, NCR>;
  private audits: Map<string, QualityAudit>;
  private static instance: QualityService;

  private constructor() {
    this.plans = new Map();
    this.inspections = new Map();
    this.ncrs = new Map();
    this.audits = new Map();
    this.loadFromStorage();
  }

  static getInstance(): QualityService {
    if (!QualityService.instance) {
      QualityService.instance = new QualityService();
    }
    return QualityService.instance;
  }

  private loadFromStorage(): void {
    const plansData = StorageManager.load<QualityPlan[]>('quality_plans');
    if (plansData) {
      plansData.forEach(item => this.plans.set(item.id, item));
    }

    const inspectionsData = StorageManager.load<QualityInspection[]>('quality_inspections');
    if (inspectionsData) {
      inspectionsData.forEach(item => this.inspections.set(item.id, item));
    }

    const ncrsData = StorageManager.load<NCR[]>('quality_ncrs');
    if (ncrsData) {
      ncrsData.forEach(item => this.ncrs.set(item.id, item));
    }

    if (this.plans.size === 0) {
      this.initSampleData();
    }
  }

  private saveToStorage(): void {
    StorageManager.save('quality_plans', Array.from(this.plans.values()));
    StorageManager.save('quality_inspections', Array.from(this.inspections.values()));
    StorageManager.save('quality_ncrs', Array.from(this.ncrs.values()));
    StorageManager.save('quality_audits', Array.from(this.audits.values()));
  }

  private initSampleData(): void {
    const samplePlan: QualityPlan = {
      id: 'QP001',
      projectId: 'PROJ001',
      title: 'EPC项目质量管理计划',
      version: '2.0',
      effectiveDate: '2025-01-01',
      standards: [
        {
          id: 'STD001',
          name: 'ISO 9001:2015',
          code: 'ISO9001',
          type: 'international',
          description: '质量管理体系要求',
          requirements: ['文档控制', '过程控制', '持续改进'],
          applicableAreas: ['全项目'],
          complianceStatus: 'compliant',
          lastAuditDate: '2025-10-01',
        },
      ],
      procedures: [],
      checkpoints: [],
      responsibilities: [],
      resources: [],
      kpis: [
        {
          id: 'KPI001',
          name: '一次合格率',
          description: '首次检验合格的产品比例',
          formula: '合格数/总数*100',
          target: 95,
          unit: '%',
          frequency: 'monthly',
          currentValue: 96.5,
          trend: 'improving',
          responsible: '质量部',
        },
      ],
      status: 'active',
      approvedBy: '质量总监',
      approvalDate: '2025-01-01',
      reviewSchedule: '年度',
      nextReviewDate: '2026-01-01',
    };

    this.plans.set(samplePlan.id, samplePlan);
    this.saveToStorage();
  }

  // ==================== 质量计划管理 (PLAN) ====================

  createQualityPlan(plan: Omit<QualityPlan, 'id'>): QualityPlan {
    const id = `QP${Date.now()}`;
    const newPlan: QualityPlan = {
      ...plan,
      id,
      status: 'draft',
    };

    this.plans.set(id, newPlan);
    this.saveToStorage();
    
    logger.info('[QualityService] 质量计划创建', { id, title: plan.title });
    return newPlan;
  }

  updateQualityPlan(id: string, updates: Partial<QualityPlan>): boolean {
    const plan = this.plans.get(id);
    if (!plan) return false;

    Object.assign(plan, updates);
    this.plans.set(id, plan);
    this.saveToStorage();
    
    return true;
  }

  // ==================== 质量检验管理 (DO) ====================

  performInspection(inspection: Omit<QualityInspection, 'id'>): QualityInspection {
    const id = `INSP${Date.now()}`;
    const newInspection: QualityInspection = {
      ...inspection,
      id,
    };

    this.inspections.set(id, newInspection);
    this.saveToStorage();

    // 如果检验不合格，自动创建NCR
    if (inspection.result === 'fail') {
      this.createNCRFromInspection(newInspection);
    }

    eventBus.emit(EVENTS.QUALITY_CHECK_COMPLETED, {
      id,
      result: inspection.result,
      itemName: inspection.itemName,
    });

    return newInspection;
  }

  private createNCRFromInspection(inspection: QualityInspection): void {
    const ncr: Omit<NCR, 'id'> = {
      number: `NCR-${Date.now()}`,
      issueDate: new Date().toISOString(),
      issuer: inspection.inspector,
      source: 'inspection',
      category: 'material',
      description: `检验不合格：${inspection.itemName}`,
      affectedItems: [
        {
          itemCode: inspection.itemCode,
          itemName: inspection.itemName,
          quantity: inspection.quantity,
          batchNumber: inspection.batchNumber || '',
          location: '待定',
          disposition: 'quarantine',
        },
      ],
      correctiveActions: [],
      preventiveActions: [],
      status: 'open',
    };

    this.createNCR(ncr);
  }

  // ==================== 不合格控制 (CHECK) ====================

  createNCR(ncr: Omit<NCR, 'id'>): NCR {
    const id = `NCR${Date.now()}`;
    const newNCR: NCR = {
      ...ncr,
      id,
      status: 'open',
    };

    this.ncrs.set(id, newNCR);
    this.saveToStorage();

    eventBus.emit(EVENTS.QUALITY_ISSUE_FOUND, {
      id,
      description: ncr.description,
      category: ncr.category,
    });

    logger.warn('[QualityService] NCR创建', { id, category: ncr.category });
    return newNCR;
  }

  updateNCRStatus(id: string, status: NCRStatus): boolean {
    const ncr = this.ncrs.get(id);
    if (!ncr) return false;

    ncr.status = status;
    if (status === 'closed') {
      ncr.closureDate = new Date().toISOString();
    }

    this.ncrs.set(id, ncr);
    this.saveToStorage();
    
    return true;
  }

  getOpenNCRs(): NCR[] {
    return Array.from(this.ncrs.values()).filter(
      ncr => ncr.status !== 'closed'
    );
  }

  // ==================== 质量审核 (CHECK) ====================

  scheduleAudit(audit: Omit<QualityAudit, 'id'>): QualityAudit {
    const id = `AUD${Date.now()}`;
    const newAudit: QualityAudit = {
      ...audit,
      id,
      status: 'planned',
    };

    this.audits.set(id, newAudit);
    this.saveToStorage();
    
    return newAudit;
  }

  completeAudit(
    auditId: string,
    findings: AuditFinding[],
    score?: number
  ): boolean {
    const audit = this.audits.get(auditId);
    if (!audit) return false;

    audit.findings = findings;
    audit.score = score;
    audit.status = 'completed';
    audit.reportDate = new Date().toISOString();

    this.audits.set(auditId, audit);
    this.saveToStorage();

    // 统计不符合项
    const majorNCs = findings.filter(f => f.type === 'major_nc').length;
    const minorNCs = findings.filter(f => f.type === 'minor_nc').length;

    if (majorNCs > 0 || minorNCs > 5) {
      eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
        type: 'warning',
        message: '审核发现严重问题',
        description: `主要不符合: ${majorNCs}, 次要不符合: ${minorNCs}`,
      });
    }

    return true;
  }

  // ==================== 持续改进 (ACT) ====================

  implementCorrectiveAction(
    ncrId: string,
    action: CorrectiveAction
  ): boolean {
    const ncr = this.ncrs.get(ncrId);
    if (!ncr) return false;

    ncr.correctiveActions.push(action);
    ncr.status = 'action_in_progress';

    this.ncrs.set(ncrId, ncr);
    this.saveToStorage();
    
    return true;
  }

  verifyEffectiveness(
    ncrId: string,
    effectiveness: 'effective' | 'partial' | 'ineffective'
  ): boolean {
    const ncr = this.ncrs.get(ncrId);
    if (!ncr) return false;

    ncr.verificationDate = new Date().toISOString();
    
    if (effectiveness === 'effective') {
      ncr.status = 'closed';
      ncr.closureDate = new Date().toISOString();
    } else {
      ncr.status = 'action_planned';
      eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
        type: 'warning',
        message: 'NCR纠正措施无效',
        description: '需要重新制定纠正措施',
      });
    }

    this.ncrs.set(ncrId, ncr);
    this.saveToStorage();
    
    return true;
  }

  // ==================== 统计分析 ====================

  getQualityStatistics(): QualityStatistics {
    const inspections = Array.from(this.inspections.values());
    const ncrs = Array.from(this.ncrs.values());
    const audits = Array.from(this.audits.values());

    const passedInspections = inspections.filter(i => i.result === 'pass').length;
    const totalDefects = inspections.reduce((sum, i) => sum + i.defects.length, 0);

    const stats: QualityStatistics = {
      totalInspections: inspections.length,
      passRate: inspections.length > 0 ? (passedInspections / inspections.length) * 100 : 0,
      defectRate: inspections.length > 0 ? (totalDefects / inspections.length) : 0,
      ncrCount: ncrs.length,
      openNcrs: ncrs.filter(n => n.status !== 'closed').length,
      auditScore: this.calculateAverageAuditScore(audits),
      customerComplaints: 0, // 示例数据
      supplierRating: 85, // 示例数据
      processCapability: 1.33, // 示例数据 Cpk
      firstPassYield: 95, // 示例数据
      costOfQuality: 50000, // 示例数据
      kpiAchievement: 92, // 示例数据
    };

    return stats;
  }

  private calculateAverageAuditScore(audits: QualityAudit[]): number {
    const completedAudits = audits.filter(a => a.status === 'completed' && a.score);
    if (completedAudits.length === 0) return 0;

    const totalScore = completedAudits.reduce((sum, a) => sum + (a.score || 0), 0);
    return totalScore / completedAudits.length;
  }

  // ==================== 获取数据方法 ====================

  getAllInspections(): QualityInspection[] {
    return Array.from(this.inspections.values());
  }

  getAllNCRs(): NCR[] {
    return Array.from(this.ncrs.values());
  }

  getAllAudits(): QualityAudit[] {
    return Array.from(this.audits.values());
  }

  getQualityTrend(months: number = 12): any[] {
    // 返回质量趋势数据
    const trend: any[] = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      trend.push({
        month: date.toISOString().slice(0, 7),
        passRate: 90 + Math.random() * 10,
        ncrCount: Math.floor(Math.random() * 10),
        auditScore: 80 + Math.random() * 20,
      });
    }
    
    return trend;
  }
}

export const qualityService = QualityService.getInstance();
