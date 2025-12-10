/**
 * DCS控制系统上下文
 * 提供全局的DCS状态管理和控制接口
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { dcsService, ProcessData, EquipmentStatus, ControlLoop, AlarmEvent } from '../services/DCSControlService';

interface DCSContextType {
  processData: ProcessData;
  controlEquipment: (equipmentId: string, command: 'start' | 'stop') => void;
  setLoopSetpoint: (loopId: string, value: number) => void;
  setLoopMode: (loopId: string, mode: 'AUTO' | 'MANUAL' | 'CASCADE') => void;
  acknowledgeAlarm: (alarmId: string) => void;
  getEquipment: (id: string) => EquipmentStatus | undefined;
  getLoop: (id: string) => ControlLoop | undefined;
  getActiveAlarms: () => AlarmEvent[];
}

const DCSContext = createContext<DCSContextType | undefined>(undefined);

export const useDCS = (): DCSContextType => {
  const context = useContext(DCSContext);
  if (!context) {
    throw new Error('useDCS must be used within DCSProvider');
  }
  return context;
};

interface DCSProviderProps {
  children: ReactNode;
}

export const DCSProvider: React.FC<DCSProviderProps> = ({ children }) => {
  const [processData, setProcessData] = useState<ProcessData>(dcsService.getData());

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DCSProvider] 🚀 组件挂载 - 初始化DCS系统');
    }
    
    // 启动数据模拟
    dcsService.startSimulation();

    // 订阅数据更新
    const unsubscribe = dcsService.subscribe((data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[DCSProvider] 📡 收到数据更新', {
          temp: data.controlLoops.find(l => l.id === 'TIC-101')?.pv.toFixed(1),
          time: data.timestamp.toLocaleTimeString()
        });
      }
      setProcessData(data);
    });

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[DCSProvider] 🛑 组件卸载 - 停止DCS系统');
      }
      unsubscribe();
      dcsService.stopSimulation();
    };
  }, []);

  const controlEquipment = (equipmentId: string, command: 'start' | 'stop') => {
    dcsService.controlEquipment(equipmentId, command);
  };

  const setLoopSetpoint = (loopId: string, value: number) => {
    dcsService.setLoopSetpoint(loopId, value);
  };

  const setLoopMode = (loopId: string, mode: 'AUTO' | 'MANUAL' | 'CASCADE') => {
    dcsService.setLoopMode(loopId, mode);
  };

  const acknowledgeAlarm = (alarmId: string) => {
    dcsService.acknowledgeAlarm(alarmId);
  };

  const getEquipment = (id: string): EquipmentStatus | undefined => {
    return processData.equipment.find(eq => eq.id === id);
  };

  const getLoop = (id: string): ControlLoop | undefined => {
    return processData.controlLoops.find(loop => loop.id === id);
  };

  const getActiveAlarms = (): AlarmEvent[] => {
    return processData.alarms.filter(alarm => !alarm.acknowledged);
  };

  const value: DCSContextType = {
    processData,
    controlEquipment,
    setLoopSetpoint,
    setLoopMode,
    acknowledgeAlarm,
    getEquipment,
    getLoop,
    getActiveAlarms
  };

  return <DCSContext.Provider value={value}>{children}</DCSContext.Provider>;
};
