import { CorrectionFactors } from '../types';

/**
 * 计算经过校正后的载流量
 * 基于IEC 60512和IEC 60364-5-52标准
 */
export function getCorrectedCurrent(
  ratedCurrent: number, 
  factors: CorrectionFactors
): number {
  // 温度校正系数 (IEC 60512)
  const kTemp = Math.sqrt((90 - factors.temp) / (90 - 30));
  
  // 敷设校正系数 (IEC 60364-5-52)
  let kGroup = 1;
  if (factors.grouping > 3) {
    kGroup = 0.8 + (0.2 / Math.sqrt(factors.grouping));
  }
  
  return ratedCurrent * kTemp * kGroup;
}

/**
 * 获取温度校正系数
 */
export function getTempCorrection(ambientTemp: number): number {
  const baseTemp = 30; // 基准温度
  const maxTemp = 90;  // 最高工作温度
  
  return Math.sqrt((maxTemp - ambientTemp) / (maxTemp - baseTemp));
}

/**
 * 获取敷设方式校正系数
 */
export function getGroupingCorrection(installation: string): number {
  const corrections: Record<string, number> = {
    'tray': 0.95,
    'conduit': 0.80,
    'direct_burial': 1.0
  };
  
  return corrections[installation] || 1.0;
}

