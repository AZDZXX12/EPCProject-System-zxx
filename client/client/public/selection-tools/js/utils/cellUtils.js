/**
 * 单元格工具函数
 * 
 * 提供统一的单元格文本提取功能
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 单元格工具模块...');
    
    /**
     * 统一提取Luckysheet单元格的显示文本
     * 避免 [object Object] 的问题
     */
    window.getCellText = function(cellData) {
        if (cellData === undefined || cellData === null) return '';
        
        // 如果是字符串或数字，直接返回
        if (typeof cellData === 'string' || typeof cellData === 'number') {
            return String(cellData).trim();
        }
        
        // 如果是对象，递归提取值
        if (typeof cellData === 'object') {
            // 优先使用显示文本 m
            if ('m' in cellData && cellData.m !== null && cellData.m !== undefined && cellData.m !== '') {
                const mVal = cellData.m;
                if (typeof mVal === 'object') {
                    return window.getCellText(mVal);
                }
                return String(mVal).trim();
            }
            
            // 其次使用原始值 v
            if ('v' in cellData && cellData.v !== null && cellData.v !== undefined && cellData.v !== '') {
                const vVal = cellData.v;
                if (typeof vVal === 'object') {
                    return window.getCellText(vVal);
                }
                return String(vVal).trim();
            }
            
            // 检查是否有text属性（编辑后可能出现）
            if ('text' in cellData && cellData.text !== null && cellData.text !== undefined && cellData.text !== '') {
                return String(cellData.text).trim();
            }
            
            // 检查 ct (cell type) 中的富文本格式 inlineStr
            if ('ct' in cellData && cellData.ct) {
                // Excel富文本格式：ct.s 是数组，每个元素的 v 是文本片段
                if ('s' in cellData.ct && Array.isArray(cellData.ct.s) && cellData.ct.s.length > 0) {
                    const texts = cellData.ct.s
                        .filter(item => item && item.v)
                        .map(item => String(item.v));
                    if (texts.length > 0) {
                        return texts.join('').trim();
                    }
                }
                
                // 普通格式：ct.v
                if ('v' in cellData.ct && cellData.ct.v !== null && cellData.ct.v !== undefined && cellData.ct.v !== '') {
                    return String(cellData.ct.v).trim();
                }
            }
            
            // 检查是否只有样式属性，没有实际值（空单元格）
            const keys = Object.keys(cellData);
            const styleKeys = ['ct', 'ff', 'fs', 'ht', 'vt', 'bl', 'fc', 'bg', 'it', 'cl', 'un', 'tb'];
            const hasOnlyStyleKeys = keys.every(key => styleKeys.includes(key));
            if (hasOnlyStyleKeys) {
                return ''; // 空单元格
            }
            
            return '';
        }
        
        return String(cellData).trim();
    };
    
    console.log('✅ 单元格工具模块已加载');
})();


