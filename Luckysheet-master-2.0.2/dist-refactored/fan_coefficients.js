// 离心风机系数数据库
// 提取自: 电机电力电气计算表（11月）.xlsx - [2]数据库工作表
// 共 0 种风机型号

const FAN_COEFFICIENTS_DB = [];

// 根据风机型号查找系数
function getFanCoefficient(fanModel, columnIndex) {
    const fan = FAN_COEFFICIENTS_DB.find(f => f['风机型号'] === fanModel);
    if (!fan) return null;
    
    // 返回指定列的数据
    const keys = Object.keys(fan);
    return fan[keys[columnIndex]] || null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FAN_COEFFICIENTS_DB, getFanCoefficient };
}
