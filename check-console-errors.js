#!/usr/bin/env node

/**
 * 检查浏览器控制台错误
 * 使用Puppeteer连接到运行中的Chrome实例
 */

const puppeteer = require('puppeteer');

async function checkConsoleErrors() {
  console.log('\n========================================');
  console.log('  🔍 浏览器控制台错误检查');
  console.log('========================================\n');

  let browser;
  try {
    console.log('正在启动浏览器...');
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // 收集控制台消息
    const consoleMessages = [];
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        errors.push(text);
      } else if (type === 'warning') {
        warnings.push(text);
      }
    });

    // 收集页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // 收集请求失败
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure().errorText
      });
    });

    console.log('正在访问应用: http://localhost:3001');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待页面加载
    await page.waitForTimeout(3000);

    console.log('\n========================================');
    console.log('  📊 检查结果');
    console.log('========================================\n');

    // 输出错误
    if (errors.length > 0) {
      console.log(`❌ 发现 ${errors.length} 个控制台错误:\n`);
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      console.log('');
    } else {
      console.log('✅ 没有控制台错误\n');
    }

    // 输出警告
    if (warnings.length > 0) {
      console.log(`⚠️  发现 ${warnings.length} 个控制台警告:\n`);
      warnings.slice(0, 10).forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.substring(0, 150)}...`);
      });
      if (warnings.length > 10) {
        console.log(`... 还有 ${warnings.length - 10} 个警告\n`);
      }
      console.log('');
    } else {
      console.log('✅ 没有控制台警告\n');
    }

    // 输出页面错误
    if (pageErrors.length > 0) {
      console.log(`❌ 发现 ${pageErrors.length} 个页面错误:\n`);
      pageErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      console.log('');
    } else {
      console.log('✅ 没有页面错误\n');
    }

    // 输出请求失败
    if (failedRequests.length > 0) {
      console.log(`❌ 发现 ${failedRequests.length} 个请求失败:\n`);
      failedRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.url}`);
        console.log(`   错误: ${req.failure}\n`);
      });
    } else {
      console.log('✅ 所有请求成功\n');
    }

    // 性能指标
    const metrics = await page.metrics();
    console.log('========================================');
    console.log('  ⚡ 性能指标');
    console.log('========================================\n');
    console.log(`DOM节点数: ${metrics.Nodes}`);
    console.log(`JS堆大小: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`布局次数: ${metrics.LayoutCount}`);
    console.log(`样式重算次数: ${metrics.RecalcStyleCount}\n`);

    // 检查特定元素
    console.log('========================================');
    console.log('  🔍 关键元素检查');
    console.log('========================================\n');

    const hasAIButton = await page.$('.ai-assistant-float-btn');
    console.log(`AI助手按钮: ${hasAIButton ? '✅ 存在' : '❌ 不存在'}`);

    const hasHeader = await page.$('header');
    console.log(`页面头部: ${hasHeader ? '✅ 存在' : '❌ 不存在'}`);

    const hasSider = await page.$('.ant-layout-sider');
    console.log(`侧边栏: ${hasSider ? '✅ 存在' : '❌ 不存在'}`);

    // 生成优化建议
    console.log('\n========================================');
    console.log('  💡 优化建议');
    console.log('========================================\n');

    const suggestions = [];
    
    if (errors.length > 0) {
      suggestions.push('🔴 高优先级: 修复控制台错误');
    }
    
    if (warnings.length > 10) {
      suggestions.push('🟡 中优先级: 减少控制台警告');
    }
    
    if (failedRequests.length > 0) {
      suggestions.push('🔴 高优先级: 修复失败的网络请求');
    }
    
    if (metrics.JSHeapUsedSize > 50 * 1024 * 1024) {
      suggestions.push('🟡 中优先级: 优化内存使用（当前超过50MB）');
    }
    
    if (metrics.LayoutCount > 100) {
      suggestions.push('🟡 中优先级: 减少布局重排次数');
    }

    if (suggestions.length > 0) {
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
    } else {
      console.log('✅ 暂无优化建议，应用运行良好！');
    }

    console.log('\n========================================\n');

    // 保存详细报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: errors.length,
        warnings: warnings.length,
        pageErrors: pageErrors.length,
        failedRequests: failedRequests.length
      },
      errors,
      warnings: warnings.slice(0, 20),
      pageErrors,
      failedRequests,
      metrics,
      suggestions
    };

    const fs = require('fs');
    fs.writeFileSync(
      'console-errors-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('📄 详细报告已保存到: console-errors-report.json\n');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 前端服务器未运行 (http://localhost:3001)');
    console.error('2. Puppeteer未安装 (运行: npm install puppeteer)');
    console.error('3. Chrome浏览器未安装\n');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkConsoleErrors().catch(console.error);
