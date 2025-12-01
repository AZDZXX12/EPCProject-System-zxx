import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { message } from 'antd';
import { plcSimulator } from '../services/plcSimulator';
import type { PLCDataPoint, SCADAAlarm } from '../types/industrial';

// 设备状态类型
export type EquipmentStatus = 'running' | 'idle' | 'warning' | 'fault' | 'offline';

// 设备数据接口
export interface EquipmentData {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  temperature: number;
  pressure: number;
  flow: number;
  efficiency: number;
  power: number;
  runningTime: number;
  lastUpdated: number;
}

// 系统统计数据
export interface SystemStats {
  totalEquipment: number;
  runningCount: number;
  idleCount: number;
  warningCount: number;
  faultCount: number;
  offlineCount: number;
  totalEfficiency: number;
  totalPower: number;
  energyConsumption: number;
  productionCount: number;
}

// 事件类型
export type DigitalTwinEventType = 
  | 'equipment:selected'
  | 'equipment:statusChanged'
  | 'alarm:new'
  | 'alarm:acknowledged'
  | 'simulator:started'
  | 'simulator:stopped'
  | 'data:updated';

// 事件数据
export interface DigitalTwinEvent {
  type: DigitalTwinEventType;
  payload: any;
  timestamp: number;
}

// 上下文状态接口
interface DigitalTwinContextState {
  // 设备数据
  equipmentList: EquipmentData[];
  selectedEquipmentId: string | null;
  
  // 系统状态
  isSimulatorRunning: boolean;
  systemStats: SystemStats;
  
  // PLC数据
  plcData: PLCDataPoint[];
  alarms: SCADAAlarm[];
  
  // 历史数据
  historicalData: Array<{
    timestamp: number;
    temperature: number;
    pressure: number;
    flow: number;
    level: number;
  }>;
  
  // 操作方法
  selectEquipment: (id: string | null) => void;
  updateEquipmentStatus: (id: string, status: EquipmentStatus) => void;
  startSimulator: () => void;
  stopSimulator: () => void;
  acknowledgeAlarm: (alarmId: string) => void;
  
  // 事件系统
  addEventListener: (type: DigitalTwinEventType, handler: (event: DigitalTwinEvent) => void) => () => void;
  emitEvent: (type: DigitalTwinEventType, payload: any) => void;
}

const DigitalTwinContext = createContext<DigitalTwinContextState | undefined>(undefined);

// 初始设备数据
const initialEquipmentList: EquipmentData[] = [
  {
    id: 'EQUIP-001',
    name: '主反应器',
    type: 'reactor',
    status: 'running',
    temperature: 85,
    pressure: 2.5,
    flow: 120,
    efficiency: 92,
    power: 45.5,
    runningTime: 14520,
    lastUpdated: Date.now()
  },
  {
    id: 'EQUIP-002',
    name: '冷却塔',
    type: 'cooler',
    status: 'running',
    temperature: 35,
    pressure: 1.2,
    flow: 200,
    efficiency: 88,
    power: 22.3,
    runningTime: 18900,
    lastUpdated: Date.now()
  },
  {
    id: 'EQUIP-003',
    name: '泵站A',
    type: 'pump',
    status: 'running',
    temperature: 42,
    pressure: 3.8,
    flow: 150,
    efficiency: 95,
    power: 35.8,
    runningTime: 12300,
    lastUpdated: Date.now()
  },
  {
    id: 'EQUIP-004',
    name: '储罐B',
    type: 'tank',
    status: 'idle',
    temperature: 25,
    pressure: 1.0,
    flow: 0,
    efficiency: 0,
    power: 0,
    runningTime: 0,
    lastUpdated: Date.now()
  },
  {
    id: 'EQUIP-005',
    name: '分离器C',
    type: 'separator',
    status: 'warning',
    temperature: 95,
    pressure: 2.8,
    flow: 80,
    efficiency: 75,
    power: 28.5,
    runningTime: 8900,
    lastUpdated: Date.now()
  },
  {
    id: 'EQUIP-006',
    name: '压缩机D',
    type: 'compressor',
    status: 'running',
    temperature: 68,
    pressure: 5.2,
    flow: 180,
    efficiency: 90,
    power: 52.3,
    runningTime: 15600,
    lastUpdated: Date.now()
  }
];

export const DigitalTwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 状态
  const [equipmentList, setEquipmentList] = useState<EquipmentData[]>(initialEquipmentList);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [plcData, setPlcData] = useState<PLCDataPoint[]>([]);
  const [alarms, setAlarms] = useState<SCADAAlarm[]>([]);
  const [historicalData, setHistoricalData] = useState<Array<{
    timestamp: number;
    temperature: number;
    pressure: number;
    flow: number;
    level: number;
  }>>([]);
  
  // 事件监听器
  const eventListenersRef = useRef<Map<DigitalTwinEventType, Set<(event: DigitalTwinEvent) => void>>>(new Map());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 计算系统统计
  const systemStats: SystemStats = React.useMemo(() => {
    const stats = equipmentList.reduce((acc, eq) => {
      acc.totalEquipment++;
      switch (eq.status) {
        case 'running':
          acc.runningCount++;
          break;
        case 'idle':
          acc.idleCount++;
          break;
        case 'warning':
          acc.warningCount++;
          break;
        case 'fault':
          acc.faultCount++;
          break;
        case 'offline':
          acc.offlineCount++;
          break;
      }
      acc.totalPower += eq.power;
      if (eq.status === 'running') {
        acc.totalEfficiency += eq.efficiency;
      }
      return acc;
    }, {
      totalEquipment: 0,
      runningCount: 0,
      idleCount: 0,
      warningCount: 0,
      faultCount: 0,
      offlineCount: 0,
      totalEfficiency: 0,
      totalPower: 0,
      energyConsumption: 0,
      productionCount: 0
    });

    // 计算平均效率
    if (stats.runningCount > 0) {
      stats.totalEfficiency = stats.totalEfficiency / stats.runningCount;
    }
    
    // 计算能耗和产量（模拟数据）
    stats.energyConsumption = stats.totalPower * 0.85; // kWh
    stats.productionCount = Math.floor(stats.totalEfficiency * 13.5); // 件

    return stats;
  }, [equipmentList]);

  // 选择设备
  const selectEquipment = useCallback((id: string | null) => {
    setSelectedEquipmentId(id);
    emitEvent('equipment:selected', { equipmentId: id });
    
    if (id) {
      const equipment = equipmentList.find(eq => eq.id === id);
      if (equipment) {
        message.info(`已选择设备: ${equipment.name}`);
      }
    }
  }, [equipmentList]);

  // 更新设备状态
  const updateEquipmentStatus = useCallback((id: string, status: EquipmentStatus) => {
    setEquipmentList(prev => prev.map(eq => 
      eq.id === id ? { ...eq, status, lastUpdated: Date.now() } : eq
    ));
    emitEvent('equipment:statusChanged', { equipmentId: id, status });
    message.success(`设备状态已更新为: ${status}`);
  }, []);

  // 启动模拟器
  const startSimulator = useCallback(() => {
    if (isSimulatorRunning) return;

    plcSimulator.start();
    setIsSimulatorRunning(true);
    emitEvent('simulator:started', {});
    message.success('模拟器已启动');

    // 定时更新数据
    updateIntervalRef.current = setInterval(() => {
      // 模拟PLC数据
      const data: PLCDataPoint[] = equipmentList.filter(eq => eq.status === 'running').map((eq, index) => ({
        id: `PLC-${eq.id}`,
        name: `${eq.name}_温度`,
        address: `DB${index + 1}.DBW0`,
        type: 'REAL' as const,
        value: eq.temperature,
        unit: '°C',
        quality: 'GOOD' as const,
        timestamp: Date.now()
      }));
      setPlcData(data);

      // 模拟设备数据更新
      setEquipmentList(prev => prev.map(eq => {
        if (eq.status === 'running') {
          return {
            ...eq,
            temperature: eq.temperature + (Math.random() - 0.5) * 2,
            pressure: Math.max(0, eq.pressure + (Math.random() - 0.5) * 0.2),
            flow: Math.max(0, eq.flow + (Math.random() - 0.5) * 5),
            efficiency: Math.max(0, Math.min(100, eq.efficiency + (Math.random() - 0.5) * 2)),
            power: Math.max(0, eq.power + (Math.random() - 0.5) * 2),
            lastUpdated: Date.now()
          };
        }
        return eq;
      }));

      // 添加历史数据
      if (data.length > 0) {
        const avgTemp = data.reduce((sum, d) => sum + (d.value || 0), 0) / data.length;
        setHistoricalData(prev => {
          const newData = [...prev, {
            timestamp: Date.now(),
            temperature: avgTemp,
            pressure: 2.5 + Math.random(),
            flow: 150 + Math.random() * 50,
            level: 75 + Math.random() * 10
          }];
          return newData.slice(-50); // 保留最近50条
        });
      }

      // 模拟报警
      if (Math.random() < 0.05) {
        const alarm: SCADAAlarm = {
          id: `ALARM-${Date.now()}`,
          level: Math.random() > 0.7 ? 'CRITICAL' : 'HIGH',
          type: Math.random() > 0.5 ? 'PROCESS' : 'EQUIPMENT',
          message: '设备温度超过阈值',
          device: equipmentList[Math.floor(Math.random() * equipmentList.length)].name,
          timestamp: Date.now(),
          acknowledged: false
        };
        setAlarms(prev => [alarm, ...prev].slice(0, 20));
        emitEvent('alarm:new', alarm);
      }

      emitEvent('data:updated', { timestamp: Date.now() });
    }, 1000);
  }, [isSimulatorRunning, equipmentList]);

  // 停止模拟器
  const stopSimulator = useCallback(() => {
    if (!isSimulatorRunning) return;

    plcSimulator.stop();
    setIsSimulatorRunning(false);
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    emitEvent('simulator:stopped', {});
    message.info('模拟器已停止');
  }, [isSimulatorRunning]);

  // 确认报警
  const acknowledgeAlarm = useCallback((alarmId: string) => {
    setAlarms(prev => prev.map(alarm =>
      alarm.id === alarmId
        ? { ...alarm, acknowledged: true, acknowledgedBy: '操作员', acknowledgedAt: Date.now() }
        : alarm
    ));
    emitEvent('alarm:acknowledged', { alarmId });
    message.success('报警已确认');
  }, []);

  // 添加事件监听器
  const addEventListener = useCallback((type: DigitalTwinEventType, handler: (event: DigitalTwinEvent) => void) => {
    if (!eventListenersRef.current.has(type)) {
      eventListenersRef.current.set(type, new Set());
    }
    eventListenersRef.current.get(type)!.add(handler);

    // 返回取消订阅函数
    return () => {
      const listeners = eventListenersRef.current.get(type);
      if (listeners) {
        listeners.delete(handler);
      }
    };
  }, []);

  // 发射事件
  const emitEvent = useCallback((type: DigitalTwinEventType, payload: any) => {
    const event: DigitalTwinEvent = {
      type,
      payload,
      timestamp: Date.now()
    };

    const listeners = eventListenersRef.current.get(type);
    if (listeners) {
      listeners.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (isSimulatorRunning) {
        plcSimulator.stop();
      }
    };
  }, [isSimulatorRunning]);

  const value: DigitalTwinContextState = {
    equipmentList,
    selectedEquipmentId,
    isSimulatorRunning,
    systemStats,
    plcData,
    alarms,
    historicalData,
    selectEquipment,
    updateEquipmentStatus,
    startSimulator,
    stopSimulator,
    acknowledgeAlarm,
    addEventListener,
    emitEvent
  };

  return (
    <DigitalTwinContext.Provider value={value}>
      {children}
    </DigitalTwinContext.Provider>
  );
};

// 自定义Hook
export const useDigitalTwin = () => {
  const context = useContext(DigitalTwinContext);
  if (context === undefined) {
    throw new Error('useDigitalTwin must be used within a DigitalTwinProvider');
  }
  return context;
};

export default DigitalTwinContext;
