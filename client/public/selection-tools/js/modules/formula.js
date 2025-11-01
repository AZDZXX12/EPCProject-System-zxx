/**
 * 公式计算模块
 * 
 * 处理所有表格公式和自动计算功能
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 公式计算模块...');
    
    /**
     * 手动计算求和
     * 根据当前工作表类型（简化版/完整版）执行对应的求和逻辑
     */
    window.manualCalculateSum = function() {
        try {
            const currentSheet = luckysheet.getSheet();
            const sheetName = currentSheet ? currentSheet.name : 'unknown';
            const isSimplified = currentSheet && currentSheet.name && currentSheet.name.includes('简化版');
            console.log(`🧮 [manualCalculateSum] 工作表: "${sheetName}", 类型: ${isSimplified ? '简化版' : '完整版'}`);
            
            const sheetData = luckysheet.getSheetData();
            let footerStartRow = -1;
            
            // 查找表尾起始行（安装费）
            for (let i = 5; i < sheetData.length; i++) {
                const row = sheetData[i];
                if (Array.isArray(row)) {
                    for (let j = 0; j < row.length; j++) {
                        const cell = row[j];
                        const val = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
                        if (String(val).includes('安装费')) { 
                            footerStartRow = i; 
                            break; 
                        }
                    }
                    if (footerStartRow >= 0) break;
                }
            }
            
            if (footerStartRow >= 0) {
                const totalRow = footerStartRow + 4;
                const dataStartRow = 5;
                const dataEndRow = footerStartRow;
                
                if (isSimplified) {
                    // 简化版求和：F/H/K/M列
                    let fSum = 0, hSum = 0, kSum = 0, mSum = 0;
                    
                    for (let row = dataStartRow; row < dataEndRow; row++) {
                        // F列：数量
                        const fCell = sheetData[row] && sheetData[row][5];
                        const fVal = fCell && typeof fCell === 'object' ? fCell.v : fCell;
                        if (fVal && fVal !== '/' && !isNaN(parseFloat(fVal))) {
                            fSum += parseFloat(fVal);
                        }
                        
                        // H列：总电机数量
                        const hCell = sheetData[row] && sheetData[row][7];
                        const hVal = hCell && typeof hCell === 'object' ? hCell.v : hCell;
                        if (hVal && hVal !== '/' && !isNaN(parseFloat(hVal))) {
                            hSum += parseFloat(hVal);
                        }
                        
                        // K列：总设备功率
                        const kCell = sheetData[row] && sheetData[row][10];
                        const kVal = kCell && typeof kCell === 'object' ? kCell.v : kCell;
                        if (kVal && kVal !== '/' && !isNaN(parseFloat(kVal))) {
                            kSum += parseFloat(kVal);
                        }
                        
                        // M列：设备总价
                        const mCell = sheetData[row] && sheetData[row][12];
                        const mVal = mCell && typeof mCell === 'object' ? mCell.v : mCell;
                        if (mVal && mVal !== '/' && !isNaN(parseFloat(mVal))) {
                            mSum += parseFloat(mVal);
                        }
                    }
                    
                    // 设置合计行的值
                    luckysheet.setCellValue(totalRow, 5, {
                        v: Math.round(fSum),
                        m: String(Math.round(fSum)),
                        ct: { fa: "General", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    luckysheet.setCellValue(totalRow, 7, {
                        v: Math.round(hSum),
                        m: String(Math.round(hSum)),
                        ct: { fa: "General", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    luckysheet.setCellValue(totalRow, 9, {
                        v: '/',
                        m: '/',
                        ct: { fa: "General", t: "g" },
                        ht: 0,
                        vt: 0
                    });
                    luckysheet.setCellValue(totalRow, 10, {
                        v: kSum,
                        m: kSum.toFixed(2),
                        ct: { fa: "General", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    luckysheet.setCellValue(totalRow, 12, {
                        v: mSum,
                        m: mSum.toFixed(2),
                        ct: { fa: "0.00", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    
                    luckysheet.refresh();
                    console.log(`🔄 简化版手动计算求和: F=${Math.round(fSum)}, H=${Math.round(hSum)}, K=${kSum.toFixed(2)}, M=${mSum.toFixed(2)}`);
                    
                    // 更新详情页
                    const installedPowerEl = document.getElementById('installedPower');
                    const totalQuotePriceEl = document.getElementById('totalQuotePrice');
                    if (installedPowerEl) installedPowerEl.value = kSum.toFixed(2);
                    if (totalQuotePriceEl) totalQuotePriceEl.value = mSum.toFixed(2);
                    
                } else {
                    // 完整版求和：H/J/M/O列
                    let hSum = 0, jSum = 0, mSum = 0, oSum = 0;
                    
                    for (let row = dataStartRow; row < dataEndRow; row++) {
                        const hCell = sheetData[row] && sheetData[row][7];
                        const hVal = hCell && typeof hCell === 'object' ? hCell.v : hCell;
                        if (hVal && hVal !== '/' && !isNaN(parseFloat(hVal))) {
                            hSum += parseFloat(hVal);
                        }
                        
                        const jCell = sheetData[row] && sheetData[row][9];
                        const jVal = jCell && typeof jCell === 'object' ? jCell.v : jCell;
                        if (jVal && jVal !== '/' && !isNaN(parseFloat(jVal))) {
                            jSum += parseFloat(jVal);
                        }
                        
                        const mCell = sheetData[row] && sheetData[row][12];
                        const mVal = mCell && typeof mCell === 'object' ? mCell.v : mCell;
                        if (mVal && mVal !== '/' && !isNaN(parseFloat(mVal))) {
                            mSum += parseFloat(mVal);
                        }
                        
                        const oCell = sheetData[row] && sheetData[row][14];
                        const oVal = oCell && typeof oCell === 'object' ? oCell.v : oCell;
                        if (oVal && oVal !== '/' && !isNaN(parseFloat(oVal))) {
                            oSum += parseFloat(oVal);
                        }
                    }
                    
                    luckysheet.setCellValue(totalRow, 7, {
                        v: Math.round(hSum),
                        m: String(Math.round(hSum)),
                        ct: { fa: "General", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    luckysheet.setCellValue(totalRow, 9, {
                        v: Math.round(jSum),
                        m: String(Math.round(jSum)),
                        ct: { fa: "General", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    luckysheet.setCellValue(totalRow, 12, {
                        v: mSum,
                        m: mSum.toFixed(2),
                        ct: { fa: "General", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    luckysheet.setCellValue(totalRow, 14, {
                        v: oSum,
                        m: oSum.toFixed(2),
                        ct: { fa: "0.00", t: "n" },
                        ht: 0,
                        vt: 0
                    });
                    
                    luckysheet.refresh();
                    console.log(`🔄 完整版手动计算求和: H=${Math.round(hSum)}, J=${Math.round(jSum)}, M=${mSum.toFixed(2)}, O=${oSum.toFixed(2)}`);
                    
                    // 更新详情页
                    const installedPowerEl = document.getElementById('installedPower');
                    const totalQuotePriceEl = document.getElementById('totalQuotePrice');
                    if (installedPowerEl) installedPowerEl.value = mSum.toFixed(2);
                    if (totalQuotePriceEl) totalQuotePriceEl.value = oSum.toFixed(2);
                }
            }
        } catch (error) {
            console.error('❌ manualCalculateSum 执行失败:', error);
        }
    };
    
    /**
     * 设置表格自动计算功能
     * TODO: 从原文件复制 setupTableCalculations 函数
     */
    window.setupTableCalculations = function() {
        console.log('🧮 设置表格自动计算功能');
        // TODO: 实现详细逻辑
    };
    
    /**
     * 为所有数据行添加计算公式
     * TODO: 从原文件复制 addFormulasToAllRows 函数
     */
    window.addFormulasToAllRows = function() {
        console.log('📐 为所有数据行添加计算公式');
        // TODO: 实现详细逻辑
    };
    
    console.log('✅ 公式计算模块已加载');
})();

