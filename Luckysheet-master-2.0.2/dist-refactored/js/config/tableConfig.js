/**
 * 表格配置模块
 * 
 * 包含：
 * - 完整版表头配置 (createTableHeader)
 * - 简化版表头配置 (createSimplifiedTableHeader)
 * - 边框配置 (getBorderConfig, getSimplifiedBorderConfig等)
 * - 合并单元格配置
 */

(function() {
    'use strict';
    
    console.log('🔧 正在加载: 表格配置模块...');
    
    // ========== 简化版边框配置 ==========
    window.getSimplifiedBorderConfig = function(footerStartRow) {
        const borderInfo = [];
        const maxCol = 13; // N列是第13列（从0开始）
        
        // 表头边框（0-4行）
        for (let r = 0; r <= 4; r++) {
            for (let c = 0; c <= maxCol; c++) {
                borderInfo.push({
                    rangeType: "cell",
                    value: {
                        row_index: r,
                        col_index: c,
                        l: {style: 1, color: "#000000"},
                        r: {style: 1, color: "#000000"},
                        t: {style: 1, color: "#000000"},
                        b: {style: 1, color: "#000000"}
                    }
                });
            }
        }
        
        // 表尾边框（footerStartRow 到 footerStartRow+4）
        for (let r = footerStartRow; r < footerStartRow + 5; r++) {
            for (let c = 0; c <= maxCol; c++) {
                borderInfo.push({
                    rangeType: "cell",
                    value: {
                        row_index: r,
                        col_index: c,
                        l: {style: 1, color: "#000000"},
                        r: {style: 1, color: "#000000"},
                        t: {style: 1, color: "#000000"},
                        b: {style: 1, color: "#000000"}
                    }
                });
            }
        }
        
        return borderInfo;
    };
    
    // ========== 简化版数据区边框配置 ==========
    window.getSimplifiedDataBorderConfig = function(dataStartRow, footerStartRow) {
        const borderInfo = [];
        const maxCol = 13; // N列
        
        // 数据区边框
        for (let r = dataStartRow; r < footerStartRow; r++) {
            for (let c = 0; c <= maxCol; c++) {
                borderInfo.push({
                    rangeType: "cell",
                    value: {
                        row_index: r,
                        col_index: c,
                        l: {style: 1, color: "#000000"},
                        r: {style: 1, color: "#000000"},
                        t: {style: 1, color: "#000000"},
                        b: {style: 1, color: "#000000"}
                    }
                });
            }
        }
        
        return borderInfo;
    };
    
    // ========== 创建简化版表头 ==========
    window.createSimplifiedTableHeader = function() {
        const data = [];
        const totalRows = 20;
        const totalCols = 14; // 简化版只有14列（A-N）
        for (let i = 0; i < totalRows; i++) {
            const row = [];
            for (let j = 0; j < totalCols; j++) {
                row.push('');
            }
            data.push(row);
        }
        
        // ABC列（0-2列）1-3行合并显示公司名称（换行显示）
        data[0][0] = '温岭市泽国化工机械\\n有限公司';
        
        // DEF列（3-5列）1-3行合并显示设备一览表（20号字）
        data[0][3] = '设备一览表';
        
        // GH列（6-7列）1-3行各自横向合并
        data[0][6] = '项目名称';
        data[1][6] = '子项名称';
        data[2][6] = '项目编号';
        
        // L列（11列）编制/校核/审核（独立，不合并）
        data[0][11] = '编制';
        data[1][11] = '校核';
        data[2][11] = '审核';
        
        // 第4-5行表头（14列 A-N）
        data[3][0] = '序号';
        data[3][1] = '设备名称';
        data[3][2] = '规格型号';
        data[3][3] = '技术参数及要求';
        data[3][4] = '单位';
        data[3][5] = '数量';
        data[3][6] = '电机数量';
        data[4][6] = '单';
        data[4][7] = '总';
        data[3][8] = '电机功率(KW)';
        data[3][9] = '设备功率(KW)';
        data[4][9] = '单';
        data[4][10] = '总';
        data[3][11] = '价格（万元）';
        data[4][11] = '单';
        data[4][12] = '总';
        data[3][13] = '备注';
        
        // 表尾（15-19行）
        data[15][1] = '安装费';
        data[15][4] = '套';
        for (let c = 2; c <= 13; c++) if (c !== 4) data[15][c] = '/';
        
        data[16][1] = '钢材用量';
        data[16][4] = '吨';
        for (let c = 2; c <= 13; c++) if (c !== 4) data[16][c] = '/';
        
        data[17][1] = '电器材料';
        data[17][4] = '套';
        for (let c = 2; c <= 13; c++) if (c !== 4) data[17][c] = '/';
        
        data[18][1] = '电线电缆';
        data[18][4] = '套';
        for (let c = 2; c <= 13; c++) if (c !== 4) data[18][c] = '/';
        
        // 第19行：合计
        data[19][0] = '合计';
        data[19][2] = '/';
        data[19][3] = '/';
        data[19][4] = '/';
        data[19][6] = '/';
        data[19][7] = 0;
        data[19][8] = '/';
        data[19][9] = '/';
        data[19][10] = 0;
        data[19][11] = '/';
        data[19][13] = '/';
        
        return data;
    };
    
    // ========== 完整版边框配置 ==========
    // TODO: 从原文件复制 getBorderConfig 函数
    
    // ========== 完整版数据区边框配置 ==========
    // TODO: 从原文件复制 getDataBorderConfig 函数
    
    // ========== 创建完整版表头 ==========
    window.createTableHeader = function() {
        // 创建足够的行数：5行表头 + 10行数据区 + 5行表尾 = 20行
        const data = [];
        const totalRows = 20;
        for (let i = 0; i < totalRows; i++) {
            const row = [];
            for (let j = 0; j < 26; j++) {
                row.push('');
            }
            data.push(row);
        }
        
        // 清空所有可能的缓存数据
        localStorage.removeItem('deviceDatabaseBase64');
        localStorage.removeItem('databaseLocation');
        localStorage.removeItem('deviceDatabaseName');
        
        // 设置表头内容
        // ABCD列（0-3列）1-3行合并显示公司名称（换行显示）
        data[0][0] = {
            v: '温岭市泽国化工机械\n有限公司',
            m: '温岭市泽国化工机械\n有限公司',
            ct: { fa: 'General', t: 'g' },
            fs: 16,  // 字体大小16
            ff: 'SimSun',  // 宋体
            tb: 2,  // 换行显示 (0=截断, 1=溢出, 2=自动换行)
            ht: 0,  // 居中对齐 (0=居中, 1=左对齐, 2=右对齐)
            vt: 0   // 垂直居中 (0=居中, 1=顶部, 2=底部)
        };
        
        // EFG列（4-6列）1-3行合并显示设备一览表
        data[0][4] = '设备一览表';
        
        // HI列（7-8列）1-3行分别水平合并
        data[0][7] = '项目名称';
        data[1][7] = '子项名称';
        data[2][7] = '项目编号';
        data[0][8] = '';
        data[1][8] = '';
        data[2][8] = '';
        
        // JKLM列（9-12）在第1-3行按行横向合并，内容留空
        for (let r = 0; r <= 2; r++) {
            for (let c = 9; c <= 12; c++) {
                data[r][c] = '';
            }
        }
        
        // 编制/校核/审核移动到N列（索引13）第1-3行
        data[0][13] = '编制';
        data[1][13] = '校核';
        data[2][13] = '审核';
        
        // O-P列（14-15）1-3行按行合并，留空
        for (let r = 0; r <= 2; r++) {
            data[r][14] = '';
            data[r][15] = '';
        }
        
        // 设置第3-4行（对应Excel的第4-5行）表头
        data[3][0] = '序号';
        data[3][1] = '设备\n位号';
        data[3][2] = '设备名称';
        data[3][3] = '规格型号';
        data[3][4] = '技术参数及要求';
        data[3][5] = '材料';
        data[3][6] = '单位';
        data[3][7] = '数量';
        
        // 电机数量在IJ列4行合并，5行"单"/"总"
        data[3][8] = '电机数量';
        data[4][8] = '单';
        data[4][9] = '总';
        
        // K列：电机功率（KW）
        data[3][10] = '电机功率（KW）';
        data[4][10] = '';
        
        // 设备功率(KW)在L-M列
        data[3][11] = '设备功率(KW)';
        data[4][11] = '单';
        data[4][12] = '总';
        
        // 价格（万元）在N-O列
        data[3][13] = '价格（万元）';
        data[4][13] = '单';
        data[4][14] = '总';
        
        // 备注在P列
        data[3][15] = '备注';
        
        // 设置表尾初始数据（最后5行：15-19行）
        const footerStartIndex = totalRows - 5; // 15
        
        // 倒数第5行：安装费
        data[footerStartIndex][0] = '';
        data[footerStartIndex][1] = '/';
        data[footerStartIndex][2] = '安装费';
        data[footerStartIndex][3] = '/';
        data[footerStartIndex][4] = '/';
        data[footerStartIndex][5] = '/';
        data[footerStartIndex][6] = '套';
        data[footerStartIndex][7] = '/';
        data[footerStartIndex][8] = '/';
        data[footerStartIndex][9] = '/';
        data[footerStartIndex][10] = '/';
        data[footerStartIndex][11] = '/';
        data[footerStartIndex][12] = '/';
        data[footerStartIndex][13] = '/';
        data[footerStartIndex][14] = '/';
        data[footerStartIndex][15] = '/';
        
        // 倒数第4行：钢材用量
        data[footerStartIndex + 1][0] = '';
        data[footerStartIndex + 1][1] = '/';
        data[footerStartIndex + 1][2] = '钢材用量';
        data[footerStartIndex + 1][3] = '/';
        data[footerStartIndex + 1][4] = '/';
        data[footerStartIndex + 1][5] = '/';
        data[footerStartIndex + 1][6] = '吨';
        data[footerStartIndex + 1][7] = '/';
        data[footerStartIndex + 1][8] = '/';
        data[footerStartIndex + 1][9] = '/';
        data[footerStartIndex + 1][10] = '/';
        data[footerStartIndex + 1][11] = '/';
        data[footerStartIndex + 1][12] = '/';
        data[footerStartIndex + 1][13] = '/';
        data[footerStartIndex + 1][14] = '/';
        data[footerStartIndex + 1][15] = '/';
        
        // 倒数第3行：电器材料
        data[footerStartIndex + 2][0] = '';
        data[footerStartIndex + 2][1] = '/';
        data[footerStartIndex + 2][2] = '电器材料';
        data[footerStartIndex + 2][3] = '/';
        data[footerStartIndex + 2][4] = '/';
        data[footerStartIndex + 2][5] = '/';
        data[footerStartIndex + 2][6] = '套';
        data[footerStartIndex + 2][7] = '/';
        data[footerStartIndex + 2][8] = '/';
        data[footerStartIndex + 2][9] = '/';
        data[footerStartIndex + 2][10] = '/';
        data[footerStartIndex + 2][11] = '/';
        data[footerStartIndex + 2][12] = '/';
        data[footerStartIndex + 2][13] = '/';
        data[footerStartIndex + 2][14] = '/';
        data[footerStartIndex + 2][15] = '/';
        
        // 倒数第2行：电线电缆
        data[footerStartIndex + 3][0] = '';
        data[footerStartIndex + 3][1] = '/';
        data[footerStartIndex + 3][2] = '电线电缆';
        data[footerStartIndex + 3][3] = '/';
        data[footerStartIndex + 3][4] = '/';
        data[footerStartIndex + 3][5] = '/';
        data[footerStartIndex + 3][6] = '套';
        data[footerStartIndex + 3][7] = '/';
        data[footerStartIndex + 3][8] = '/';
        data[footerStartIndex + 3][9] = '/';
        data[footerStartIndex + 3][10] = '/';
        data[footerStartIndex + 3][11] = '/';
        data[footerStartIndex + 3][12] = '/';
        data[footerStartIndex + 3][13] = '/';
        data[footerStartIndex + 3][14] = '/';
        data[footerStartIndex + 3][15] = '/';
        
        // 倒数第1行：合计 - ABC列合并
        data[footerStartIndex + 4][0] = '合计';
        data[footerStartIndex + 4][1] = '';
        data[footerStartIndex + 4][2] = '';
        data[footerStartIndex + 4][3] = '/';
        data[footerStartIndex + 4][4] = '/';
        data[footerStartIndex + 4][5] = '/';
        data[footerStartIndex + 4][6] = '/';
        data[footerStartIndex + 4][7] = '/';
        data[footerStartIndex + 4][8] = '/';
        data[footerStartIndex + 4][9] = '';
        data[footerStartIndex + 4][10] = '/';
        data[footerStartIndex + 4][11] = '/';
        data[footerStartIndex + 4][12] = '';
        data[footerStartIndex + 4][13] = '/';
        data[footerStartIndex + 4][14] = '';
        data[footerStartIndex + 4][15] = '/';
        
        return data;
    };
    
    // ========== 完整版边框配置 ==========
    window.getBorderConfig = function(footerStartRow = 15) {
        const borderInfo = [];
        
        // 表头A-P行（0-4行，0-15列）添加边框
        for (let row = 0; row <= 4; row++) {
            for (let col = 0; col <= 15; col++) {
                borderInfo.push({
                    "rangeType": "cell",
                    "value": {
                        "row_index": row,
                        "col_index": col,
                        "l": {"style": 1, "color": "#000000"},
                        "r": {"style": 1, "color": "#000000"},
                        "t": {"style": 1, "color": "#000000"},
                        "b": {"style": 1, "color": "#000000"}
                    }
                });
            }
        }
        
        // 表尾A-P行（动态位置，0-15列）添加边框
        for (let row = footerStartRow; row < footerStartRow + 5; row++) {
            for (let col = 0; col <= 15; col++) {
                borderInfo.push({
                    "rangeType": "cell",
                    "value": {
                        "row_index": row,
                        "col_index": col,
                        "l": {"style": 1, "color": "#000000"},
                        "r": {"style": 1, "color": "#000000"},
                        "t": {"style": 1, "color": "#000000"},
                        "b": {"style": 1, "color": "#000000"}
                    }
                });
            }
        }
        
        return borderInfo;
    };
    
    // 获取完整版数据行边框配置（A-P列所有边框）
    window.getDataBorderConfig = function(startRow, endRow) {
        const borderInfo = [];
        
        // 为数据行（从startRow到endRow-1）的A-P列（0-15列）添加边框
        for (let r = startRow; r < endRow; r++) {
            for (let c = 0; c < 16; c++) { // A-P列（0-15）
                borderInfo.push({
                    rangeType: "cell",
                    value: {
                        row_index: r,
                        col_index: c,
                        l: { style: 1, color: "#000000" },
                        r: { style: 1, color: "#000000" },
                        t: { style: 1, color: "#000000" },
                        b: { style: 1, color: "#000000" }
                    }
                });
            }
        }
        
        return borderInfo;
    };
    
    console.log('✅ 表格配置模块已加载');
})();

