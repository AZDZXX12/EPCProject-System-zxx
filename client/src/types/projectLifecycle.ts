/**
 * 项目生命周期管理
 * EPC项目从立项到结束的完整流程定义
 */

// 项目阶段枚举
export enum ProjectPhase {
  // 1. 立项阶段
  INITIATION = 'initiation',
  // 2. 设计阶段
  DESIGN = 'design',
  // 3. 采购阶段
  PROCUREMENT = 'procurement',
  // 4. 施工阶段
  CONSTRUCTION = 'construction',
  // 5. 调试阶段
  COMMISSIONING = 'commissioning',
  // 6. 验收阶段
  ACCEPTANCE = 'acceptance',
  // 7. 移交阶段
  HANDOVER = 'handover',
  // 8. 项目结束
  CLOSURE = 'closure',
}

// 项目阶段中文名称
export const PhaseNames: Record<ProjectPhase, string> = {
  [ProjectPhase.INITIATION]: '立项阶段',
  [ProjectPhase.DESIGN]: '设计阶段',
  [ProjectPhase.PROCUREMENT]: '采购阶段',
  [ProjectPhase.CONSTRUCTION]: '施工阶段',
  [ProjectPhase.COMMISSIONING]: '调试阶段',
  [ProjectPhase.ACCEPTANCE]: '验收阶段',
  [ProjectPhase.HANDOVER]: '移交阶段',
  [ProjectPhase.CLOSURE]: '项目结束',
};

// 项目阶段描述
export const PhaseDescriptions: Record<ProjectPhase, string> = {
  [ProjectPhase.INITIATION]: '项目可行性研究、立项审批、组建项目团队',
  [ProjectPhase.DESIGN]: '工程设计、方案评审、图纸审核',
  [ProjectPhase.PROCUREMENT]: '设备采购、材料采购、供应商管理',
  [ProjectPhase.CONSTRUCTION]: '现场施工、进度管理、质量安全控制',
  [ProjectPhase.COMMISSIONING]: '设备调试、系统联调、性能测试',
  [ProjectPhase.ACCEPTANCE]: '工程验收、质量检查、文档归档',
  [ProjectPhase.HANDOVER]: '资料移交、培训交底、保修承诺',
  [ProjectPhase.CLOSURE]: '项目总结、经验归档、团队解散',
};

// 每个阶段的关键交付物
export const PhaseDeliverables: Record<ProjectPhase, string[]> = {
  [ProjectPhase.INITIATION]: [
    '项目建议书',
    '可行性研究报告',
    '项目章程',
    '干系人登记册',
    '项目团队组建文件',
  ],
  [ProjectPhase.DESIGN]: [
    '初步设计文件',
    '施工图设计',
    '设计变更记录',
    '设计评审报告',
    '设备选型清单',
  ],
  [ProjectPhase.PROCUREMENT]: [
    '采购计划',
    '供应商评估报告',
    '采购合同',
    '设备到货验收单',
    '材料清单',
  ],
  [ProjectPhase.CONSTRUCTION]: [
    '施工组织设计',
    '施工日志',
    '质量检验记录',
    '安全检查报告',
    '进度报表',
  ],
  [ProjectPhase.COMMISSIONING]: [
    '调试方案',
    '单机试车记录',
    '联动试车记录',
    '性能测试报告',
    '问题整改清单',
  ],
  [ProjectPhase.ACCEPTANCE]: [
    '竣工图',
    '验收申请',
    '验收报告',
    '质量评定',
    '遗留问题清单',
  ],
  [ProjectPhase.HANDOVER]: [
    '竣工资料',
    '使用说明书',
    '培训记录',
    '保修承诺书',
    '移交清单',
  ],
  [ProjectPhase.CLOSURE]: [
    '项目总结报告',
    '经验教训文档',
    '财务决算',
    '资料归档清单',
    '项目结案报告',
  ],
};

// 阶段状态
export enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

// 阶段状态中文名称
export const PhaseStatusNames: Record<PhaseStatus, string> = {
  [PhaseStatus.NOT_STARTED]: '未开始',
  [PhaseStatus.IN_PROGRESS]: '进行中',
  [PhaseStatus.COMPLETED]: '已完成',
  [PhaseStatus.ON_HOLD]: '暂停',
  [PhaseStatus.CANCELLED]: '已取消',
};

// 项目阶段数据接口
export interface ProjectPhaseData {
  phase: ProjectPhase;
  status: PhaseStatus;
  startDate?: string;
  endDate?: string;
  planStartDate?: string;
  planEndDate?: string;
  progress: number;
  deliverables: DeliverableItem[];
  milestones: MilestoneItem[];
  risks: RiskItem[];
  notes?: string;
}

// 交付物项
export interface DeliverableItem {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  dueDate?: string;
  completedDate?: string;
  responsible?: string;
  reviewer?: string;
  attachments?: string[];
}

// 里程碑项
export interface MilestoneItem {
  id: string;
  name: string;
  description?: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'achieved' | 'delayed' | 'missed';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

// 风险项
export interface RiskItem {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation?: string;
  owner?: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'closed';
}

// 项目生命周期完整数据
export interface ProjectLifecycle {
  projectId: string;
  currentPhase: ProjectPhase;
  phases: ProjectPhaseData[];
  overallProgress: number;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
}

// 阶段转换规则
export const PhaseTransitionRules: Record<ProjectPhase, ProjectPhase[]> = {
  [ProjectPhase.INITIATION]: [ProjectPhase.DESIGN],
  [ProjectPhase.DESIGN]: [ProjectPhase.PROCUREMENT],
  [ProjectPhase.PROCUREMENT]: [ProjectPhase.CONSTRUCTION],
  [ProjectPhase.CONSTRUCTION]: [ProjectPhase.COMMISSIONING],
  [ProjectPhase.COMMISSIONING]: [ProjectPhase.ACCEPTANCE],
  [ProjectPhase.ACCEPTANCE]: [ProjectPhase.HANDOVER],
  [ProjectPhase.HANDOVER]: [ProjectPhase.CLOSURE],
  [ProjectPhase.CLOSURE]: [],
};

// 检查阶段转换是否合法
export function canTransitionToPhase(
  currentPhase: ProjectPhase,
  targetPhase: ProjectPhase
): boolean {
  const allowedPhases = PhaseTransitionRules[currentPhase];
  return allowedPhases.includes(targetPhase);
}

// 获取下一个阶段
export function getNextPhase(currentPhase: ProjectPhase): ProjectPhase | null {
  const nextPhases = PhaseTransitionRules[currentPhase];
  return nextPhases.length > 0 ? nextPhases[0] : null;
}

// 计算阶段进度
export function calculatePhaseProgress(phase: ProjectPhaseData): number {
  if (phase.deliverables.length === 0) return phase.progress;
  
  const completedCount = phase.deliverables.filter(
    (d) => d.status === 'completed'
  ).length;
  
  return Math.round((completedCount / phase.deliverables.length) * 100);
}

// 计算整体项目进度
export function calculateOverallProgress(phases: ProjectPhaseData[]): number {
  if (phases.length === 0) return 0;
  
  const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
  return Math.round(totalProgress / phases.length);
}

// 获取阶段颜色
export function getPhaseColor(status: PhaseStatus): string {
  const colorMap: Record<PhaseStatus, string> = {
    [PhaseStatus.NOT_STARTED]: '#d9d9d9',
    [PhaseStatus.IN_PROGRESS]: '#1890ff',
    [PhaseStatus.COMPLETED]: '#52c41a',
    [PhaseStatus.ON_HOLD]: '#faad14',
    [PhaseStatus.CANCELLED]: '#ff4d4f',
  };
  return colorMap[status];
}

// 检查阶段是否可以开始
export function canStartPhase(
  phase: ProjectPhase,
  phases: ProjectPhaseData[]
): boolean {
  const phaseOrder = Object.values(ProjectPhase);
  const currentIndex = phaseOrder.indexOf(phase);
  
  if (currentIndex === 0) return true;
  
  // 检查前一个阶段是否已完成
  const previousPhase = phaseOrder[currentIndex - 1];
  const previousPhaseData = phases.find((p) => p.phase === previousPhase);
  
  return previousPhaseData?.status === PhaseStatus.COMPLETED;
}
