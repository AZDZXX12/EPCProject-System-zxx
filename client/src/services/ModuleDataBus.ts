/**
 * 模块数据总线 - 统一管理模块间数据流转
 */

import { eventBus, EVENTS } from '../utils/EventBus';
import { logger } from '../utils/logger';
import { useProjectStore } from '../store/projectStore';

export interface DataFlowConfig {
  source: string;
  target: string;
  dataType: string;
  transformer?: (data: any) => any;
  validator?: (data: any) => boolean;
  autoSync?: boolean;
}

export interface ModuleConnection {
  id: string;
  name: string;
  sourceModule: string;
  targetModule: string;
  dataFlow: DataFlowConfig[];
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  syncCount?: number;
}

export interface DataPacket {
  id: string;
  timestamp: string;
  source: string;
  target: string;
  dataType: string;
  payload: any;
  metadata?: Record<string, any>;
}

/**
 * 模块数据总线
 */
export class ModuleDataBus {
  private connections: Map<string, ModuleConnection> = new Map();
  private dataQueue: DataPacket[] = [];
  private subscribers: Map<string, Set<(data: DataPacket) => void>> = new Map();
  private dataCache: Map<string, any> = new Map();
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initializeConnections();
    this.setupEventListeners();
    this.startAutoSync();
  }

  /**
   * 初始化模块连接配置
   */
  private initializeConnections() {
    // 1. 设计 -> 采购 连接
    this.registerConnection({
      id: 'design-to-procurement',
      name: '设计到采购数据流',
      sourceModule: 'design',
      targetModule: 'procurement',
      dataFlow: [
        {
          source: 'equipment_selection',
          target: 'procurement_plan',
          dataType: 'equipment_list',
          transformer: this.transformEquipmentToProcurement,
          validator: this.validateEquipmentData,
          autoSync: true,
        },
        {
          source: 'material_requirements',
          target: 'material_procurement',
          dataType: 'material_list',
          autoSync: true,
        },
      ],
      status: 'active',
      syncCount: 0,
    });

    // 2. 价格监控 -> 采购 连接
    this.registerConnection({
      id: 'price-to-procurement',
      name: '价格监控到采购数据流',
      sourceModule: 'price_monitor',
      targetModule: 'procurement',
      dataFlow: [
        {
          source: 'price_alert',
          target: 'urgent_procurement',
          dataType: 'price_alert',
          transformer: this.transformPriceAlertToProcurement,
          autoSync: true,
        },
        {
          source: 'batch_materials',
          target: 'procurement_items',
          dataType: 'material_batch',
          autoSync: true,
        },
      ],
      status: 'active',
      syncCount: 0,
    });

    // 3. 采购 -> 施工 连接
    this.registerConnection({
      id: 'procurement-to-construction',
      name: '采购到施工数据流',
      sourceModule: 'procurement',
      targetModule: 'construction',
      dataFlow: [
        {
          source: 'delivered_materials',
          target: 'construction_materials',
          dataType: 'material_delivery',
          validator: this.validateDeliveryData,
          autoSync: true,
        },
        {
          source: 'equipment_arrival',
          target: 'equipment_installation',
          dataType: 'equipment_delivery',
          autoSync: true,
        },
      ],
      status: 'active',
      syncCount: 0,
    });

    // 4. 施工 -> 进度 连接
    this.registerConnection({
      id: 'construction-to-progress',
      name: '施工到进度数据流',
      sourceModule: 'construction',
      targetModule: 'progress',
      dataFlow: [
        {
          source: 'daily_progress',
          target: 'progress_update',
          dataType: 'progress_data',
          transformer: this.transformConstructionProgress,
          autoSync: true,
        },
        {
          source: 'milestone_completion',
          target: 'milestone_update',
          dataType: 'milestone_data',
          autoSync: true,
        },
      ],
      status: 'active',
      syncCount: 0,
    });

    // 5. 供应商 -> 采购 连接
    this.registerConnection({
      id: 'supplier-to-procurement',
      name: '供应商到采购数据流',
      sourceModule: 'supplier',
      targetModule: 'procurement',
      dataFlow: [
        {
          source: 'recommended_supplier',
          target: 'supplier_selection',
          dataType: 'supplier_recommendation',
          autoSync: false,
        },
        {
          source: 'supplier_evaluation',
          target: 'supplier_score',
          dataType: 'evaluation_result',
          autoSync: true,
        },
      ],
      status: 'active',
      syncCount: 0,
    });

    // 6. 风险 -> 全局 连接
    this.registerConnection({
      id: 'risk-to-global',
      name: '风险到全局数据流',
      sourceModule: 'risk',
      targetModule: 'global',
      dataFlow: [
        {
          source: 'risk_alert',
          target: 'global_notification',
          dataType: 'risk_notification',
          autoSync: true,
        },
        {
          source: 'risk_mitigation',
          target: 'action_items',
          dataType: 'mitigation_plan',
          autoSync: true,
        },
      ],
      status: 'active',
      syncCount: 0,
    });
  }

  /**
   * 注册模块连接
   */
  private registerConnection(connection: ModuleConnection) {
    this.connections.set(connection.id, connection);
    
    // 为每个数据流创建订阅通道
    connection.dataFlow.forEach(flow => {
      const channel = `${connection.sourceModule}.${flow.source}`;
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
      }
    });
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners() {
    // 监听设备选型完成
    eventBus.on(EVENTS.DEVICE_CREATED, (data: any) => {
      this.publishData('design', 'equipment_selection', data);
    });

    // 监听价格预警
    eventBus.on(EVENTS.PRICE_ALERT_TRIGGERED, (data: any) => {
      this.publishData('price_monitor', 'price_alert', data);
    });

    // 监听采购项添加
    eventBus.on(EVENTS.PROCUREMENT_ITEM_ADDED, (data: any) => {
      this.publishData('procurement', 'procurement_update', data);
    });

    // 监听供应商评估
    eventBus.on(EVENTS.SUPPLIER_EVALUATED, (data: any) => {
      this.publishData('supplier', 'supplier_evaluation', data);
    });

    // 监听阶段变化
    eventBus.on(EVENTS.PHASE_CHANGED, (data: any) => {
      this.handlePhaseChange(data);
    });

    // 监听风险识别
    eventBus.on(EVENTS.RISK_IDENTIFIED, (data: any) => {
      this.publishData('risk', 'risk_alert', data);
    });
  }

  /**
   * 发布数据到总线
   */
  publishData(source: string, dataType: string, payload: any) {
    const packet: DataPacket = {
      id: this.generatePacketId(),
      timestamp: new Date().toISOString(),
      source,
      target: '*', // 初始目标为所有
      dataType,
      payload,
      metadata: {
        projectId: useProjectStore.getState().currentProject?.id,
      },
    };

    // 加入队列
    this.dataQueue.push(packet);

    // 查找相关连接并处理
    this.connections.forEach(connection => {
      if (connection.sourceModule === source && connection.status === 'active') {
        const flow = connection.dataFlow.find(f => f.source === dataType);
        if (flow) {
          this.processDataFlow(packet, connection, flow);
        }
      }
    });

    // 缓存最新数据
    const cacheKey = `${source}.${dataType}`;
    this.dataCache.set(cacheKey, payload);

    // 触发订阅者
    const channel = `${source}.${dataType}`;
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.forEach(callback => callback(packet));
    }
  }

  /**
   * 处理数据流
   */
  private processDataFlow(packet: DataPacket, connection: ModuleConnection, flow: DataFlowConfig) {
    try {
      // 验证数据
      if (flow.validator && !flow.validator(packet.payload)) {
        logger.warn(`[数据总线] 数据验证失败: ${connection.id} - ${flow.dataType}`);
        return;
      }

      // 转换数据
      let transformedData = packet.payload;
      if (flow.transformer) {
        transformedData = flow.transformer(packet.payload);
      }

      // 创建目标数据包
      const targetPacket: DataPacket = {
        ...packet,
        target: connection.targetModule,
        payload: transformedData,
        metadata: {
          ...packet.metadata,
          connectionId: connection.id,
          flowType: flow.dataType,
        },
      };

      // 发送到目标模块
      this.deliverToTarget(targetPacket, flow.target);

      // 更新连接统计
      connection.lastSync = new Date().toISOString();
      connection.syncCount = (connection.syncCount || 0) + 1;

      // 记录成功
      logger.info(`[数据总线] 流转成功: ${connection.sourceModule} -> ${connection.targetModule} (${flow.dataType})`);
    } catch (error) {
      logger.error(`[数据总线] 流转失败: ${connection.id}`, error);
      connection.status = 'error';
    }
  }

  /**
   * 投递数据到目标模块
   */
  private deliverToTarget(packet: DataPacket, targetType: string) {
    const store = useProjectStore.getState();

    switch (packet.target) {
      case 'procurement':
        this.handleProcurementDelivery(packet, targetType);
        break;
      case 'construction':
        this.handleConstructionDelivery(packet, targetType);
        break;
      case 'progress':
        this.handleProgressDelivery(packet, targetType);
        break;
      case 'global':
        this.handleGlobalDelivery(packet, targetType);
        break;
      default:
        logger.warn(`[数据总线] 未知目标模块: ${packet.target}`);
    }
  }

  /**
   * 处理采购模块投递
   */
  private handleProcurementDelivery(packet: DataPacket, targetType: string) {
    const store = useProjectStore.getState();

    switch (targetType) {
      case 'procurement_plan':
        // 创建采购计划
        store.addProcurementPlan({
          projectId: packet.metadata?.projectId,
          materialId: 'auto-generated',
          materialName: `采购计划 - ${new Date().toLocaleDateString()}`,
          specification: 'Auto',
          quantity: 1,
          estimatedPrice: 0,
          urgency: 'medium',
          items: packet.payload,
          status: 'draft',
        });
        break;

      case 'urgent_procurement':
        // 创建紧急采购
        eventBus.emit(EVENTS.PROCUREMENT_PLAN_CREATED, {
          type: 'urgent',
          reason: 'price_alert',
          data: packet.payload,
        });
        break;

      case 'procurement_items':
        // 批量添加采购项
        packet.payload.forEach((item: any) => {
          eventBus.emit(EVENTS.PROCUREMENT_ITEM_ADDED, item);
        });
        break;
    }
  }

  /**
   * 处理施工模块投递
   */
  private handleConstructionDelivery(packet: DataPacket, targetType: string) {
    switch (targetType) {
      case 'construction_materials':
        // 更新施工材料库存
        eventBus.emit(EVENTS.DEVICE_STATUS_CHANGED, {
          type: 'material_received',
          data: packet.payload,
        });
        break;

      case 'equipment_installation':
        // 创建设备安装任务
        eventBus.emit(EVENTS.TASK_CREATED, {
          type: 'equipment_installation',
          equipment: packet.payload,
        });
        break;
    }
  }

  /**
   * 处理进度模块投递
   */
  private handleProgressDelivery(packet: DataPacket, targetType: string) {
    switch (targetType) {
      case 'progress_update':
        // 更新项目进度
        eventBus.emit(EVENTS.PROGRESS_CHANGED, packet.payload);
        break;

      case 'milestone_update':
        // 更新里程碑
        eventBus.emit(EVENTS.MILESTONE_UPDATED, packet.payload);
        break;
    }
  }

  /**
   * 处理全局模块投递
   */
  private handleGlobalDelivery(packet: DataPacket, targetType: string) {
    switch (targetType) {
      case 'global_notification':
        // 发送全局通知
        eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
          type: 'warning',
          message: packet.payload.message,
          description: packet.payload.description,
        });
        break;

      case 'action_items':
        // 创建行动项
        eventBus.emit(EVENTS.TASK_CREATED, {
          type: 'action_item',
          priority: 'high',
          data: packet.payload,
        });
        break;
    }
  }

  /**
   * 处理阶段变化
   */
  private handlePhaseChange(data: any) {
    // 根据阶段变化触发相应的数据流
    const { fromPhase, toPhase } = data;

    // 设计完成 -> 采购开始
    if (fromPhase === 'design' && toPhase === 'procurement') {
      this.triggerDesignToProcurementFlow();
    }

    // 采购完成 -> 施工开始
    if (fromPhase === 'procurement' && toPhase === 'construction') {
      this.triggerProcurementToConstructionFlow();
    }
  }

  /**
   * 触发设计到采购的数据流
   */
  private triggerDesignToProcurementFlow() {
    const store = useProjectStore.getState();
    const equipments = store.equipments.filter(e => e.status === 'selected');

    if (equipments.length > 0) {
      this.publishData('design', 'equipment_selection', equipments);
    }
  }

  /**
   * 触发采购到施工的数据流
   */
  private triggerProcurementToConstructionFlow() {
    const store = useProjectStore.getState();
    const deliveredItems = store.procurementPlans
      .filter(p => p.status === 'delivered')
      .flatMap(p => p.items);

    if (deliveredItems.length > 0) {
      this.publishData('procurement', 'delivered_materials', deliveredItems);
    }
  }

  /**
   * 数据转换器：设备到采购
   */
  private transformEquipmentToProcurement(data: any) {
    if (Array.isArray(data)) {
      return data.map(equipment => ({
        id: `proc-${equipment.id}`,
        equipmentId: equipment.id,
        name: equipment.name,
        specification: equipment.specification,
        quantity: equipment.quantity || 1,
        estimatedPrice: equipment.price,
        supplier: equipment.supplier,
        category: 'equipment',
        urgency: 'normal',
      }));
    }
    return data;
  }

  /**
   * 数据转换器：价格预警到采购
   */
  private transformPriceAlertToProcurement(data: any) {
    return {
      id: `urgent-${Date.now()}`,
      materialId: data.materialId,
      name: data.materialName,
      reason: data.alertType,
      currentPrice: data.currentPrice,
      threshold: data.threshold,
      recommendedAction: data.recommendation,
      urgency: 'high',
      quantity: data.suggestedQuantity || 0,
    };
  }

  /**
   * 数据转换器：施工进度
   */
  private transformConstructionProgress(data: any) {
    return {
      date: data.date,
      progress: data.completionRate,
      completedTasks: data.completedTasks,
      totalTasks: data.totalTasks,
      milestones: data.milestones,
      issues: data.issues || [],
    };
  }

  /**
   * 数据验证器：设备数据
   */
  private validateEquipmentData(data: any): boolean {
    if (!Array.isArray(data)) return false;
    return data.every(item => 
      item.id && 
      item.name && 
      item.specification
    );
  }

  /**
   * 数据验证器：交付数据
   */
  private validateDeliveryData(data: any): boolean {
    if (!Array.isArray(data)) return false;
    return data.every(item => 
      item.id && 
      item.deliveryDate && 
      item.quantity > 0
    );
  }

  /**
   * 订阅数据通道
   */
  subscribe(channel: string, callback: (data: DataPacket) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.subscribers.get(channel)?.delete(callback);
    };
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): ModuleConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * 获取数据队列
   */
  getDataQueue(limit: number = 100): DataPacket[] {
    return this.dataQueue.slice(-limit);
  }

  /**
   * 获取缓存数据
   */
  getCachedData(key: string): any {
    return this.dataCache.get(key);
  }

  /**
   * 手动触发数据同步
   */
  manualSync(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection && connection.status === 'active') {
      connection.dataFlow.forEach(flow => {
        const cacheKey = `${connection.sourceModule}.${flow.source}`;
        const cachedData = this.dataCache.get(cacheKey);
        if (cachedData) {
          const packet: DataPacket = {
            id: this.generatePacketId(),
            timestamp: new Date().toISOString(),
            source: connection.sourceModule,
            target: connection.targetModule,
            dataType: flow.dataType,
            payload: cachedData,
            metadata: { manual: true },
          };
          this.processDataFlow(packet, connection, flow);
        }
      });
    }
  }

  /**
   * 启动自动同步
   */
  private startAutoSync() {
    this.syncInterval = setInterval(() => {
      this.connections.forEach(connection => {
        if (connection.status === 'active') {
          connection.dataFlow.forEach(flow => {
            if (flow.autoSync) {
              const cacheKey = `${connection.sourceModule}.${flow.source}`;
              const cachedData = this.dataCache.get(cacheKey);
              if (cachedData) {
                // 检查是否需要同步（例如：数据有更新）
                const lastSync = connection.lastSync ? new Date(connection.lastSync).getTime() : 0;
                const now = Date.now();
                if (now - lastSync > 60000) { // 每分钟最多同步一次
                  this.manualSync(connection.id);
                }
              }
            }
          });
        }
      });
    }, 30000); // 每30秒检查一次
  }

  /**
   * 停止自动同步
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 生成数据包ID
   */
  private generatePacketId(): string {
    return `packet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取连接健康度
   */
  getConnectionHealth(): {
    total: number;
    active: number;
    inactive: number;
    error: number;
    health: number;
  } {
    const connections = Array.from(this.connections.values());
    const total = connections.length;
    const active = connections.filter(c => c.status === 'active').length;
    const inactive = connections.filter(c => c.status === 'inactive').length;
    const error = connections.filter(c => c.status === 'error').length;
    const health = total > 0 ? (active / total) * 100 : 0;

    return { total, active, inactive, error, health };
  }

  /**
   * 重置连接
   */
  resetConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = 'active';
      connection.syncCount = 0;
      connection.lastSync = undefined;
    }
  }

  /**
   * 清理数据队列
   */
  clearDataQueue(olderThan?: Date) {
    if (olderThan) {
      this.dataQueue = this.dataQueue.filter(
        packet => new Date(packet.timestamp) > olderThan
      );
    } else {
      this.dataQueue = [];
    }
  }
}

// 导出单例
export const moduleDataBus = new ModuleDataBus();
