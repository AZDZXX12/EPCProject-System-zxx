/**
 * 旋风除尘器选型计算器
 * 从VBA代码转译：Cyclone.frm + CycloneParameters_1.bas
 */

class CycloneResults {
    constructor() {
        this.inletHeight = 0;           // 入口高度 mm
        this.inletWidth = 0;            // 入口宽度 mm
        this.cylinderDiameter = 0;      // 筒体直径 mm
        this.outletDiameter = 0;        // 排气直径 mm
        this.outletInsertionDepth = 0;  // 排气管插入深度 mm
        this.straightSectionHeight = 0; // 直筒高度 mm
        this.coneHeight = 0;            // 锥体高度 m
        this.totalHeight = 0;           // 设备总高度 m
        this.dustOutletDiameter = 0;    // 排灰口直径 mm
        this.pressureLoss = 0;          // 压力损失 Pa
    }
}

const CYCLONE_DEFAULTS = {
    cylinderLengthRatio: 2,         // 直筒长度/筒体直径
    coneLengthRatio: 2,             // 锥体长度/筒体直径
    outletDiameterRatio: 0.5,       // 排气直径/筒体直径
    innerCylinderLengthRatio: 0.25, // 内筒长度/筒体直径
    inletHeightRatio: 0.5,          // 入口高度/筒体直径
    dustOutletRatio: 0.25,          // 灰斗出口直径/筒体直径
    inletWidthRatio: 0.5,           // 入口宽度/入口高度
    inletAirflow: 10000,            // 入口风量 m3/h
    inletVelocity: 18               // 入口风速 m/s
};

const CYCLONE_CONSTRAINTS = {
    cylinderLengthRatio: { min: 1, max: 3 },
    coneLengthRatio: { min: 1.5, max: 4 },
    outletDiameterRatio: { min: 0.4, max: 0.7 },
    inletVelocity: { min: 10, max: 30 }
};

/**
 * 主计算函数
 */
function calculateCyclone(inletAirflow, inletVelocity, cylinderLengthRatio, coneLengthRatio, 
                         outletDiameterRatio, innerCylinderLengthRatio, inletHeightRatio, 
                         dustOutletRatio, inletWidthRatio) {
    const results = new CycloneResults();
    
    // 验证输入
    if (inletVelocity <= 0) {
        throw new Error('入口风速必须大于0');
    }
    if (inletAirflow <= 0) {
        throw new Error('入口风量必须大于0');
    }
    
    // 计算入口面积 (m²) = 风量 (m³/h) / (风速 (m/s) * 3600)
    const inletArea = inletAirflow / (inletVelocity * 3600);
    
    // 计算各尺寸
    // 入口高度和宽度
    results.inletHeight = Math.sqrt(inletArea / inletWidthRatio) * 1000; // 转换为mm
    results.inletWidth = results.inletHeight * inletWidthRatio; // mm
    
    // 筒体直径
    results.cylinderDiameter = results.inletHeight / inletHeightRatio; // mm
    
    // 排气直径
    results.outletDiameter = results.cylinderDiameter * outletDiameterRatio; // mm
    
    // 排气管插入深度
    results.outletInsertionDepth = results.cylinderDiameter * innerCylinderLengthRatio; // mm
    
    // 直筒高度
    results.straightSectionHeight = results.cylinderDiameter * cylinderLengthRatio; // mm
    
    // 锥体高度
    results.coneHeight = (results.cylinderDiameter * coneLengthRatio) / 1000; // m
    
    // 排灰口直径
    results.dustOutletDiameter = results.cylinderDiameter * dustOutletRatio; // mm
    
    // 设备总高度
    results.totalHeight = (results.straightSectionHeight / 1000) + results.coneHeight + 
                         (results.outletInsertionDepth / 1000); // 转换为m
    
    // 计算压力损失 (Pa)
    const airDensity = 1.2; // 空气密度 kg/m³
    const resistanceCoefficient = 16 * (inletArea / (Math.PI * Math.pow(results.outletDiameter / 2000, 2)));
    results.pressureLoss = resistanceCoefficient * airDensity * Math.pow(inletVelocity, 2) / 2;
    
    return results;
}

/**
 * 验证参数范围
 */
function validateCycloneParameters(cylinderLengthRatio, coneLengthRatio, outletDiameterRatio, inletVelocity) {
    const errors = [];
    
    // 验证比例参数范围
    if (cylinderLengthRatio < CYCLONE_CONSTRAINTS.cylinderLengthRatio.min || 
        cylinderLengthRatio > CYCLONE_CONSTRAINTS.cylinderLengthRatio.max) {
        errors.push(`直筒长/筒体直径应在${CYCLONE_CONSTRAINTS.cylinderLengthRatio.min}-${CYCLONE_CONSTRAINTS.cylinderLengthRatio.max}之间`);
    }
    
    if (coneLengthRatio < CYCLONE_CONSTRAINTS.coneLengthRatio.min || 
        coneLengthRatio > CYCLONE_CONSTRAINTS.coneLengthRatio.max) {
        errors.push(`锥体长/筒体直径应在${CYCLONE_CONSTRAINTS.coneLengthRatio.min}-${CYCLONE_CONSTRAINTS.coneLengthRatio.max}之间`);
    }
    
    if (outletDiameterRatio < CYCLONE_CONSTRAINTS.outletDiameterRatio.min || 
        outletDiameterRatio > CYCLONE_CONSTRAINTS.outletDiameterRatio.max) {
        errors.push(`排气直径/筒体直径应在${CYCLONE_CONSTRAINTS.outletDiameterRatio.min}-${CYCLONE_CONSTRAINTS.outletDiameterRatio.max}之间`);
    }
    
    // 验证操作参数
    if (inletVelocity < CYCLONE_CONSTRAINTS.inletVelocity.min || 
        inletVelocity > CYCLONE_CONSTRAINTS.inletVelocity.max) {
        errors.push(`入口风速建议在${CYCLONE_CONSTRAINTS.inletVelocity.min}-${CYCLONE_CONSTRAINTS.inletVelocity.max} m/s之间`);
    }
    
    return errors;
}

/**
 * 获取默认参数
 */
function getCycloneDefaults() {
    return { ...CYCLONE_DEFAULTS };
}

// 导出函数
window.CycloneCalculator = {
    calculate: calculateCyclone,
    validate: validateCycloneParameters,
    getDefaults: getCycloneDefaults,
    constraints: CYCLONE_CONSTRAINTS
};

console.log('✅ 旋风除尘器计算器已加载');

