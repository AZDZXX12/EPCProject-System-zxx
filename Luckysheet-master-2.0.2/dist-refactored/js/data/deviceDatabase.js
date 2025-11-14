/**
 * 设备数据库模块
 * 
 * 管理设备数据的存储和初始化
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 设备数据库模块...');
    
    // 初始化设备数据库（动态加载）
    window.deviceDatabase = {};
    window.currentDeviceList = [];
    
    // 从localStorage恢复数据库（如果有）
    try {
        const cached = localStorage.getItem('deviceDatabaseBase64');
        if (cached) {
            const decoded = atob(cached);
            window.deviceDatabase = JSON.parse(decoded);
            console.log('✅ 数据库已从缓存恢复');
        }
    } catch (error) {
        console.warn('⚠️ 恢复数据库失败:', error);
    }
    
    console.log('✅ 设备数据库模块已加载');
})();

