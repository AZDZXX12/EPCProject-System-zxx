/**
 * 热源选型推荐计算器
 * 从VBA代码转译：StartHeatSourceCalculator.bas + StartHeatSource.frm
 */

class HeatSourceResults {
    constructor() {
        this.totalHeat = 0;      // 热量需求 kcal/h
        this.biomass = 0;        // 生物质燃料用量 kg/h
        this.gas = 0;            // 天然气用量 m³/h
        this.steam = 0;          // 蒸汽用量 kg/h
        this.waterEvap = 0;      // 蒸发水量 kg/h
        this.dryMaterial = 0;    // 干燥物料 kg/h
    }
}

const HEAT_SOURCE_CONST = {
    SPECIFIC_HEAT: 0.3,            // 物料比热 kcal/kg·℃
    SYSTEM_EFFICIENCY: 0.6,        // 系统热效率
    WATER_EVAP_HEAT: 595,          // 水蒸发潜热 kcal/kg
    STEAM_HEAT_VALUE: 600,         // 蒸汽热值 kcal/kg
    BIOMASS_HEAT_VALUE: 4000,      // 生物质热值 kcal/kg
    GAS_HEAT_VALUE: 8500,          // 天然气热值 kcal/m³
    MIN_HOT_AIR_TEMP: 100,         // 最小热风温度 ℃
    MAX_HOT_AIR_TEMP: 300,         // 最大热风温度 ℃
    MAX_INITIAL_MOISTURE: 20,      // 最大初始含水率 %
    DEFAULT_TARGET_MOISTURE: 1,    // 默认目标含水率 %
    DEFAULT_INITIAL_TEMP: 20,      // 默认初始温度 ℃
    DEFAULT_HOT_AIR_TEMP: 180      // 默认热风温度 ℃
};

/**
 * 热源选型计算主函数
 * @param {number} throughput - 物料通量 吨/小时
 * @param {number} initialMoisture - 初始含水率 %
 * @param {number} targetMoisture - 目标含水率 %
 * @param {number} hotAirTemp - 热风温度 ℃
 * @param {number} initialTemp - 初始物料温度 ℃
 * @returns {HeatSourceResults}
 */
function calculateHeatSource(throughput, initialMoisture, targetMoisture, hotAirTemp, initialTemp) {
    const results = new HeatSourceResults();
    
    // 输入验证
    if (throughput <= 0) {
        throw new Error('物料通量必须大于0');
    }
    if (initialMoisture <= 0) {
        throw new Error('初始含水率必须大于0');
    }
    if (initialMoisture >= HEAT_SOURCE_CONST.MAX_INITIAL_MOISTURE) {
        throw new Error(`初始含水率应小于${HEAT_SOURCE_CONST.MAX_INITIAL_MOISTURE}%`);
    }
    if (hotAirTemp < HEAT_SOURCE_CONST.MIN_HOT_AIR_TEMP || hotAirTemp > HEAT_SOURCE_CONST.MAX_HOT_AIR_TEMP) {
        throw new Error(`热风温度应在${HEAT_SOURCE_CONST.MIN_HOT_AIR_TEMP}-${HEAT_SOURCE_CONST.MAX_HOT_AIR_TEMP}℃之间`);
    }
    if (targetMoisture >= initialMoisture) {
        throw new Error('目标含水率必须小于初始含水率');
    }
    
    // 单位转换（吨/小时 → kg/h）
    const throughputKg = throughput * 1000;
    
    // 计算蒸发水量
    results.waterEvap = throughputKg * ((initialMoisture / 100 - targetMoisture / 100) / (1 - targetMoisture / 100));
    
    // 计算干燥物料
    results.dryMaterial = throughputKg - results.waterEvap;
    
    // 计算蒸发水分所需热量 (Q1)
    const Q1 = results.waterEvap * (HEAT_SOURCE_CONST.WATER_EVAP_HEAT + 0.45 * hotAirTemp - initialTemp);
    
    // 计算加热物料所需热量 (Q2)
    const Q2 = results.dryMaterial * HEAT_SOURCE_CONST.SPECIFIC_HEAT * (hotAirTemp - initialTemp);
    
    // 计算总热量需求（考虑热效率）
    results.totalHeat = (Q1 + Q2) / HEAT_SOURCE_CONST.SYSTEM_EFFICIENCY;
    
    // 计算不同热源用量
    results.biomass = results.totalHeat / HEAT_SOURCE_CONST.BIOMASS_HEAT_VALUE;  // 生物质燃料 kg/h
    results.gas = results.totalHeat / HEAT_SOURCE_CONST.GAS_HEAT_VALUE;         // 天然气 m³/h
    results.steam = results.totalHeat / HEAT_SOURCE_CONST.STEAM_HEAT_VALUE;     // 蒸汽 kg/h
    
    return results;
}

/**
 * 输入验证
 */
function validateHeatSourceInputs(throughput, initialMoisture, targetMoisture, hotAirTemp, initialTemp) {
    const errors = [];
    
    if (throughput <= 0) {
        errors.push('物料通量必须大于0');
    }
    
    if (initialMoisture <= 0 || initialMoisture >= 100) {
        errors.push('初始含水率必须在0-100%之间');
    }
    
    if (initialMoisture >= HEAT_SOURCE_CONST.MAX_INITIAL_MOISTURE) {
        errors.push(`初始含水率应小于${HEAT_SOURCE_CONST.MAX_INITIAL_MOISTURE}%`);
    }
    
    if (targetMoisture < 0 || targetMoisture >= 100) {
        errors.push('目标含水率必须在0-100%之间');
    }
    
    if (targetMoisture >= initialMoisture) {
        errors.push('目标含水率必须小于初始含水率');
    }
    
    if (hotAirTemp < HEAT_SOURCE_CONST.MIN_HOT_AIR_TEMP || hotAirTemp > HEAT_SOURCE_CONST.MAX_HOT_AIR_TEMP) {
        errors.push(`热风温度应在${HEAT_SOURCE_CONST.MIN_HOT_AIR_TEMP}-${HEAT_SOURCE_CONST.MAX_HOT_AIR_TEMP}℃之间`);
    }
    
    if (initialTemp < -50 || initialTemp > 100) {
        errors.push('初始温度应在-50到100℃之间');
    }
    
    return errors;
}

/**
 * 获取默认参数
 */
function getHeatSourceDefaults() {
    return {
        throughput: 10,                                        // 物料通量 吨/小时
        initialMoisture: 15,                                   // 初始含水率 %
        targetMoisture: HEAT_SOURCE_CONST.DEFAULT_TARGET_MOISTURE,  // 目标含水率 %
        hotAirTemp: HEAT_SOURCE_CONST.DEFAULT_HOT_AIR_TEMP,         // 热风温度 ℃
        initialTemp: HEAT_SOURCE_CONST.DEFAULT_INITIAL_TEMP         // 初始温度 ℃
    };
}

/**
 * 格式化输出结果
 */
function formatHeatSourceResults(results) {
    return {
        totalHeatMW: (results.totalHeat / 10000).toFixed(2) + ' 万kcal/小时',
        totalHeatKcal: results.totalHeat.toFixed(0) + ' kcal/h',
        biomass: results.biomass.toFixed(1) + ' kg/h',
        gas: results.gas.toFixed(1) + ' m³/h',
        steam: results.steam.toFixed(1) + ' kg/h',
        waterEvap: results.waterEvap.toFixed(1) + ' kg/h',
        dryMaterial: results.dryMaterial.toFixed(1) + ' kg/h'
    };
}

// 导出函数
window.HeatSourceCalculator = {
    calculate: calculateHeatSource,
    validate: validateHeatSourceInputs,
    getDefaults: getHeatSourceDefaults,
    format: formatHeatSourceResults,
    constants: HEAT_SOURCE_CONST
};

console.log('✅ 热源选型计算器已加载');

