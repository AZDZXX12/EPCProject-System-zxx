/**
 * 电缆选型计算引擎
 * 基于IEC标准的计算算法
 */

import { CableParams, CableResult } from '../types';
import { cableSpecs, CableSpecData } from '../data/cableSpecs';
import { getTempCorrection, getGroupingCorrection } from './currentCorrection';

/**
 * 计算电压降
 * 基于三相平衡线路公式
 * 
 * @param current - 负载电流(A)
 * @param cable - 电缆规格
 * @param length - 线路长度(m)
 * @param voltage - 额定电压(V)
 * @returns 电压降百分比
 */
export function calculateVoltageDrop(
  current: number,
  cable: CableSpecData,
  length: number,
  voltage: number
): number {
  // 电阻 (Ω/km)
  const resistance = cable.voltage_drop_coef / cable.cross_section;
  
  // 电抗 (典型值 Ω/km)
  const reactance = 0.08;
  
  // 功率因数
  const powerFactor = 0.85;
  const sinPhi = Math.sqrt(1 - powerFactor ** 2);
  
  // 长度转换为km
  const lengthKm = length / 1000;
  
  // 电压降计算
  // ΔU% = (√3 × I × L × (R×cosφ + X×sinφ)) / U × 100
  const uDrop = (
    Math.sqrt(3) * current * lengthKm * 
    (resistance * powerFactor + reactance * sinPhi)
  ) / voltage * 100;
  
  return parseFloat(uDrop.toFixed(2));
}

/**
 * 计算推荐电缆规格
 * 基于IEC 60287-1-1标准
 * 
 * @param params - 计算参数
 * @returns 推荐的电缆列表
 */
export function calculateCableSelection(params: CableParams): CableResult[] {
  const { voltage, current, length, ambientTemp, installation } = params;
  
  // 从电缆库中筛选符合条件的电缆
  const validCables = cableSpecs.filter(cable => 
    cable.rated_voltage >= voltage &&
    cable.max_temp >= ambientTemp + 30
  );
  
  // 计算校正系数
  const k1 = getTempCorrection(ambientTemp);
  const k2 = getGroupingCorrection(installation);
  
  const results: CableResult[] = [];
  
  for (const cable of validCables) {
    // 校正后的载流量
    const correctedCurrent = cable.current_rating * k1 * k2;
    
    // 检查是否满足载流量要求
    if (correctedCurrent >= current) {
      // 计算电压降
      const voltageDrop = calculateVoltageDrop(
        current,
        cable,
        length,
        voltage
      );
      
      // 根据绝缘材料选择颜色
      const insulationColors: Record<string, string> = {
        'XLPE': '#2E8B57',
        'PVC': '#4169E1',
        'EPR': '#8B4513',
      };
      
      // 生成完整规格标识
      let specification = '';
      if (cable.specification) {
        specification = cable.specification;
      } else if (cable.core_count === 5 && cable.pe_cross_section) {
        specification = `4×${cable.cross_section}+1×${cable.pe_cross_section}`;
      } else if (cable.core_count === 4) {
        specification = `3×${cable.cross_section}+1×${cable.cross_section}`;
      } else {
        specification = `${cable.core_count}×${cable.cross_section}`;
      }

      results.push({
        type: cable.type,
        core_count: cable.core_count,
        cross_section: cable.cross_section,
        pe_cross_section: cable.pe_cross_section,
        specification,
        price_per_meter: cable.price_per_meter,
        voltage_drop: voltageDrop,
        current_rating: parseFloat(correctedCurrent.toFixed(2)),
        insulation_material: cable.insulation_material,
        shield_type: cable.shield_type,
        insulationColor: insulationColors[cable.insulation_material] || '#2E8B57',
        total_price: parseFloat((cable.price_per_meter * length).toFixed(2))
      });
    }
  }
  
  // 按截面积排序，只返回前3个推荐方案
  return results.sort((a, b) => a.cross_section - b.cross_section).slice(0, 3);
}

/**
 * 验证输入参数
 */
export function validateParams(params: CableParams): string | null {
  if (params.current <= 0) {
    return '负载电流必须大于0';
  }
  
  if (params.length <= 0) {
    return '线路长度必须大于0';
  }
  
  if (![220, 380, 600].includes(params.voltage)) {
    return '请选择有效的额定电压';
  }
  
  if (![20, 30, 40].includes(params.ambientTemp)) {
    return '请选择有效的环境温度';
  }
  
  if (!['tray', 'conduit', 'direct_burial'].includes(params.installation)) {
    return '请选择有效的敷设方式';
  }
  
  return null;
}

/**
 * 获取电缆推荐等级
 */
export function getCableGrade(voltageDrop: number, marginPercent: number): {
  grade: 'excellent' | 'good' | 'acceptable' | 'warning';
  label: string;
  color: string;
} {
  if (voltageDrop <= 2 && marginPercent >= 20) {
    return { grade: 'excellent', label: '优选', color: '#4caf50' };
  } else if (voltageDrop <= 3 && marginPercent >= 10) {
    return { grade: 'good', label: '推荐', color: '#8bc34a' };
  } else if (voltageDrop <= 5) {
    return { grade: 'acceptable', label: '可用', color: '#ff9800' };
  } else {
    return { grade: 'warning', label: '不建议', color: '#f44336' };
  }
}

