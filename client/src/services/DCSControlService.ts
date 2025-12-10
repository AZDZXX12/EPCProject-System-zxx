/**
 * DCS分布式控制系统服务
 * 管理化工生产线的实时控制和数据采集
 */

export interface EquipmentStatus {
  id: string;
  name: string;
  type: 'pump' | 'valve' | 'reactor' | 'tank' | 'compressor' | 'furnace';
  status: 'running' | 'stopped' | 'warning' | 'error' | 'maintenance';
  speed?: number; // RPM
  power?: number; // kW
  temperature?: number; // °C
  pressure?: number; // MPa
  flowRate?: number; // m³/h
  level?: number; // %
  position?: number; // % (for valves)
}

export interface ControlLoop {
  id: string;
  tag: string;
  description: string;
  type: 'TIC' | 'PIC' | 'FIC' | 'LIC'; // Temperature/Pressure/Flow/Level Indicator Controller
  pv: number; // Process Variable
  sp: number; // Set Point
  op: number; // Output
  mode: 'AUTO' | 'MANUAL' | 'CASCADE';
  unit: string;
  alarm: {
    HH?: number; // High High
    H?: number;  // High
    L?: number;  // Low
    LL?: number; // Low Low
    current?: 'HH' | 'H' | 'L' | 'LL' | null;
  };
}

export interface AlarmEvent {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  tag: string;
  description: string;
  value?: number;
  limit?: number;
  acknowledged: boolean;
}

export interface ProcessData {
  timestamp: Date;
  controlLoops: ControlLoop[];
  equipment: EquipmentStatus[];
  alarms: AlarmEvent[];
  kpis: {
    loadFactor: number;
    energyConsumption: number;
    productionRate: number;
    efficiency: number;
  };
}

class DCSControlService {
  private subscribers: Set<(data: ProcessData) => void> = new Set();
  private data: ProcessData;
  private simulationInterval: NodeJS.Timeout | null = null;
  private alarmQueue: AlarmEvent[] = [];

  constructor() {
    this.data = this.initializeData();
  }

  /**
   * 初始化工艺数据
   */
  private initializeData(): ProcessData {
    return {
      timestamp: new Date(),
      controlLoops: [
        {
          id: 'TIC-101',
          tag: 'TIC-101',
          description: '裂解炉出口温度控制',
          type: 'TIC',
          pv: 842.0,
          sp: 840.0,
          op: 45.0,
          mode: 'AUTO',
          unit: '°C',
          alarm: { HH: 860, H: 850, L: 800, LL: 790, current: null }
        },
        {
          id: 'PIC-203',
          tag: 'PIC-203',
          description: '压缩机入口压力控制',
          type: 'PIC',
          pv: 45.1,
          sp: 45.0,
          op: 60.0,
          mode: 'AUTO',
          unit: 'MPa',
          alarm: { HH: 50, H: 48, L: 40, LL: 38, current: null }
        },
        {
          id: 'FIC-301',
          tag: 'FIC-301',
          description: '原料进料流量控制',
          type: 'FIC',
          pv: 125.3,
          sp: 125.0,
          op: 55.2,
          mode: 'AUTO',
          unit: 'm³/h',
          alarm: { HH: 150, H: 140, L: 100, LL: 90, current: null }
        },
        {
          id: 'LIC-101',
          tag: 'LIC-101',
          description: 'TK-101液位控制',
          type: 'LIC',
          pv: 72.5,
          sp: 70.0,
          op: 42.0,
          mode: 'AUTO',
          unit: '%',
          alarm: { HH: 95, H: 90, L: 20, LL: 10, current: null }
        },
        {
          id: 'LIC-201',
          tag: 'LIC-201',
          description: 'TK-201液位控制',
          type: 'LIC',
          pv: 88.9,
          sp: 85.0,
          op: 38.5,
          mode: 'AUTO',
          unit: '%',
          alarm: { HH: 95, H: 90, L: 20, LL: 10, current: 'H' }
        }
      ],
      equipment: [
        {
          id: 'P-101A',
          name: '原料进料泵A',
          type: 'pump',
          status: 'running',
          speed: 1450,
          power: 75.2,
          flowRate: 125.3,
          temperature: 65.5
        },
        {
          id: 'C-201A',
          name: '裂解气压缩机A',
          type: 'compressor',
          status: 'running',
          speed: 3600,
          power: 850.5,
          temperature: 88.2,
          pressure: 45.1
        },
        {
          id: 'F-101',
          name: '裂解炉',
          type: 'furnace',
          status: 'running',
          temperature: 842.0,
          power: 2500
        },
        {
          id: 'V-101',
          name: '进料调节阀',
          type: 'valve',
          status: 'running',
          position: 55.2
        },
        {
          id: 'TK-101',
          name: '粗汽油储罐',
          type: 'tank',
          status: 'running',
          level: 72.5,
          temperature: 45.2
        },
        {
          id: 'TK-201',
          name: '乙烯储罐',
          type: 'tank',
          status: 'warning',
          level: 88.9,
          temperature: -103.7,
          pressure: 0.7
        }
      ],
      alarms: [],
      kpis: {
        loadFactor: 98.5,
        energyConsumption: 420,
        productionRate: 156.8,
        efficiency: 92.3
      }
    };
  }

  /**
   * 订阅数据更新
   */
  subscribe(callback: (data: ProcessData) => void): () => void {
    this.subscribers.add(callback);
    callback(this.data);
    return () => this.subscribers.delete(callback);
  }

  /**
   * 启动实时数据模拟
   */
  startSimulation(): void {
    if (this.simulationInterval) {
      console.log('[DCS] ⚠️ 模拟已在运行');
      return;
    }

    console.log('[DCS] ✅ 启动DCS实时数据模拟 (1Hz)');
    this.simulationInterval = setInterval(() => {
      this.updateProcessData();
      this.notifySubscribers();
    }, 1000);
  }

  /**
   * 停止数据模拟
   */
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  /**
   * 更新过程数据（模拟真实波动）
   */
  private updateProcessData(): void {
    this.data.timestamp = new Date();
    const time = Date.now() / 1000;
    
    // 调试日志（每10秒输出一次）
    if (Math.floor(time) % 10 === 0) {
      console.log('[DCS] 📊 数据更新中...', {
        timestamp: this.data.timestamp.toLocaleTimeString(),
        subscribers: this.subscribers.size
      });
    }

    // 更新控制回路
    this.data.controlLoops = this.data.controlLoops.map(loop => {
      let newPV = loop.pv;
      let newOP = loop.op;

      switch (loop.id) {
        case 'TIC-101':
          newPV = loop.sp + Math.sin(time / 2) * 3 + (Math.random() - 0.5) * 1.5;
          newOP = 45 + Math.cos(time / 3) * 5 + (Math.random() - 0.5) * 2;
          break;
        case 'PIC-203':
          newPV = loop.sp + (Math.random() - 0.5) * 0.5;
          newOP = 60 + (Math.random() - 0.5) * 2;
          break;
        case 'FIC-301':
          newPV = loop.sp + Math.sin(time / 4) * 2 + (Math.random() - 0.5);
          newOP = 55 + Math.sin(time / 3) * 3;
          break;
        case 'LIC-101':
          newPV = Math.min(98, Math.max(2, loop.pv + (Math.random() - 0.45) * 0.5));
          newOP = 42 + (Math.random() - 0.5) * 2;
          break;
        case 'LIC-201':
          newPV = Math.min(98, Math.max(2, loop.pv + (Math.random() - 0.4) * 0.5));
          newOP = 38 + (Math.random() - 0.5) * 2;
          break;
      }

      // 检查报警
      const alarm = this.checkAlarm(loop.id, newPV, loop.alarm);

      return { ...loop, pv: newPV, op: newOP, alarm: { ...loop.alarm, current: alarm } };
    });

    // 更新设备状态
    this.data.equipment = this.data.equipment.map(eq => {
      const updates: Partial<EquipmentStatus> = {};

      if (eq.type === 'pump' && eq.flowRate !== undefined) {
        updates.flowRate = 125 + Math.sin(time / 4) * 2 + (Math.random() - 0.5);
        updates.temperature = 65 + (Math.random() - 0.5) * 0.5;
      }

      if (eq.type === 'compressor') {
        updates.temperature = 88 + (Math.random() - 0.5);
        updates.power = 850 + (Math.random() - 0.5) * 10;
      }

      if (eq.type === 'furnace') {
        const ticLoop = this.data.controlLoops.find(l => l.id === 'TIC-101');
        if (ticLoop) {
          updates.temperature = ticLoop.pv;
        }
      }

      if (eq.type === 'tank') {
        const licLoop = this.data.controlLoops.find(l => l.tag.includes(eq.id.replace('TK', 'LIC')));
        if (licLoop) {
          updates.level = licLoop.pv;
        }
      }

      return { ...eq, ...updates };
    });

    // 更新KPI
    this.data.kpis = {
      loadFactor: 98.5 + Math.sin(time / 10) * 1.5,
      energyConsumption: 420 + Math.sin(time / 8) * 5,
      productionRate: 156.8 + Math.sin(time / 6) * 3,
      efficiency: 92.3 + Math.sin(time / 12) * 1.2
    };
  }

  /**
   * 检查报警限值
   */
  private checkAlarm(
    tag: string,
    value: number,
    limits: ControlLoop['alarm']
  ): 'HH' | 'H' | 'L' | 'LL' | null {
    if (limits.HH !== undefined && value >= limits.HH) {
      this.addAlarm(tag, 'critical', `${tag} 超高高限`, value, limits.HH);
      return 'HH';
    }
    if (limits.H !== undefined && value >= limits.H) {
      this.addAlarm(tag, 'high', `${tag} 超高限`, value, limits.H);
      return 'H';
    }
    if (limits.LL !== undefined && value <= limits.LL) {
      this.addAlarm(tag, 'critical', `${tag} 超低低限`, value, limits.LL);
      return 'LL';
    }
    if (limits.L !== undefined && value <= limits.L) {
      this.addAlarm(tag, 'medium', `${tag} 超低限`, value, limits.L);
      return 'L';
    }
    return null;
  }

  /**
   * 添加报警事件
   */
  private addAlarm(tag: string, severity: AlarmEvent['severity'], description: string, value?: number, limit?: number): void {
    const existing = this.alarmQueue.find(a => a.tag === tag && !a.acknowledged);
    if (existing) return;

    const alarm: AlarmEvent = {
      id: `${tag}-${Date.now()}`,
      timestamp: new Date(),
      severity,
      tag,
      description,
      value,
      limit,
      acknowledged: false
    };

    this.alarmQueue.unshift(alarm);
    this.data.alarms = this.alarmQueue.slice(0, 50);
  }

  /**
   * 控制设备（启动/停止）
   */
  controlEquipment(equipmentId: string, command: 'start' | 'stop'): void {
    this.data.equipment = this.data.equipment.map(eq => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          status: command === 'start' ? 'running' : 'stopped',
          speed: command === 'start' ? (eq.speed || 0) : 0,
          power: command === 'start' ? (eq.power || 0) : 0
        };
      }
      return eq;
    });
    this.notifySubscribers();
  }

  /**
   * 调整控制回路设定值
   */
  setLoopSetpoint(loopId: string, newSP: number): void {
    this.data.controlLoops = this.data.controlLoops.map(loop => {
      if (loop.id === loopId) {
        return { ...loop, sp: newSP };
      }
      return loop;
    });
    this.notifySubscribers();
  }

  /**
   * 切换控制模式
   */
  setLoopMode(loopId: string, mode: ControlLoop['mode']): void {
    this.data.controlLoops = this.data.controlLoops.map(loop => {
      if (loop.id === loopId) {
        return { ...loop, mode };
      }
      return loop;
    });
    this.notifySubscribers();
  }

  /**
   * 确认报警
   */
  acknowledgeAlarm(alarmId: string): void {
    this.alarmQueue = this.alarmQueue.map(alarm => {
      if (alarm.id === alarmId) {
        return { ...alarm, acknowledged: true };
      }
      return alarm;
    });
    this.data.alarms = this.alarmQueue.slice(0, 50);
    this.notifySubscribers();
  }

  /**
   * 获取当前数据快照
   */
  getData(): ProcessData {
    return { ...this.data };
  }

  /**
   * 通知所有订阅者
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.data));
  }
}

// 单例实例
export const dcsService = new DCSControlService();
