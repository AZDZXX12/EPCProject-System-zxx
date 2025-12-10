// 🔍 CSS加载诊断脚本
// 在浏览器控制台(F12)中运行此脚本

console.log('=== 🔍 CSS诊断开始 ===\n');

// 1. 检查.panel-card样式
const panelCard = document.querySelector('.panel-card');
if (panelCard) {
  const styles = window.getComputedStyle(panelCard);
  console.log('✅ 找到.panel-card元素');
  console.log('\n📊 当前样式:');
  console.log('背景:', styles.background);
  console.log('阴影:', styles.boxShadow);
  console.log('过渡:', styles.transition);
  
  // 检查是否有新CSS
  if (styles.background.includes('linear-gradient')) {
    console.log('\n✅ 新CSS已加载！背景包含渐变');
  } else {
    console.log('\n❌ 旧CSS！背景没有渐变');
  }
  
  if (styles.boxShadow !== 'none' && styles.boxShadow.split(',').length > 2) {
    console.log('✅ 新CSS已加载！有多层阴影');
  } else {
    console.log('❌ 旧CSS！阴影层数不足');
  }
} else {
  console.log('❌ 未找到.panel-card元素');
}

// 2. 检查.kpi-value样式
const kpiValue = document.querySelector('.kpi-value');
if (kpiValue) {
  const styles = window.getComputedStyle(kpiValue);
  console.log('\n✅ 找到.kpi-value元素');
  console.log('颜色:', styles.color);
  console.log('字体大小:', styles.fontSize);
  console.log('文字阴影:', styles.textShadow);
  
  // 检查是否是青色
  if (styles.color === 'rgb(34, 211, 238)') {
    console.log('✅ 新CSS已加载！数值是青色');
  } else {
    console.log('❌ 旧CSS！数值不是青色，是:', styles.color);
  }
  
  if (parseInt(styles.fontSize) >= 20) {
    console.log('✅ 新CSS已加载！字体 >=20px');
  } else {
    console.log('❌ 旧CSS！字体太小:', styles.fontSize);
  }
} else {
  console.log('❌ 未找到.kpi-value元素');
}

// 3. 检查.pid-value-num样式
const pidValue = document.querySelector('.pid-value-num');
if (pidValue) {
  const styles = window.getComputedStyle(pidValue);
  console.log('\n✅ 找到.pid-value-num元素');
  console.log('字体大小:', styles.fontSize);
  console.log('文字阴影:', styles.textShadow);
  
  if (parseInt(styles.fontSize) >= 16) {
    console.log('✅ 新CSS已加载！DCS数值字体 >=16px');
  } else {
    console.log('❌ 旧CSS！DCS数值字体太小:', styles.fontSize);
  }
} else {
  console.log('❌ 未找到.pid-value-num元素');
}

// 4. 检查CSS文件加载
const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
console.log('\n📁 加载的CSS文件:');
cssLinks.forEach(link => {
  if (link.href.includes('DigitalTwin3D.css')) {
    console.log('✅ DigitalTwin3D.css:', link.href);
    console.log('   文件时间戳:', link.href.split('?')[1] || '无缓存参数');
  }
});

// 5. 建议
console.log('\n=== 💡 诊断建议 ===');
const hasGradient = panelCard && window.getComputedStyle(panelCard).background.includes('linear-gradient');
const hasLargeFont = pidValue && parseInt(window.getComputedStyle(pidValue).fontSize) >= 16;

if (hasGradient && hasLargeFont) {
  console.log('✅ CSS已正确加载，如果界面没变化，请尝试:');
  console.log('1. 完全关闭浏览器重新打开');
  console.log('2. 检查是否有其他CSS覆盖');
} else {
  console.log('❌ CSS未正确加载，请执行:');
  console.log('1. 按 Ctrl+Shift+Delete 清除缓存');
  console.log('2. 在Network标签勾选"Disable cache"');
  console.log('3. 按 Ctrl+F5 强制刷新');
  console.log('4. 如果还不行，重启开发服务器');
}

console.log('\n=== 🔍 CSS诊断结束 ===');
