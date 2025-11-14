// 测试真实案例的功率计算

console.log('='.repeat(80));
console.log('案例1：默认参数（流量16000，全压4500）');
console.log('='.repeat(80));

// 假设推荐到某个型号，使用其系数
const Q_input = 16000;  // m³/h
const P_input = 4500;   // Pa
const T = 60;           // ℃

// 假设推荐的系数（示例）
const phi = 0.15;       // 流量系数
const psi = 0.45;       // 压力系数
const eta = 0.80;       // 效率 80%

const D = 2.2;          // m
const n = 960;          // r/min
const rho = 1.056;      // kg/m³

// 计算
const u = Math.PI * D * n / 60;
const Q_calc = phi * Math.PI / 4 * Math.pow(D, 2) * u * 3600;
const P_calc = psi * rho * Math.pow(u, 2);

console.log('\n计算参数：');
console.log('  线速度 u =', u.toFixed(2), 'm/s');
console.log('  计算流量 Q_calc =', Q_calc.toFixed(0), 'm³/h');
console.log('  计算压力 P_calc =', P_calc.toFixed(0), 'Pa');

// 轴功率
const shaftPower = (Q_calc * P_calc) / (3600 * eta * 1000);
console.log('\n轴功率计算：');
console.log('  公式：P_shaft = Q × P / (3600 × η × 1000)');
console.log('  P_shaft = ', Q_calc.toFixed(0), '×', P_calc.toFixed(0), '/ (3600 ×', eta, '× 1000)');
console.log('  P_shaft =', shaftPower.toFixed(2), 'kW');

// 电机功率
const motorPower = shaftPower / 0.98 * 1.15;
console.log('\n电机功率计算：');
console.log('  公式：P_motor = P_shaft / η_trans × K_safe');
console.log('  P_motor = ', shaftPower.toFixed(2), '/ 0.98 × 1.15');
console.log('  P_motor =', motorPower.toFixed(2), 'kW');

console.log('\n' + '='.repeat(80));
console.log('案例2：使用目标Q、P直接估算（粗略）');
console.log('='.repeat(80));

const rough_shaft = (Q_input * P_input) / (3600 * 0.8 * 1000);
const rough_motor = rough_shaft / 0.98 * 1.15;

console.log('  轴功率（粗略）=', rough_shaft.toFixed(2), 'kW');
console.log('  电机功率（粗略）=', rough_motor.toFixed(2), 'kW');

console.log('\n💡 功率是否合理？');
console.log('  - 风量16000 m³/h = 16000/3600 = 4.44 m³/s');
console.log('  - 压力4500 Pa = 4.5 kPa（相当于约0.459米水柱）');
console.log('  - 理论功率 = 4.44 m³/s × 4500 Pa / 0.8 / 1000 = 25 kW（轴）');
console.log('  - 考虑传动和安全系数 = 25 / 0.98 × 1.15 = 29.3 kW（电机）');
console.log('\n  ✅ 如果推荐型号的Q_calc和P_calc远大于输入值，功率会相应放大！');


