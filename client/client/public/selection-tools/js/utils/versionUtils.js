/**
 * 版本检测工具
 * 
 * 用于检测和管理Excel文件版本（简化版/完整版）
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 版本检测工具模块...');
    
    /**
     * 检测Excel版本（简化版/完整版）
     * @param {Array} celldata - Luckysheet celldata 数组
     * @returns {Object} 版本信息对象
     */
    window.detectExcelVersion = function(celldata) {
        console.log('🔍 开始识别Excel文件版本...');
        
        let hasDeviceNumber = false;  // 是否有"设备位号"列
        let maxColumn = 0;  // 最大列数
        
        // 检查第4行的单元格内容
        const row3Cells = celldata.filter(cell => cell.r === 3);  // 第4行（索引3）
        const row4Cells = celldata.filter(cell => cell.r === 4);  // 第5行（索引4）
        
        // 合并两行的数据来检查
        const headerCells = [...row3Cells, ...row4Cells];
        
        headerCells.forEach(cell => {
            const valueOriginal = cell.v && cell.v.v ? String(cell.v.v).trim() : '';
            const value = valueOriginal.replace(/\s+/g, ''); // 去除所有空格
            const col = cell.c;
            
            // 更新最大列数
            if (col > maxColumn) maxColumn = col;
            
            // 检查B列（索引1）是否包含"设备位号"（去除空格后检查）
            if (col === 1 && (value.includes('设备位号') || value.includes('位号'))) {
                hasDeviceNumber = true;
                console.log(`  ✅ 检测到"位号"关键字: "${valueOriginal}" → "${value}"`);
            }
            
            console.log(`  📋 第${cell.r+1}行${String.fromCharCode(65+col)}列: "${valueOriginal}"`);
        });
        
        // 判断版本
        const isSimplified = !hasDeviceNumber;
        const version = isSimplified ? '简化版' : '完整版';
        const expectedColumns = isSimplified ? 14 : 16;
        
        console.log(`✅ 识别结果: ${version}`);
        console.log(`  - 是否有设备位号列: ${hasDeviceNumber ? '是' : '否'}`);
        console.log(`  - 最大列数: ${maxColumn + 1}`);
        console.log(`  - 预期列数: ${expectedColumns}`);
        
        return {
            isSimplified: isSimplified,
            version: version,
            expectedColumns: expectedColumns,
            detectedColumns: maxColumn + 1
        };
    };
    
    /**
     * 确保版本信息正确
     * 检查并更新全局版本变量
     */
    window.ensureCorrectVersion = function() {
        const currentSheet = luckysheet.getSheet();
        console.log(`[ensureCorrectVersion] currentSheet:`, currentSheet);
        if (currentSheet && currentSheet.name) {
            const sheetIsSimplified = currentSheet.name.includes('简化版');
            const globalIsSimplified = window.currentSheetVersion ? window.currentSheetVersion.isSimplified : null;
            console.log(`[ensureCorrectVersion] sheetIsSimplified=${sheetIsSimplified}, globalIsSimplified=${globalIsSimplified}`);
            console.log(`[ensureCorrectVersion] 比较结果: ${globalIsSimplified} !== ${sheetIsSimplified} = ${globalIsSimplified !== sheetIsSimplified}`);

            if (globalIsSimplified !== sheetIsSimplified) {
                window.currentSheetVersion = {
                    isSimplified: sheetIsSimplified,
                    version: sheetIsSimplified ? '简化版' : '完整版',
                    expectedColumns: sheetIsSimplified ? 14 : 16
                };
                console.log(`✅ 版本信息已更新: ${window.currentSheetVersion.version} (工作表: ${currentSheet.name})`);
                return true; // 表示版本已更新
            } else {
                console.log(`[ensureCorrectVersion] 版本信息一致，无需更新`);
            }
        } else {
            console.warn(`[ensureCorrectVersion] 无法获取currentSheet`);
        }
        return false; // 表示版本未变化
    };
    
    console.log('✅ 版本检测工具模块已加载');
})();

