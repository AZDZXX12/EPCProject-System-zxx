/**
 * 增强型电缆选型计算器
 * 包含启动电流、效率、安全余量等因素
 */

import { CableParams } from '../types';

/**
 * 计算考虑效率的实际电流
 */
export function calculateActualCurrent(
  power: number,
  voltage: number,
  powerFactor: number = 0.85,
  efficiency: number = 0.9
): number {
  const isThreePhase = voltage > 300;
  
  if (isThreePhase) {
    // I = P / (√3 × U × cosφ × η)
    return (power * 1000) / (Math.sqrt(3) * voltage * powerFactor * efficiency);
  } else {
    return (power * 1000) / (voltage * powerFactor * efficiency);
  }
}

/**
 * 计算选型电流（含安全余量）
 */
export function calculateDesignCurrent(
  actualCurrent: number,
  safetyFactor: number = 1.25
): number {
  return actualCurrent * safetyFactor;
}

/**
 * 估算启动电流
 */
export function calculateStartingCurrent(
  ratedCurrent: number,
  motorType: 'standard' | 'frequency' | 'soft' = 'standard'
): { min: number; max: number; multiplier: string } {
  let minMultiplier = 5;
  let maxMultiplier = 7;
  
  switch (motorType) {
    case 'frequency': // 变频启动
      minMultiplier = 1.2;
      maxMultiplier = 1.5;
      break;
    case 'soft': // 软启动
      minMultiplier = 2;
      maxMultiplier = 3;
      break;
    default: // 直接启动
      minMultiplier = 5;
      maxMultiplier = 7;
  }
  
  return {
    min: ratedCurrent * minMultiplier,
    max: ratedCurrent * maxMultiplier,
    multiplier: `${minMultiplier}-${maxMultiplier}倍`
  };
}

/**
 * 推荐断路器规格
 */
export function recommendCircuitBreaker(ratedCurrent: number): {
  rating: number;
  type: string;
  description: string;
} {
  // 断路器额定电流应为电机额定电流的1.5-2.5倍
  const minRating = ratedCurrent * 1.5;
  
  // 标准断路器规格
  const standardRatings = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];
  const selectedRating = standardRatings.find(r => r >= minRating) || 250;
  
  return {
    rating: selectedRating,
    type: selectedRating <= 63 ? 'DZ47-63' : 'DZ20',
    description: `额定电流${selectedRating}A塑壳断路器`
  };
}

/**
 * 推荐接触器规格
 */
export function recommendContactor(ratedCurrent: number, voltage: number): {
  model: string;
  rating: string;
  description: string;
} {
  // 接触器额定电流应为电机额定电流的1.2-1.5倍
  const requiredCurrent = ratedCurrent * 1.3;
  
  // 标准接触器规格（CJX2系列）
  const contactorSpecs = [
    { current: 9, model: 'CJX2-0910' },
    { current: 12, model: 'CJX2-1210' },
    { current: 18, model: 'CJX2-1810' },
    { current: 25, model: 'CJX2-2510' },
    { current: 32, model: 'CJX2-3210' },
    { current: 40, model: 'CJX2-4011' },
    { current: 50, model: 'CJX2-5011' },
    { current: 65, model: 'CJX2-6511' },
    { current: 80, model: 'CJX2-8011' },
    { current: 95, model: 'CJX2-9511' },
  ];
  
  const selected = contactorSpecs.find(s => s.current >= requiredCurrent) || contactorSpecs[contactorSpecs.length - 1];
  
  return {
    model: selected.model,
    rating: `${selected.current}A`,
    description: `${voltage}V ${selected.current}A交流接触器`
  };
}

/**
 * 推荐热继电器规格
 */
export function recommendThermalRelay(ratedCurrent: number): {
  model: string;
  range: string;
  setting: number;
  description: string;
} {
  // 热继电器整定值为电机额定电流的1.05-1.15倍
  const settingCurrent = ratedCurrent * 1.1;
  
  // 标准热继电器规格（JR36系列）
  const relaySpecs = [
    { min: 0.1, max: 0.16, model: 'JR36-20/0.1-0.16' },
    { min: 0.16, max: 0.25, model: 'JR36-20/0.16-0.25' },
    { min: 0.25, max: 0.4, model: 'JR36-20/0.25-0.4' },
    { min: 0.4, max: 0.63, model: 'JR36-20/0.4-0.63' },
    { min: 0.63, max: 1, model: 'JR36-20/0.63-1' },
    { min: 1, max: 1.6, model: 'JR36-20/1-1.6' },
    { min: 1.6, max: 2.5, model: 'JR36-20/1.6-2.5' },
    { min: 2.5, max: 4, model: 'JR36-20/2.5-4' },
    { min: 4, max: 6, model: 'JR36-20/4-6' },
    { min: 5.5, max: 8, model: 'JR36-20/5.5-8' },
    { min: 7, max: 11, model: 'JR36-20/7-11' },
    { min: 9, max: 13, model: 'JR36-20/9-13' },
    { min: 12, max: 18, model: 'JR36-20/12-18' },
    { min: 17, max: 25, model: 'JR36-20/17-25' },
    { min: 23, max: 32, model: 'JR36-20/23-32' },
    { min: 30, max: 40, model: 'JR36-20/30-40' },
    { min: 37, max: 50, model: 'JR36-20/37-50' },
    { min: 48, max: 65, model: 'JR36-20/48-65' },
    { min: 60, max: 80, model: 'JR36-20/60-80' },
    { min: 80, max: 93, model: 'JR36-20/80-93' },
  ];
  
  const selected = relaySpecs.find(s => settingCurrent >= s.min && settingCurrent <= s.max) 
    || relaySpecs[relaySpecs.length - 1];
  
  return {
    model: selected.model,
    range: `${selected.min}-${selected.max}A`,
    setting: Math.round(settingCurrent * 10) / 10,
    description: `整定范围${selected.min}-${selected.max}A，建议整定${Math.round(settingCurrent * 10) / 10}A`
  };
}

/**
 * 推荐熔断器规格
 */
export function recommendFuse(ratedCurrent: number): {
  rating: number;
  type: string;
  description: string;
} {
  // 熔断器额定电流应为电机额定电流的1.5-2.5倍
  const requiredRating = ratedCurrent * 2;
  
  // 标准熔断器规格
  const standardRatings = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
  const selectedRating = standardRatings.find(r => r >= requiredRating) || 100;
  
  return {
    rating: selectedRating,
    type: 'RT18-32',
    description: `${selectedRating}A熔断器（RT18-32系列）`
  };
}

/**
 * 推荐变频器规格
 */
export function recommendVFD(power: number, voltage: number, ratedCurrent: number): {
  model: string;
  power: number;
  voltage: number;
  current: number;
  description: string;
} {
  // 变频器功率应选择电机功率的1.1-1.2倍
  const requiredPower = power * 1.15;
  
  // 标准变频器功率等级（kW）
  const standardPowers = [0.75, 1.5, 2.2, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 185, 200];
  const selectedPower = standardPowers.find(p => p >= requiredPower) || standardPowers[standardPowers.length - 1];
  
  // 根据电压选择型号系列
  let series = '';
  let outputCurrent = 0;
  
  if (voltage === 220) {
    series = 'MM440'; // 单相220V系列
    outputCurrent = ratedCurrent * 1.2;
  } else if (voltage === 380) {
    series = 'MM430'; // 三相380V系列
    outputCurrent = ratedCurrent * 1.2;
  } else if (voltage === 600) {
    series = 'MM440'; // 高压系列
    outputCurrent = ratedCurrent * 1.2;
  }
  
  return {
    model: `${series}-${selectedPower}kW`,
    power: selectedPower,
    voltage: voltage,
    current: Math.round(outputCurrent * 10) / 10,
    description: `${selectedPower}kW ${voltage}V变频器，额定输出电流${Math.round(outputCurrent * 10) / 10}A`
  };
}

/**
 * 生成完整的配电方案
 */
export interface ElectricalEquipment {
  circuitBreaker: ReturnType<typeof recommendCircuitBreaker>;
  contactor: ReturnType<typeof recommendContactor>;
  thermalRelay: ReturnType<typeof recommendThermalRelay>;
  fuse: ReturnType<typeof recommendFuse>;
  startingCurrent: ReturnType<typeof calculateStartingCurrent>;
  vfd?: ReturnType<typeof recommendVFD>;
  startupMethod?: 'direct' | 'soft_starter' | 'vfd';
}

export function generateElectricalScheme(
  power: number,
  voltage: number,
  powerFactor: number = 0.85,
  efficiency: number = 0.9,
  startupMethod: 'direct' | 'soft_starter' | 'vfd' = 'direct'
): ElectricalEquipment {
  const actualCurrent = calculateActualCurrent(power, voltage, powerFactor, efficiency);
  
  // 根据启动方式确定电机类型
  let motorType: 'standard' | 'frequency' | 'soft' = 'standard';
  if (startupMethod === 'vfd') {
    motorType = 'frequency';
  } else if (startupMethod === 'soft_starter') {
    motorType = 'soft';
  }
  
  const equipment: ElectricalEquipment = {
    circuitBreaker: recommendCircuitBreaker(actualCurrent),
    contactor: recommendContactor(actualCurrent, voltage),
    thermalRelay: recommendThermalRelay(actualCurrent),
    fuse: recommendFuse(actualCurrent),
    startingCurrent: calculateStartingCurrent(actualCurrent, motorType),
    startupMethod: startupMethod
  };
  
  // 如果是变频启动，添加变频器
  if (startupMethod === 'vfd') {
    equipment.vfd = recommendVFD(power, voltage, actualCurrent);
  }
  
  return equipment;
}

