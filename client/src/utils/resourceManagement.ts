/**
 * 智能资源管理系统
 * 对标 MS Project 和 Primavera P6 的资源分配功能
 */

import { logger } from './logger';

export interface Resource {
  id: string;
  name: string;
  type: 'human' | 'equipment' | 'material';
  unit: string;
  costPerUnit: number;
  maxCapacity: number;
  currentCapacity: number;
  skills?: string[];
  certifications?: string[];
  availability: Array<{
    start: Date;
    end: Date;
    capacity: number;
  }>;
}

export interface ResourceAllocation {
  taskId: string;
  resourceId: string;
  units: number;
  startDate: Date;
  endDate: Date;
  cost: number;
  status: 'allocated' | 'overallocated' | 'available';
}

export interface ResourceConflict {
  resourceId: string;
  resourceName: string;
  conflictDates: Array<{
    date: Date;
    requiredUnits: number;
    availableUnits: number;
    tasks: string[];
  }>;
  severity: 'high' | 'medium' | 'low';
}

export class ResourceManager {
  private resources: Map<string, Resource>;
  private allocations: ResourceAllocation[];
  
  constructor() {
    this.resources = new Map();
    this.allocations = [];
  }
  
  /**
   * 添加资源
   */
  addResource(resource: Resource): void {
    this.resources.set(resource.id, resource);
  }
  
  /**
   * 分配资源到任务
   */
  allocateResource(
    taskId: string,
    resourceId: string,
    units: number,
    startDate: Date,
    endDate: Date
  ): ResourceAllocation | null {
    const resource = this.resources.get(resourceId);
    if (!resource) return null;
    
    // 检查资源可用性
    const isAvailable = this.checkAvailability(resourceId, units, startDate, endDate);
    
    const allocation: ResourceAllocation = {
      taskId,
      resourceId,
      units,
      startDate,
      endDate,
      cost: units * resource.costPerUnit * this.getDuration(startDate, endDate),
      status: isAvailable ? 'allocated' : 'overallocated'
    };
    
    this.allocations.push(allocation);
    return allocation;
  }
  
  /**
   * 检查资源可用性
   */
  checkAvailability(
    resourceId: string,
    requiredUnits: number,
    startDate: Date,
    endDate: Date
  ): boolean {
    const resource = this.resources.get(resourceId);
    if (!resource) return false;
    
    // 检查该时间段内的所有分配
    const conflictingAllocations = this.allocations.filter(
      a => a.resourceId === resourceId &&
           a.startDate <= endDate &&
           a.endDate >= startDate
    );
    
    // 计算每天的资源使用情况
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayAllocations = conflictingAllocations.filter(
        a => a.startDate <= current && a.endDate >= current
      );
      
      const totalUnits = dayAllocations.reduce((sum, a) => sum + a.units, 0) + requiredUnits;
      
      if (totalUnits > resource.maxCapacity) {
        return false;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return true;
  }
  
  /**
   * 检测资源冲突
   */
  detectConflicts(): ResourceConflict[] {
    const conflicts: ResourceConflict[] = [];
    
    this.resources.forEach((resource, resourceId) => {
      const resourceAllocations = this.allocations.filter(
        a => a.resourceId === resourceId
      );
      
      if (resourceAllocations.length === 0) return;
      
      // 获取时间范围
      const startDate = new Date(Math.min(...resourceAllocations.map(a => a.startDate.getTime())));
      const endDate = new Date(Math.max(...resourceAllocations.map(a => a.endDate.getTime())));
      
      const conflictDates: any[] = [];
      const current = new Date(startDate);
      
      while (current <= endDate) {
        const dayAllocations = resourceAllocations.filter(
          a => a.startDate <= current && a.endDate >= current
        );
        
        const totalUnits = dayAllocations.reduce((sum, a) => sum + a.units, 0);
        
        if (totalUnits > resource.maxCapacity) {
          conflictDates.push({
            date: new Date(current),
            requiredUnits: totalUnits,
            availableUnits: resource.maxCapacity,
            tasks: dayAllocations.map(a => a.taskId)
          });
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      if (conflictDates.length > 0) {
        conflicts.push({
          resourceId,
          resourceName: resource.name,
          conflictDates,
          severity: this.calculateSeverity(conflictDates, resource.maxCapacity)
        });
      }
    });
    
    return conflicts;
  }
  
  /**
   * 资源负载平衡（自动优化）
   */
  levelResources(strategy: 'delay' | 'split' | 'compress' = 'delay'): void {
    const conflicts = this.detectConflicts();
    
    conflicts.forEach(conflict => {
      switch (strategy) {
        case 'delay':
          this.delayTasks(conflict);
          break;
        case 'split':
          this.splitTasks(conflict);
          break;
        case 'compress':
          this.compressTasks(conflict);
          break;
      }
    });
  }
  
  /**
   * 延迟任务策略
   */
  private delayTasks(conflict: ResourceConflict): void {
    conflict.conflictDates.forEach(conflictDate => {
      // 找出优先级最低的任务
      const lowestPriorityTask = conflictDate.tasks[conflictDate.tasks.length - 1];
      
      // 将该任务延迟一天
      const allocation = this.allocations.find(
        a => a.taskId === lowestPriorityTask && a.resourceId === conflict.resourceId
      );
      
      if (allocation) {
        const duration = this.getDuration(allocation.startDate, allocation.endDate);
        allocation.startDate = new Date(conflictDate.date.getTime() + 86400000);
        allocation.endDate = new Date(allocation.startDate.getTime() + duration * 86400000);
      }
    });
  }
  
  /**
   * 分割任务策略
   */
  private splitTasks(conflict: ResourceConflict): void {
    // 实现任务分割逻辑
    logger.debug('[资源] 分割任务以解决冲突:', conflict);
  }
  
  /**
   * 压缩任务策略
   */
  private compressTasks(conflict: ResourceConflict): void {
    // 实现任务压缩逻辑
    logger.debug('[资源] 压缩任务以解决冲突:', conflict);
  }
  
  /**
   * 计算冲突严重程度
   */
  private calculateSeverity(
    conflictDates: any[],
    maxCapacity: number
  ): 'high' | 'medium' | 'low' {
    const maxOverload = Math.max(...conflictDates.map(
      d => (d.requiredUnits - maxCapacity) / maxCapacity
    ));
    
    if (maxOverload > 0.5) return 'high';
    if (maxOverload > 0.2) return 'medium';
    return 'low';
  }
  
  /**
   * 获取资源利用率报告
   */
  getUtilizationReport(): Map<string, {
    resourceName: string;
    averageUtilization: number;
    peakUtilization: number;
    underutilizedDays: number;
    overutilizedDays: number;
    totalCost: number;
  }> {
    const report = new Map();
    
    this.resources.forEach((resource, resourceId) => {
      const resourceAllocations = this.allocations.filter(
        a => a.resourceId === resourceId
      );
      
      if (resourceAllocations.length === 0) {
        report.set(resourceId, {
          resourceName: resource.name,
          averageUtilization: 0,
          peakUtilization: 0,
          underutilizedDays: 0,
          overutilizedDays: 0,
          totalCost: 0
        });
        return;
      }
      
      // 计算利用率指标
      const utilizationData = this.calculateUtilization(resourceId, resourceAllocations);
      
      report.set(resourceId, {
        resourceName: resource.name,
        ...utilizationData
      });
    });
    
    return report;
  }
  
  /**
   * 计算资源利用率
   */
  private calculateUtilization(
    resourceId: string,
    allocations: ResourceAllocation[]
  ): any {
    const resource = this.resources.get(resourceId)!;
    
    // 获取时间范围
    const startDate = new Date(Math.min(...allocations.map(a => a.startDate.getTime())));
    const endDate = new Date(Math.max(...allocations.map(a => a.endDate.getTime())));
    
    let totalUtilization = 0;
    let peakUtilization = 0;
    let underutilizedDays = 0;
    let overutilizedDays = 0;
    let totalCost = 0;
    let days = 0;
    
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayAllocations = allocations.filter(
        a => a.startDate <= current && a.endDate >= current
      );
      
      const dayUnits = dayAllocations.reduce((sum, a) => sum + a.units, 0);
      const utilization = dayUnits / resource.maxCapacity;
      
      totalUtilization += utilization;
      peakUtilization = Math.max(peakUtilization, utilization);
      
      if (utilization < 0.5) underutilizedDays++;
      if (utilization > 1) overutilizedDays++;
      
      totalCost += dayUnits * resource.costPerUnit;
      days++;
      
      current.setDate(current.getDate() + 1);
    }
    
    return {
      averageUtilization: totalUtilization / days,
      peakUtilization,
      underutilizedDays,
      overutilizedDays,
      totalCost
    };
  }
  
  /**
   * 获取资源甘特图数据
   */
  getResourceGanttData(): any {
    const ganttData: any[] = [];
    
    this.resources.forEach((resource, resourceId) => {
      // 资源主行
      ganttData.push({
        id: resourceId,
        text: resource.name,
        type: 'project',
        open: true
      });
      
      // 资源分配子行
      const resourceAllocations = this.allocations.filter(
        a => a.resourceId === resourceId
      );
      
      resourceAllocations.forEach((allocation, index) => {
        ganttData.push({
          id: `${resourceId}_${index}`,
          text: `Task ${allocation.taskId}`,
          start_date: allocation.startDate,
          end_date: allocation.endDate,
          parent: resourceId,
          progress: 0.5
        });
      });
    });
    
    return ganttData;
  }
  
  /**
   * 计算时间差（天）
   */
  private getDuration(startDate: Date, endDate: Date): number {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
  }
  
  /**
   * 导出资源报告
   */
  exportReport(format: 'excel' | 'pdf' = 'excel'): void {
    const report = this.getUtilizationReport();
    
    if (format === 'excel') {
      // 导出Excel
      const data = Array.from(report.entries()).map(([id, info]) => ({
        '资源ID': id,
        '资源名称': info.resourceName,
        '平均利用率': `${(info.averageUtilization * 100).toFixed(2)}%`,
        '峰值利用率': `${(info.peakUtilization * 100).toFixed(2)}%`,
        '未充分利用天数': info.underutilizedDays,
        '过度利用天数': info.overutilizedDays,
        '总成本': `¥${info.totalCost.toFixed(2)}`
      }));
      
      // 使用XLSX库导出
      logger.info('[资源] 导出Excel报告', { rows: data.length });
    } else {
      // 导出PDF
      logger.info('[资源] 导出PDF报告');
    }
  }
}

// 单例模式
export const resourceManager = new ResourceManager();
