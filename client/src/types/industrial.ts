/**
 * 工业控制系统类型定义
 * 参考标准: IEC 61131-3, OPC UA
 */

// PLC数据点类型
export interface PLCDataPoint {
  id: string;
  name: string;
  address: string;          // PLC地址 (如: DB1.DBW0)
  type: 'BOOL' | 'INT' | 'REAL' | 'DINT' | 'STRING';
  value: any;
  unit?: string;
  min?: number;
  max?: number;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';
  timestamp: number;
}

// DCS控制回路
export interface DCSLoop {
  id: string;
  name: string;
  pv: number;              // Process Variable (过程变量)
  sp: number;              // Set Point (设定值)
  mv: number;              // Manipulated Variable (操纵变量)
  mode: 'AUTO' | 'MANUAL' | 'CASCADE';
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  unit: string;
}

// SCADA报警
export interface SCADAAlarm {
  id: string;
  timestamp: number;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'PROCESS' | 'EQUIPMENT' | 'SYSTEM';
  message: string;
  device: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

// 设备状态
export interface DeviceStatus {
  id: string;
  name: string;
  type: 'PUMP' | 'VALVE' | 'MOTOR' | 'SENSOR' | 'TANK';
  status: 'RUNNING' | 'STOPPED' | 'FAULT' | 'MAINTENANCE';
  parameters: {
    [key: string]: PLCDataPoint;
  };
  position?: { x: number; y: number; z: number };
}

// 趋势数据
export interface TrendData {
  tagName: string;
  data: Array<{
    timestamp: number;
    value: number;
  }>;
  unit: string;
  color: string;
}

// 控制命令
export interface ControlCommand {
  deviceId: string;
  action: 'START' | 'STOP' | 'SET_VALUE' | 'RESET';
  parameter?: string;
  value?: any;
  operator: string;
  timestamp: number;
}

// OPC UA节点
export interface OPCUANode {
  nodeId: string;
  browseName: string;
  displayName: string;
  dataType: string;
  value: any;
  children?: OPCUANode[];
}

// Modbus寄存器
export interface ModbusRegister {
  address: number;
  type: 'COIL' | 'DISCRETE_INPUT' | 'HOLDING_REGISTER' | 'INPUT_REGISTER';
  value: number;
  description: string;
}
