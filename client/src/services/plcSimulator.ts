/**
 * PLC数据模拟器
 * 用于开发和测试，模拟真实PLC设备的数据变化
 */

import type { PLCDataPoint, DeviceStatus, SCADAAlarm } from '../types/industrial';
import { logger } from '../utils/logger';

export class PLCSimulator {
  private dataPoints: Map<string, PLCDataPoint> = new Map();
  private devices: Map<string, DeviceStatus> = new Map();
  private alarms: SCADAAlarm[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(data: PLCDataPoint) => void> = new Set();

  constructor() {
    this.initializeDataPoints();
    this.initializeDevices();
  }

  /**
   * 初始化模拟数据点
   */
  private initializeDataPoints(): void {
    const points: PLCDataPoint[] = [
      // 温度传感器
      {
        id: 'temp_1',
        name: '反应器温度',
        address: 'DB1.DBW0',
        type: 'REAL',
        value: 85.5,
        unit: '°C',
        min: 0,
        max: 150,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      {
        id: 'temp_2',
        name: '冷却水温度',
        address: 'DB1.DBW4',
        type: 'REAL',
        value: 25.3,
        unit: '°C',
        min: 0,
        max: 100,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      // 压力传感器
      {
        id: 'pressure_1',
        name: '系统压力',
        address: 'DB1.DBW8',
        type: 'REAL',
        value: 2.5,
        unit: 'MPa',
        min: 0,
        max: 10,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      {
        id: 'pressure_2',
        name: '进料压力',
        address: 'DB1.DBW12',
        type: 'REAL',
        value: 1.8,
        unit: 'MPa',
        min: 0,
        max: 5,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      // 流量计
      {
        id: 'flow_1',
        name: '进料流量',
        address: 'DB1.DBW16',
        type: 'REAL',
        value: 120,
        unit: 'L/h',
        min: 0,
        max: 500,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      {
        id: 'flow_2',
        name: '出料流量',
        address: 'DB1.DBW20',
        type: 'REAL',
        value: 115,
        unit: 'L/h',
        min: 0,
        max: 500,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      // 液位计
      {
        id: 'level_1',
        name: '储罐液位',
        address: 'DB1.DBW24',
        type: 'REAL',
        value: 65.5,
        unit: '%',
        min: 0,
        max: 100,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      // 开关量
      {
        id: 'motor_1',
        name: '主泵运行',
        address: 'DB1.DBX28.0',
        type: 'BOOL',
        value: true,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      {
        id: 'valve_1',
        name: '进料阀状态',
        address: 'DB1.DBX28.1',
        type: 'BOOL',
        value: true,
        quality: 'GOOD',
        timestamp: Date.now()
      },
      {
        id: 'alarm_1',
        name: '高温报警',
        address: 'DB1.DBX28.2',
        type: 'BOOL',
        value: false,
        quality: 'GOOD',
        timestamp: Date.now()
      }
    ];

    points.forEach(point => {
      this.dataPoints.set(point.id, point);
    });
  }

  /**
   * 初始化模拟设备
   */
  private initializeDevices(): void {
    const devices: DeviceStatus[] = [
      {
        id: 'PLC-001',
        name: '主控PLC',
        type: 'MOTOR',
        status: 'RUNNING',
        parameters: {}
      },
      {
        id: 'PUMP-001',
        name: '进料泵',
        type: 'PUMP',
        status: 'RUNNING',
        parameters: {}
      },
      {
        id: 'VALVE-001',
        name: '控制阀',
        type: 'VALVE',
        status: 'RUNNING',
        parameters: {}
      }
    ];

    devices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  /**
   * 启动模拟器
   */
  start(updateInterval: number = 1000): void {
    if (this.updateInterval) {
      this.stop();
    }

    this.updateInterval = setInterval(() => {
      this.updateDataPoints();
      this.checkAlarms();
    }, updateInterval);

    logger.info('[PLC模拟器] 已启动', { updateInterval });
  }

  /**
   * 停止模拟器
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    logger.info('[PLC模拟器] 已停止');
  }

  /**
   * 更新数据点
   */
  private updateDataPoints(): void {
    this.dataPoints.forEach((point, id) => {
      if (point.type === 'REAL') {
        // 模拟真实的数据波动
        const variation = this.getVariation(id);
        const newValue = Math.max(
          point.min || 0,
          Math.min(
            point.max || 100,
            (point.value as number) + variation
          )
        );

        const updatedPoint: PLCDataPoint = {
          ...point,
          value: Number(newValue.toFixed(2)),
          timestamp: Date.now()
        };

        this.dataPoints.set(id, updatedPoint);
        this.notifyListeners(updatedPoint);
      }
    });
  }

  /**
   * 获取数据变化量（模拟真实波动）
   */
  private getVariation(pointId: string): number {
    const patterns: Record<string, () => number> = {
      // 温度：缓慢波动
      temp_1: () => (Math.random() - 0.5) * 0.5,
      temp_2: () => (Math.random() - 0.5) * 0.3,
      // 压力：中等波动
      pressure_1: () => (Math.random() - 0.5) * 0.1,
      pressure_2: () => (Math.random() - 0.5) * 0.08,
      // 流量：较大波动
      flow_1: () => (Math.random() - 0.5) * 5,
      flow_2: () => (Math.random() - 0.5) * 4,
      // 液位：缓慢变化
      level_1: () => (Math.random() - 0.5) * 0.2
    };

    return patterns[pointId]?.() || (Math.random() - 0.5) * 2;
  }

  /**
   * 检查报警条件
   */
  private checkAlarms(): void {
    const temp1 = this.dataPoints.get('temp_1');
    const pressure1 = this.dataPoints.get('pressure_1');

    // 高温报警
    if (temp1 && (temp1.value as number) > 100) {
      this.triggerAlarm({
        id: `alarm_${Date.now()}`,
        timestamp: Date.now(),
        level: 'HIGH',
        type: 'PROCESS',
        message: `反应器温度过高: ${temp1.value}°C`,
        device: 'PLC-001',
        acknowledged: false
      });
    }

    // 高压报警
    if (pressure1 && (pressure1.value as number) > 8) {
      this.triggerAlarm({
        id: `alarm_${Date.now()}`,
        timestamp: Date.now(),
        level: 'CRITICAL',
        type: 'PROCESS',
        message: `系统压力过高: ${pressure1.value}MPa`,
        device: 'PLC-001',
        acknowledged: false
      });
    }
  }

  /**
   * 触发报警
   */
  private triggerAlarm(alarm: SCADAAlarm): void {
    // 避免重复报警
    const exists = this.alarms.some(a => 
      a.message === alarm.message && 
      !a.acknowledged &&
      Date.now() - a.timestamp < 60000 // 1分钟内
    );

    if (!exists) {
      this.alarms.push(alarm);
      logger.warn('[PLC模拟器] 报警:', alarm.message, { level: alarm.level });
    }
  }

  /**
   * 读取数据点
   */
  readDataPoint(id: string): PLCDataPoint | undefined {
    return this.dataPoints.get(id);
  }

  /**
   * 写入数据点
   */
  writeDataPoint(id: string, value: any): boolean {
    const point = this.dataPoints.get(id);
    if (!point) return false;

    const updatedPoint: PLCDataPoint = {
      ...point,
      value,
      timestamp: Date.now()
    };

    this.dataPoints.set(id, updatedPoint);
    this.notifyListeners(updatedPoint);
    return true;
  }

  /**
   * 获取所有数据点
   */
  getAllDataPoints(): PLCDataPoint[] {
    return Array.from(this.dataPoints.values());
  }

  /**
   * 获取设备状态
   */
  getDeviceStatus(id: string): DeviceStatus | undefined {
    return this.devices.get(id);
  }

  /**
   * 更新设备状态
   */
  updateDeviceStatus(id: string, status: Partial<DeviceStatus>): boolean {
    const device = this.devices.get(id);
    if (!device) return false;

    const updatedDevice: DeviceStatus = {
      ...device,
      ...status
    };

    this.devices.set(id, updatedDevice);
    return true;
  }

  /**
   * 获取所有报警
   */
  getAlarms(): SCADAAlarm[] {
    return this.alarms;
  }

  /**
   * 确认报警
   */
  acknowledgeAlarm(alarmId: string, operator: string): boolean {
    const alarm = this.alarms.find(a => a.id === alarmId);
    if (!alarm) return false;

    alarm.acknowledged = true;
    alarm.acknowledgedBy = operator;
    alarm.acknowledgedAt = Date.now();
    return true;
  }

  /**
   * 添加数据监听器
   */
  addListener(callback: (data: PLCDataPoint) => void): void {
    this.listeners.add(callback);
  }

  /**
   * 移除数据监听器
   */
  removeListener(callback: (data: PLCDataPoint) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(data: PLCDataPoint): void {
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * 模拟设备启动
   */
  startDevice(deviceId: string): boolean {
    return this.updateDeviceStatus(deviceId, { status: 'RUNNING' });
  }

  /**
   * 模拟设备停止
   */
  stopDevice(deviceId: string): boolean {
    return this.updateDeviceStatus(deviceId, { status: 'STOPPED' });
  }

  /**
   * 模拟设备故障
   */
  faultDevice(deviceId: string): boolean {
    return this.updateDeviceStatus(deviceId, { status: 'FAULT' });
  }

  /**
   * 重置模拟器
   */
  reset(): void {
    this.stop();
    this.dataPoints.clear();
    this.devices.clear();
    this.alarms = [];
    this.initializeDataPoints();
    this.initializeDevices();
  }
}

// 导出单例
export const plcSimulator = new PLCSimulator();
export default plcSimulator;
