/**
 * EPC项目管理系统 - 一键修复脚本
 * 
 * 使用方法:
 * 1. 打开浏览器 http://localhost:3001
 * 2. 按 F12 打开控制台
 * 3. 粘贴此文件全部内容到控制台
 * 4. 按回车执行
 */

(function() {
    console.log('%c🔧 EPC项目管理系统 - 一键修复工具', 'color: #1890ff; font-size: 20px; font-weight: bold;');
    console.log('');
    
    // ==================== 步骤1: 清理旧数据 ====================
    console.log('%c📋 步骤1: 清理旧数据', 'color: #52c41a; font-size: 16px; font-weight: bold;');
    
    const keysToRemove = [];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
        // 清理旧项目数据（时间戳ID）
        if (key.match(/PROJ-\d{13}/)) {
            keysToRemove.push(key);
        }
        // 清理甘特图任务
        if (key.includes('gantt_tasks_PROJ-') && key.match(/\d{13}/)) {
            keysToRemove.push(key);
        }
        // 清理施工日志
        if (key.includes('construction_logs_PROJ-') && key.match(/\d{13}/)) {
            keysToRemove.push(key);
        }
        // 清理施工阶段
        if (key.includes('construction_phase_PROJ-') && key.match(/\d{13}/)) {
            keysToRemove.push(key);
        }
    });
    
    // 清理projects_cache中的旧项目
    const projectsCache = localStorage.getItem('projects_cache');
    if (projectsCache) {
        try {
            const projects = JSON.parse(projectsCache);
            const oldProjects = projects.filter(p => p.id.match(/PROJ-\d{13}/));
            const newProjects = projects.filter(p => !p.id.match(/PROJ-\d{13}/));
            
            if (oldProjects.length > 0) {
                console.log(`  ⚠️ 发现 ${oldProjects.length} 个旧项目:`);
                oldProjects.forEach(p => console.log(`     - ${p.id}: ${p.name}`));
                
                localStorage.setItem('projects_cache', JSON.stringify(newProjects));
                console.log(`  ✅ 已清理旧项目，保留 ${newProjects.length} 个新项目`);
            } else {
                console.log('  ℹ️ 未发现旧项目');
            }
        } catch (e) {
            console.error('  ❌ 解析projects_cache失败:', e);
        }
    }
    
    // 执行清理
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
        console.log(`  ✅ 已清理 ${keysToRemove.length} 项旧数据`);
    } else {
        console.log('  ℹ️ 未发现需要清理的旧数据');
    }
    console.log('');
    
    // ==================== 步骤2: 检查当前状态 ====================
    console.log('%c📊 步骤2: 检查当前状态', 'color: #1890ff; font-size: 16px; font-weight: bold;');
    
    const remainingProjects = localStorage.getItem('projects_cache');
    if (remainingProjects) {
        try {
            const projects = JSON.parse(remainingProjects);
            console.log(`  📁 当前项目数量: ${projects.length}`);
            projects.forEach(p => {
                console.log(`     - ${p.id}: ${p.name} (进度: ${p.progress || 0}%)`);
            });
        } catch (e) {
            console.log('  ℹ️ 无法解析项目数据');
        }
    } else {
        console.log('  ℹ️ 当前无项目数据');
    }
    console.log('');
    
    // ==================== 步骤3: 修复建议 ====================
    console.log('%c💡 步骤3: 修复建议', 'color: #faad14; font-size: 16px; font-weight: bold;');
    console.log('');
    console.log('  1️⃣ 如果还有旧项目，请执行完全清理:');
    console.log('     localStorage.clear(); location.reload();');
    console.log('');
    console.log('  2️⃣ 创建新项目:');
    console.log('     - 进入"工作台"页面');
    console.log('     - 点击"新建项目"');
    console.log('     - 填写项目信息');
    console.log('     - 保存（新项目ID格式: PROJ-001）');
    console.log('');
    console.log('  3️⃣ 测试甘特图:');
    console.log('     - 选择新项目');
    console.log('     - 打开"甘特图"');
    console.log('     - 添加任务');
    console.log('     - 双击任务（应正常打开）');
    console.log('');
    console.log('  4️⃣ 测试施工日志:');
    console.log('     - 打开"施工日志"');
    console.log('     - 点击"添加施工日志"');
    console.log('     - 填写所有必填字段');
    console.log('     - 保存');
    console.log('');
    
    // ==================== 步骤4: 自动刷新 ====================
    console.log('%c🔄 步骤4: 准备刷新页面', 'color: #722ed1; font-size: 16px; font-weight: bold;');
    console.log('');
    console.log('  ⏰ 5秒后自动刷新页面...');
    console.log('');
    console.log('%c✅ 修复完成！', 'color: #52c41a; font-size: 20px; font-weight: bold;');
    
    // 5秒后自动刷新
    let countdown = 5;
    const timer = setInterval(() => {
        console.log(`  ${countdown}...`);
        countdown--;
        if (countdown === 0) {
            clearInterval(timer);
            console.log('  🔄 正在刷新...');
            location.reload();
        }
    }, 1000);
    
})();



