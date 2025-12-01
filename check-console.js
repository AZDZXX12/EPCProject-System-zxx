/**
 * 检查项目中的console调用
 * 用于识别需要清理的console.log/warn/error等调用
 */

const fs = require('fs');
const path = require('path');

// 排除的目录
const EXCLUDE_DIRS = ['node_modules', 'build', 'dist', '.git'];

// 排除的文件（这些文件中的console是合法的）
const EXCLUDE_FILES = [
  'logger.ts',
  'EnhancedLogger.ts',
  'setupTests.ts',
  'check-console.js'
];

// console方法统计
const consoleStats = {
  log: 0,
  warn: 0,
  error: 0,
  debug: 0,
  info: 0,
  table: 0,
  other: 0
};

// 文件统计
const fileStats = [];

/**
 * 检查单个文件
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // 跳过排除的文件
  if (EXCLUDE_FILES.includes(fileName)) {
    return;
  }
  
  // 匹配console调用
  const consoleRegex = /console\.(log|warn|error|debug|info|table|[a-z]+)/g;
  const matches = content.match(consoleRegex);
  
  if (matches && matches.length > 0) {
    const fileStat = {
      path: filePath,
      count: matches.length,
      methods: {}
    };
    
    matches.forEach(match => {
      const method = match.replace('console.', '');
      fileStat.methods[method] = (fileStat.methods[method] || 0) + 1;
      
      if (consoleStats[method] !== undefined) {
        consoleStats[method]++;
      } else {
        consoleStats.other++;
      }
    });
    
    fileStats.push(fileStat);
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        scanDirectory(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      checkFile(fullPath);
    }
  });
}

/**
 * 打印结果
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Console调用检查报告');
  console.log('='.repeat(80) + '\n');
  
  // 总体统计
  const totalCount = Object.values(consoleStats).reduce((a, b) => a + b, 0);
  console.log('📊 总体统计:');
  console.log(`   总计: ${totalCount}处console调用`);
  console.log(`   文件数: ${fileStats.length}个文件\n`);
  
  // 方法统计
  console.log('📈 方法分布:');
  Object.entries(consoleStats).forEach(([method, count]) => {
    if (count > 0) {
      console.log(`   console.${method}: ${count}处`);
    }
  });
  console.log('');
  
  // 文件排序（按数量降序）
  fileStats.sort((a, b) => b.count - a.count);
  
  // 前10个文件
  console.log('🔝 Top 10 文件:');
  fileStats.slice(0, 10).forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file.path);
    console.log(`   ${index + 1}. ${relativePath}`);
    console.log(`      数量: ${file.count}处`);
    console.log(`      方法: ${Object.entries(file.methods).map(([m, c]) => `${m}(${c})`).join(', ')}`);
  });
  console.log('');
  
  // 优先级建议
  console.log('🎯 修复建议:');
  console.log('   P0 - 立即修复（用户可见）:');
  const p0Files = fileStats.filter(f => 
    f.path.includes('/pages/') || 
    f.path.includes('/components/') && !f.path.includes('/utils/')
  ).slice(0, 5);
  p0Files.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file.path);
    console.log(`      ${index + 1}. ${relativePath} (${file.count}处)`);
  });
  
  console.log('\n   P1 - 高优先级（服务类）:');
  const p1Files = fileStats.filter(f => 
    f.path.includes('/services/') || 
    f.path.includes('/contexts/')
  ).slice(0, 5);
  p1Files.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file.path);
    console.log(`      ${index + 1}. ${relativePath} (${file.count}处)`);
  });
  
  console.log('\n   P2 - 中优先级（工具类）:');
  const p2Files = fileStats.filter(f => 
    f.path.includes('/utils/') || 
    f.path.includes('/store/')
  ).slice(0, 5);
  p2Files.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file.path);
    console.log(`      ${index + 1}. ${relativePath} (${file.count}处)`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 建议: 使用logger替换console调用');
  console.log('   import { logger } from \'./utils/logger\';');
  console.log('   console.log() → logger.info()');
  console.log('   console.warn() → logger.warn()');
  console.log('   console.error() → logger.error()');
  console.log('='.repeat(80) + '\n');
}

// 执行扫描
const srcDir = path.join(__dirname, 'client', 'src');
if (fs.existsSync(srcDir)) {
  console.log(`📁 扫描目录: ${srcDir}\n`);
  scanDirectory(srcDir);
  printResults();
} else {
  console.error('❌ 错误: 找不到src目录');
  process.exit(1);
}
