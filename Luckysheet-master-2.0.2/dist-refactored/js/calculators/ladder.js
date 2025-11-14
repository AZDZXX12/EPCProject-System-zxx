/**
 * 爬梯材料表计算器（含护栏）
 * 从VBA代码转译：LadderCalculations.bas + GuardrailCalculations.bas
 * 符合GB4053.1-2009标准
 */

class LadderResults {
    constructor() {
        this.sideBeamLength = 0;       // 侧边方管长度 m
        this.sideBeamWeight = 0;       // 侧边方管重量 kg
        this.rungCount = 0;            // 踏棍数量
        this.rungSpacing = 0;          // 踏棍间距 mm
        this.rungTotalWeight = 0;      // 踏棍总重量 kg
        this.bracingLength = 0;        // 连接角钢长度 m
        this.bracingWeight = 0;        // 连接角钢重量 kg
        this.platformCount = 0;        // 平台数量
        this.platformBeamLength = 0;   // 平台框架长度 m
        this.platformBeamWeight = 0;   // 平台框架重量 kg
        this.platformFloorArea = 0;    // 平台地面面积 m²
        this.platformFloorWeight = 0;  // 平台地面重量 kg
        this.platformTopRailLength = 0; // 平台顶部扶手长度 m
        this.platformTopRailWeight = 0; // 平台顶部扶手重量 kg
        this.platformSideRailLength = 0; // 平台侧边扶手长度 m
        this.platformSideRailWeight = 0; // 平台侧边扶手重量 kg
        this.cageVerticalLength = 0;   // 护笼竖杆长度 m
        this.cageVerticalWeight = 0;   // 护笼竖杆重量 kg
        this.cageRingLength = 0;       // 护笼横杆长度 m
        this.cageRingWeight = 0;       // 护笼横杆重量 kg
        this.boltCount = 0;            // 螺栓数量
        this.paintArea = 0;            // 油漆面积 m²
        this.totalWeight = 0;          // 总重量 kg
        this.platformHeights = [];     // 平台高度列表 m
    }
}

class GuardrailResults {
    constructor() {
        this.postCount = 0;            // 立柱数量
        this.postLength = 0;           // 立柱总长度 m
        this.postWeight = 0;           // 立柱重量 kg
        this.railCount = 0;            // 横杆数量（层数）
        this.railLength = 0;           // 横杆总长度 m
        this.railWeight = 0;           // 横杆重量 kg
        this.connectionLength = 0;     // 连接扁钢长度 m
        this.connectionWeight = 0;     // 连接扁钢重量 kg
        this.toePlateLength = 0;       // 踢脚板长度 m
        this.toePlateWeight = 0;       // 踢脚板重量 kg
        this.totalWeight = 0;          // 总重量 kg
    }
}

const LADDER_CONST = {
    SQUARE_TUBE_63: 5.72,          // 63×63×6方管 kg/m
    STEEL_PIPE_32: 3.13,           // Φ32×3.5钢管 kg/m
    ANGLE_STEEL_50: 3.77,          // L50×50×5角钢 kg/m
    CHANNEL_STEEL_12: 12.059,      // 12#槽钢 kg/m
    FLAT_IRON_30: 0.942,           // 30×4扁钢 kg/m
    FLAT_IRON_100: 3.14,           // 100×4扁钢 kg/m
    STEEL_PLATE_4MM: 31.4,         // 4mm花纹钢板 kg/m²
    PLATFORM_INTERVAL: 6000,       // 平台间距 mm（每6m一个）
    MIN_RUNG_SPACING: 225,         // 最小踏棍间距 mm
    MAX_RUNG_SPACING: 300,         // 最大踏棍间距 mm
    CAGE_START_HEIGHT: 2000,       // 护笼起始高度 mm
    CAGE_POLE_SPACING: 300,        // 护笼竖杆间距 mm
    CAGE_RING_SPACING: 1500,       // 护笼横杆间距 mm
    GUARDRAIL_POST_SPACING: 1100,  // 护栏立柱间距 mm
    GUARDRAIL_HEIGHT_THRESHOLD: 1.05 // 护栏高度阈值 m
};

/**
 * 计算平台数量（GB4053.1-2009要求）
 */
function calculatePlatformCount(height) {
    if (height <= LADDER_CONST.PLATFORM_INTERVAL) {
        return 0;
    }
    return Math.floor(height / LADDER_CONST.PLATFORM_INTERVAL);
}

/**
 * 计算平台高度列表
 */
function calculatePlatformHeights(height, platformCount) {
    const heights = [];
    for (let i = 1; i <= platformCount; i++) {
        heights.push(i * LADDER_CONST.PLATFORM_INTERVAL / 1000); // 转为m
    }
    return heights;
}

/**
 * 计算踏棍间距（GB4053.1-2009要求）
 */
function calculateRungSpacing(height) {
    // GB4053.1-2009规定：踏棍间距应为225mm~300mm
    if (height <= 3000) {
        return 300;
    } else if (height <= 6000) {
        return 275;
    } else {
        return 250;
    }
}

/**
 * 爬梯材料计算主函数
 */
function calculateLadder(height, width, hasCage = false) {
    const results = new LadderResults();
    
    // 验证输入
    if (height <= 0 || width <= 0) {
        throw new Error('高度和宽度必须大于0');
    }
    
    // 计算基础参数
    results.platformCount = calculatePlatformCount(height);
    results.rungSpacing = calculateRungSpacing(height);
    results.rungCount = Math.ceil(height / results.rungSpacing);
    results.platformHeights = calculatePlatformHeights(height, results.platformCount);
    
    // 1. 侧边方管（两根）
    results.sideBeamLength = (height / 1000) * 2;
    results.sideBeamWeight = results.sideBeamLength * LADDER_CONST.SQUARE_TUBE_63;
    
    // 2. 踏棍 - Φ32×3.5钢管
    results.rungTotalWeight = results.rungCount * (width / 1000) * LADDER_CONST.STEEL_PIPE_32;
    
    // 3. 连接角钢 - L50×50×5
    results.bracingLength = (height / 1000) * 4;
    results.bracingWeight = results.bracingLength * LADDER_CONST.ANGLE_STEEL_50;
    
    // 4. 平台结构（如果有平台）
    if (results.platformCount > 0) {
        // 4.1 平台框架 - 12#槽钢
        results.platformBeamLength = results.platformCount * (width / 1000) * 4;
        results.platformBeamWeight = results.platformBeamLength * LADDER_CONST.CHANNEL_STEEL_12;
        
        // 4.2 平台地面 - 4mm花纹钢板
        results.platformFloorArea = results.platformCount * (width / 1000) * (width / 1000);
        results.platformFloorWeight = results.platformFloorArea * LADDER_CONST.STEEL_PLATE_4MM;
        
        // 4.3 平台顶部扶手 - 30×4扁钢
        const topRailCountPerPlatform = 4; // 每个平台4根顶部扶手
        results.platformTopRailLength = results.platformCount * topRailCountPerPlatform * 1; // 每根约1m
        results.platformTopRailWeight = results.platformTopRailLength * LADDER_CONST.FLAT_IRON_30;
        
        // 4.4 平台侧边扶手 - 30×4扁钢
        results.platformSideRailLength = results.platformCount * 2 * (width / 1000);
        results.platformSideRailWeight = results.platformSideRailLength * LADDER_CONST.FLAT_IRON_30;
    }
    
    // 5. 护笼（如果需要）
    if (hasCage) {
        // 护笼高度（从2.0m开始安装）
        const cageHeight = height - LADDER_CONST.CAGE_START_HEIGHT;
        
        if (cageHeight > 0) {
            // 护笼竖杆（间距不超过300mm）
            const cagePoleCount = Math.ceil(cageHeight / LADDER_CONST.CAGE_POLE_SPACING) * 2;
            results.cageVerticalLength = cagePoleCount * (cageHeight / 1000);
            results.cageVerticalWeight = results.cageVerticalLength * LADDER_CONST.FLAT_IRON_30;
            
            // 护笼横杆（间距不超过1500mm）
            const cageRingCount = Math.ceil(cageHeight / LADDER_CONST.CAGE_RING_SPACING);
            const ringLengthPerLevel = (width / 1000) * 2; // 每层环箍长度
            results.cageRingLength = cageRingCount * ringLengthPerLevel;
            results.cageRingWeight = results.cageRingLength * LADDER_CONST.FLAT_IRON_30;
        }
    }
    
    // 6. 紧固件和油漆
    results.boltCount = results.rungCount * 4 + results.platformCount * 16;
    results.paintArea = (height / 1000 * 2 * 0.15) + (results.rungCount * (width / 1000 + 0.1) * 0.05);
    
    // 7. 计算总重量
    results.totalWeight = results.sideBeamWeight + results.rungTotalWeight + results.bracingWeight +
                         results.platformBeamWeight + results.platformFloorWeight +
                         results.platformTopRailWeight + results.platformSideRailWeight +
                         results.cageVerticalWeight + results.cageRingWeight;
    
    return results;
}

/**
 * 计算护栏立柱数量
 */
function calculateGuardrailPostCount(length) {
    // GB4053.3-2009规定：立柱间距不应超过1.1m
    return Math.ceil(length / LADDER_CONST.GUARDRAIL_POST_SPACING) + 1;
}

/**
 * 计算护栏横杆数量（层数）
 */
function calculateGuardrailRailCount(height) {
    // GB4053.3-2009规定：
    // 护栏高度≤1.05m时，横杆不少于2道
    // 护栏高度>1.05m时，横杆不少于3道
    if (height <= LADDER_CONST.GUARDRAIL_HEIGHT_THRESHOLD) {
        return 2;
    } else {
        return 3;
    }
}

/**
 * 护栏材料计算主函数
 */
function calculateGuardrail(length, height, isPlatform = false) {
    const results = new GuardrailResults();
    
    // 验证输入
    if (length <= 0 || height <= 0) {
        throw new Error('长度和高度必须大于0');
    }
    
    // 计算基础参数
    results.postCount = calculateGuardrailPostCount(length);
    results.railCount = calculateGuardrailRailCount(height);
    
    // 1. 立柱 - Φ32×3.5钢管
    results.postLength = results.postCount * height;
    results.postWeight = results.postLength * LADDER_CONST.STEEL_PIPE_32;
    
    // 2. 横杆 - Φ32×3.5钢管
    results.railLength = results.railCount * length;
    results.railWeight = results.railLength * LADDER_CONST.STEEL_PIPE_32;
    
    // 3. 连接扁钢 - 30×4扁钢
    results.connectionLength = results.postCount * 0.2 * results.railCount; // 每个连接点约0.2m
    results.connectionWeight = results.connectionLength * LADDER_CONST.FLAT_IRON_30;
    
    // 4. 踢脚板（仅平台护栏需要）
    if (isPlatform) {
        results.toePlateLength = length;
        results.toePlateWeight = length * LADDER_CONST.FLAT_IRON_100; // 100×4扁钢
    }
    
    // 5. 计算总重量
    results.totalWeight = results.postWeight + results.railWeight + 
                         results.connectionWeight + results.toePlateWeight;
    
    return results;
}

/**
 * 检查是否需要护笼（GB4053.1-2009要求）
 */
function checkCageRequirement(height) {
    // GB4053.1-2009规定：爬梯高度超过3m时应装护笼
    return height > 3000;
}

/**
 * 检查护栏高度是否符合标准
 */
function checkGuardrailHeightRequirement(height) {
    // GB4053.3-2009规定：护栏高度不应小于1.05m
    return height < 1.05;
}

// 导出函数
window.LadderCalculator = {
    calculateLadder: calculateLadder,
    calculateGuardrail: calculateGuardrail,
    checkCageRequirement: checkCageRequirement,
    checkGuardrailHeightRequirement: checkGuardrailHeightRequirement,
    calculatePlatformCount: calculatePlatformCount,
    calculateRungSpacing: calculateRungSpacing,
    constants: LADDER_CONST
};

console.log('✅ 爬梯及护栏计算器已加载');

