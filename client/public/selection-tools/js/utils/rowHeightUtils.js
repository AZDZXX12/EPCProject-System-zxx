/**
 * 行高计算工具
 * 
 * 根据文本内容计算合适的行高
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 行高计算工具模块...');
    
    /**
     * 根据文本内容计算行高
     * @param {string} text - 文本内容
     * @returns {number} 计算出的行高（像素）
     */
    window.computeRowHeightFromText = function(text) {
        if (!text) return 25;
        const lines = text.split('\n').length;
        const baseHeight = 25;
        const lineHeight = 20;
        return Math.max(baseHeight, lines * lineHeight);
    };
    
    /**
     * 调整行高范围
     * @param {number} startRow - 开始行
     * @param {number} endRow - 结束行
     */
    window.adjustRowHeights = function(startRow, endRow) {
        console.log(`📏 调整行高: 第${startRow}行到第${endRow}行`);
        
        const currentSheet = luckysheet.getSheet();
        if (!currentSheet || !currentSheet.celldata) {
            console.warn('⚠️ 无法获取当前工作表数据');
            return;
        }
        
        for (let r = startRow; r <= endRow; r++) {
            const rowCells = currentSheet.celldata.filter(cell => cell.r === r);
            let maxHeight = 25; // 最小高度
            
            rowCells.forEach(cell => {
                if (cell.v && cell.v.v) {
                    const text = String(cell.v.v);
                    const height = window.computeRowHeightFromText(text);
                    maxHeight = Math.max(maxHeight, height);
                }
            });
            
            // 设置行高（最大150px）
            luckysheet.setRowHeight({ row: r, height: Math.min(maxHeight, 150) });
        }
        
        console.log(`✅ 行高调整完成`);
    };
    
    console.log('✅ 行高计算工具模块已加载');
})();

