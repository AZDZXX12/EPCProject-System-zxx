/**
 * 安全管理服务 (HSE Management Service)
 * 提供完整的健康、安全、环境管理体系
 */

import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';
import { eventBus, EVENTS } from '../utils/EventBus';

// ==================== 类型定义 ====================

export interface SafetyIncident {
  id: string;
  type: IncidentType;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  title: string;
  description: string;
  location: string;
  datetime: string;
  reporter: string;
  involvedPersonnel: string[];
  injuries: InjuryRecord[];
  damages: DamageRecord[];
  rootCause?: string;
  correctiveActions: CorrectiveAction[];
  preventiveMeasures: string[];
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  investigator?: string;
  reportPath?: string;
  photos?: string[];
  estimatedLoss?: number;
  reportToAuthorities: boolean;
}

export type IncidentType = 
  | 'injury' | 'fire' | 'explosion' | 'chemical_spill' 
  | 'equipment_damage' | 'environmental' | 'near_miss' 
  | 'unsafe_behavior' | 'unsafe_condition';

export interface InjuryRecord {
  personnelId: string;
  name: string;
  injuryType: string;
  bodyPart: string;
  severity: 'first_aid' | 'medical' | 'lost_time' | 'fatal';
  treatmentLocation: string;
  daysLost?: number;
}

export interface DamageRecord {
  item: string;
  description: string;
  estimatedCost: number;
  repairStatus: 'pending' | 'in_progress' | 'completed';
}

export interface CorrectiveAction {
  id: string;
  action: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completionDate?: string;
  effectiveness?: 'effective' | 'partially_effective' | 'not_effective';
}

export interface SafetyInspection {
  id: string;
  type: 'routine' | 'special' | 'comprehensive' | 'pre_operation';
  area: string;
  inspector: string;
  datetime: string;
  checklist: ChecklistItem[];
  findings: SafetyFinding[];
  overallScore: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  reportPath?: string;
  photos?: string[];
  nextInspectionDate?: string;
  approvedBy?: string;
}

export interface ChecklistItem {
  category: string;
  item: string;
  standard: string;
  result: 'pass' | 'fail' | 'na' | 'partial';
  comments?: string;
}

export interface SafetyFinding {
  id: string;
  type: 'violation' | 'hazard' | 'improvement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  recommendedAction: string;
  deadline: string;
  responsible: string;
  status: 'open' | 'in_progress' | 'closed' | 'overdue';
}

export interface SafetyTraining {
  id: string;
  title: string;
  type: TrainingType;
  category: 'mandatory' | 'specialized' | 'refresher';
  description: string;
  trainer: string;
  trainingDate: string;
  duration: number;
  location: string;
  participants: TrainingParticipant[];
  materials: string[];
  examRequired: boolean;
  passingScore?: number;
  certificateValidity?: number;
  nextTrainingDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export type TrainingType = 
  | 'safety_induction' | 'fire_safety' | 'first_aid' | 'ppe_usage' 
  | 'chemical_handling' | 'electrical_safety' | 'working_at_height' 
  | 'confined_space' | 'equipment_operation' | 'emergency_response';

export interface TrainingParticipant {
  personnelId: string;
  name: string;
  attended: boolean;
  examScore?: number;
  passed?: boolean;
  certificateNumber?: string;
}

export interface RiskAssessment {
  id: string;
  activity: string;
  location: string;
  assessor: string;
  assessmentDate: string;
  hazards: Hazard[];
  controlMeasures: ControlMeasure[];
  residualRisk: RiskLevel;
  approvalStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  workPermitRequired: boolean;
}

export interface Hazard {
  id: string;
  description: string;
  category: HazardCategory;
  likelihood: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  riskLevel: RiskLevel;
  existingControls: string[];
}

export type HazardCategory = 
  | 'mechanical' | 'electrical' | 'chemical' | 'biological' 
  | 'physical' | 'ergonomic' | 'psychosocial' | 'environmental';

export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface ControlMeasure {
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  implementation: string;
  responsible: string;
  deadline: string;
  status: 'planned' | 'implemented' | 'verified';
  effectiveness?: 'effective' | 'partial' | 'ineffective';
}

export interface SafetyStatistics {
  totalIncidents: number;
  lostTimeInjuries: number;
  nearMisses: number;
  ltifr: number;
  trifr: number;
  safeManHours: number;
  lastIncidentDays: number;
  trainingsCompleted: number;
  inspectionsCompleted: number;
  openFindings: number;
  complianceRate: number;
}

// ==================== 安全管理服务 ====================

export class SafetyService {
  private incidents: Map<string, SafetyIncident>;
  private inspections: Map<string, SafetyInspection>;
  private trainings: Map<string, SafetyTraining>;
  private riskAssessments: Map<string, RiskAssessment>;
  private static instance: SafetyService;

  private constructor() {
    this.incidents = new Map();
    this.inspections = new Map();
    this.trainings = new Map();
    this.riskAssessments = new Map();
    this.loadFromStorage();
  }

  static getInstance(): SafetyService {
    if (!SafetyService.instance) {
      SafetyService.instance = new SafetyService();
    }
    return SafetyService.instance;
  }

  private loadFromStorage(): void {
    const incidentsData = StorageManager.load<SafetyIncident[]>('safety_incidents');
    if (incidentsData) {
      incidentsData.forEach(item => this.incidents.set(item.id, item));
    }

    const inspectionsData = StorageManager.load<SafetyInspection[]>('safety_inspections');
    if (inspectionsData) {
      inspectionsData.forEach(item => this.inspections.set(item.id, item));
    }

    if (this.incidents.size === 0) {
      this.initSampleData();
    }
  }

  private saveToStorage(): void {
    StorageManager.save('safety_incidents', Array.from(this.incidents.values()));
    StorageManager.save('safety_inspections', Array.from(this.inspections.values()));
    StorageManager.save('safety_trainings', Array.from(this.trainings.values()));
  }

  private initSampleData(): void {
    const sampleIncident: SafetyIncident = {
      id: 'INC001',
      type: 'near_miss',
      severity: 'minor',
      title: '高空作业险肇事故',
      description: '工人在2楼平台作业时，安全带未正确固定',
      location: '2号厂房二楼平台',
      datetime: '2025-11-20 14:30:00',
      reporter: '张安全员',
      involvedPersonnel: ['李工'],
      injuries: [],
      damages: [],
      rootCause: '安全意识不足',
      correctiveActions: [{
        id: 'CA001',
        action: '对当事人进行安全再培训',
        responsible: '安全部',
        dueDate: '2025-11-25',
        status: 'completed',
      }],
      preventiveMeasures: ['加强高空作业安全培训'],
      status: 'closed',
      reportToAuthorities: false,
    };

    this.incidents.set(sampleIncident.id, sampleIncident);
    this.saveToStorage();
  }

  // ==================== 事故管理 ====================

  reportIncident(incident: Omit<SafetyIncident, 'id'>): SafetyIncident {
    const id = `INC${Date.now()}`;
    const newIncident: SafetyIncident = {
      ...incident,
      id,
      status: 'reported',
    };

    this.incidents.set(id, newIncident);
    this.saveToStorage();

    if (incident.severity === 'critical' || incident.severity === 'major') {
      eventBus.emit(EVENTS.EMERGENCY_NOTIFICATION, {
        type: 'safety_incident',
        severity: incident.severity,
        message: `紧急安全事故：${incident.title}`,
      });
    }

    logger.warn('[SafetyService] 事故报告', { id, type: incident.type });
    return newIncident;
  }

  updateIncidentStatus(
    incidentId: string,
    status: SafetyIncident['status']
  ): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    incident.status = status;
    this.incidents.set(incidentId, incident);
    this.saveToStorage();
    return true;
  }

  getAllIncidents(): SafetyIncident[] {
    return Array.from(this.incidents.values());
  }

  // ==================== 安全检查 ====================

  createInspection(inspection: Omit<SafetyInspection, 'id'>): SafetyInspection {
    const id = `INSP${Date.now()}`;
    const newInspection: SafetyInspection = {
      ...inspection,
      id,
    };

    this.inspections.set(id, newInspection);
    this.saveToStorage();
    return newInspection;
  }

  completeInspection(
    inspectionId: string,
    findings: SafetyFinding[],
    overallScore: number
  ): boolean {
    const inspection = this.inspections.get(inspectionId);
    if (!inspection) return false;

    inspection.findings = findings;
    inspection.overallScore = overallScore;
    inspection.status = 'completed';

    this.inspections.set(inspectionId, inspection);
    this.saveToStorage();

    const criticalFindings = findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      eventBus.emit(EVENTS.SAFETY_ALERT, {
        type: 'critical_findings',
        count: criticalFindings.length,
      });
    }

    return true;
  }

  getOpenFindings(): SafetyFinding[] {
    const allFindings: SafetyFinding[] = [];
    
    this.inspections.forEach(inspection => {
      if (inspection.findings) {
        const openFindings = inspection.findings.filter(
          f => f.status === 'open' || f.status === 'overdue'
        );
        allFindings.push(...openFindings);
      }
    });

    return allFindings;
  }

  // ==================== 安全培训 ====================

  scheduleTraining(training: Omit<SafetyTraining, 'id'>): SafetyTraining {
    const id = `TRN${Date.now()}`;
    const newTraining: SafetyTraining = {
      ...training,
      id,
      status: 'scheduled',
    };

    this.trainings.set(id, newTraining);
    this.saveToStorage();
    return newTraining;
  }

  completeTraining(
    trainingId: string,
    participants: TrainingParticipant[]
  ): boolean {
    const training = this.trainings.get(trainingId);
    if (!training) return false;

    training.participants = participants;
    training.status = 'completed';

    if (training.certificateValidity) {
      const nextDate = new Date(training.trainingDate);
      nextDate.setMonth(nextDate.getMonth() + training.certificateValidity);
      training.nextTrainingDate = nextDate.toISOString();
    }

    this.trainings.set(trainingId, training);
    this.saveToStorage();
    return true;
  }

  // ==================== 风险评估 ====================

  createRiskAssessment(assessment: Omit<RiskAssessment, 'id'>): RiskAssessment {
    const id = `RA${Date.now()}`;
    const newAssessment: RiskAssessment = {
      ...assessment,
      id,
    };

    newAssessment.hazards.forEach(hazard => {
      hazard.riskScore = hazard.likelihood * hazard.severity;
      hazard.riskLevel = this.calculateRiskLevel(hazard.riskScore);
    });

    newAssessment.residualRisk = this.calculateResidualRisk(newAssessment);
    this.riskAssessments.set(id, newAssessment);
    
    StorageManager.save('risk_assessments', Array.from(this.riskAssessments.values()));
    return newAssessment;
  }

  private calculateRiskLevel(score: number): RiskLevel {
    if (score <= 4) return 'low';
    if (score <= 9) return 'medium';
    if (score <= 16) return 'high';
    return 'extreme';
  }

  private calculateResidualRisk(assessment: RiskAssessment): RiskLevel {
    const implementedControls = assessment.controlMeasures.filter(
      c => c.status === 'implemented' || c.status === 'verified'
    );

    if (implementedControls.length === 0) {
      const maxScore = Math.max(...assessment.hazards.map(h => h.riskScore));
      return this.calculateRiskLevel(maxScore);
    }

    const effectiveControls = implementedControls.filter(
      c => c.effectiveness === 'effective'
    ).length;
    const effectiveness = effectiveControls / implementedControls.length;

    const maxScore = Math.max(...assessment.hazards.map(h => h.riskScore));
    const residualScore = maxScore * (1 - effectiveness * 0.7);
    
    return this.calculateRiskLevel(Math.round(residualScore));
  }

  // ==================== 综合统计 ====================

  getComprehensiveStatistics(): SafetyStatistics {
    const incidents = Array.from(this.incidents.values());
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    const thisYearIncidents = incidents.filter(
      i => new Date(i.datetime) >= yearStart
    );

    const stats: SafetyStatistics = {
      totalIncidents: thisYearIncidents.length,
      lostTimeInjuries: 0,
      nearMisses: thisYearIncidents.filter(i => i.type === 'near_miss').length,
      ltifr: 0,
      trifr: 0,
      safeManHours: 1000000,
      lastIncidentDays: 0,
      trainingsCompleted: Array.from(this.trainings.values()).filter(
        t => t.status === 'completed'
      ).length,
      inspectionsCompleted: Array.from(this.inspections.values()).filter(
        i => i.status === 'completed'
      ).length,
      openFindings: this.getOpenFindings().length,
      complianceRate: 95,
    };

    thisYearIncidents.forEach(incident => {
      incident.injuries.forEach(injury => {
        if (injury.severity === 'lost_time') {
          stats.lostTimeInjuries++;
        }
      });
    });

    stats.ltifr = (stats.lostTimeInjuries / stats.safeManHours) * 1000000;
    const recordableInjuries = stats.lostTimeInjuries;
    stats.trifr = (recordableInjuries / stats.safeManHours) * 1000000;

    if (incidents.length > 0) {
      const lastIncident = incidents.sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      )[0];
      const daysSince = Math.floor(
        (now.getTime() - new Date(lastIncident.datetime).getTime()) / (1000 * 60 * 60 * 24)
      );
      stats.lastIncidentDays = daysSince;
    }

    return stats;
  }
}

export const safetyService = SafetyService.getInstance();
