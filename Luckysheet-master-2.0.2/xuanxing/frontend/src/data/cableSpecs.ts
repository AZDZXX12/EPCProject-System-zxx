/**
 * 电缆规格数据
 * 包含常用电缆的技术参数
 */

export interface CableSpecData {
  id: number;
  type: string;
  core_count: number;
  cross_section: number;      // 相线截面积
  pe_cross_section?: number;  // PE线截面积（如果不同于相线）
  current_rating: number;
  rated_voltage: number;
  max_temp: number;
  insulation_material: string;
  shield_type: string;
  price_per_meter: number;
  voltage_drop_coef: number;
  specification?: string;     // 标准规格标识
}

/**
 * 电缆规格数据库
 * 基于国标和IEC标准的常用电缆规格
 */
export const cableSpecs: CableSpecData[] = [
  // 4芯电缆（3相线+PE线，适用于TN-C-S系统，符合GB/T 12706-2020）
  {
    id: 1,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 16.0,
    specification: "3×16+1×16",
    current_rating: 85.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 28.5,
    voltage_drop_coef: 1.15
  },
  {
    id: 2,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 25.0,
    specification: "3×25+1×16",
    current_rating: 115.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 42.5,
    voltage_drop_coef: 0.727
  },
  {
    id: 3,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 35.0,
    specification: "3×35+1×16",
    current_rating: 145.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 58.0,
    voltage_drop_coef: 0.524
  },
  {
    id: 4,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 50.0,
    specification: "3×50+1×25",
    current_rating: 180.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 78.0,
    voltage_drop_coef: 0.387
  },
  {
    id: 5,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 70.0,
    specification: "3×70+1×35",
    current_rating: 230.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 105.0,
    voltage_drop_coef: 0.268
  },
  {
    id: 6,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 95.0,
    specification: "3×95+1×50",
    current_rating: 280.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 138.0,
    voltage_drop_coef: 0.193
  },
  {
    id: 7,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 120.0,
    specification: "3×120+1×70",
    current_rating: 330.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 168.0,
    voltage_drop_coef: 0.153
  },
  {
    id: 8,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 150.0,
    specification: "3×150+1×70",
    current_rating: 380.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 205.0,
    voltage_drop_coef: 0.124
  },
  {
    id: 9,
    type: "VV-0.6/1kV",
    core_count: 4,
    cross_section: 25.0,
    specification: "3×25+1×16",
    current_rating: 105.0,
    rated_voltage: 380,
    max_temp: 70,
    insulation_material: "PVC",
    shield_type: "none",
    price_per_meter: 35.0,
    voltage_drop_coef: 0.78
  },
  {
    id: 10,
    type: "VV-0.6/1kV",
    core_count: 4,
    cross_section: 35.0,
    specification: "3×35+1×16",
    current_rating: 130.0,
    rated_voltage: 380,
    max_temp: 70,
    insulation_material: "PVC",
    shield_type: "none",
    price_per_meter: 48.0,
    voltage_drop_coef: 0.56
  },
  {
    id: 11,
    type: "YJV22-0.6/1kV",
    core_count: 4,
    cross_section: 50.0,
    specification: "3×50+1×25",
    current_rating: 175.0,
    rated_voltage: 600,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "steel_tape",
    price_per_meter: 95.0,
    voltage_drop_coef: 0.387
  },
  {
    id: 12,
    type: "YJV22-0.6/1kV",
    core_count: 4,
    cross_section: 70.0,
    specification: "3×70+1×35",
    current_rating: 220.0,
    rated_voltage: 600,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "steel_tape",
    price_per_meter: 128.0,
    voltage_drop_coef: 0.268
  },
  {
    id: 13,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 185.0,
    specification: "3×185+1×95",
    current_rating: 430.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 245.0,
    voltage_drop_coef: 0.099
  },
  {
    id: 14,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 240.0,
    specification: "3×240+1×120",
    current_rating: 520.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 315.0,
    voltage_drop_coef: 0.077
  },
  {
    id: 15,
    type: "YJV-0.6/1kV",
    core_count: 4,
    cross_section: 300.0,
    specification: "3×300+1×150",
    current_rating: 600.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 385.0,
    voltage_drop_coef: 0.062
  },
  // 5芯电缆（3相线+N线+PE线，适用于TN-S系统，符合GB/T 12706-2020）
  {
    id: 16,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 4.0,
    pe_cross_section: 4.0,
    specification: "4×4+1×4",
    current_rating: 32.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 12.5,
    voltage_drop_coef: 2.78
  },
  {
    id: 17,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 6.0,
    pe_cross_section: 6.0,
    specification: "4×6+1×6",
    current_rating: 42.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 17.8,
    voltage_drop_coef: 1.85
  },
  {
    id: 18,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 10.0,
    pe_cross_section: 10.0,
    specification: "4×10+1×10",
    current_rating: 58.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 26.5,
    voltage_drop_coef: 1.11
  },
  {
    id: 19,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 16.0,
    pe_cross_section: 16.0,
    specification: "4×16+1×16",
    current_rating: 78.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 38.5,
    voltage_drop_coef: 0.694
  },
  {
    id: 20,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 25.0,
    pe_cross_section: 16.0,
    specification: "4×25+1×16",
    current_rating: 105.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 56.8,
    voltage_drop_coef: 0.444
  },
  {
    id: 21,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 35.0,
    pe_cross_section: 16.0,
    specification: "4×35+1×16",
    current_rating: 135.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 76.5,
    voltage_drop_coef: 0.317
  },
  {
    id: 22,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 50.0,
    pe_cross_section: 25.0,
    specification: "4×50+1×25",
    current_rating: 168.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 105.0,
    voltage_drop_coef: 0.222
  },
  {
    id: 23,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 70.0,
    pe_cross_section: 35.0,
    specification: "4×70+1×35",
    current_rating: 215.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 142.0,
    voltage_drop_coef: 0.159
  },
  {
    id: 24,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 95.0,
    pe_cross_section: 50.0,
    specification: "4×95+1×50",
    current_rating: 260.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 185.0,
    voltage_drop_coef: 0.117
  },
  {
    id: 25,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 120.0,
    pe_cross_section: 70.0,
    specification: "4×120+1×70",
    current_rating: 305.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 225.0,
    voltage_drop_coef: 0.093
  },
  {
    id: 26,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 150.0,
    pe_cross_section: 70.0,
    specification: "4×150+1×70",
    current_rating: 350.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 275.0,
    voltage_drop_coef: 0.074
  },
  {
    id: 27,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 185.0,
    pe_cross_section: 95.0,
    specification: "4×185+1×95",
    current_rating: 400.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 330.0,
    voltage_drop_coef: 0.060
  },
  {
    id: 28,
    type: "YJV-0.6/1kV",
    core_count: 5,
    cross_section: 240.0,
    pe_cross_section: 120.0,
    specification: "4×240+1×120",
    current_rating: 480.0,
    rated_voltage: 380,
    max_temp: 90,
    insulation_material: "XLPE",
    shield_type: "copper",
    price_per_meter: 425.0,
    voltage_drop_coef: 0.046
  },
  {
    id: 29,
    type: "VV-0.6/1kV",
    core_count: 5,
    cross_section: 16.0,
    specification: "4×16+1×16",
    current_rating: 70.0,
    rated_voltage: 380,
    max_temp: 70,
    insulation_material: "PVC",
    shield_type: "none",
    price_per_meter: 32.5,
    voltage_drop_coef: 0.75
  },
  {
    id: 30,
    type: "VV-0.6/1kV",
    core_count: 5,
    cross_section: 25.0,
    specification: "4×25+1×16",
    current_rating: 95.0,
    rated_voltage: 380,
    max_temp: 70,
    insulation_material: "PVC",
    shield_type: "none",
    price_per_meter: 48.5,
    voltage_drop_coef: 0.48
  },
  {
    id: 31,
    type: "VV-0.6/1kV",
    core_count: 5,
    cross_section: 35.0,
    specification: "4×35+1×16",
    current_rating: 120.0,
    rated_voltage: 380,
    max_temp: 70,
    insulation_material: "PVC",
    shield_type: "none",
    price_per_meter: 65.0,
    voltage_drop_coef: 0.34
  }
];

/**
 * 根据条件筛选电缆规格
 */
export function getCablesByVoltage(voltage: number): CableSpecData[] {
  return cableSpecs.filter(cable => cable.rated_voltage >= voltage);
}

/**
 * 根据温度筛选电缆规格
 */
export function getCablesByTemp(ambientTemp: number): CableSpecData[] {
  return cableSpecs.filter(cable => cable.max_temp >= ambientTemp + 30);
}

