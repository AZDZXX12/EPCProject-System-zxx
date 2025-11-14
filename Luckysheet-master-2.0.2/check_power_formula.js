// 验证功率计算公式

// Excel截图数据（第3行）
const Q_excel = 189955; // m³/h
const P_excel = 6321;   // Pa
const eta_excel = 81;   // %

// 方法1：当前代码的公式
const method1 = (Q_excel * P_excel) / (3600 * (eta_excel/100) * 1000);
console.log('方法1（当前代码）:', method1.toFixed(2), 'kW');

// 方法2：先转换流量为m³/s
const Q_m3s = Q_excel / 3600;
const method2 = (Q_m3s * P_excel) / ((eta_excel/100) * 1000);
console.log('方法2（先转换）:', method2.toFixed(2), 'kW');

// 方法3：完整的功率公式 P=QΔp/η
// Q单位m³/s，Δp单位Pa，η无量纲，结果单位W，除以1000得kW
const method3 = (Q_excel/3600) * P_excel / (eta_excel/100) / 1000;
console.log('方法3（标准公式）:', method3.toFixed(2), 'kW');

// Excel期望值
const excel_expected = 411.77;
console.log('\nExcel期望值:', excel_expected, 'kW');
console.log('误差1:', Math.abs(method1 - excel_expected).toFixed(2), 'kW');
console.log('误差2:', Math.abs(method2 - excel_expected).toFixed(2), 'kW');
console.log('误差3:', Math.abs(method3 - excel_expected).toFixed(2), 'kW');

// 验证电机功率（温度60℃，安全系数1.15）
const motor1 = method1 / 0.98 * 1.15;
const motor2 = method2 / 0.98 * 1.15;
const motor3 = method3 / 0.98 * 1.15;
const excel_motor = 483.20;

console.log('\n电机功率验证：');
console.log('方法1电机功率:', motor1.toFixed(2), 'kW (Excel期望', excel_motor, 'kW)');
console.log('方法2电机功率:', motor2.toFixed(2), 'kW');
console.log('方法3电机功率:', motor3.toFixed(2), 'kW');


