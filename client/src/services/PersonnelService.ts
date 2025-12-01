/**
 * 人员管理服务
 * 提供人员的CRUD、考勤、培训、证书管理等功能
 */

import { StorageManager } from '../utils/StorageManager';
import { logger } from '../utils/logger';
import { eventBus, EVENTS } from '../utils/EventBus';

// ==================== 类型定义 ====================

export interface Personnel {
  id: string;
  jobNumber: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  idCard: string;
  phone: string;
  email: string;
  position: string;
  department: string;
  level: string;
  experience: string;
  education: string;
  status: 'active' | 'leave' | 'resigned';
  joinDate: string;
  contractEndDate: string;
  salary: number;
  bankAccount: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: string;
  photo?: string;
  skills: string[];
  certifications: Certification[];
  trainings: Training[];
  attendance: AttendanceRecord[];
  evaluations: Evaluation[];
  projects: string[];
  workload: number;
  performance: PerformanceMetrics;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring';
  certificateNumber: string;
  attachmentUrl?: string;
}

export interface Training {
  id: string;
  name: string;
  type: 'safety' | 'technical' | 'management' | 'other';
  date: string;
  duration: number;
  trainer: string;
  score?: number;
  status: 'completed' | 'ongoing' | 'planned';
  certificate?: string;
}

export interface AttendanceRecord {
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'holiday';
  overtime?: number;
  remarks?: string;
}

export interface Evaluation {
  id: string;
  period: string;
  evaluator: string;
  date: string;
  scores: {
    work: number;
    attitude: number;
    teamwork: number;
    innovation: number;
    overall: number;
  };
  comments: string;
  suggestions: string;
}

export interface PerformanceMetrics {
  tasksCompleted: number;
  tasksTotal: number;
  averageRating: number;
  attendanceRate: number;
  overtimeHours: number;
  safetyViolations: number;
}

export interface TeamStatistics {
  totalCount: number;
  activeCount: number;
  departments: Map<string, number>;
  positions: Map<string, number>;
  avgExperience: number;
  avgAge: number;
  certificationStats: {
    total: number;
    expiring: number;
    expired: number;
  };
  trainingStats: {
    completed: number;
    ongoing: number;
    planned: number;
  };
}

// ==================== 人员管理服务 ====================

export class PersonnelService {
  private personnel: Map<string, Personnel>;
  private static instance: PersonnelService;

  private constructor() {
    this.personnel = new Map();
    this.loadFromStorage();
  }

  static getInstance(): PersonnelService {
    if (!PersonnelService.instance) {
      PersonnelService.instance = new PersonnelService();
    }
    return PersonnelService.instance;
  }

  // 从存储加载数据
  private loadFromStorage(): void {
    const cached = StorageManager.load<Personnel[]>('personnel_data');
    if (cached) {
      cached.forEach(p => this.personnel.set(p.id, p));
      logger.info('[PersonnelService] 加载人员数据', { count: cached.length });
    } else {
      this.initSampleData();
    }
  }

  // 保存到存储
  private saveToStorage(): void {
    const data = Array.from(this.personnel.values());
    StorageManager.save('personnel_data', data);
  }

  // 初始化示例数据
  private initSampleData(): void {
    const samplePersonnel: Personnel[] = [
      {
        id: 'P001',
        jobNumber: 'EMP-001',
        name: '张三',
        gender: 'male',
        age: 35,
        idCard: '320123198801010001',
        phone: '13800138001',
        email: 'zhangsan@company.com',
        position: '项目经理',
        department: '项目管理部',
        level: '高级',
        experience: '15年',
        education: '本科',
        status: 'active',
        joinDate: '2010-03-15',
        contractEndDate: '2025-03-14',
        salary: 25000,
        bankAccount: '6222021234567890123',
        emergencyContact: {
          name: '张太太',
          relationship: '配偶',
          phone: '13900139001',
        },
        address: '江苏省南京市建邺区xx路xx号',
        skills: ['项目管理', '团队协调', '风险控制', '成本管理'],
        certifications: [
          {
            id: 'cert1',
            name: '一级建造师',
            issuer: '住建部',
            issueDate: '2015-06-01',
            expiryDate: '2025-06-01',
            status: 'valid',
            certificateNumber: 'JS12345678',
          },
          {
            id: 'cert2',
            name: 'PMP认证',
            issuer: 'PMI',
            issueDate: '2018-09-01',
            expiryDate: '2024-09-01',
            status: 'expiring',
            certificateNumber: 'PMP2018090001',
          },
        ],
        trainings: [
          {
            id: 'train1',
            name: '安全生产管理培训',
            type: 'safety',
            date: '2025-01-15',
            duration: 16,
            trainer: '安全培训中心',
            score: 92,
            status: 'completed',
            certificate: '安全培训证书',
          },
        ],
        attendance: [],
        evaluations: [
          {
            id: 'eval1',
            period: '2024年度',
            evaluator: '李总',
            date: '2025-01-10',
            scores: {
              work: 95,
              attitude: 90,
              teamwork: 92,
              innovation: 88,
              overall: 91,
            },
            comments: '工作表现优秀，项目管理能力突出',
            suggestions: '继续保持，可以带新人',
          },
        ],
        projects: ['项目A', '项目B', '项目C'],
        workload: 85,
        performance: {
          tasksCompleted: 45,
          tasksTotal: 50,
          averageRating: 4.5,
          attendanceRate: 98,
          overtimeHours: 120,
          safetyViolations: 0,
        },
      },
      {
        id: 'P002',
        jobNumber: 'EMP-002',
        name: '李四',
        gender: 'male',
        age: 32,
        idCard: '320123199101010002',
        phone: '13800138002',
        email: 'lisi@company.com',
        position: '电气工程师',
        department: '工程技术部',
        level: '中级',
        experience: '10年',
        education: '本科',
        status: 'active',
        joinDate: '2015-07-20',
        contractEndDate: '2026-07-19',
        salary: 18000,
        bankAccount: '6222021234567890456',
        emergencyContact: {
          name: '李母',
          relationship: '母亲',
          phone: '13900139002',
        },
        address: '江苏省南京市鼓楼区yy路yy号',
        skills: ['电气设计', 'PLC编程', 'AutoCAD', '设备调试'],
        certifications: [
          {
            id: 'cert3',
            name: '电气工程师',
            issuer: '人社部',
            issueDate: '2017-08-01',
            expiryDate: '2027-08-01',
            status: 'valid',
            certificateNumber: 'DQ20170801',
          },
        ],
        trainings: [],
        attendance: [],
        evaluations: [],
        projects: ['项目B', '项目D'],
        workload: 75,
        performance: {
          tasksCompleted: 38,
          tasksTotal: 40,
          averageRating: 4.2,
          attendanceRate: 96,
          overtimeHours: 80,
          safetyViolations: 0,
        },
      },
    ];

    samplePersonnel.forEach(p => this.personnel.set(p.id, p));
    this.saveToStorage();
  }

  // ==================== CRUD操作 ====================

  // 获取所有人员
  getAllPersonnel(): Personnel[] {
    return Array.from(this.personnel.values());
  }

  // 获取单个人员
  getPersonnelById(id: string): Personnel | null {
    return this.personnel.get(id) || null;
  }

  // 添加人员
  addPersonnel(personnel: Omit<Personnel, 'id'>): Personnel {
    const id = `P${Date.now()}`;
    const newPersonnel: Personnel = {
      ...personnel,
      id,
    };
    this.personnel.set(id, newPersonnel);
    this.saveToStorage();
    
    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
      type: 'success',
      message: '人员添加成功',
      description: `${newPersonnel.name} 已加入团队`,
    });
    
    return newPersonnel;
  }

  // 更新人员信息
  updatePersonnel(id: string, updates: Partial<Personnel>): boolean {
    const personnel = this.personnel.get(id);
    if (!personnel) return false;

    const updated = { ...personnel, ...updates };
    this.personnel.set(id, updated);
    this.saveToStorage();
    
    return true;
  }

  // 删除人员
  deletePersonnel(id: string): boolean {
    const result = this.personnel.delete(id);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  // ==================== 考勤管理 ====================

  // 记录考勤
  recordAttendance(personnelId: string, record: AttendanceRecord): boolean {
    const personnel = this.personnel.get(personnelId);
    if (!personnel) return false;

    if (!personnel.attendance) {
      personnel.attendance = [];
    }
    
    // 检查是否已有当天记录
    const existingIndex = personnel.attendance.findIndex(
      a => a.date === record.date
    );
    
    if (existingIndex >= 0) {
      personnel.attendance[existingIndex] = record;
    } else {
      personnel.attendance.push(record);
    }
    
    this.personnel.set(personnelId, personnel);
    this.saveToStorage();
    return true;
  }

  // 获取考勤统计
  getAttendanceStatistics(personnelId: string, month: string): any {
    const personnel = this.personnel.get(personnelId);
    if (!personnel || !personnel.attendance) return null;

    const monthRecords = personnel.attendance.filter(
      a => a.date.startsWith(month)
    );

    return {
      total: monthRecords.length,
      present: monthRecords.filter(a => a.status === 'present').length,
      absent: monthRecords.filter(a => a.status === 'absent').length,
      late: monthRecords.filter(a => a.status === 'late').length,
      leave: monthRecords.filter(a => a.status === 'leave').length,
      overtime: monthRecords.reduce((sum, a) => sum + (a.overtime || 0), 0),
    };
  }

  // ==================== 培训管理 ====================

  // 添加培训记录
  addTraining(personnelId: string, training: Training): boolean {
    const personnel = this.personnel.get(personnelId);
    if (!personnel) return false;

    if (!personnel.trainings) {
      personnel.trainings = [];
    }
    
    personnel.trainings.push(training);
    this.personnel.set(personnelId, personnel);
    this.saveToStorage();
    
    return true;
  }

  // 获取培训计划
  getTrainingPlan(status?: 'completed' | 'ongoing' | 'planned'): Training[] {
    const allTrainings: Training[] = [];
    
    this.personnel.forEach(p => {
      if (p.trainings) {
        p.trainings.forEach(t => {
          if (!status || t.status === status) {
            allTrainings.push({
              ...t,
              personnelName: p.name,
            } as any);
          }
        });
      }
    });
    
    return allTrainings.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // ==================== 证书管理 ====================

  // 添加证书
  addCertification(personnelId: string, certification: Certification): boolean {
    const personnel = this.personnel.get(personnelId);
    if (!personnel) return false;

    if (!personnel.certifications) {
      personnel.certifications = [];
    }
    
    personnel.certifications.push(certification);
    this.personnel.set(personnelId, personnel);
    this.saveToStorage();
    
    return true;
  }

  // 获取即将过期的证书
  getExpiringCertifications(days: number = 90): Array<{
    personnel: Personnel;
    certification: Certification;
    daysRemaining: number;
  }> {
    const expiringList: any[] = [];
    const now = new Date();
    
    this.personnel.forEach(p => {
      if (p.certifications) {
        p.certifications.forEach(c => {
          const expiryDate = new Date(c.expiryDate);
          const daysRemaining = Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysRemaining > 0 && daysRemaining <= days) {
            expiringList.push({
              personnel: p,
              certification: c,
              daysRemaining,
            });
          }
        });
      }
    });
    
    return expiringList.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  // ==================== 统计分析 ====================

  // 获取团队统计
  getTeamStatistics(): TeamStatistics {
    const departments = new Map<string, number>();
    const positions = new Map<string, number>();
    let totalAge = 0;
    let totalExperience = 0;
    let activeCount = 0;
    let certTotal = 0;
    let certExpiring = 0;
    let certExpired = 0;
    let trainCompleted = 0;
    let trainOngoing = 0;
    let trainPlanned = 0;
    
    this.personnel.forEach(p => {
      // 部门统计
      const deptCount = departments.get(p.department) || 0;
      departments.set(p.department, deptCount + 1);
      
      // 岗位统计
      const posCount = positions.get(p.position) || 0;
      positions.set(p.position, posCount + 1);
      
      // 年龄和经验
      totalAge += p.age;
      totalExperience += parseInt(p.experience) || 0;
      
      // 在职统计
      if (p.status === 'active') activeCount++;
      
      // 证书统计
      if (p.certifications) {
        certTotal += p.certifications.length;
        certExpiring += p.certifications.filter(c => c.status === 'expiring').length;
        certExpired += p.certifications.filter(c => c.status === 'expired').length;
      }
      
      // 培训统计
      if (p.trainings) {
        trainCompleted += p.trainings.filter(t => t.status === 'completed').length;
        trainOngoing += p.trainings.filter(t => t.status === 'ongoing').length;
        trainPlanned += p.trainings.filter(t => t.status === 'planned').length;
      }
    });
    
    const totalCount = this.personnel.size;
    
    return {
      totalCount,
      activeCount,
      departments,
      positions,
      avgAge: totalCount > 0 ? Math.round(totalAge / totalCount) : 0,
      avgExperience: totalCount > 0 ? Math.round(totalExperience / totalCount) : 0,
      certificationStats: {
        total: certTotal,
        expiring: certExpiring,
        expired: certExpired,
      },
      trainingStats: {
        completed: trainCompleted,
        ongoing: trainOngoing,
        planned: trainPlanned,
      },
    };
  }

  // 搜索人员
  searchPersonnel(query: string): Personnel[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.personnel.values()).filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.jobNumber.toLowerCase().includes(lowerQuery) ||
      p.position.toLowerCase().includes(lowerQuery) ||
      p.department.toLowerCase().includes(lowerQuery) ||
      p.skills.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }

  // 获取空闲人员
  getAvailablePersonnel(skillRequired?: string): Personnel[] {
    return Array.from(this.personnel.values()).filter(p => {
      const isAvailable = p.status === 'active' && p.workload < 80;
      if (!skillRequired) return isAvailable;
      return isAvailable && p.skills.includes(skillRequired);
    });
  }
}

// 导出单例
export const personnelService = PersonnelService.getInstance();
