// 最终公式验证 - 根据网上标准资料

console.log('='.repeat(80));
console.log('标准公式验证（根据网上资料）');
console.log('='.repeat(80));

// 标准公式（网上资料）：P_shaft (kW) = Q × P / (3600 × η)
// 不需要除以1000！

// 测试案例1：标准示例
const Q1 = 50000;      // m³/h
const P1 = 3000;       // Pa
const eta1 = 0.82;

const P_shaft_web = (Q1 * P1) / (3600 * eta1);
console.log('\n案例1：Q=50000 m³/h, P=3000 Pa, η=0.82');
console.log('网上公式：P = Q × P / (3600 × η) =', P_shaft_web.toFixed(2), 'kW');
console.log('期望：50.81 kW');

// 测试案例2：Excel数据
const Q2 = 189955;
const P2 = 6321;
const eta2 = 0.81;

const P_shaft_excel = (Q2 * P2) / (3600 * eta2);
console.log('\n案例2：Q=189955 m³/h, P=6321 Pa, η=0.81');
console.log('网上公式：P = Q × P / (3600 × η) =', P_shaft_excel.toFixed(2), 'kW');
console.log('Excel期望：411.77 kW');

console.log('\n' + '='.repeat(80));
console.log('❌ 等等，结果还是太大了1000倍！');
console.log('='.repeat(80));

// 单位分析
console.log('\n🔬 单位详细分析：');
console.log('Q 单位：m³/h');
console.log('P 单位：Pa = N/m² = J/m³ (能量密度)');
console.log('');
console.log('Q × P 的单位：');
console.log('  = (m³/h) × (J/m³)');
console.log('  = J/h');
console.log('  = W·s/h');
console.log('  = W·s / (3600 s)');
console.log('  = W / 3600');
console.log('');
console.log('所以：Q × P / 3600 的单位是 W （瓦特）');
console.log('要转换为 kW，必须除以 1000！');
console.log('');
console.log('✅ 正确公式应该是：P(kW) = Q × P / (3600 × η × 1000)');

// 用正确公式重新计算
const P_correct_1 = (Q1 * P1) / (3600 * eta1 * 1000);
const P_correct_2 = (Q2 * P2) / (3600 * eta2 * 1000);

console.log('\n' + '='.repeat(80));
console.log('✅ 用正确公式重新计算：');
console.log('='.repeat(80));
console.log('案例1：', P_correct_1.toFixed(2), 'kW （期望 50.81）');
console.log('案例2：', P_correct_2.toFixed(2), 'kW （期望 411.77）');

console.log('\n' + '='.repeat(80));
console.log('🎯 结论：');
console.log('='.repeat(80));
console.log('1. 网上公式写的是 P = Q×P/(3600×η)，但单位是 W，不是 kW');
console.log('2. 要得到 kW，必须再除以 1000');
console.log('3. 完整公式：P(kW) = Q(m³/h) × P(Pa) / (3600 × η × 1000)');
console.log('4. 当前代码的公式是正确的！');


