// 启动方式类型
export type StartupMethod = 'direct' | 'soft_starter' | 'vfd';

export const StartupMethodLabels: Record<StartupMethod, string> = {
  direct: '直接启动',
  soft_starter: '软启动',
  vfd: '变频启动'
};

// 电缆参数接口
export interface CableParams {
  voltage: 220 | 380 | 600;  // 单位: V
  current: number;           // 单位: A
  length: number;            // 单位: m
  ambientTemp: 20 | 30 | 40; // 标准环境温度(℃)
  installation: 'tray' | 'conduit' | 'direct_burial';
  power?: number;            // 可选：设备功率(kW)
  powerFactor?: number;      // 可选：功率因数(0-1)
  startupMethod?: StartupMethod; // 可选：启动方式
}

// 电缆计算结果
export interface CableResult {
  type: string;
  core_count: number;        // 芯数
  cross_section: number;     // 相线截面积
  pe_cross_section?: number; // PE线截面积（如果不同）
  price_per_meter: number;
  voltage_drop: number;
  current_rating: number;
  insulation_material: string;
  shield_type: string;
  total_price?: number;
  insulationColor?: string;
  specification?: string;    // 完整规格标识，如 "3×10+2×6mm²"
}

// 电缆项目（单条电缆的完整信息）
export interface CableItem {
  id: string;
  name: string;              // 电缆名称/用途
  params: CableParams;       // 输入参数
  result: CableResult;       // 选型结果
  equipment?: any;           // 配套电器设备
  ratedCurrent?: number;     // 额定电流
}

// 电缆规格统计
export interface CableSpecSummary {
  type: string;              // 电缆型号（如 YJV-3x10mm²）
  count: number;             // 数量（根）
  totalLength: number;       // 总长度（米）
  totalPrice: number;        // 总价格（元）
  items: string[];           // 关联的电缆项目名称
}

// 电器设备统计
export interface EquipmentSummary {
  circuitBreakers: Map<string, number>;  // 断路器规格及数量
  contactors: Map<string, number>;       // 接触器规格及数量
  thermalRelays: Map<string, number>;    // 热继电器规格及数量
  fuses: Map<string, number>;            // 熔断器规格及数量
}

// 校正系数
export interface CorrectionFactors {
  temp: number;
  grouping: number;
  burialDepth?: number;
}

// 敷设方式类型
export type InstallationType = 'tray' | 'conduit' | 'direct_burial';

export const InstallationTypeLabels: Record<InstallationType, string> = {
  tray: '桥架敷设',
  conduit: '管道敷设',
  direct_burial: '直埋敷设'
};

