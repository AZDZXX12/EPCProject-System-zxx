/**
 * 对齐工具模块
 * 
 * 用于处理表格单元格的对齐样式
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 对齐工具模块...');
    
    /**
     * 设置DOM监听器，实时监控并应用居中样式
     */
    window.setupAlignmentObserver = function() {
        if (window.alignmentObserver) {
            window.alignmentObserver.disconnect();
        }
        
        const targetNode = document.getElementById('luckysheet');
        if (!targetNode) {
            console.warn('⚠️ 未找到luckysheet容器');
            return;
        }
        
        const config = { childList: true, subtree: true, attributes: true };
        
        window.alignmentObserver = new MutationObserver(function(mutationsList) {
            let shouldAlign = false;
            
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE && 
                            (node.classList.contains('luckysheet-cell') || 
                             node.querySelector && node.querySelector('[class*="luckysheet-cell"]'))) {
                            shouldAlign = true;
                            break;
                        }
                    }
                }
            }
            
            if (shouldAlign) {
                console.log('🔄 检测到DOM变化，应用居中对齐');
                setTimeout(() => {
                    applyImmediateAlignment();
                }, 100);
            }
        });
        
        window.alignmentObserver.observe(targetNode, config);
        console.log('✅ DOM监听器已启动');
    };
    
    /**
     * 立即应用居中对齐
     */
    function applyImmediateAlignment() {
        const headerFooterRows = [0, 1, 2, 3, 4, 15, 16, 17, 18, 19];
        
        const cellElements = document.querySelectorAll('#luckysheet [data-row]');
        
        cellElements.forEach(cell => {
            const row = parseInt(cell.getAttribute('data-row'));
            if (headerFooterRows.includes(row)) {
                cell.style.setProperty('text-align', 'center', 'important');
                cell.style.setProperty('vertical-align', 'middle', 'important');
                cell.style.setProperty('display', 'flex', 'important');
                cell.style.setProperty('align-items', 'center', 'important');
                cell.style.setProperty('justify-content', 'center', 'important');
                
                const allChildren = cell.querySelectorAll('*');
                allChildren.forEach(child => {
                    if (child.tagName !== 'INPUT') {
                        child.style.setProperty('text-align', 'center', 'important');
                        child.style.setProperty('vertical-align', 'middle', 'important');
                    }
                });
            }
        });
    }
    
    /**
     * 设置表头表尾居中对齐
     */
    window.setHeaderFooterAlignment = function() {
        try {
            console.log('🎯 开始设置表头表尾居中对齐');
            
            const luckysheetContainer = document.getElementById('luckysheet');
            if (!luckysheetContainer) {
                console.warn('⚠️ Luckysheet容器未找到，稍后重试');
                return;
            }
            
            const allCells = luckysheetContainer.querySelectorAll('td, div[data-row], [class*="cell"]');
            console.log(`📋 找到 ${allCells.length} 个可能的单元格元素`);
            
            if (allCells.length === 0) {
                console.warn('⚠️ 未找到任何单元格元素，Luckysheet可能未完全加载');
                return;
            }
            
            const headerFooterRows = [0, 1, 2, 3, 4, 15, 16, 17, 18, 19];
            let processedCount = 0;
            
            allCells.forEach((cell, index) => {
                try {
                    const row = cell.getAttribute('data-row') || 
                                cell.getAttribute('r') || 
                                cell.parentElement?.getAttribute('data-row');
                    
                    if (row !== null && headerFooterRows.includes(parseInt(row))) {
                        cell.style.setProperty('text-align', 'center', 'important');
                        cell.style.setProperty('vertical-align', 'middle', 'important');
                        
                        const textNodes = cell.querySelectorAll('*');
                        textNodes.forEach(node => {
                            if (node.tagName !== 'INPUT' && node.tagName !== 'TEXTAREA') {
                                node.style.setProperty('text-align', 'center', 'important');
                                node.style.setProperty('vertical-align', 'middle', 'important');
                            }
                        });
                        
                        processedCount++;
                    }
                } catch (err) {
                    // 忽略单个单元格的错误
                }
            });
            
            console.log(`✅ 表头表尾居中对齐设置完成，处理了 ${processedCount} 个单元格`);
        } catch (error) {
            console.error('❌ 设置表头表尾居中对齐失败:', error);
        }
    };
    
    console.log('✅ 对齐工具模块已加载');
})();

