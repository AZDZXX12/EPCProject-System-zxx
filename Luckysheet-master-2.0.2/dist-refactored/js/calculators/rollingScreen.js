/**
 * 滚筒筛分机算料计算器
 * 从VBA代码转译：frmRollingScreen.frm + LegCalculations.bas
 * 依赖：PlatformCalculator（圆形平台）、GuardrailCalculator（护栏）
 */

class RollingScreenResults {
    constructor() {
        this.legModel = '';            // 支架型号
        this.legLength = 0;            // 支架总长度 m
        this.legUnitWeight = 0;        // 支架单位重量 kg/m
        this.legWeight = 0;            // 支架总重量 kg
        this.legSelectionLogic = '';   // 选择逻辑说明
        this.platformWeight = 0;       // 平台总重量 kg
        this.guardrailWeight = 0;      // 护栏总重量 kg
        this.totalWeight = 0;          // 项目总重量 kg
    }
}

const ROLLING_SCREEN_CONST = {
    // 支架型号单位重量 (kg/m)
    LEG_WEIGHTS: {
        '100×100×4': 11.75,
        '120×120×4': 14.1,
        '120×120×5': 17.2,
        '150×150×5': 22.8,
        '150×150×6': 27.2,
        '180×180×6': 33,
        '180×180×8': 43.2,
        '200×200×10': 59.5
    },
    // 筛分机约束
    MIN_HEIGHT: 2000,              // 最小高度 mm
    MAX_HEIGHT: 7000,              // 最大高度 mm
    MIN_DIAMETER: 1.2,             // 最小筒体直径 m
    MAX_DIAMETER: 2.8,             // 最大筒体直径 m
    MIN_LENGTH: 4,                 // 最小筒体长度 m
    MAX_LENGTH: 9,                 // 最大筒体长度 m
    VALID_LEG_COUNTS: [4, 6, 8],  // 有效支腿数量
    STANDARD_WIDTH: 700            // 标准平台宽度 mm
};

/**
 * 计算支架材料
 */
function calculateLegMaterials(legCount, height, diameter) {
    const result = {
        model: '',
        length: 0,
        unitWeight: 0,
        weight: 0,
        selectionLogic: ''
    };
    
    // 验证输入
    if (!ROLLING_SCREEN_CONST.VALID_LEG_COUNTS.includes(legCount)) {
        throw new Error(`支腿数量必须为${ROLLING_SCREEN_CONST.VALID_LEG_COUNTS.join(', ')}之一`);
    }
    if (height < ROLLING_SCREEN_CONST.MIN_HEIGHT || height > ROLLING_SCREEN_CONST.MAX_HEIGHT) {
        throw new Error(`架体高度必须在${ROLLING_SCREEN_CONST.MIN_HEIGHT}-${ROLLING_SCREEN_CONST.MAX_HEIGHT}mm之间`);
    }
    
    // 根据支腿数量确定基础型号
    let baseModel;
    switch (legCount) {
        case 4:
            baseModel = '重型';
            break;
        case 6:
            baseModel = '中型';
            break;
        case 8:
            baseModel = '标准型';
            break;
        default:
            baseModel = '中型';
    }
    
    // 根据高度确定型号增强
    let heightFactor = 0;
    if (height > 4000) {
        heightFactor = Math.floor((height - 4000) / 1000);
    }
    
    // 根据筒体直径确定型号增强
    let diameterFactor = 0;
    const diameterMM = diameter * 1000;
    if (diameterMM >= 1200 && diameterMM <= 1800) {
        diameterFactor = 0;
    } else if (diameterMM >= 2000 && diameterMM <= 2400) {
        diameterFactor = 1;
    } else if (diameterMM >= 2600 && diameterMM <= 2800) {
        diameterFactor = 2;
    }
    
    // 综合等级 = 基础型号 + 高度增强 + 直径增强
    const totalLevel = heightFactor + diameterFactor;
    
    // 根据型号选择
    let legModel;
    switch (baseModel) {
        case '重型':
            if (totalLevel === 0) {
                legModel = '150×150×6';
            } else if (totalLevel === 1) {
                legModel = '180×180×8';
            } else {
                legModel = '200×200×10';
            }
            break;
        case '中型':
            if (totalLevel === 0) {
                legModel = '120×120×4';
            } else if (totalLevel === 1) {
                legModel = '150×150×5';
            } else {
                legModel = '180×180×6';
            }
            break;
        case '标准型':
            if (totalLevel === 0) {
                legModel = '100×100×4';
            } else if (totalLevel === 1) {
                legModel = '120×120×5';
            } else {
                legModel = '150×150×6';
            }
            break;
    }
    
    // 获取单位重量
    const unitWeight = ROLLING_SCREEN_CONST.LEG_WEIGHTS[legModel];
    if (!unitWeight) {
        throw new Error(`未找到型号 ${legModel} 的单位重量`);
    }
    
    // 计算总长度和总重量
    const totalLength = legCount * height / 1000; // 转为m
    const totalWeight = totalLength * unitWeight;
    
    // 生成选择逻辑说明
    const selectionLogic = `${legCount}根支腿(${baseModel})`;
    
    return {
        model: legModel,
        length: totalLength,
        unitWeight: unitWeight,
        weight: totalWeight,
        selectionLogic: selectionLogic
    };
}

/**
 * 滚筒筛分机完整计算
 */
function calculateRollingScreen(diameter, length, height, width, legCount, guardrailHeight) {
    const results = new RollingScreenResults();
    
    // 验证输入
    if (diameter < ROLLING_SCREEN_CONST.MIN_DIAMETER || diameter > ROLLING_SCREEN_CONST.MAX_DIAMETER) {
        throw new Error(`筒体直径必须在${ROLLING_SCREEN_CONST.MIN_DIAMETER}-${ROLLING_SCREEN_CONST.MAX_DIAMETER}m之间`);
    }
    if (length < ROLLING_SCREEN_CONST.MIN_LENGTH || length > ROLLING_SCREEN_CONST.MAX_LENGTH) {
        throw new Error(`筒体长度必须在${ROLLING_SCREEN_CONST.MIN_LENGTH}-${ROLLING_SCREEN_CONST.MAX_LENGTH}m之间`);
    }
    
    // 1. 计算支架材料
    const legMaterials = calculateLegMaterials(legCount, height, diameter * 1000);
    results.legModel = legMaterials.model;
    results.legLength = legMaterials.length;
    results.legUnitWeight = legMaterials.unitWeight;
    results.legWeight = legMaterials.weight;
    results.legSelectionLogic = legMaterials.selectionLogic;
    
    // 2. 计算平台材料（使用圆形平台计算器）
    if (typeof window.PlatformCalculator !== 'undefined') {
        const platformResults = window.PlatformCalculator.calculateCircular(
            diameter * 1000, // 转为mm
            length * 1000,   // 转为mm
            width
        );
        results.platformWeight = platformResults.totalWeight;
    } else {
        console.warn('⚠️ PlatformCalculator未加载，平台重量为0');
        results.platformWeight = 0;
    }
    
    // 3. 计算护栏材料
    if (typeof window.LadderCalculator !== 'undefined') {
        // 护栏长度 = 筒体长度 + 800 + 平台宽度×4 + 筒体直径×2
        const guardrailLength = (length * 1000 + 800 + width * 4 + diameter * 1000 * 2) / 1000; // 转为m
        const guardrailResults = window.LadderCalculator.calculateGuardrail(
            guardrailLength,
            guardrailHeight / 1000, // 转为m
            true // 是平台护栏
        );
        results.guardrailWeight = guardrailResults.totalWeight;
    } else {
        console.warn('⚠️ LadderCalculator未加载，护栏重量为0');
        results.guardrailWeight = 0;
    }
    
    // 4. 计算总重量
    results.totalWeight = results.legWeight + results.platformWeight + results.guardrailWeight;
    
    return results;
}

/**
 * 输入验证
 */
function validateRollingScreenInputs(diameter, length, height, width, legCount, guardrailHeight) {
    const errors = [];
    
    // 验证筒体直径
    if (diameter < ROLLING_SCREEN_CONST.MIN_DIAMETER || diameter > ROLLING_SCREEN_CONST.MAX_DIAMETER) {
        errors.push(`筒体直径必须在${ROLLING_SCREEN_CONST.MIN_DIAMETER}-${ROLLING_SCREEN_CONST.MAX_DIAMETER}m之间`);
    }
    
    // 验证筒体长度
    if (length < ROLLING_SCREEN_CONST.MIN_LENGTH || length > ROLLING_SCREEN_CONST.MAX_LENGTH) {
        errors.push(`筒体长度必须在${ROLLING_SCREEN_CONST.MIN_LENGTH}-${ROLLING_SCREEN_CONST.MAX_LENGTH}m之间`);
    }
    
    // 验证架体高度
    if (height < ROLLING_SCREEN_CONST.MIN_HEIGHT || height > ROLLING_SCREEN_CONST.MAX_HEIGHT) {
        errors.push(`架体高度必须在${ROLLING_SCREEN_CONST.MIN_HEIGHT}-${ROLLING_SCREEN_CONST.MAX_HEIGHT}mm之间`);
    }
    
    // 验证支腿数量
    if (!ROLLING_SCREEN_CONST.VALID_LEG_COUNTS.includes(legCount)) {
        errors.push(`支腿数量必须为${ROLLING_SCREEN_CONST.VALID_LEG_COUNTS.join(', ')}之一`);
    }
    
    // 验证平台宽度
    if (width <= 0) {
        errors.push('围绕平台宽度必须大于0');
    }
    
    // 验证护栏高度
    if (guardrailHeight <= 0) {
        errors.push('护栏高度必须大于0');
    }
    
    // 护栏高度安全检查（GB4053.3-2009标准）
    if (guardrailHeight < 1050) {
        errors.push('警告：护栏高度不符合GB4053.3-2009标准要求(≥1050mm)');
    }
    
    return errors;
}

/**
 * 获取默认参数
 */
function getRollingScreenDefaults() {
    return {
        diameter: 1.6,                              // 筒体直径 m
        length: 6,                                  // 筒体长度 m
        height: 3500,                               // 架体高度 mm
        width: ROLLING_SCREEN_CONST.STANDARD_WIDTH, // 平台宽度 mm
        legCount: 4,                                // 支腿数量
        guardrailHeight: 1200                       // 护栏高度 mm
    };
}

// 导出函数
window.RollingScreenCalculator = {
    calculate: calculateRollingScreen,
    calculateLeg: calculateLegMaterials,
    validate: validateRollingScreenInputs,
    getDefaults: getRollingScreenDefaults,
    constants: ROLLING_SCREEN_CONST
};

console.log('✅ 滚筒筛分机计算器已加载');

