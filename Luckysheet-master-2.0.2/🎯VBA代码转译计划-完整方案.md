# 🎯 VBA代码转译计划 - 完整方案

## 📋 任务清单

### ✅ 已实现的工具（3个）
1. ✅ 风量计算 (Air_volume.frm) - 已完成
2. ✅ 护栏算料 (frmGuardrailCalculator.frm) - 已完成  
3. ✅ 楼梯算料 (frmStairCalculator.frm) - 已完成

### 🔥 待转译的工具（8个）

#### 优先级1 - 核心功能
4. 🚀 **皮带支架算料** (frmBeltSupport.frm + modBeltSupportCalculations.bas)
   - ✅ VBA代码已读取
   - 📝 输入参数：皮带角度、皮带宽度、最低高度、皮带长度、是否搭接、搭接距离、边缘数量
   - 📝 输出结果：支腿数量、横梁数量、斜撑数量、槽钢用量、角钢用量、重量、价格、功率

5. 🚀 **风机功率计算** (Pricetopower.bas)
   - ✅ VBA代码已读取
   - 📝 输入参数：皮带宽度、皮带长度、皮带角度
   - 📝 输出结果：皮带价格、皮带功率、功率说明

#### 优先级2 - 常用功能
6. ⏳ **旋风除尘选型** (Cyclone.frm)
7. ⏳ **钢平台用量计算** (PlatformCalculations.bas)
8. ⏳ **爬梯材料表** (frmLadderCalculator.frm)
9. ⏳ **筛分机算料** (frmRollingScreen.frm)

#### 优先级3 - 扩展功能
10. ⏳ **热源选型推荐** (StartHeatSource.frm)
11. ⏳ **线缆选型推荐** (frmCableCalculator.frm)

---

## 🔧 紧急修复（2个）

### 修复1：保存文件名问题 ⚠️

**当前问题：**
- 系统自动使用工作表名称或时间戳作为文件名
- 用户无法在保存前自定义文件名
- 历史记录显示的名称与用户期望不符

**解决方案：**
在保存Excel/PDF之前，添加文件名输入对话框：

```javascript
// 修改保存Excel流程
async function saveExcelWithName() {
    // 1. 弹出对话框让用户输入文件名
    const userFileName = await promptFileName('请输入文件名', '选型文件');
    
    // 2. 如果用户取消，则不保存
    if (!userFileName) return;
    
    // 3. 生成Excel
    const blob = await generateExcelBlob();
    
    // 4. 保存到历史记录（使用用户输入的名称）
    await saveExcelToHistory(blob, userFileName + '.xlsx', userFileName);
    
    // 5. 下载文件
    downloadFile(blob, userFileName + '.xlsx');
}

// 自定义文件名输入对话框
function promptFileName(message, defaultName) {
    return new Promise((resolve) => {
        // 创建模态对话框
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;">
                <div style="background:white;padding:30px;border-radius:12px;min-width:400px;">
                    <h3 style="margin:0 0 20px 0;font-size:18px;">${message}</h3>
                    <input type="text" id="fileNameInput" value="${defaultName}" 
                           style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;"/>
                    <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
                        <button id="cancelBtn" style="padding:10px 20px;background:#6b7280;color:white;border:none;border-radius:6px;cursor:pointer;">取消</button>
                        <button id="confirmBtn" style="padding:10px 20px;background:#00d4ff;color:white;border:none;border-radius:6px;cursor:pointer;">确定</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#fileNameInput');
        const confirmBtn = modal.querySelector('#confirmBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        
        // 自动选中默认文件名
        input.focus();
        input.select();
        
        confirmBtn.onclick = () => {
            const fileName = input.value.trim();
            modal.remove();
            resolve(fileName || defaultName);
        };
        
        cancelBtn.onclick = () => {
            modal.remove();
            resolve(null);
        };
        
        // 回车确认
        input.onkeypress = (e) => {
            if (e.key === 'Enter') confirmBtn.click();
        };
    });
}
```

**修改位置：**
- `dist-refactored/js/modules/legacy.js` (第10646行 saveExcelToHistory函数)
- `dist-refactored/js/modules/legacy.js` (第10695行 savePdfToHistory函数)

---

### 修复2：保存时间为北京时间 ⚠️

**当前问题：**
- 后端返回UTC时间（协调世界时）
- 中国是UTC+8时区
- 显示时间少8小时

**解决方案A：前端修复（临时）**
```javascript
// 在显示时间时添加8小时
function formatBeijingTime(utcTimeString) {
    const utcDate = new Date(utcTimeString);
    const beijingDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
    return beijingDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}
```

**解决方案B：后端修复（推荐）**
修改后端Django设置：

```python
# xuanxing/backend/cable_selector/settings.py
TIME_ZONE = 'Asia/Shanghai'  # 设置为上海时区（北京时间）
USE_TZ = True  # 继续使用时区感知

# 在serializers.py中格式化输出
def to_representation(self, instance):
    data = super().to_representation(instance)
    # 转换为北京时间
    if instance.created_at:
        beijing_time = instance.created_at.astimezone(pytz.timezone('Asia/Shanghai'))
        data['created_at'] = beijing_time.strftime('%Y-%m-%d %H:%M:%S')
    return data
```

**修改位置：**
- 前端：`dist-refactored/selection-history.html` (第383行)
- 后端：`xuanxing/backend/selections/serializers.py`

---

## 📝 VBA转JavaScript完整方案

### 皮带支架算料 - 完整转译

#### JavaScript数据结构
```javascript
// 输出结果结构
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
```

#### 主计算函数
```javascript
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
```

#### 皮带价格和功率计算
```javascript
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
    }
];

// 标准功率表
const STANDARD_POWERS = [0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110];

function getBeltPrice(beltWidth, length) {
    const spec = BELT_SPECS.find(s => s.width === beltWidth);
    if (!spec) return 0;
    
    if (length >= 10) {
        return spec.basePrice + (length - 10) * spec.pricePerMeter;
    } else {
        return spec.basePrice - (10 - length) * spec.discountPerMeter;
    }
}

function getBeltPower(beltWidth, length, beltAngle) {
    const spec = BELT_SPECS.find(s => s.width === beltWidth);
    if (!spec) return 0;
    
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

function getNextStandardPower(currentPower) {
    for (let power of STANDARD_POWERS) {
        if (power > currentPower) return power;
    }
    return STANDARD_POWERS[STANDARD_POWERS.length - 1];
}

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
```

---

## 📂 文件修改清单

### 需要创建的新文件
1. `dist-refactored/js/utils/fileNamePrompt.js` - 文件名输入对话框
2. `dist-refactored/js/calculators/beltSupport.js` - 皮带支架计算器

### 需要修改的现有文件
1. `dist-refactored/js/modules/legacy.js` (第10646-10680行) - 添加文件名输入
2. `dist-refactored/js/modules/legacy.js` (第10695-10730行) - 添加文件名输入
3. `dist-refactored/selection-history.html` (第383行) - 修复时间显示
4. `dist-refactored/tools/all-tools.html` - 添加皮带支架计算工具
5. `xuanxing/backend/selections/serializers.py` - 修复时区

---

## 🚀 实施步骤

### 第1步：修复时间和文件名（紧急）
1. 修改前端时间显示 ✅
2. 添加文件名输入对话框 ✅
3. 测试保存流程

### 第2步：转译皮带支架（优先级1）
1. 创建计算器JavaScript文件
2. 在all-tools.html中添加UI
3. 集成计算逻辑
4. 测试所有场景

### 第3步：转译其他工具（分批）
1. 旋风除尘选型
2. 钢平台用量计算
3. 爬梯材料表
4. 筛分机算料
5. 热源选型推荐
6. 线缆选型推荐

---

## 📝 注意事项

1. **完整性**：每个VBA函数的逻辑都必须转译，不能遗漏
2. **精度**：数值计算保持相同精度
3. **常量**：所有魔法数字都应定义为常量
4. **验证**：输入验证规则保持一致
5. **测试**：每个工具转译后都要测试所有边界情况

---

## 🧪 测试用例

### 皮带支架算料测试
| 测试场景 | 输入 | 期望输出 |
|----------|------|----------|
| 水平皮带 | 角度=0°, 宽度=800, 高度=0.5m, 长度=10m | 支腿数量=2, 末端高度=0.5m |
| 倾斜皮带 | 角度=15°, 宽度=1000, 高度=1m, 长度=20m | 支腿数量=4, 功率需增加 |
| 长距离 | 角度=0°, 宽度=650, 高度=0.5m, 长度=50m | 支腿数量=9, 间距在3-6m |
| 搭接模式 | 有搭接, 搭接距离=2m, 边缘数=2 | 边缘支腿数正确计算 |

---

**下一步：开始实施修复和转译工作！**

