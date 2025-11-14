/**
 * 钢平台用量计算器
 * 从VBA代码转译：PlatformCalculations.bas + PlatformCalculations_1.bas
 */

class PlatformResults {
    constructor() {
        this.mainBeamLength = 0;        // 主梁长度 m
        this.mainBeamWeight = 0;        // 主梁重量 kg
        this.secondaryBeamCount = 0;    // 次梁数量
        this.secondaryBeamLength = 0;   // 次梁总长度 m
        this.secondaryBeamWeight = 0;   // 次梁重量 kg
        this.columnCount = 0;           // 立柱数量
        this.columnHeight = 0;          // 立柱高度 m
        this.columnWeight = 0;          // 立柱重量 kg
        this.floorArea = 0;             // 平台面积 m²
        this.floorWeight = 0;           // 平台地面重量 kg
        this.bracingLength = 0;         // 连接角钢长度 m
        this.bracingWeight = 0;         // 连接角钢重量 kg
        this.structureWeight = 0;       // 平台结构总重量 kg
        this.equipmentLoad = 0;         // 设备荷载（60%）kg
        this.mainBeamMaterial = '';     // 主梁材料规格
        this.secondaryBeamMaterial = ''; // 次梁材料规格
    }
}

class CircularPlatformResults {
    constructor() {
        this.numCrossBracing = 0;       // 平台横撑数量
        this.sideChannelLength = 0;     // 两侧平台槽钢总长 m
        this.sideChannelWeight = 0;     // 两侧平台槽钢重量 kg
        this.sideAngleLength = 0;       // 两侧平台角钢总长 m
        this.sideAngleWeight = 0;       // 两侧平台角钢重量 kg
        this.frontChannelLength = 0;    // 前方平台槽钢总长 m
        this.frontChannelWeight = 0;    // 前方平台槽钢重量 kg
        this.rearChannelLength = 0;     // 后方平台槽钢总长 m
        this.rearChannelWeight = 0;     // 后方平台槽钢重量 kg
        this.plateArea = 0;             // 花纹板面积 m²
        this.plateWeight = 0;           // 花纹板重量 kg
        this.totalWeight = 0;           // 平台总重量 kg
    }
}

const MATERIAL_SPECS = {
    squareTube: {
        light: [
            { name: '方管', spec: '100×100×4', weight: 11.73 },
            { name: '方管', spec: '80×80×3.5', weight: 8.38 }
        ],
        medium: [
            { name: '方管', spec: '120×120×5', weight: 17.85 },
            { name: '方管', spec: '100×100×4', weight: 11.73 }
        ],
        heavy: [
            { name: '方管', spec: '150×150×6', weight: 26.39 },
            { name: '方管', spec: '120×120×5', weight: 17.85 }
        ]
    },
    channelSteel: {
        light: [
            { name: '槽钢', spec: '14#', weight: 14.535 },
            { name: '槽钢', spec: '12#', weight: 12.059 }
        ],
        medium: [
            { name: '槽钢', spec: '16#', weight: 17.24 },
            { name: '槽钢', spec: '14#', weight: 14.535 }
        ],
        heavy: [
            { name: '槽钢', spec: '18#', weight: 20.17 },
            { name: '槽钢', spec: '16#', weight: 17.24 }
        ]
    }
};

const PLATFORM_CONST = {
    CHANNEL_STEEL_12: 12.059,   // 12#槽钢单位重量 kg/m
    ANGLE_STEEL_50: 3.77,       // L50×5角钢单位重量 kg/m
    STEEL_PLATE_4MM: 31.4,      // 4mm钢板单位重量 kg/m²
    STEEL_PLATE_3MM: 25.6,      // 3mm花纹板单位重量 kg/m²
    RAILING_WEIGHT: 2.42,       // Φ32×3.5钢管单位重量 kg/m
    MAX_SECONDARY_SPACING: 1.2, // 次梁最大间距 m
    MAX_COLUMN_SPACING: 2.5,    // 立柱最大间距 m
    MIN_SECONDARY_COUNT: 2,     // 最小次梁数量
    MIN_COLUMN_COUNT: 4         // 最小立柱数量
};

/**
 * 选择材料规格
 */
function selectMaterial(equipmentWeight, isSquareTube = false) {
    let category;
    
    if (equipmentWeight <= 1000) {
        category = 'light';
    } else if (equipmentWeight <= 3000) {
        category = 'medium';
    } else {
        category = 'heavy';
    }
    
    return isSquareTube ? 
        MATERIAL_SPECS.squareTube[category] : 
        MATERIAL_SPECS.channelSteel[category];
}

/**
 * 矩形平台结构计算
 */
function calculateRectangularPlatform(length, width, height, equipmentWeight, isSquareTube = false) {
    const results = new PlatformResults();
    
    // 验证输入
    if (length <= 0 || width <= 0 || height <= 0) {
        throw new Error('平台尺寸必须大于0');
    }
    if (equipmentWeight < 0) {
        throw new Error('设备重量不能为负数');
    }
    
    // 材料选择
    const materials = selectMaterial(equipmentWeight, isSquareTube);
    results.mainBeamMaterial = `${materials[0].name} ${materials[0].spec}`;
    results.secondaryBeamMaterial = `${materials[1].name} ${materials[1].spec}`;
    
    // 1. 主梁计算（2根）
    results.mainBeamLength = length * 2;
    results.mainBeamWeight = results.mainBeamLength * materials[0].weight;
    
    // 2. 次梁计算（间距不超过1.2m）
    results.secondaryBeamCount = Math.ceil(width / PLATFORM_CONST.MAX_SECONDARY_SPACING);
    if (results.secondaryBeamCount < PLATFORM_CONST.MIN_SECONDARY_COUNT) {
        results.secondaryBeamCount = PLATFORM_CONST.MIN_SECONDARY_COUNT;
    }
    results.secondaryBeamLength = results.secondaryBeamCount * width;
    results.secondaryBeamWeight = results.secondaryBeamLength * materials[1].weight;
    
    // 3. 立柱计算（间距不超过2.5m）
    results.columnCount = Math.ceil(length / PLATFORM_CONST.MAX_COLUMN_SPACING) * 2;
    if (results.columnCount < PLATFORM_CONST.MIN_COLUMN_COUNT) {
        results.columnCount = PLATFORM_CONST.MIN_COLUMN_COUNT;
    }
    results.columnHeight = height;
    results.columnWeight = results.columnCount * height * materials[0].weight;
    
    // 4. 平台地面（4mm花纹钢板）
    results.floorArea = length * width;
    results.floorWeight = results.floorArea * PLATFORM_CONST.STEEL_PLATE_4MM;
    
    // 5. 连接角钢（50×50×5）
    results.bracingLength = results.columnCount * 0.5; // 每个立柱约0.5m连接角钢
    results.bracingWeight = results.bracingLength * PLATFORM_CONST.ANGLE_STEEL_50;
    
    // 6. 结构总重量
    results.structureWeight = results.mainBeamWeight + results.secondaryBeamWeight + 
                             results.columnWeight + results.floorWeight + results.bracingWeight;
    
    // 7. 设备荷载（60%）
    results.equipmentLoad = equipmentWeight * 0.6;
    
    return results;
}

/**
 * 圆形平台计算（环绕设备）
 */
function calculateCircularPlatform(diameter, length, width) {
    const results = new CircularPlatformResults();
    
    // 验证输入
    if (diameter <= 0 || length <= 0 || width <= 0) {
        throw new Error('尺寸参数必须大于0');
    }
    
    // 1. 计算平台横撑数量
    results.numCrossBracing = Math.ceil((length + 700) / 900) + 1;
    
    // 2. 计算两侧平台槽钢总长
    const diagonalFactor = Math.sqrt(Math.pow(width, 2) * 2);
    const lengthFactor = Math.round(length / 3000 + 1);
    results.sideChannelLength = (results.numCrossBracing * width + (length + 800) + 
                                 diagonalFactor * lengthFactor * 2) / 1000; // 转为m
    results.sideChannelWeight = results.sideChannelLength * PLATFORM_CONST.CHANNEL_STEEL_12;
    
    // 3. 计算两侧平台角钢总长
    results.sideAngleLength = (results.numCrossBracing * width) / 1000; // 转为m
    results.sideAngleWeight = results.sideAngleLength * PLATFORM_CONST.ANGLE_STEEL_50;
    
    // 4. 计算前方平台槽钢总长
    const frontPlatformWidth = diameter + 300 + width * 2;
    results.frontChannelLength = (Math.ceil(frontPlatformWidth / 500) * 700 + frontPlatformWidth) / 1000; // 转为m
    results.frontChannelWeight = results.frontChannelLength * PLATFORM_CONST.CHANNEL_STEEL_12;
    
    // 5. 计算后方平台槽钢总长
    const rearSupportFactor = (Math.sqrt(diameter) / 4 * 100 + 1000);
    const rearSupportCount = Math.ceil(frontPlatformWidth / 700 + 1);
    results.rearChannelLength = (frontPlatformWidth * 3 + rearSupportFactor * rearSupportCount + 
                                Math.sqrt(Math.pow(diameter / 2, 2) + Math.pow(rearSupportFactor, 2)) * 4) / 1000; // 转为m
    results.rearChannelWeight = results.rearChannelLength * PLATFORM_CONST.CHANNEL_STEEL_12;
    
    // 6. 计算花纹板面积
    const rearPlatformArea = frontPlatformWidth * rearSupportFactor;
    results.plateArea = ((length + 800) * width * 2 + frontPlatformWidth * 700 + rearPlatformArea) / 1000000; // 转为m²
    results.plateWeight = results.plateArea * PLATFORM_CONST.STEEL_PLATE_3MM;
    
    // 7. 计算平台总重量
    results.totalWeight = results.sideChannelWeight + results.sideAngleWeight + 
                         results.frontChannelWeight + results.rearChannelWeight + 
                         results.plateWeight;
    
    return results;
}

/**
 * 计算总重量（平台 + 护栏 + 楼梯）
 */
function calculateTotalStructureWeight(platformWeight, guardrailWeight, stairWeight) {
    return platformWeight + guardrailWeight + stairWeight;
}

// 导出函数
window.PlatformCalculator = {
    calculateRectangular: calculateRectangularPlatform,
    calculateCircular: calculateCircularPlatform,
    calculateTotal: calculateTotalStructureWeight,
    selectMaterial: selectMaterial,
    constants: PLATFORM_CONST
};

console.log('✅ 钢平台计算器已加载');

