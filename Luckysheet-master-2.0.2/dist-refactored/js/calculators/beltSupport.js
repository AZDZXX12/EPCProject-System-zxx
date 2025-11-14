/**
 * 皮带支架算料计算器
 * 从VBA代码转译：frmBeltSupport.frm + modBeltSupportCalculations.bas + Pricetopower.bas
 */

// 输出结果数据结构
class BeltSupportOutput {
    constructor() {
        this.endHeight = 0;         // 皮带末端高度(m)
        this.avgSpacing = 0;        // 支腿平均间距(m)
        this.legCount = 0;          // 支腿数量
        this.legInfo = '';          // 支腿详细信息
        this.crossCount = 0;        // 横梁数量
        this.diagonalCount = 0;     // 斜撑数量
        this.edgeLegCount = 0;      // 边缘支腿数量
        this.edgeBeamLength = 0;    // 边缘横梁长度(m)
        this.totalChannelSteel = 0; // 槽钢总长度(m)
        this.totalAngleIron = 0;    // 角钢总长度(m)
        this.channelWeight = 0;     // 槽钢重量(kg)
        this.angleWeight = 0;       // 角钢重量(kg)
        this.weldingRodWeight = 0;  // 焊条预估重量(kg)
    }
}

// 常量定义
const BELT_SUPPORT_CONST = {
    PI: Math.PI,
    FRAME_WIDTH_EXTENSION: 0.4,   // 支架宽度扩展量(m)
    MIN_LEG_COUNT: 2,              // 最小支腿数量
    MAX_SPACING: 6,                // 最大支腿间距(m)
    MIN_SPACING: 3,                // 最小支腿间距(m)
    LEG_BASE_HEIGHT: 0.05,         // 支腿基础高度(5cm)
    CROSS_SPACING: 1.5,            // 横梁间距(m)
    EDGE_LEG_SPACING: 1.3,         // 边缘支腿间距(m)
    EDGE_LEG_HEIGHT: 0.8,          // 边缘支腿高度(m)
    CHANNEL_DENSITY: 7.85,         // 槽钢密度(kg/m)
    ANGLE_DENSITY: 3.77,           // 角钢密度(kg/m)
    WELDING_ROD_PER_METER: 0.3,   // 每米材料焊条用量(kg/m)
    MIN_BELT_LENGTH: 3             // 皮带最小长度(m)
};

// 皮带规格数据
const BELT_SPECS = [
    { width: 500, basePrice: 17000, pricePerMeter: 600, discountPerMeter: 500, power10m: 2.2 },
    { width: 650, basePrice: 19000, pricePerMeter: 650, discountPerMeter: 500, power10m: 3 },
    { width: 800, basePrice: 23000, pricePerMeter: 1000, discountPerMeter: 800, power10m: 4 },
    { 
        width: 1000, 
        basePrice: 30000, 
        pricePerMeter: 1200, 
        discountPerMeter: 1000, 
        power10m: 5.5,
        power15m: 7.5,
        power20m: 11,
        power30m: 15
    },
    { width: 1200, basePrice: 36000, pricePerMeter: 1500, discountPerMeter: 1200, power10m: 7.5 }
];

// 标准功率表
const STANDARD_POWERS = [0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110];

/**
 * 主计算函数
 */
function calculateBeltSupport(beltAngle, beltWidth, minHeight, beltLength, hasOverlap, overlapDist, edgeCount) {
    const output = new BeltSupportOutput();
    
    // 确保皮带长度不小于最小值
    if (beltLength < BELT_SUPPORT_CONST.MIN_BELT_LENGTH) {
        beltLength = BELT_SUPPORT_CONST.MIN_BELT_LENGTH;
    }
    
    // 1. 计算基础几何
    const theta = beltAngle * Math.PI / 180;
    let Lh, Hd, tanTheta;
    
    // 处理0角度
    if (Math.abs(beltAngle) < 0.001) {
        Lh = beltLength;
        Hd = 0;
        tanTheta = 0;
    } else {
        Lh = beltLength * Math.cos(theta);  // 水平投影长度
        Hd = beltLength * Math.sin(theta);  // 高度差
        tanTheta = Math.tan(theta);
    }
    
    output.endHeight = minHeight + Hd;
    const frameWidth = (beltWidth / 1000) + BELT_SUPPORT_CONST.FRAME_WIDTH_EXTENSION;
    
    // 2. 支腿计算
    output.legCount = Math.round(Lh / ((BELT_SUPPORT_CONST.MIN_SPACING + BELT_SUPPORT_CONST.MAX_SPACING) / 2));
    if (output.legCount < BELT_SUPPORT_CONST.MIN_LEG_COUNT) {
        output.legCount = BELT_SUPPORT_CONST.MIN_LEG_COUNT;
    }
    
    // 调整间距在3-6m之间
    output.avgSpacing = Lh / (output.legCount - 1);
    if (output.avgSpacing > BELT_SUPPORT_CONST.MAX_SPACING) {
        output.legCount++;
        output.avgSpacing = Lh / (output.legCount - 1);
    } else if (output.avgSpacing < BELT_SUPPORT_CONST.MIN_SPACING) {
        output.legCount--;
        if (output.legCount < BELT_SUPPORT_CONST.MIN_LEG_COUNT) {
            output.legCount = BELT_SUPPORT_CONST.MIN_LEG_COUNT;
        }
        output.avgSpacing = Lh / (output.legCount - 1);
    }
    output.avgSpacing = Math.round(output.avgSpacing * 10) / 10;
    
    const legHeights = [];
    const legCrossCount = [];
    let legInfo = '';
    let totalLegLength = 0;
    let totalCrossLength = 0;
    
    // 3. 计算每根支腿的高度和横梁
    for (let i = 0; i < output.legCount; i++) {
        let x;
        if (output.legCount > 1) {
            x = i * output.avgSpacing;
        } else {
            x = 0;
        }
        
        legHeights[i] = minHeight + x * tanTheta + BELT_SUPPORT_CONST.LEG_BASE_HEIGHT;
        
        const nTiers = Math.ceil(legHeights[i] / BELT_SUPPORT_CONST.CROSS_SPACING);
        legCrossCount[i] = nTiers;
        output.crossCount += nTiers;
        
        if (legInfo !== '') legInfo += ', ';
        legInfo += `${legHeights[i].toFixed(2)}m(${nTiers}道横)`;
        
        totalLegLength += legHeights[i];
    }
    output.legInfo = legInfo;
    
    // 4. 斜撑计算
    const diagLength = Math.sqrt(Math.pow(frameWidth / 2, 2) + Math.pow(BELT_SUPPORT_CONST.CROSS_SPACING, 2));
    let totalDiagLength = 0;
    
    if (output.legCount > 1) {
        for (let i = 0; i < output.legCount - 1; i++) {
            const maxH = Math.max(legHeights[i], legHeights[i + 1]);
            const nTiers = Math.ceil(maxH / BELT_SUPPORT_CONST.CROSS_SPACING);
            
            if (nTiers > 2) {
                output.diagonalCount += (nTiers - 1) * 2;
                totalDiagLength += diagLength * (nTiers - 1) * 2;
            }
        }
    }
    
    // 5. 边缘计算
    if (hasOverlap) {
        output.edgeBeamLength = overlapDist;
        const singleEdgeLegCount = Math.round(overlapDist / BELT_SUPPORT_CONST.EDGE_LEG_SPACING) + 2;
        output.edgeLegCount = (singleEdgeLegCount * edgeCount) + 2;
    } else {
        output.edgeBeamLength = frameWidth;
        const singleEdgeLegCount = Math.round(frameWidth / BELT_SUPPORT_CONST.EDGE_LEG_SPACING) + 2;
        output.edgeLegCount = (singleEdgeLegCount * edgeCount) + 2;
    }
    
    // 6. 材料总计
    totalCrossLength = output.crossCount * frameWidth;
    output.totalChannelSteel = totalLegLength + totalCrossLength;
    output.totalAngleIron = totalDiagLength + (output.edgeLegCount * BELT_SUPPORT_CONST.EDGE_LEG_HEIGHT) + output.edgeBeamLength;
    
    // 7. 重量计算
    output.channelWeight = output.totalChannelSteel * BELT_SUPPORT_CONST.CHANNEL_DENSITY;
    output.angleWeight = output.totalAngleIron * BELT_SUPPORT_CONST.ANGLE_DENSITY;
    
    // 8. 焊条重量预估
    output.weldingRodWeight = (output.totalChannelSteel + output.totalAngleIron) * BELT_SUPPORT_CONST.WELDING_ROD_PER_METER;
    
    return output;
}

/**
 * 输入验证
 */
function validateBeltSupportInputs(angle, minHeight, length, hasOverlap, overlapDist) {
    if (length < BELT_SUPPORT_CONST.MIN_BELT_LENGTH) {
        alert(`皮带长度最小为 ${BELT_SUPPORT_CONST.MIN_BELT_LENGTH} 米！`);
        return false;
    }
    
    if (angle < 0) {
        alert('皮带角度不能为负数！');
        return false;
    }
    
    if (minHeight <= 0) {
        alert('最低高度必须大于0！');
        return false;
    }
    
    if (length <= 0) {
        alert('皮带长度必须大于0！');
        return false;
    }
    
    if (hasOverlap && overlapDist <= 0) {
        alert('搭接距离必须大于0！');
        return false;
    }
    
    return true;
}

/**
 * 获取皮带价格
 */
function getBeltPrice(beltWidth, length) {
    const spec = BELT_SPECS.find(s => s.width === beltWidth);
    if (!spec) return 0;
    
    if (length >= 10) {
        return spec.basePrice + (length - 10) * spec.pricePerMeter;
    } else {
        return spec.basePrice - (10 - length) * spec.discountPerMeter;
    }
}

/**
 * 获取皮带功率
 */
function getBeltPower(beltWidth, length, beltAngle) {
    const spec = BELT_SPECS.find(s => s.width === beltWidth);
    if (!spec) {
        // 使用默认估算
        return beltWidth / 1000 * 5.5;
    }
    
    let basePower = 0;
    
    // 根据长度确定基础功率
    if (length <= 10) {
        basePower = spec.power10m;
    } else if (length <= 15) {
        basePower = spec.power15m || (spec.power10m * (1 + (length - 10) * 0.05));
    } else if (length <= 20) {
        basePower = spec.power20m || (spec.power10m * (1 + (length - 10) * 0.05));
    } else if (length <= 30) {
        basePower = spec.power30m || (spec.power10m * (1 + (length - 10) * 0.05));
    } else {
        if (spec.power30m) {
            basePower = spec.power30m * (1 + (length - 30) * 0.03);
        } else {
            basePower = spec.power10m * (1 + (length - 10) * 0.05);
        }
    }
    
    // 角度调整
    let adjustedPower = basePower;
    if (beltAngle > 15) {
        adjustedPower = getNextStandardPower(basePower);
    }
    
    // 功率上限
    const maxPowers = { 500: 7.5, 650: 11, 800: 15, 1000: 30, 1200: 45 };
    adjustedPower = Math.min(adjustedPower, maxPowers[beltWidth] || 110);
    
    return findClosestStandardPower(adjustedPower);
}

/**
 * 获取下一个标准功率
 */
function getNextStandardPower(currentPower) {
    for (let power of STANDARD_POWERS) {
        if (power > currentPower) return power;
    }
    return STANDARD_POWERS[STANDARD_POWERS.length - 1];
}

/**
 * 找到最接近的标准功率
 */
function findClosestStandardPower(power) {
    let closestPower = STANDARD_POWERS[0];
    let minDiff = Math.abs(power - closestPower);
    
    for (let standardPower of STANDARD_POWERS) {
        const diff = Math.abs(power - standardPower);
        if (diff < minDiff) {
            minDiff = diff;
            closestPower = standardPower;
        }
    }
    
    return closestPower;
}

// 导出函数供外部调用
window.BeltSupportCalculator = {
    calculate: calculateBeltSupport,
    validate: validateBeltSupportInputs,
    getBeltPrice: getBeltPrice,
    getBeltPower: getBeltPower
};

console.log('✅ 皮带支架计算器已加载');

