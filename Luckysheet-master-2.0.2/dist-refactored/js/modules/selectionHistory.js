/**
 * 选型历史记录管理模块
 * 功能：拦截保存操作，自动保存到后端+本地备份
 */

const SelectionHistory = {
    API_BASE_URL: 'https://luckysheet-backend.onrender.com/api/selections',  // 生产环境
    // API_BASE_URL: 'http://localhost:8001/api/selections',  // 本地开发环境
    
    /**
     * 初始化历史记录功能
     */
    init() {
        this.createHistoryButton();
        // ❌ 禁用hookSaveButton，因为已经在legacy.js的saveExcelToHistory中保存历史记录
        // this.hookSaveButton();
        console.log('✅ 选型历史记录模块已初始化（历史记录由saveExcelToHistory处理）');
    },
    
    /**
     * 创建查看历史按钮
     */
    createHistoryButton() {
        const toolbar = document.querySelector('.custom-toolbar > div:last-child');
        if (!toolbar) return;
        
        const historyBtn = document.createElement('button');
        historyBtn.id = 'viewHistoryBtn';
        historyBtn.className = 'title-btn';
        historyBtn.title = '查看保存的文件历史';
        historyBtn.innerHTML = '📚 历史记录';
        historyBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        historyBtn.style.color = 'white';
        
        const refreshBtn = document.getElementById('refreshDbBtn');
        if (refreshBtn) {
            toolbar.insertBefore(historyBtn, refreshBtn);
        } else {
            toolbar.appendChild(historyBtn);
        }
        
        // 绑定点击事件
        historyBtn.addEventListener('click', () => this.openHistoryPage());
    },
    
    /**
     * 拦截保存按钮，添加自动上传功能
     */
    hookSaveButton() {
        const saveBtn = document.getElementById('saveFileBtn');
        if (!saveBtn) {
            console.warn('未找到保存按钮');
            return;
        }
        
        // 保存原始点击事件
        const originalClick = saveBtn.onclick;
        
        // 重写点击事件
        saveBtn.onclick = async (e) => {
            // 先执行原始保存（下载到本地）
            if (originalClick) {
                originalClick.call(saveBtn, e);
            }
            
            // 延迟一下，让本地保存完成
            setTimeout(async () => {
                await this.autoSaveToBackend();
            }, 500);
        };
        
        console.log('✅ 已拦截保存按钮，添加自动上传功能');
    },
    
    /**
     * 自动保存到后端
     */
    async autoSaveToBackend() {
        try {
            // 获取当前工作簿名称作为项目名称
            const projectName = this.getCurrentFileName();
            
            // 静默保存，不打扰用户
            console.log(`📤 自动上传到云端: ${projectName}`);
            
            // 获取Excel文件
            const excelFile = await this.getCurrentSheetFile(projectName);
            if (!excelFile) {
                console.warn('无法导出Excel文件');
                return;
            }
            
            // 获取当前登录用户信息
            const currentUser = window.currentUser;
            const userPhone = currentUser && currentUser.phone ? currentUser.phone : 'unknown';
            
            // 准备数据
            const recordData = {
                project_name: projectName,
                selection_type: 'other', // 自动保存，类型设为other
                excel_filename: excelFile.filename,
                excel_content: excelFile.base64,
                excel_size: excelFile.size,
                phone: userPhone, // 添加用户手机号
                notes: `自动保存于 ${new Date().toLocaleString('zh-CN')}`
            };
            
            // 保存到云端
            await this.saveToCloud(recordData);
            
            // 显示成功提示（不打扰用户）
            console.log('✅ 文件已自动备份到云端');
            this.showSuccess('✅ 已自动备份到云端', 2000);
            
        } catch (error) {
            console.error('自动保存失败:', error);
            // 显示错误提示，帮助用户了解问题
            this.showError('⚠️ 云端备份失败：' + error.message, 3000);
        }
    },
    
    /**
     * 获取当前文件名
     */
    getCurrentFileName() {
        // 尝试从Luckysheet获取工作簿名称
        if (typeof luckysheet !== 'undefined' && luckysheet.getSheet) {
            const sheet = luckysheet.getSheet();
            if (sheet && sheet.name) {
                return sheet.name;
            }
        }
        
        // 默认使用时间戳
        const now = new Date();
        return `选型文件_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    },
    
    /**
     * 打开历史记录页面
     */
    openHistoryPage() {
        window.open('selection-history.html', '_blank');
    },
    
    /**
     * 获取当前表格文件（Excel格式）
     * 🎯 与主保存功能（legacy.js中的exportSheetExcelJS）完全一致
     * ✅ 包含所有格式、边框、公式、样式
     */
    async getCurrentSheetFile(projectName) {
        try {
            // 检查ExcelJS是否可用
            if (typeof ExcelJS === 'undefined') {
                console.warn('⚠️ ExcelJS未加载');
                return null;
            }

            console.log('📊 开始导出完整Excel文件用于云端备份...');
            
            // 获取所有工作表
            const sheets = luckysheet.getAllSheets();
            if (!sheets || sheets.length === 0) {
                console.warn('⚠️ 未找到工作表数据');
                return null;
            }

            // 🎯 调用与主保存功能相同的导出逻辑
            const blob = await this.exportSheetExcelJS(sheets, projectName);
            
            if (!blob) {
                console.error('❌ Excel导出失败');
                return null;
            }

            // 转换为Base64
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    console.log('✅ Excel文件导出成功（完整格式），大小:', blob.size, 'bytes');
                    resolve({
                        filename: `${projectName}.xlsx`,
                        base64: base64,
                        size: blob.size
                    });
                };
                reader.onerror = () => {
                    console.error('❌ Base64转换失败');
                    resolve(null);
                };
                reader.readAsDataURL(blob);
            });

        } catch (error) {
            console.error('❌ 导出Excel文件失败:', error);
            return null;
        }
    },

    /**
     * ExcelJS导出函数（与legacy.js中的exportSheetExcelJS完全一致）
     * 包含所有样式、边框、公式、合并单元格等
     */
    async exportSheetExcelJS(luckysheetData, name = "file") {
        console.log('🔧 ExcelJS导出开始（云端备份）');
        
        // 创建工作簿
        const workbook = new ExcelJS.Workbook();
        workbook.creator = '设备参数选型系统';
        workbook.created = new Date();
        
        // 遍历所有sheet
        let sheetIndex = 0;
        for (const table of luckysheetData) {
            if (!table.data || table.data.length === 0) continue;
            
            sheetIndex++;
            const sheetName = table.name || `Sheet${sheetIndex}`;
            console.log(`📄 处理工作表: ${table.name || '未命名'} → 导出为: ${sheetName}`);
            
            const worksheet = workbook.addWorksheet(sheetName);
            
            // 检测工作表类型
            const isSimplified = table.name && table.name.includes('简化版');
            console.log(`📊 工作表类型: ${isSimplified ? '简化版' : '完整版'}`);
            
            // 设置单元格样式和值
            this.setStyleAndValue(table.data, worksheet, table, isSimplified);
            
            // 设置合并单元格
            if (table.config && table.config.merge) {
                this.setMerge(table.config.merge, worksheet);
            }
            
            // 设置列宽和行高
            this.setColumnWidth(table, worksheet);
            this.setRowHeight(table, worksheet);
        }
        
        // 写入buffer并返回blob
        const buffer = await workbook.xlsx.writeBuffer();
        return new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' 
        });
    },

    /**
     * 设置单元格样式和值（完整版，包含所有格式和公式）
     */
    setStyleAndValue(data, worksheet, table, isSimplified) {
        console.log(`📝 设置单元格样式和值，共 ${data.length} 行`);
        
        // 确定实际的数据范围
        let maxRow = 0;
        let maxCol = 0;
        
        for (let r = 0; r < data.length; r++) {
            const row = data[r];
            if (!row) continue;
            
            for (let c = 0; c < row.length; c++) {
                const cellData = row[c];
                if (cellData && (cellData.v !== undefined || cellData.m !== undefined || cellData.f)) {
                    maxRow = Math.max(maxRow, r);
                    maxCol = Math.max(maxCol, c);
                }
            }
        }
        
        maxRow += 1;
        maxCol += 1;
        console.log(`📊 有效数据范围: ${maxRow} 行 × ${maxCol} 列`);
        
        // 查找表尾起始行（"安装费"所在行）
        let footerStartRow = -1;
        for (let r = 5; r < data.length; r++) {
            const row = data[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
                const cellData = row[c];
                const cellValue = this.getCellText(cellData);
                if (String(cellValue).includes('安装费')) {
                    footerStartRow = r;
                    break;
                }
            }
            if (footerStartRow >= 0) break;
        }
        console.log(`📊 表尾起始行: ${footerStartRow >= 0 ? footerStartRow + 1 : '未找到'}`);
        
        // 数据行范围：第6行（索引5）到表尾起始行之前
        const dataRowStart = 5;
        const dataRowEnd = footerStartRow >= 0 ? footerStartRow : maxRow;
        
        // 表尾合计行索引（表尾起始行+4）
        const totalRow = footerStartRow >= 0 ? footerStartRow + 4 : -1;
        console.log(`📊 表尾合计行: ${totalRow >= 0 ? totalRow + 1 : '未找到'}`);
        
        // 扩展遍历范围
        const effectiveMaxRow = Math.max(maxRow, dataRowEnd, totalRow + 1);
        const effectiveMaxCol = Math.max(maxCol, 16);

        // 遍历所有单元格
        for (let r = 0; r < effectiveMaxRow; r++) {
            const row = data[r] || [];
            const isTotalRow = (r === totalRow);
            
            for (let c = 0; c < effectiveMaxCol; c++) {
                const cellData = row[c];
                const excelRow = r + 1;
                const excelCol = c + 1;
                const cell = worksheet.getCell(excelRow, excelCol);
                
                // 获取单元格值（定义在循环外部，避免作用域问题）
                let actualValue = null;
                if (cellData) {
                    actualValue = this.getCellText(cellData);
                    
                    if (!actualValue) {
                        if (cellData.v !== undefined && cellData.v !== null) {
                            actualValue = cellData.v;
                        } else if (cellData.m !== undefined && cellData.m !== null) {
                            actualValue = cellData.m;
                        }
                    }
                    
                    // 🎯 根据列和行设置值/公式（与主保存功能完全一致）
                    this.setCellValue(cell, actualValue, r, c, excelRow, isSimplified, isTotalRow, dataRowStart, dataRowEnd);
                }
                
                // 设置样式
                this.setCellStyle(cell, cellData, r, c, actualValue, isSimplified);
            }
        }
        
        // 补充空白单元格的公式
        this.fillEmptyFormulas(worksheet, data, dataRowStart, dataRowEnd);
        
        console.log('✅ 单元格样式和值设置完成');
    },

    /**
     * 获取单元格文本（兼容多种格式）
     */
    getCellText(cellData) {
        if (!cellData) return '';
        if (typeof cellData === 'string' || typeof cellData === 'number') return String(cellData).trim();
        if (typeof cellData === 'object') {
            if (cellData.m !== null && cellData.m !== undefined && cellData.m !== '') return String(cellData.m).trim();
            if (cellData.v !== null && cellData.v !== undefined && cellData.v !== '') return String(cellData.v).trim();
            if (cellData.text) return String(cellData.text).trim();
            if (cellData.ct && cellData.ct.v) return String(cellData.ct.v).trim();
        }
        return '';
    },

    /**
     * 设置单元格值（包含所有公式逻辑）
     */
    setCellValue(cell, actualValue, r, c, excelRow, isSimplified, isTotalRow, dataRowStart, dataRowEnd) {
        const isDataRow = (r >= dataRowStart && r < dataRowEnd);
        
        // A列：序号
        if (c === 0 && actualValue !== null) {
            const numValue = parseFloat(actualValue);
            if (!isNaN(numValue)) {
                cell.value = numValue;
                cell.numFmt = '0';
            } else {
                cell.value = actualValue;
            }
        }
        // F列：简化版合计行SUM
        else if (c === 5) {
            if (isSimplified && isTotalRow) {
                cell.value = { formula: `SUM(F${dataRowStart + 1}:F${dataRowEnd})` };
            } else if (actualValue !== null) {
                const numValue = parseFloat(actualValue);
                if (!isNaN(numValue)) { cell.value = numValue; cell.numFmt = '0.##########'; }
                else if (String(actualValue).trim() === '/') { cell.value = '/'; }
                else { cell.value = actualValue; }
            }
        }
        // G列：数字
        else if (c === 6) {
            if (actualValue !== null) {
                const numValue = parseFloat(actualValue);
                if (!isNaN(numValue)) { cell.value = numValue; cell.numFmt = '0.##########'; }
                else if (String(actualValue).trim() === '/') { cell.value = '/'; }
                else { cell.value = actualValue; }
            }
        }
        // H列：简化版数据行为F*G公式，合计行SUM
        else if (c === 7) {
            if (isSimplified) {
                if (isTotalRow) {
                    cell.value = { formula: `SUM(H${dataRowStart + 1}:H${dataRowEnd})` };
                } else {
                    cell.value = { formula: `IFERROR(IF(F${excelRow}*G${excelRow}=0,"",F${excelRow}*G${excelRow}),"")` };
                }
            } else if (actualValue !== null) {
                const numValue = parseFloat(actualValue);
                if (!isNaN(numValue)) { cell.value = numValue; cell.numFmt = '0.##########'; }
                else if (String(actualValue).trim() === '/') { cell.value = '/'; }
                else { cell.value = actualValue; }
            }
        }
        // I列：单台电机数量
        else if (c === 8 && actualValue !== null) {
            const numValue = parseFloat(actualValue);
            if (!isNaN(numValue)) {
                cell.value = numValue;
                cell.numFmt = '0.##########';
            } else if (actualValue === '/' || String(actualValue).trim() === '/') {
                cell.value = '/';
            } else {
                cell.value = actualValue;
            }
        }
        // J列：简化版合计行"/"，数据行IF公式
        else if (c === 9) {
            const strValue = actualValue !== null ? String(actualValue).trim() : '';
            if (isTotalRow) {
                if (isSimplified) {
                    cell.value = '/';
                } else {
                    cell.value = { formula: `SUM(J${dataRowStart + 1}:J${dataRowEnd})` };
                }
            } else if (strValue === '/') {
                cell.value = '/';
            } else if (isDataRow) {
                cell.value = { formula: `IFERROR(IF(I${excelRow}*H${excelRow}=0,"",I${excelRow}*H${excelRow}),"")` };
            }
        }
        // K列：简化版合计SUM，数据行IF公式
        else if (c === 10) {
            const strValue = String(actualValue ?? '').trim();
            if (isSimplified) {
                if (isTotalRow) {
                    cell.value = { formula: `SUM(K${dataRowStart + 1}:K${dataRowEnd})` };
                } else {
                    cell.value = { formula: `IFERROR(IF(J${excelRow}*F${excelRow}=0,"",J${excelRow}*F${excelRow}),"")` };
                }
            } else if (actualValue !== null) {
                if (strValue && /[\+\-\*\/]/.test(strValue) && !/^[\-]?\d+(\.\d+)?$/.test(strValue)) {
                    cell.value = strValue;
                } else if (strValue === '/' || strValue === '') {
                    cell.value = '/';
                } else {
                    const numValue = parseFloat(strValue);
                    cell.value = !isNaN(numValue) ? (cell.numFmt='0.##########', numValue) : strValue;
                }
            }
        }
        // L列：简化版不需要公式
        else if (c === 11) {
            const strValue = actualValue !== null ? String(actualValue).trim() : '';
            if (strValue === '/') {
                cell.value = '/';
            } else if (isDataRow) {
                const numValue = parseFloat(strValue);
                if (!isNaN(numValue)) { cell.value = numValue; cell.numFmt = '0.##########'; }
                else { cell.value = strValue || ''; }
            }
        }
        // M列：简化版数据行F×L，合计行SUM
        else if (c === 12) {
            const strValue = actualValue !== null ? String(actualValue).trim() : '';
            if (isTotalRow) {
                cell.value = { formula: `SUM(M${dataRowStart + 1}:M${dataRowEnd})` };
            } else if (strValue === '/') {
                cell.value = '/';
            } else if (isDataRow) {
                if (isSimplified) {
                    cell.value = { formula: `IFERROR(IF(F${excelRow}*L${excelRow}=0,"",F${excelRow}*L${excelRow}),"")` };
                } else {
                    cell.value = { formula: `IFERROR(IF(L${excelRow}*H${excelRow}=0,"",L${excelRow}*H${excelRow}),"")` };
                }
            }
        }
        // N列：数字格式
        else if (c === 13 && actualValue !== null) {
            const numValue = parseFloat(actualValue);
            if (!isNaN(numValue)) {
                cell.value = numValue;
                cell.numFmt = '0.##########';
            } else if (actualValue === '/' || String(actualValue).trim() === '/') {
                cell.value = '/';
            } else {
                cell.value = actualValue;
            }
        }
        // O列：总报价
        else if (c === 14) {
            const strValue = actualValue !== null ? String(actualValue).trim() : '';
            if (isTotalRow) {
                cell.value = { formula: `SUM(O${dataRowStart + 1}:O${dataRowEnd})` };
            } else if (strValue === '/') {
                cell.value = '/';
            } else if (isDataRow) {
                cell.value = { formula: `IFERROR(IF(N${excelRow}*H${excelRow}=0,"",N${excelRow}*H${excelRow}),"")` };
            }
        }
        // 其他列：直接保存值
        else if (actualValue !== null) {
            cell.value = actualValue;
        }
    },

    /**
     * 设置单元格样式（包含边框、对齐、字体、颜色）
     */
    setCellStyle(cell, cellData, r, c, actualValue, isSimplified) {
        // D列、E列等需要自动换行
        const isColumnD = (c === 3);
        const isColumnE = (c === 4);
        const isDevicePositionHeader = (r === 3 && c === 1);
        const isMotorPowerHeader = (r === 3 && c === 10);
        // 公司名换行（检查是否包含"温岭市泽国化工机械"或换行符）
        const actualTextForStyle = (typeof actualValue !== 'undefined' && actualValue !== null) ? String(actualValue) : '';
        const isCompanyNameCell = actualTextForStyle.indexOf('温岭市泽国化工机械') !== -1 || actualTextForStyle.indexOf('\n') !== -1;
        const needWrapText = isColumnD || isColumnE || isDevicePositionHeader || isMotorPowerHeader || isCompanyNameCell;
        
        // 🎯 边框：简化版不为O/P列加边框（表尾合计行以上表头有边框）
        const needBorder = isSimplified ? (c >= 0 && c <= 13) : (c >= 0 && c <= 15);
        
        // 默认样式（12号宋体）
        const style = {
            alignment: { 
                horizontal: 'center', 
                vertical: 'middle',
                wrapText: needWrapText
            },
            font: {
                name: 'SimSun',
                size: 12,  // 默认12号字体
                color: { argb: 'FF000000' }
            }
        };
        
        // 添加边框（只为需要的列）
        if (needBorder) {
            style.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }
        
        // 读取Luckysheet的样式
        if (cellData) {
            if (cellData.bl === 1) style.font.bold = true;
            if (cellData.fs) style.font.size = Number(cellData.fs);
            if (cellData.ff) style.font.name = String(cellData.ff);
            
            // 字体颜色
            if (cellData.fc) {
                const fc = String(cellData.fc).replace('#', '');
                style.font.color = { argb: 'FF' + fc };
            }
            
            // 背景色
            if (cellData.bg) {
                const bg = String(cellData.bg).replace('#', '');
                style.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF' + bg }
                };
            }
            
            // 对齐方式
            if (cellData.ht !== undefined) {
                const htMap = { 0: 'center', 1: 'left', 2: 'right' };
                style.alignment.horizontal = htMap[cellData.ht] || 'center';
            }
            if (cellData.vt !== undefined) {
                const vtMap = { 0: 'middle', 1: 'top', 2: 'bottom' };
                style.alignment.vertical = vtMap[cellData.vt] || 'middle';
            }
            
            // D列强制左对齐并换行
            if (isColumnD) {
                style.alignment.horizontal = 'left';
                style.alignment.wrapText = true;
            }
            
            // E列强制换行
            if (isColumnE) {
                style.alignment.wrapText = true;
            }
        }
        
        cell.style = style;
    },

    /**
     * 为空白单元格补充公式
     */
    fillEmptyFormulas(worksheet, data, dataRowStart, dataRowEnd) {
        try {
            const isSlash = (rowIdx, colIdx) => {
                const raw = data[rowIdx] && data[rowIdx][colIdx];
                const txt = this.getCellText(raw);
                return (txt && String(txt).trim() === '/');
            };
            
            for (let r = dataRowStart; r < dataRowEnd; r++) {
                const excelRow = r + 1;
                
                // J列
                if (!isSlash(r, 9)) {
                    const cellJ = worksheet.getCell(excelRow, 10);
                    const vJ = cellJ.value;
                    const emptyJ = (vJ === undefined || vJ === null || (typeof vJ === 'string' && vJ === ''));
                    if (emptyJ) {
                        cellJ.value = { formula: `IFERROR(IF(I${excelRow}*H${excelRow}=0,"",I${excelRow}*H${excelRow}),"")` };
                    }
                }
                
                // L列
                if (!isSlash(r, 11)) {
                    const cellL = worksheet.getCell(excelRow, 12);
                    const vL = cellL.value;
                    const emptyL = (vL === undefined || vL === null || (typeof vL === 'string' && vL === ''));
                    if (emptyL) {
                        cellL.value = { formula: `IFERROR(IF(K${excelRow}*I${excelRow}=0,"",K${excelRow}*I${excelRow}),"")` };
                    }
                }
                
                // M列
                if (!isSlash(r, 12)) {
                    const cellM = worksheet.getCell(excelRow, 13);
                    const vM = cellM.value;
                    const emptyM = (vM === undefined || vM === null || (typeof vM === 'string' && vM === ''));
                    if (emptyM) {
                        cellM.value = { formula: `IFERROR(IF(L${excelRow}*H${excelRow}=0,"",L${excelRow}*H${excelRow}),"")` };
                    }
                }
                
                // O列
                if (!isSlash(r, 14)) {
                    const cellO = worksheet.getCell(excelRow, 15);
                    const vO = cellO.value;
                    const emptyO = (vO === undefined || vO === null || (typeof vO === 'string' && vO === ''));
                    if (emptyO) {
                        cellO.value = { formula: `IFERROR(IF(N${excelRow}*H${excelRow}=0,"",N${excelRow}*H${excelRow}),"")` };
                    }
                }
            }
            console.log('✅ 空白单元格公式补充完成');
        } catch (e) {
            console.warn('⚠️ 空白单元格公式补充失败:', e);
        }
    },

    /**
     * 设置合并单元格
     */
    setMerge(luckyMerge = {}, worksheet) {
        const mergearr = Object.values(luckyMerge);
        console.log(`🔗 设置合并单元格，共 ${mergearr.length} 个`);
        
        const mergedRanges = new Set();
        mergearr.forEach(elem => {
            const key = `${elem.r}_${elem.c}_${elem.rs}_${elem.cs}`;
            if (!mergedRanges.has(key)) {
                try {
                    worksheet.mergeCells(
                        elem.r + 1, 
                        elem.c + 1, 
                        elem.r + elem.rs, 
                        elem.c + elem.cs
                    );
                    mergedRanges.add(key);
                } catch (e) {
                    console.warn(`⚠️ 跳过重复合并: 行${elem.r+1}-${elem.r+elem.rs} 列${elem.c+1}-${elem.c+elem.cs}`);
                }
            }
        });
        
        console.log('✅ 合并单元格设置完成');
    },

    /**
     * 设置列宽
     */
    setColumnWidth(table, worksheet) {
        console.log('📏 设置列宽');
        
        if (table.config && table.config.columnlen) {
            Object.keys(table.config.columnlen).forEach(col => {
                const colIndex = parseInt(col);
                const widthPx = table.config.columnlen[col];
                const widthChar = widthPx / 8;
                worksheet.getColumn(colIndex + 1).width = Math.max(widthChar, 8);
            });
        }
        
        // A列固定宽度
        worksheet.getColumn(1).width = 5;
        console.log('✅ 列宽设置完成');
    },

    /**
     * 设置行高
     */
    setRowHeight(table, worksheet) {
        console.log('📏 设置行高');
        
        if (table.config && table.config.rowlen) {
            Object.keys(table.config.rowlen).forEach(row => {
                const rowIndex = parseInt(row);
                const heightPx = table.config.rowlen[row];
                const heightPt = heightPx * 0.75;
                const finalHeight = Math.max(heightPt, 20);
                worksheet.getRow(rowIndex + 1).height = finalHeight;
            });
        }
        
        console.log('✅ 行高设置完成');
    },
    
    
    /**
     * 保存到云端
     */
    async saveToCloud(recordData) {
        const response = await fetch(`${this.API_BASE_URL}/records/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '保存失败');
        }
        
        const result = await response.json();
        console.log('✅ 云端保存成功:', result);
        return result;
    },
    
    /**
     * 显示成功提示
     */
    showSuccess(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            font-size: 14px;
            opacity: 0.95;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);
    },
    
    /**
     * 显示错误提示
     */
    showError(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            font-size: 14px;
            opacity: 0.95;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SelectionHistory.init());
} else {
    SelectionHistory.init();
}

// 导出到全局
window.SelectionHistory = SelectionHistory;

