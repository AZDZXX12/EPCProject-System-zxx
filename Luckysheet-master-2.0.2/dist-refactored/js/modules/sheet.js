/**
 * 表格操作模块
 * 
 * 处理表格的增删改查操作
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 表格操作模块...');
    
    /**
     * 刷新序号
     * @param {number} dataStartRow - 数据起始行
     * @param {number} footerStartRow - 表尾起始行
     */
    window.refreshSerialNumbers = function(dataStartRow = 5, footerStartRow = window.currentFooterStartRow || 19) {
        console.log(`🔢 刷新序号 - 数据起始行: ${dataStartRow}, 表尾起始行: ${footerStartRow}`);
        
        try {
            window.isRefreshingSerialNumbers = true;
            
            const sheetData = luckysheet.getSheetData();
            if (!sheetData || sheetData.length === 0) {
                console.warn('⚠️ 无法获取工作表数据');
                return;
            }
            
            // 数据区序号（从1开始）
            let serial = 1;
            for (let r = dataStartRow; r < footerStartRow; r++) {
                luckysheet.setCellValue(r, 0, serial);
                serial++;
            }
            
            // 表尾前4行继续编号（安装费、钢材用量、电器材料、电线电缆）
            for (let i = 0; i < 4; i++) {
                const r = footerStartRow + i;
                luckysheet.setCellValue(r, 0, serial);
                serial++;
            }
            
            // 合计行A列显示"合计"
            luckysheet.setCellValue(footerStartRow + 4, 0, '合计');
            
            luckysheet.refresh();
            console.log(`✅ 序号已更新 - 数据区: ${dataStartRow}-${footerStartRow-1}行（共${footerStartRow-dataStartRow}个序号），表尾: ${footerStartRow}-${footerStartRow+4}行（留空）`);
            
        } finally {
            window.isRefreshingSerialNumbers = false;
        }
    };
    
    /**
     * 添加设备到表格
     * @param {Object} deviceData - 设备数据
     * TODO: 从原文件复制完整实现
     */
    window.addDeviceToSheet = function(deviceData) {
        console.log('➕ 添加设备到表格:', deviceData);
        
        // 确保版本正确
        if (typeof window.ensureCorrectVersion === 'function') {
            try {
                window.ensureCorrectVersion();
            } catch (error) {
                console.error('❌ ensureCorrectVersion 调用失败:', error);
            }
        }
        
        // TODO: 实现添加设备逻辑
    };
    
    /**
     * 更新设备列表
     * TODO: 从原文件复制完整实现
     */
    window.updateDeviceList = function() {
        console.log('🔄 更新设备列表');
        // TODO: 实现更新设备列表逻辑
    };
    
    /**
     * 创建新工作表
     * TODO: 从原文件复制完整实现
     */
    window.createNewSheet = function() {
        console.log('📄 创建新工作表');
        // TODO: 实现创建新工作表逻辑
    };
    
    console.log('✅ 表格操作模块已加载');
})();

