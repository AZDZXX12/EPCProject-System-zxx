/**
 * 采购流程自动化服务
 * 从需求识别到交付验收的全链路自动化
 */

import { eventBus, EVENTS } from '../utils/EventBus';
import { useProjectStore } from '../store/projectStore';
import { supplierRecommendationService } from './SupplierRecommendationService';
import { moduleDataBus } from './ModuleDataBus';

export interface ProcurementRequest {
  id: string;
  projectId: string;
  requestType: 'material' | 'equipment' | 'service';
  items: ProcurementItem[];
  urgency: 'high' | 'medium' | 'low';
  requester: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  budget?: number;
  justification: string;
  attachments?: string[];
}

export interface ProcurementItem {
  id: string;
  name: string;
  specification: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  category: string;
  brand?: string;
  model?: string;
  technicalRequirements?: string;
}

export interface ProcurementOrder {
  id: string;
  requestId: string;
  orderNumber: string;
  supplier: {
    id: string;
    name: string;
    contact: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentTerms: string;
  deliveryTerms: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'draft' | 'approved' | 'sent' | 'confirmed' | 'in_transit' | 'delivered' | 'completed';
  approvals: ApprovalRecord[];
}

export interface OrderItem extends ProcurementItem {
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  tax?: number;
  deliveryDate?: string;
}

export interface ApprovalRecord {
  id: string;
  approver: string;
  role: string;
  decision: 'approved' | 'rejected' | 'pending';
  comments?: string;
  timestamp: string;
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  deliveryNumber: string;
  deliveryDate: string;
  items: DeliveryItem[];
  receiver: string;
  location: string;
  status: 'pending' | 'partial' | 'complete';
  qualityCheck: QualityCheckResult;
  documents: string[];
}

export interface DeliveryItem {
  itemId: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity?: number;
  rejectionReason?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface QualityCheckResult {
  id: string;
  inspector: string;
  checkDate: string;
  overallResult: 'pass' | 'fail' | 'conditional';
  checkItems: {
    item: string;
    standard: string;
    result: 'pass' | 'fail';
    remarks?: string;
  }[];
  correctionRequired?: string;
  nextCheckDate?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'threshold' | 'schedule' | 'event' | 'manual';
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  priority: number;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'in';
  value: any;
  logic?: 'and' | 'or';
}

export interface RuleAction {
  type: 'create_request' | 'approve' | 'reject' | 'notify' | 'escalate';
  params: Record<string, any>;
}

/**
 * 采购自动化服务
 */
export class ProcurementAutomationService {
  private requests: Map<string, ProcurementRequest> = new Map();
  private orders: Map<string, ProcurementOrder> = new Map();
  private deliveries: Map<string, DeliveryRecord> = new Map();
  private automationRules: AutomationRule[] = [];
  private approvalWorkflow: Map<string, ApprovalWorkflow> = new Map();

  constructor() {
    this.initializeAutomationRules();
    this.setupEventListeners();
    this.initializeApprovalWorkflows();
  }

  /**
   * 初始化自动化规则
   */
  private initializeAutomationRules() {
    // 库存补充规则
    this.automationRules.push({
      id: 'auto-reorder-1',
      name: '低库存自动补货',
      trigger: 'threshold',
      conditions: [
        { field: 'inventory_level', operator: 'less', value: 20 },
        { field: 'category', operator: 'in', value: ['material', 'consumable'] },
      ],
      actions: [
        { type: 'create_request', params: { urgency: 'medium', quantity_formula: 'reorder_point * 2' } },
        { type: 'notify', params: { recipients: ['procurement_manager'], message: '库存预警，已自动创建补货申请' } },
      ],
      enabled: true,
      priority: 1,
    });

    // 紧急采购规则
    this.automationRules.push({
      id: 'urgent-procurement-1',
      name: '价格异常紧急采购',
      trigger: 'event',
      conditions: [
        { field: 'event_type', operator: 'equals', value: 'price_surge' },
        { field: 'price_increase', operator: 'greater', value: 20 },
      ],
      actions: [
        { type: 'create_request', params: { urgency: 'high', auto_approve: true } },
        { type: 'escalate', params: { to: 'department_head', reason: '价格异常上涨' } },
      ],
      enabled: true,
      priority: 2,
    });

    // 定期采购规则
    this.automationRules.push({
      id: 'scheduled-procurement-1',
      name: '月度办公用品采购',
      trigger: 'schedule',
      conditions: [
        { field: 'day_of_month', operator: 'equals', value: 25 },
      ],
      actions: [
        { type: 'create_request', params: { template: 'office_supplies', urgency: 'low' } },
      ],
      enabled: true,
      priority: 3,
    });
  }

  /**
   * 初始化审批工作流
   */
  private initializeApprovalWorkflows() {
    // 标准审批流程
    this.approvalWorkflow.set('standard', {
      id: 'standard',
      name: '标准采购审批流程',
      steps: [
        { level: 1, role: 'department_manager', threshold: 10000 },
        { level: 2, role: 'procurement_manager', threshold: 50000 },
        { level: 3, role: 'finance_manager', threshold: 100000 },
        { level: 4, role: 'general_manager', threshold: Infinity },
      ],
    });

    // 紧急审批流程
    this.approvalWorkflow.set('urgent', {
      id: 'urgent',
      name: '紧急采购审批流程',
      steps: [
        { level: 1, role: 'procurement_manager', threshold: Infinity },
      ],
    });
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners() {
    // 监听价格预警
    eventBus.on(EVENTS.PRICE_ALERT_TRIGGERED, (data: any) => {
      this.handlePriceAlert(data);
    });

    // 监听库存变化
    eventBus.on(EVENTS.DEVICE_STATUS_CHANGED, (data: any) => {
      if (data.type === 'inventory_update') {
        this.checkInventoryLevels(data);
      }
    });

    // 监听采购申请
    eventBus.on(EVENTS.PROCUREMENT_PLAN_CREATED, (data: any) => {
      this.processProcurementRequest(data);
    });

    // 监听模块数据总线
    moduleDataBus.subscribe('design.equipment_selection', (packet) => {
      this.createProcurementFromDesign(packet.payload);
    });
  }

  /**
   * 创建采购申请
   */
  async createProcurementRequest(params: Partial<ProcurementRequest>): Promise<ProcurementRequest> {
    const request: ProcurementRequest = {
      id: this.generateId('REQ'),
      projectId: params.projectId || useProjectStore.getState().currentProject?.id || '',
      requestType: params.requestType || 'material',
      items: params.items || [],
      urgency: params.urgency || 'medium',
      requester: params.requester || 'system',
      department: params.department || 'procurement',
      requestDate: new Date().toISOString(),
      requiredDate: params.requiredDate || this.calculateRequiredDate(params.urgency || 'medium'),
      budget: params.budget,
      justification: params.justification || '系统自动生成',
      attachments: params.attachments,
    };

    this.requests.set(request.id, request);

    // 触发审批流程
    await this.initiateApproval(request);

    // 发送通知
    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
      type: 'info',
      message: '采购申请已创建',
      description: `申请编号: ${request.id}`,
    });

    return request;
  }

  /**
   * 启动审批流程
   */
  private async initiateApproval(request: ProcurementRequest) {
    const totalAmount = this.calculateTotalAmount(request.items);
    const workflowType = request.urgency === 'high' ? 'urgent' : 'standard';
    const workflow = this.approvalWorkflow.get(workflowType);

    if (!workflow) return;

    // 确定需要的审批级别
    const requiredApprovals = workflow.steps.filter(step => totalAmount >= step.threshold);

    // 创建审批记录
    const approvals: ApprovalRecord[] = requiredApprovals.map(step => ({
      id: this.generateId('APR'),
      approver: this.getApprover(step.role),
      role: step.role,
      decision: 'pending',
      timestamp: new Date().toISOString(),
    }));

    // 如果金额较小或紧急，可以自动审批
    if (totalAmount < 5000 || request.urgency === 'high') {
      approvals[0].decision = 'approved';
      approvals[0].comments = '自动审批';
      
      // 自动创建采购订单
      await this.createProcurementOrder(request, approvals);
    }

    return approvals;
  }

  /**
   * 创建采购订单
   */
  private async createProcurementOrder(
    request: ProcurementRequest,
    approvals: ApprovalRecord[]
  ): Promise<ProcurementOrder> {
    // 获取推荐供应商
    const category = request.items[0]?.category || '材料';
    const recommendations = supplierRecommendationService.recommend({
      materialCategory: category,
      urgency: request.urgency,
      qualityRequirement: 'high',
    });

    const supplier = recommendations[0]?.supplier;
    if (!supplier) {
      throw new Error('未找到合适的供应商');
    }

    // 创建订单项
    const orderItems: OrderItem[] = request.items.map(item => ({
      ...item,
      unitPrice: item.estimatedPrice || 0,
      totalPrice: (item.estimatedPrice || 0) * item.quantity,
    }));

    const order: ProcurementOrder = {
      id: this.generateId('ORD'),
      requestId: request.id,
      orderNumber: this.generateOrderNumber(),
      supplier: {
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone,
      },
      items: orderItems,
      totalAmount: orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
      paymentTerms: supplier.paymentTerms,
      deliveryTerms: `交货期: ${this.calculateDeliveryDays(request.urgency)}天`,
      orderDate: new Date().toISOString(),
      expectedDelivery: this.calculateExpectedDelivery(request.urgency),
      status: 'approved',
      approvals,
    };

    this.orders.set(order.id, order);

    // 发送订单给供应商
    await this.sendOrderToSupplier(order);

    return order;
  }

  /**
   * 发送订单给供应商
   */
  private async sendOrderToSupplier(order: ProcurementOrder) {
    // 模拟发送订单
    setTimeout(() => {
      order.status = 'sent';
      
      // 模拟供应商确认
      setTimeout(() => {
        order.status = 'confirmed';
        eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
          type: 'success',
          message: '订单已确认',
          description: `供应商 ${order.supplier.name} 已确认订单 ${order.orderNumber}`,
        });
        
        // 启动交付跟踪
        this.startDeliveryTracking(order);
      }, 3000);
    }, 1000);
  }

  /**
   * 启动交付跟踪
   */
  private startDeliveryTracking(order: ProcurementOrder) {
    const delivery: DeliveryRecord = {
      id: this.generateId('DEL'),
      orderId: order.id,
      deliveryNumber: this.generateDeliveryNumber(),
      deliveryDate: order.expectedDelivery,
      items: order.items.map(item => ({
        itemId: item.id,
        orderedQuantity: item.quantity,
        deliveredQuantity: 0,
        acceptedQuantity: 0,
      })),
      receiver: '',
      location: '',
      status: 'pending',
      qualityCheck: {
        id: this.generateId('QC'),
        inspector: '',
        checkDate: '',
        overallResult: 'pass',
        checkItems: [],
      },
      documents: [],
    };

    this.deliveries.set(delivery.id, delivery);

    // 模拟交付过程
    this.simulateDeliveryProcess(delivery, order);
  }

  /**
   * 模拟交付过程
   */
  private simulateDeliveryProcess(delivery: DeliveryRecord, order: ProcurementOrder) {
    // 运输中
    setTimeout(() => {
      order.status = 'in_transit';
      eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
        type: 'info',
        message: '订单运输中',
        description: `订单 ${order.orderNumber} 正在运输中`,
      });
    }, 5000);

    // 已交付
    setTimeout(() => {
      order.status = 'delivered';
      delivery.status = 'complete';
      delivery.deliveryDate = new Date().toISOString();
      delivery.receiver = 'warehouse_manager';
      delivery.location = '主仓库';
      
      // 更新交付数量
      delivery.items.forEach(item => {
        item.deliveredQuantity = item.orderedQuantity;
        item.acceptedQuantity = item.orderedQuantity;
      });

      // 执行质量检查
      this.performQualityCheck(delivery);
    }, 10000);
  }

  /**
   * 执行质量检查
   */
  private performQualityCheck(delivery: DeliveryRecord) {
    delivery.qualityCheck = {
      id: this.generateId('QC'),
      inspector: 'quality_inspector',
      checkDate: new Date().toISOString(),
      overallResult: 'pass',
      checkItems: [
        { item: '外观检查', standard: 'GB/T 1234', result: 'pass' },
        { item: '数量核对', standard: '订单要求', result: 'pass' },
        { item: '规格验证', standard: '技术规范', result: 'pass' },
      ],
    };

    // 更新库存
    this.updateInventory(delivery);

    // 完成订单
    const order = this.orders.get(delivery.orderId);
    if (order) {
      order.status = 'completed';
      
      eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
        type: 'success',
        message: '采购完成',
        description: `订单 ${order.orderNumber} 已完成验收入库`,
      });

      // 触发施工模块
      moduleDataBus.publishData('procurement', 'delivered_materials', {
        orderId: order.id,
        items: order.items,
        deliveryDate: delivery.deliveryDate,
      });
    }
  }

  /**
   * 更新库存
   */
  private updateInventory(delivery: DeliveryRecord) {
    const order = this.orders.get(delivery.orderId);
    if (!order) return;

    // 发送库存更新事件
    eventBus.emit(EVENTS.DEVICE_STATUS_CHANGED, {
      type: 'inventory_update',
      action: 'add',
      items: delivery.items.map(item => {
        const orderItem = order.items.find(oi => oi.id === item.itemId);
        return {
          id: item.itemId,
          name: orderItem?.name,
          quantity: item.acceptedQuantity,
          location: delivery.location,
        };
      }),
    });
  }

  /**
   * 处理价格预警
   */
  private handlePriceAlert(data: any) {
    // 检查自动化规则
    const applicableRules = this.automationRules.filter(rule => 
      rule.enabled && 
      rule.trigger === 'event' &&
      this.evaluateConditions(rule.conditions, { event_type: 'price_surge', ...data })
    );

    // 执行规则动作
    applicableRules.forEach(rule => {
      this.executeRuleActions(rule.actions, data);
    });
  }

  /**
   * 检查库存水平
   */
  private checkInventoryLevels(data: any) {
    const applicableRules = this.automationRules.filter(rule => 
      rule.enabled && 
      rule.trigger === 'threshold' &&
      this.evaluateConditions(rule.conditions, data)
    );

    applicableRules.forEach(rule => {
      this.executeRuleActions(rule.actions, data);
    });
  }

  /**
   * 处理采购申请
   */
  private processProcurementRequest(data: any) {
    if (data.auto) {
      this.createProcurementRequest(data);
    }
  }

  /**
   * 从设计创建采购
   */
  private createProcurementFromDesign(equipments: any[]) {
    const items: ProcurementItem[] = equipments.map(eq => ({
      id: this.generateId('ITEM'),
      name: eq.name,
      specification: eq.specification || '',
      quantity: eq.quantity || 1,
      unit: eq.unit || '台',
      estimatedPrice: eq.price,
      category: 'equipment',
      brand: eq.brand,
      model: eq.model,
      technicalRequirements: eq.requirements,
    }));

    this.createProcurementRequest({
      requestType: 'equipment',
      items,
      urgency: 'medium',
      department: 'engineering',
      justification: '设计阶段设备选型',
    });
  }

  /**
   * 评估条件
   */
  private evaluateConditions(conditions: RuleCondition[], data: any): boolean {
    return conditions.every(condition => {
      const value = data[condition.field];
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'greater':
          return value > condition.value;
        case 'less':
          return value < condition.value;
        case 'contains':
          return String(value).includes(condition.value);
        case 'in':
          return condition.value.includes(value);
        default:
          return false;
      }
    });
  }

  /**
   * 执行规则动作
   */
  private executeRuleActions(actions: RuleAction[], data: any) {
    actions.forEach(action => {
      switch (action.type) {
        case 'create_request':
          this.createProcurementRequest({
            urgency: action.params.urgency,
            items: this.generateItemsFromRule(action.params, data),
          });
          break;
        case 'notify':
          eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
            type: 'warning',
            message: action.params.message,
          });
          break;
        case 'escalate':
          this.escalateToManager(action.params.to, action.params.reason);
          break;
      }
    });
  }

  /**
   * 根据规则生成采购项
   */
  private generateItemsFromRule(params: any, data: any): ProcurementItem[] {
    // 根据规则参数生成采购项
    return [{
      id: this.generateId('ITEM'),
      name: data.materialName || '自动补货项',
      specification: data.specification || '',
      quantity: params.quantity || data.suggestedQuantity || 100,
      unit: data.unit || '个',
      category: data.category || 'material',
    }];
  }

  /**
   * 上报给管理者
   */
  private escalateToManager(role: string, reason: string) {
    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
      type: 'warning',
      message: `已上报至 ${role}`,
      description: reason,
    });
  }

  /**
   * 计算所需日期
   */
  private calculateRequiredDate(urgency: string): string {
    const date = new Date();
    switch (urgency) {
      case 'high':
        date.setDate(date.getDate() + 3);
        break;
      case 'medium':
        date.setDate(date.getDate() + 7);
        break;
      case 'low':
        date.setDate(date.getDate() + 14);
        break;
    }
    return date.toISOString();
  }

  /**
   * 计算总金额
   */
  private calculateTotalAmount(items: ProcurementItem[]): number {
    return items.reduce((sum, item) => sum + (item.estimatedPrice || 0) * item.quantity, 0);
  }

  /**
   * 获取审批人
   */
  private getApprover(role: string): string {
    const approvers: Record<string, string> = {
      department_manager: '部门经理',
      procurement_manager: '采购经理',
      finance_manager: '财务经理',
      general_manager: '总经理',
    };
    return approvers[role] || role;
  }

  /**
   * 计算交付天数
   */
  private calculateDeliveryDays(urgency: string): number {
    switch (urgency) {
      case 'high': return 5;
      case 'medium': return 10;
      case 'low': return 15;
      default: return 10;
    }
  }

  /**
   * 计算预期交付日期
   */
  private calculateExpectedDelivery(urgency: string): string {
    const date = new Date();
    date.setDate(date.getDate() + this.calculateDeliveryDays(urgency));
    return date.toISOString();
  }

  /**
   * 生成ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成订单号
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PO-${year}${month}${day}-${random}`;
  }

  /**
   * 生成交付单号
   */
  private generateDeliveryNumber(): string {
    const date = new Date();
    const timestamp = date.getTime().toString(36).toUpperCase();
    return `DEL-${timestamp}`;
  }

  /**
   * 获取采购统计
   */
  getStatistics(): {
    totalRequests: number;
    pendingApprovals: number;
    activeOrders: number;
    completedOrders: number;
    totalAmount: number;
    averageLeadTime: number;
  } {
    const requests = Array.from(this.requests.values());
    const orders = Array.from(this.orders.values());
    
    const pendingApprovals = orders.filter(o => o.status === 'draft').length;
    const activeOrders = orders.filter(o => 
      ['approved', 'sent', 'confirmed', 'in_transit'].includes(o.status)
    ).length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 计算平均交付时间
    const completedWithTime = orders.filter(o => 
      o.status === 'completed' && o.orderDate && o.expectedDelivery
    );
    const averageLeadTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, o) => {
          const orderDate = new Date(o.orderDate).getTime();
          const deliveryDate = new Date(o.expectedDelivery).getTime();
          return sum + (deliveryDate - orderDate) / (1000 * 60 * 60 * 24);
        }, 0) / completedWithTime.length
      : 0;

    return {
      totalRequests: requests.length,
      pendingApprovals,
      activeOrders,
      completedOrders,
      totalAmount,
      averageLeadTime: Math.round(averageLeadTime),
    };
  }
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  steps: {
    level: number;
    role: string;
    threshold: number;
  }[];
}

// 导出单例
export const procurementAutomation = new ProcurementAutomationService();
