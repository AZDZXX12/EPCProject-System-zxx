/**
 * 功率与电流转换工具
 */

/**
 * 根据功率计算电流（考虑效率）
 * @param power 功率(kW)
 * @param voltage 电压(V)
 * @param powerFactor 功率因数 默认0.85
 * @param efficiency 电机效率 默认0.9
 * @returns 额定电流(A)
 */
export function calculateCurrentFromPower(
  power: number,
  voltage: number,
  powerFactor: number = 0.85,
  efficiency: number = 0.9
): number {
  // 三相：I = P / (√3 × U × cosφ × η) × 1000
  // 单相：I = P / (U × cosφ × η) × 1000
  
  // 380V 和 600V 通常是三相，220V 是单相
  const isThreePhase = voltage > 300;
  
  if (isThreePhase) {
    // 三相电流计算（含效率）
    return (power * 1000) / (Math.sqrt(3) * voltage * powerFactor * efficiency);
  } else {
    // 单相电流计算（含效率）
    return (power * 1000) / (voltage * powerFactor * efficiency);
  }
}

/**
 * 计算选型电流（含安全余量）
 * @param ratedCurrent 额定电流(A)
 * @param safetyFactor 安全系数，默认1.25
 * @returns 选型电流(A)
 */
export function calculateDesignCurrent(
  ratedCurrent: number,
  safetyFactor: number = 1.25
): number {
  return ratedCurrent * safetyFactor;
}

/**
 * 根据电流计算功率
 * @param current 电流(A)
 * @param voltage 电压(V)
 * @param powerFactor 功率因数
 * @returns 功率(kW)
 */
export function calculatePowerFromCurrent(
  current: number,
  voltage: number,
  powerFactor: number = 0.85
): number {
  const isThreePhase = voltage > 300;
  
  if (isThreePhase) {
    // 三相功率计算
    return (Math.sqrt(3) * voltage * current * powerFactor) / 1000;
  } else {
    // 单相功率计算
    return (voltage * current * powerFactor) / 1000;
  }
}

