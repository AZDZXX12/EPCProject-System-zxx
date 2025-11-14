/**
 * 閬楃暀浠ｇ爜妯″潡 - 瀹屾暣JavaScript浠ｇ爜
 * 鑷姩鎻愬彇鑷?dist/index.html
 */

(function() {
    'use strict';
    
    console.log('馃敡 姝ｅ湪鍔犺浇: 閬楃暀浠ｇ爜妯″潡...');


		// 强制设置为浏览器环境，避免 Electron 环境干扰
		window.module = undefined;
		window.exports = undefined;
	


		// 确保 jQuery 和 $ 全局可用
		if (typeof jQuery !== 'undefined') {
			window.jQuery = jQuery;
			window.$ = jQuery;
			console.log('✅ jQuery 已注册到全局:', jQuery.fn.jquery);
		} else {
			console.error('❌ jQuery 未定义！');
		}
	


		console.log('✅ 所有核心库加载完成');
		if (typeof $ !== 'undefined') {
			console.log('✅ jQuery 版本:', $.fn.jquery);
		}
		window.luckysheetLoaded = true;
	


		// 尝试加载ExcelJS（可选）
		(function() {
			const script = document.createElement('script');
			script.src = './libs/exceljs.min.js';
			script.onload = function() {
				console.log('✅ ExcelJS 加载成功！支持完整Excel格式导出');
				window.excelJSLoaded = true;
			};
			script.onerror = function() {
				console.warn('⚠️ ExcelJS未安装，将使用XLSX.js导出（格式简化）');
				console.info('💡 如需完整格式支持，请访问: src/libs/download-exceljs.html 下载ExcelJS');
				window.excelJSLoaded = false;
				
				// 显示提示信息（仅首次）
				if (!localStorage.getItem('exceljs-tip-shown')) {
					setTimeout(() => {
						const tip = document.createElement('div');
						tip.style.cssText = `
							position: fixed;
							top: 10px;
							right: 10px;
							background: #fff3cd;
							color: #856404;
							padding: 15px 20px;
							border: 1px solid #ffeeba;
							border-radius: 5px;
							box-shadow: 0 2px 10px rgba(0,0,0,0.2);
							z-index: 10000;
							max-width: 350px;
							font-size: 14px;
						`;
						tip.innerHTML = `
							<strong>💡 提示</strong><br>
							未检测到 ExcelJS 库，导出的 Excel 文件将缺少边框和样式。<br>
							<a href="./libs/download-exceljs.html" target="_blank" style="color: #004085; text-decoration: underline;">点击这里下载 ExcelJS</a>
							<button onclick="this.parentElement.remove(); localStorage.setItem('exceljs-tip-shown', '1');" style="float: right; margin-top: 5px; background: #856404; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">知道了</button>
						`;
						document.body.appendChild(tip);
					}, 2000);
				}
			};
			document.head.appendChild(script);
		})();
	


		// 定义空的 LuckyExcel 对象，避免报错
		window.LuckyExcel = {
			transformExcelToLucky: function(file, callback) {
				console.warn('⚠️ LuckyExcel 不可用，使用基础 XLSX 解析');
				// 直接调用原有的 loadExcelFile 函数
				const reader = new FileReader();
				reader.onload = function(e) {
					try {
					// 检查 XLSX 是否加载
					if (typeof XLSX === 'undefined') {
						console.error('❌ XLSX 库未加载，请等待或刷新页面');
						return;
					}
						const data = new Uint8Array(e.target.result);
						const workbook = XLSX.read(data, {type: 'array'});
						const sheetName = workbook.SheetNames[0];
						const worksheet = workbook.Sheets[sheetName];
						const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
						
						// ========== 🔍 识别Excel版本（回退方案也要识别）==========
						console.log('🔍 开始识别Excel文件版本（基础XLSX解析）...');
						let hasDeviceNumber = false;
						// 检查第4-5行（索引3-4）的B列
						if (jsonData.length > 3) {
							const row3 = jsonData[3] || [];
							const row4 = jsonData[4] || [];
							// 去除所有空格后再判断
							const b3 = String(row3[1] || '').replace(/\s+/g, '');
							const b4 = String(row4[1] || '').replace(/\s+/g, '');
							const b3Original = String(row3[1] || '').trim();
							const b4Original = String(row4[1] || '').trim();
							console.log(`  📋 第4行B列: "${b3Original}" (去空格后: "${b3}")`);
							console.log(`  📋 第5行B列: "${b4Original}" (去空格后: "${b4}")`);
							// 去除空格后检查，更准确
							if (b3.includes('设备位号') || b3.includes('位号') || b4.includes('设备位号') || b4.includes('位号')) {
								hasDeviceNumber = true;
							}
						}
						const isSimplified = !hasDeviceNumber;
						const version = isSimplified ? '简化版' : '完整版';
						console.log(`✅ 识别结果: ${version}`);
						console.log(`  - 是否有设备位号列: ${hasDeviceNumber ? '是' : '否'}`);
						const versionInfo = { isSimplified, version, expectedColumns: isSimplified ? 14 : 16 };
						
						// 裁剪数据：从第5行到"安装费"行之前（表头表尾之间）
						let endRow = jsonData.length;
						for (let i = 4; i < jsonData.length; i++) {
							const row = jsonData[i];
							if (row && row.some(cell => cell && cell.toString().includes('安装费'))) {
								endRow = i;
								break;
							}
						}
						const startRow = 5; // 从第6行开始（包含第6行）
						const filteredData = jsonData.slice(startRow, endRow);
						
						// 转换为Luckysheet celldata格式
						const celldata = [];
						const dynamicRowlen = {}; // 动态行高配置
						const dynamicColumnlen = {}; // 动态列宽配置
						
						// 智能计算行高：根据内容和列宽估算
						filteredData.forEach((row, r) => {
							let maxRowHeight = 25; // 最小行高25px
							
							row.forEach((cell, c) => {
                                // 跳过A列（序号列）读取，由程序生成
                                if (c === 0) return;
								
								// 读取原始列宽
								const originalColWidth = worksheet['!cols'] && worksheet['!cols'][c] ? worksheet['!cols'][c].wpx : null;
								if (originalColWidth && !dynamicColumnlen[c]) {
									dynamicColumnlen[c] = originalColWidth;
								}
								
								// 根据单元格内容和列宽估算所需行高
								if (cell !== undefined && cell !== null && cell !== '') {
									const cellText = String(cell);
									const textLength = cellText.length;
									
									// 获取该列宽度（默认值）
									const colWidth = dynamicColumnlen[c] || (c === 4 ? 200 : c === 2 ? 140 : 80);
									
									// 估算每行能容纳的字符数（中文字符约10px宽）
									const charsPerLine = Math.floor(colWidth / 10);
									
									// 计算需要的行数
									const linesNeeded = Math.ceil(textLength / charsPerLine);
									
									// 每行约20px高度，加上8px的padding
									const estimatedHeight = Math.max(25, linesNeeded * 20 + 8);
									
									maxRowHeight = Math.max(maxRowHeight, estimatedHeight);
									
									celldata.push({
										r: r + startRow, // 数据从第6行开始（索引5）
										c: c,
										v: {
											v: cell,
											m: cell.toString(),
											ct: {fa: "General", t: "g"},
											ff: "SimSun", // 宋体
											fs: 10, // 数据字体10号
											ht: (c === 4) ? 1 : 0, // E列左对齐，其他居中
											vt: 0, // 垂直居中
											tb: 2 // 自动换行
										}
									});
								}
							});
							
							// 设置该行的行高，最大不超过150px（避免过高）
							dynamicRowlen[startRow + r] = Math.min(maxRowHeight, 150);
						});
						
						// 重新创建完整的 Luckysheet 实例，保留表头表尾
						luckysheet.destroy();
						// 减少延迟，提升加载速度
						setTimeout(() => {
							// 根据版本创建对应的表头表尾数据
							const headerData = versionInfo.isSimplified ? createSimplifiedTableHeader() : createTableHeader();
							console.log(`📋 使用${versionInfo.version}表头模板`);
							const allCelldata = [];
							
							// 计算表尾位置：表头(5行) + 加载数据行数，表尾紧接数据
							const dataRowCount = filteredData.length;
							const footerStartRow = 5 + dataRowCount; // 表尾开始行（数据从第5行开始，表尾紧接数据后）
							console.log(`🔍 调试信息: 数据行数=${dataRowCount}, 表尾开始行=${footerStartRow}`);
							
							// 重新计算表头表尾位置
							const adjustedHeaderData = [];
							
							// 添加表头数据（前5行保持不变）
							for (let r = 0; r < 5; r++) {
								adjustedHeaderData[r] = headerData[r];
							}
							
							// 添加表尾数据（根据数据行数调整位置）
							for (let r = 15; r < 20; r++) {
								const newRowIndex = footerStartRow + (r - 15);
								adjustedHeaderData[newRowIndex] = headerData[r];
							}
							
						// 添加表头表尾数据（并设置合并单元格mc属性）
							adjustedHeaderData.forEach((row, r) => {
								if (row) {
									row.forEach((cell, c) => {
									// 表尾"合计"行即使为空字符串也要添加，因为有合并单元格
									const isFooterMergeCell = (r === footerStartRow + 4 && (c === 0 || c === 1 || c === 2));
									if ((cell !== undefined && cell !== null && cell !== '') || isFooterMergeCell) {
											let fontSize = 12; // 默认12号字体
										let fontWeight = (r <= 4) ? 1 : 0; // 只有表头粗体，表尾不加粗
										let horizontalAlign = 0; // 默认居中
											
											// 根据特殊位置调整字体大小
										if (r === 0 && c === 0) { // 公司名称（ABCD合并）
												fontSize = 14;
										} else if (r === 0 && c === 4) { // 设备一览表（EFG合并）
												fontSize = 20;
											}
											
						// E列对齐方式：表头表尾居中，数据区域左对齐
						if (c === 4) {
							if (r <= 4 || r >= footerStartRow) {
								horizontalAlign = 0; // 表头表尾E列居中
							} else {
								horizontalAlign = 1; // 数据区域E列左对齐
							}
						}
						
						// 表尾字体大小特殊处理
						if (r >= footerStartRow) {
							fontSize = 10; // 表尾10号字体
							fontWeight = 0; // 表尾不加粗
						}
						
						// 构建单元格对象
						const cellValue = (cell === undefined || cell === null) ? '' : cell;
						const cellObj = {
												r: r, c: c,
												v: {
												v: cellValue, 
												m: cellValue.toString(), 
												ct: {fa: "General", t: "g"},
												bg: null, bl: fontWeight, it: 0, ff: "SimSun", fs: fontSize,
													fc: "rgb(51, 51, 51)",
												ht: horizontalAlign,
													vt: 0, tb: 2
												}
										};
										
										// 为表尾合计行ABC列添加合并单元格mc属性
										if (r === footerStartRow + 4 && c === 0) {
											cellObj.v.mc = {r: footerStartRow + 4, c: 0, rs: 1, cs: 3};
											cellObj.v.v = '合计'; // 确保显示"合计"
											cellObj.v.m = '合计';
										} else if (r === footerStartRow + 4 && (c === 1 || c === 2)) {
											cellObj.v.mc = {r: footerStartRow + 4, c: 0}; // 被合并的单元格
										}
										
										allCelldata.push(cellObj);
										}
									});
								}
							});
							
							// 添加加载的数据（除E列外居中显示）
							celldata.forEach(item => {
								if (item.v) {
									// 确保数据格式不受表头表尾影响
									if (item.r >= 5 && item.r < footerStartRow) {
										item.v.fs = 10; // 数据字体10号
										item.v.ht = (item.c === 4) ? 1 : 0; // E列左对齐，其他居中
										item.v.vt = 0;
										item.v.bl = 0; // 数据区域不加粗
										item.v.tb = 2; // 自动换行
										item.v.ff = "SimSun"; // 宋体
									}
									// 表尾数据特殊处理
									else if (item.r >= footerStartRow) {
										item.v.fs = 10; // 表尾字体10号
										item.v.ht = 0; // 表尾居中对齐
										item.v.vt = 0;
										item.v.bl = 0; // 表尾不加粗
										item.v.tb = 2; // 自动换行
										item.v.ff = "SimSun"; // 宋体
									}
								}
								allCelldata.push(item);
							});
							
							// 为A列生成序号：数据区 + 表尾前4行连续编号，合计行显示"合计"
							let serial = 1;
							// 数据区编号（第6行到"安装费"之前）
							for (let r = 5; r < footerStartRow; r++) {
								allCelldata.push({
									r: r,
									c: 0,
									v: { v: serial, m: String(serial), ct: {fa: "General", t: "n"},
										bg: null, bl: 0, it: 0, ff: "SimSun", fs: 10, fc: "rgb(51, 51, 51)", ht: 0, vt: 0, tb: 2 }
								});
								serial++;
							}
							// 表尾前4行继续编号（安装费、钢材用量、电器材料、电线电缆）
							for (let i = 0; i < 4; i++) {
								allCelldata.push({
									r: footerStartRow + i,
									c: 0,
									v: { v: serial, m: String(serial), ct: {fa: "General", t: "n"},
										bg: null, bl: 0, it: 0, ff: "SimSun", fs: 10, fc: "rgb(51, 51, 51)", ht: 0, vt: 0, tb: 2 }
								});
								serial++;
							}
							// 合计行A列显示"合计"
							allCelldata.push({
								r: footerStartRow + 4,
								c: 0,
								v: { v: '合计', m: '合计', ct: {fa: "General", t: "g"},
									bg: null, bl: 0, it: 0, ff: "SimSun", fs: 10, fc: "rgb(51, 51, 51)", ht: 0, vt: 0, tb: 2 }
							});
							
							// 创建动态合并配置，避免配置错误
							// 根据版本选择合并配置
							const dynamicMergeConfig = versionInfo.isSimplified ? {
						// 简化版（14列）
						"0_0": {r: 0, c: 0, rs: 3, cs: 3}, "0_3": {r: 0, c: 3, rs: 3, cs: 3},
						"0_6": {r: 0, c: 6, rs: 1, cs: 2}, "1_6": {r: 1, c: 6, rs: 1, cs: 2}, "2_6": {r: 2, c: 6, rs: 1, cs: 2},
						"0_8": {r: 0, c: 8, rs: 1, cs: 3}, "1_8": {r: 1, c: 8, rs: 1, cs: 3}, "2_8": {r: 2, c: 8, rs: 1, cs: 3},
						// L列独立，M/N列不合并（各自独立）
						"3_0": {r: 3, c: 0, rs: 2, cs: 1}, "3_1": {r: 3, c: 1, rs: 2, cs: 1}, "3_2": {r: 3, c: 2, rs: 2, cs: 1},
							"3_3": {r: 3, c: 3, rs: 2, cs: 1}, "3_4": {r: 3, c: 4, rs: 2, cs: 1}, "3_5": {r: 3, c: 5, rs: 2, cs: 1},
						"3_6": {r: 3, c: 6, rs: 1, cs: 2}, "3_8": {r: 3, c: 8, rs: 2, cs: 1}, "3_9": {r: 3, c: 9, rs: 1, cs: 2},
						"3_11": {r: 3, c: 11, rs: 1, cs: 2}, "3_13": {r: 3, c: 13, rs: 2, cs: 1}
							} : {
								// 完整版（16列）
								"0_0": {r: 0, c: 0, rs: 3, cs: 4}, "0_4": {r: 0, c: 4, rs: 3, cs: 3},
								"0_7": {r: 0, c: 7, rs: 1, cs: 2}, "1_7": {r: 1, c: 7, rs: 1, cs: 2}, "2_7": {r: 2, c: 7, rs: 1, cs: 2},
								"0_9": {r: 0, c: 9, rs: 1, cs: 4}, "1_9": {r: 1, c: 9, rs: 1, cs: 4}, "2_9": {r: 2, c: 9, rs: 1, cs: 4},
								"0_14": {r: 0, c: 14, rs: 1, cs: 2}, "1_14": {r: 1, c: 14, rs: 1, cs: 2}, "2_14": {r: 2, c: 14, rs: 1, cs: 2},
								"3_0": {r: 3, c: 0, rs: 2, cs: 1}, "3_1": {r: 3, c: 1, rs: 2, cs: 1}, "3_2": {r: 3, c: 2, rs: 2, cs: 1},
								"3_3": {r: 3, c: 3, rs: 2, cs: 1}, "3_4": {r: 3, c: 4, rs: 2, cs: 1}, "3_5": {r: 3, c: 5, rs: 2, cs: 1},
								"3_6": {r: 3, c: 6, rs: 2, cs: 1}, "3_7": {r: 3, c: 7, rs: 2, cs: 1}, "3_8": {r: 3, c: 8, rs: 1, cs: 2},
								"3_10": {r: 3, c: 10, rs: 2, cs: 1}, "3_11": {r: 3, c: 11, rs: 1, cs: 2}, "3_13": {r: 3, c: 13, rs: 1, cs: 2},
								"3_15": {r: 3, c: 15, rs: 2, cs: 1}
							};
							
							// 表尾合计行ABC动态合并
							dynamicMergeConfig[`${footerStartRow + 4}_0`] = { r: footerStartRow + 4, c: 0, rs: 1, cs: 3 };
							
							// 为表尾行设置适当的行高
							for (let i = 0; i < 5; i++) {
								dynamicRowlen[footerStartRow + i] = 28; // 表尾行高28
							}
							
							const totalRows = Math.max(footerStartRow + 5, 84);
							
							const options = {
								container: 'luckysheet', lang: 'zh', title: '设备参数选型',
								showinfobar: false, showtoolbar: true,
								showtoolbarConfig: {
									undoRedo: false, paintFormat: true, currencyFormat: false,
									percentageFormat: false, numberDecrease: false, numberIncrease: false,
									moreFormats: true, font: true, fontSize: true, bold: true, italic: true,
									strikethrough: true, underline: true, textColor: true, fillColor: true,
									border: true, mergeCell: true, horizontalAlignMode: true, verticalAlignMode: true,
									textWrapMode: true, textRotateMode: true, image: true, link: true, chart: true,
									postil: false, pivotTable: false, function: true, frozenMode: true,
									sortAndFilter: true, conditionalFormat: true, dataVerification: true,
									splitColumn: false, screenshot: false, findAndReplace: true, protection: true, print: true
								},
						data: [
						// 根据识别结果创建对应版本的sheet
						{
				name: `设备参数选型（${versionInfo.version}）`,
				color: versionInfo.isSimplified ? "#70ad47" : "#5b9bd5",  // 简化版绿色，完整版蓝色
									config: { 
										merge: dynamicMergeConfig, 
										borderInfo: versionInfo.isSimplified ? 
											[...getSimplifiedBorderConfig(footerStartRow), ...getSimplifiedDataBorderConfig(5, footerStartRow)] : 
											[...getBorderConfig(footerStartRow), ...getDataBorderConfig(5, footerStartRow)],
										columnlen: versionInfo.isSimplified ? 
											{ ...dynamicColumnlen, '0': 35, '1': 115, '2': 80, '3': 200, '4': 50, '5': 50, '6': 40, '7': 40, '8': 60, '9': 60, '10': 60, '11': 60, '12': 60, '13': 60 } :
											{ ...dynamicColumnlen, '0': 50, '1': 40, '2': 140, '3': 80, '4': 200, '5': 80, '6': 50, '7': 50, '8': 40, '9': 40, '10': 70, '11': 60, '12': 60, '13': 60, '14': 60, '15': 80 },
										rowlen: {...dynamicRowlen, '0': 35, '1': 35, '2': 35, '3': 28, '4': 28}
									},
									index: "0", zoomRatio: 1, order: 0, status: 1, row: totalRows, column: 60,
									celldata: allCelldata
								}
							]
							};
							
							luckysheet.create(options);
							
							// 保存表尾位置到全局变量，供序号刷新使用
							window.currentFooterStartRow = footerStartRow;
							// 保存版本信息到全局变量，供详情页回写使用
							window.currentSheetVersion = versionInfo;
							console.log(`✅ 版本信息已保存到全局变量: ${versionInfo.version}`);
							
				// 强制刷新，确保E列左对齐立即生效
				setTimeout(() => {
					luckysheet.refresh();
					console.log('✅ 已强制刷新E列样式');
				}, 50);
							
					// 初始化序号
					setTimeout(() => {
						refreshSerialNumbers(5, footerStartRow);
						
					// 只监听行的增删事件，不监听单元格更新（避免循环）
					// 注意：hook已在主初始化中注册，这里不再重复注册
					console.log('✅ 序号初始化完成（hook已全局注册）');
					}, 100);
							
							console.log(`✅ 数据加载完成，表尾位置：第${footerStartRow + 1}行，总行数：${totalRows}`);
							
							// 数据加载完成后，添加公式并更新设备列表
							setTimeout(() => {
								// 添加计算公式（只添加一次）
								if (typeof addFormulasToAllRows === 'function' && !window.formulasAdded) {
									console.log('📐 Excel数据加载完成，添加计算公式');
									window.formulasAdded = true;
									addFormulasToAllRows();
								}
								
								// 更新设备列表
								if (typeof updateDeviceListFromTable === 'function') {
									console.log('📊 Excel数据加载完成，更新设备列表');
									updateDeviceListFromTable();
								}
							}, 1000);
						}, 100);
					} catch (error) {
						console.error('Excel解析失败:', error);
					}
				};
				reader.readAsArrayBuffer(file);
			}
		};
	


		(function() {
			const script = document.createElement('script');
			script.src = 'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js';
			script.onload = function() {
				console.log('✅ XLSX 加载成功（CDN）');
				window.xlsxLoaded = true;
			};
			script.onerror = function() {
				console.error('❌ XLSX 加载失败（CDN连接失败）');
				window.xlsxLoaded = false;
				// 提示用户检查网络连接
				alert('⚠️ XLSX库加载失败\n\n可能原因：\n1. 网络连接问题\n2. CDN服务不可用\n\n请检查网络连接后刷新页面。');
			};
			document.head.appendChild(script);
		})();
	


		// 全局变量
		let deviceDatabase = {};
		let currentDeviceList = [];
		let isDetailPanelCollapsed = false;
		
		// 设置DOM监听器，实时监控并应用居中样式
		function setupAlignmentObserver() {
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
						// 检查是否有新的单元格被添加
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
		}
		
		// 立即应用居中对齐的函数
		function applyImmediateAlignment() {
			const headerFooterRows = [0, 1, 2, 3, 4, 15, 16, 17, 18, 19];
			
			// 查找所有可能的单元格元素
			const cellElements = document.querySelectorAll('#luckysheet [data-row]');
			
			cellElements.forEach(cell => {
				const row = parseInt(cell.getAttribute('data-row'));
				if (headerFooterRows.includes(row)) {
					// 强制设置居中样式
					cell.style.setProperty('text-align', 'center', 'important');
					cell.style.setProperty('vertical-align', 'middle', 'important');
					cell.style.setProperty('display', 'flex', 'important');
					cell.style.setProperty('align-items', 'center', 'important');
					cell.style.setProperty('justify-content', 'center', 'important');
					
					// 处理所有子元素
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
		
		// 简化的表头表尾居中对齐函数
		function setHeaderFooterAlignment() {
			try {
				console.log('🎯 开始设置表头表尾居中对齐');
				
				// 等待Luckysheet完全渲染
				const luckysheetContainer = document.getElementById('luckysheet');
				if (!luckysheetContainer) {
					console.warn('⚠️ Luckysheet容器未找到，稍后重试');
					return;
				}
				
				// 使用最通用的选择器查找所有表格单元格
				const allCells = luckysheetContainer.querySelectorAll('td, div[data-row], [class*="cell"]');
				console.log(`📋 找到 ${allCells.length} 个可能的单元格元素`);
				
				if (allCells.length === 0) {
					console.warn('⚠️ 未找到任何单元格元素，Luckysheet可能未完全加载');
					return;
				}
				
				// 表头行（0-4行）和表尾行（15-19行）
				const headerFooterRows = [0, 1, 2, 3, 4, 15, 16, 17, 18, 19];
				let processedCount = 0;
				
				// 遍历所有找到的元素
				allCells.forEach((cell, index) => {
					try {
						const row = cell.getAttribute('data-row') || 
									cell.getAttribute('r') || 
									cell.parentElement?.getAttribute('data-row');
						
						if (row !== null && headerFooterRows.includes(parseInt(row))) {
							// 强制设置居中样式
							cell.style.setProperty('text-align', 'center', 'important');
							cell.style.setProperty('vertical-align', 'middle', 'important');
							
							// 处理内部所有文本元素
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
						// 忽略单个单元格的错误，继续处理其他单元格
					}
				});
				
				console.log(`✅ 表头表尾居中对齐设置完成，处理了 ${processedCount} 个单元格`);
			} catch (error) {
				console.error('❌ 设置表头表尾居中对齐失败:', error);
			}
		}
		
	// 简化版边框配置函数（只到N列，即0-13列）
	function getSimplifiedBorderConfig(footerStartRow) {
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
	}
	
	// 简化版数据区边框配置函数（只到N列）
	function getSimplifiedDataBorderConfig(dataStartRow, footerStartRow) {
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
	}
	
	// 创建简化版表头（根据截图调整）
	function createSimplifiedTableHeader() {
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
		
	// 表头内容（新列映射，共14列 A-N）
	// 第1-3行：
	// ABC: 公司名称（1-3行合并）
	// DEF: 设备一览表（1-3行合并）
	// GH: 项目名称/子项名称/项目编号（按行横向合并）
	// IJK: 空白（按行横向合并）
	// L: 编制/校核/审核（单列）
	// MN: 空白（按行横向合并）
	// 第4-5行：
	// A-F: 纵向合并（序号/设备名称/规格型号/技术参数/单位/数量）
	// GH: 电机数量 单/总（横向合并）
	// I: 电机功率(KW)（4-5行合并）
	// JK: 设备功率(KW) 单/总（横向合并）
	// LM: 价格(万元) 单/总（横向合并）
	// N: 备注（4-5行合并）

// ABC列（0-2列）1-3行合并显示公司名称（换行显示，16号字体）
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
	
// DEF列（3-5列）1-3行合并显示设备一览表（20号字体）
data[0][3] = '设备一览表';
	
	// GH列（6-7列）1-3行各自横向合并
	data[0][6] = '项目名称';
	data[1][6] = '子项名称';
	data[2][6] = '项目编号';
	
	// I-K列（8-10列）1-3行各自横向合并（空着）
	// 留空
	
	// 🔥 修复：L列（11列）1-3行显示编制/校核/审核
	data[0][11] = '编制';
	data[1][11] = '校核';
	data[2][11] = '审核';
	
	// MN列（12-13列）1-3行各自横向合并（空着）
	// 留空
		
		// 第4-5行表头（14列 A-N）
		data[3][0] = '序号';          // A列（4-5行合并）
		data[4][0] = '';              // A列第5行（被合并）
		data[3][1] = '设备名称';       // B列（4-5行合并）
		data[4][1] = '';              // B列第5行（被合并）
		data[3][2] = '规格型号';       // C列（4-5行合并）
		data[4][2] = '';              // C列第5行（被合并）
		data[3][3] = '技术参数及要求'; // D列（4-5行合并）
		data[4][3] = '';              // D列第5行（被合并）
		data[3][4] = '单位';           // E列（4-5行合并）
		data[4][4] = '';              // E列第5行（被合并）
		data[3][5] = '数量';           // F列（4-5行合并）
		data[4][5] = '';              // F列第5行（被合并）
		data[3][6] = '电机数量';       // G-H列大标题
		data[4][6] = '单';             // G列小标题
		data[4][7] = '总';             // H列小标题
		data[3][8] = '电机功率(KW)';   // I列（4-5行合并）
		data[4][8] = '';              // I列第5行（被合并）
		data[3][9] = '设备功率(KW)';   // J-K列大标题
		data[4][9] = '单';             // J列小标题
		data[4][10] = '总';            // K列小标题
		data[3][11] = '价格（万元）';  // L-M列大标题
	data[4][11] = '单';            // L列小标题（12号字）
	data[4][12] = '总';            // M列小标题（12号字）
		data[3][13] = '备注';          // N列（4-5行合并）
		data[4][13] = '';             // N列第5行（被合并）
		
		// 表尾（15-19行）- 根据截图（14列 A-N）
		// 第15行：安装费
		data[15][0] = '';          // A列：序号（空）
		data[15][1] = '安装费';     // B列：设备名称
		data[15][2] = '/';         // C列：规格型号
		data[15][3] = '/';         // D列：技术参数
		data[15][4] = '套';        // E列：单位
		data[15][5] = '/';         // F列：数量
		data[15][6] = '/';         // G列：电机数量-单
		data[15][7] = '/';         // H列：电机数量-总
		data[15][8] = '/';         // I列：电机功率-单
		data[15][9] = '/';         // J列：电机功率-总
		data[15][10] = '/';        // K列：设备功率-单
		data[15][11] = '/';        // L列：设备功率-总
		data[15][12] = '/';        // M列：价格-单
		data[15][13] = '/';        // N列：价格-总
		
		// 第16行：钢材用量
		data[16][0] = '';
		data[16][1] = '钢材用量';
		data[16][2] = '/';
		data[16][3] = '/';
		data[16][4] = '吨';
		data[16][5] = '/';
		data[16][6] = '/';
		data[16][7] = '/';
		data[16][8] = '/';
		data[16][9] = '/';
		data[16][10] = '/';
		data[16][11] = '/';
		data[16][12] = '/';
		data[16][13] = '/';
		
		// 第17行：电器材料
		data[17][0] = '';
		data[17][1] = '电器材料';
		data[17][2] = '/';
		data[17][3] = '/';
		data[17][4] = '套';
		data[17][5] = '/';
		data[17][6] = '/';
		data[17][7] = '/';
		data[17][8] = '/';
		data[17][9] = '/';
		data[17][10] = '/';
		data[17][11] = '/';
		data[17][12] = '/';
		data[17][13] = '/';
		
		// 第18行：电线电缆
		data[18][0] = '';
		data[18][1] = '电线电缆';
		data[18][2] = '/';
		data[18][3] = '/';
		data[18][4] = '套';
		data[18][5] = '/';
		data[18][6] = '/';
		data[18][7] = '/';
		data[18][8] = '/';
		data[18][9] = '/';
		data[18][10] = '/';
		data[18][11] = '/';
		data[18][12] = '/';
		data[18][13] = '/';
		
	// 第19行：合计（AB合并）
	data[19][0] = '合计';       // A列：合计（AB合并的主单元格）
	data[19][1] = '';           // B列：被合并
	data[19][2] = '/';          // C列
	data[19][3] = '/';          // D列
	data[19][4] = '/';          // E列
	data[19][5] = '';           // F列：空
	data[19][6] = '/';          // G列
	data[19][7] = 0;            // H列：电机数量合计-总
	data[19][8] = '/';          // I列：电机功率
	data[19][9] = '/';          // J列：/
	data[19][10] = 0;           // K列：设备功率合计-总
	data[19][11] = '/';         // L列：价格-单（/）
	data[19][12] = '';          // M列：价格-总（空，保留求和公式）
	data[19][13] = '/';         // N列：备注（/）
		
		return data;
		}
		
		// 页面加载完成后初始化
		$(document).ready(function () {
			// 创建表头表尾数据
			const headerData = createTableHeader();
			const celldata = [];
			
			// 转换为Luckysheet格式
			headerData.forEach((row, r) => {
				row.forEach((cell, c) => {
					if (cell !== undefined && cell !== null && cell !== '') {
						let fontSize = 12; // 统一12号字体
						let fontWeight = 0; // 0=normal, 1=bold
						
						// 根据行位置设置字体大小和粗细
					if (r === 0 && c === 0) { // 公司名称（ABCD合并）
							fontSize = 14;
							fontWeight = 1;
					} else if (r === 0 && c === 4) { // 设备一览表（EFG合并）
							fontSize = 20;
							fontWeight = 1;
						} else if (r <= 4) { // 其他表头行
							fontSize = 12;
							fontWeight = 1;
						} else if (r >= 15) { // 表尾行 - 不加粗
							fontSize = 10; // 表尾10号字体
							fontWeight = 0; // 表尾不加粗
						}
						
						let cellObj = {
							r: r,
							c: c,
							v: {
								v: cell,
								m: cell.toString(),
								ct: {fa: "General", t: "g"},
								bg: null,
								bl: fontWeight,
								it: 0,
								ff: "SimSun", // 宋体
								fs: fontSize,
								fc: "rgb(51, 51, 51)",
								ht: (c === 4 && r > 4 && r < 15) ? 1 : 0, // 只有数据区域E列左对齐，其他都居中
								vt: 0, // 垂直居中 (0=居中, 1=顶部对齐, 2=底部对齐)
								tb: 2, // 文本换行 (0=不换行, 1=溢出, 2=自动换行)
								tr: 0  // 文本旋转角度
							}
						};
						
					// 设置合并单元格的mc属性 - 完整版
					// 公司名称 A1:D3 (0,0 to 2,3) - 完整版
						if (r === 0 && c === 0) {
						cellObj.v.mc = {r: 0, c: 0, rs: 3, cs: 4};
					} else if ((r >= 0 && r <= 2) && (c >= 0 && c <= 3) && !(r === 0 && c === 0)) {
							cellObj.v.mc = {r: 0, c: 0};
						}
					// 设备一览表 E1:G3 (0,4 to 2,6) - 完整版
					else if (r === 0 && c === 4) {
						cellObj.v.mc = {r: 0, c: 4, rs: 3, cs: 3};
					} else if ((r >= 0 && r <= 2) && (c >= 4 && c <= 6) && !(r === 0 && c === 4)) {
						cellObj.v.mc = {r: 0, c: 4};
					}
					// HI列按行合并：项目名称/子项名称/项目编号（完整版）
					else if (r === 0 && c === 7) {
						cellObj.v.mc = {r: 0, c: 7, rs: 1, cs: 2};
					} else if (r === 0 && c === 8) {
						cellObj.v.mc = {r: 0, c: 7};
						} else if (r === 1 && c === 7) {
						cellObj.v.mc = {r: 1, c: 7, rs: 1, cs: 2};
						} else if (r === 1 && c === 8) {
						cellObj.v.mc = {r: 1, c: 7};
					} else if (r === 2 && c === 7) {
						cellObj.v.mc = {r: 2, c: 7, rs: 1, cs: 2};
						} else if (r === 2 && c === 8) {
						cellObj.v.mc = {r: 2, c: 7};
					}
					// J-M列（9-12）在第1-3行按行横向合并（完整版）
					else if (r === 0 && c === 9) {
						cellObj.v.mc = {r: 0, c: 9, rs: 1, cs: 4};
					} else if (r === 0 && (c >= 10 && c <= 12)) {
						cellObj.v.mc = {r: 0, c: 9};
					} else if (r === 1 && c === 9) {
						cellObj.v.mc = {r: 1, c: 9, rs: 1, cs: 4};
					} else if (r === 1 && (c >= 10 && c <= 12)) {
						cellObj.v.mc = {r: 1, c: 9};
					} else if (r === 2 && c === 9) {
						cellObj.v.mc = {r: 2, c: 9, rs: 1, cs: 4};
					} else if (r === 2 && (c >= 10 && c <= 12)) {
						cellObj.v.mc = {r: 2, c: 9};
					}
					// O-P列按行横向合并（完整版）
						else if (r === 0 && c === 14) {
							cellObj.v.mc = {r: 0, c: 14, rs: 1, cs: 2};
						} else if (r === 0 && c === 15) {
							cellObj.v.mc = {r: 0, c: 14};
						} else if (r === 1 && c === 14) {
							cellObj.v.mc = {r: 1, c: 14, rs: 1, cs: 2};
						} else if (r === 1 && c === 15) {
							cellObj.v.mc = {r: 1, c: 14};
						} else if (r === 2 && c === 14) {
							cellObj.v.mc = {r: 2, c: 14, rs: 1, cs: 2};
						} else if (r === 2 && c === 15) {
							cellObj.v.mc = {r: 2, c: 14};
						}
						// 表头字段合并 (第4-5行)
						else if (r === 3 && (c >= 0 && c <= 7)) {
							cellObj.v.mc = {r: 3, c: c, rs: 2, cs: 1};
						} else if (r === 4 && (c >= 0 && c <= 7)) {
							cellObj.v.mc = {r: 3, c: c};
						}
						// 电机数量 I4:J4 (横向合并)
						else if (r === 3 && c === 8) {
							cellObj.v.mc = {r: 3, c: 8, rs: 1, cs: 2};
						} else if (r === 3 && c === 9) {
							cellObj.v.mc = {r: 3, c: 8};
						}
						// 电机功率 K4:K5 (纵向合并)
						else if (r === 3 && c === 10) {
							cellObj.v.mc = {r: 3, c: 10, rs: 2, cs: 1};
						} else if (r === 4 && c === 10) {
							cellObj.v.mc = {r: 3, c: 10};
						}
						// 设备功率 L4:M4 (横向合并)
						else if (r === 3 && c === 11) {
							cellObj.v.mc = {r: 3, c: 11, rs: 1, cs: 2};
						} else if (r === 3 && c === 12) {
							cellObj.v.mc = {r: 3, c: 11};
						}
						// 价格 N4:O4 (横向合并)
						else if (r === 3 && c === 13) {
							cellObj.v.mc = {r: 3, c: 13, rs: 1, cs: 2};
						} else if (r === 3 && c === 14) {
							cellObj.v.mc = {r: 3, c: 13};
						}
						// 备注 P4:P5 (纵向合并)
						else if (r === 3 && c === 15) {
							cellObj.v.mc = {r: 3, c: 15, rs: 2, cs: 1};
						} else if (r === 4 && c === 15) {
							cellObj.v.mc = {r: 3, c: 15};
						}
						// 表尾合计行ABC列合并（动态）
						else if (typeof footerStartRow !== 'undefined' && r === footerStartRow + 4 && c === 0) {
							cellObj.v.mc = {r: footerStartRow + 4, c: 0, rs: 1, cs: 3};
						} else if (typeof footerStartRow !== 'undefined' && r === footerStartRow + 4 && (c === 1 || c === 2)) {
							cellObj.v.mc = {r: footerStartRow + 4, c: 0};
						}
						
						celldata.push(cellObj);
					}
				});
			});
			
			// ========== 生成简化版 Sheet 数据 ==========
			const simplifiedHeaderData = createSimplifiedTableHeader();
			const simplifiedCelldata = [];
			
			// 转换为Luckysheet格式
			simplifiedHeaderData.forEach((row, r) => {
				row.forEach((cell, c) => {
					if (cell !== undefined && cell !== null && cell !== '') {
						let fontSize = 12;
						let fontWeight = 0;
						
						if (r === 0 && c === 0) {
							fontSize = 14;
							fontWeight = 1;
						} else if (r === 0 && c === 3) {  // 设备一览表在D列（索引3），字号20
							fontSize = 20;
							fontWeight = 1;
						} else if (r <= 4) {
							fontSize = 12;
							fontWeight = 1;
						} else if (r >= 15) {
							fontSize = 10;
							fontWeight = 0;
						}
						
						let cellObj = {
							r: r,
							c: c,
							v: {
								v: cell,
								m: cell.toString(),
								ct: {fa: "General", t: "g"},
								bg: null,
								bl: fontWeight,
								it: 0,
								ff: "SimSun",
								fs: fontSize,
								fc: "rgb(51, 51, 51)",
								ht: (c === 3 && r > 4 && r < 15) ? 1 : 0, // D列(技术参数)左对齐
								vt: 0,
								tb: 2,
								tr: 0
							}
						};
						
				// 简化版合并单元格 mc 属性
				// 公司名称 A1:C3
				if (r === 0 && c === 0) {
					cellObj.v.mc = {r: 0, c: 0, rs: 3, cs: 3};
				} else if ((r >= 0 && r <= 2) && (c >= 0 && c <= 2) && !(r === 0 && c === 0)) {
					cellObj.v.mc = {r: 0, c: 0};
				}
			// 设备一览表 D1:F3
			else if (r === 0 && c === 3) {
				cellObj.v.mc = {r: 0, c: 3, rs: 3, cs: 3};
			} else if ((r >= 0 && r <= 2) && (c >= 3 && c <= 5) && !(r === 0 && c === 3)) {
				cellObj.v.mc = {r: 0, c: 3};
			}
		// GH列按行合并
		else if (r === 0 && c === 6) {
			cellObj.v.mc = {r: 0, c: 6, rs: 1, cs: 2};
		} else if (r === 0 && c === 7) {
			cellObj.v.mc = {r: 0, c: 6};
		} else if (r === 1 && c === 6) {
			cellObj.v.mc = {r: 1, c: 6, rs: 1, cs: 2};
		} else if (r === 1 && c === 7) {
			cellObj.v.mc = {r: 1, c: 6};
		} else if (r === 2 && c === 6) {
			cellObj.v.mc = {r: 2, c: 6, rs: 1, cs: 2};
		} else if (r === 2 && c === 7) {
			cellObj.v.mc = {r: 2, c: 6};
		}
		// IJK列按行合并
		else if (r === 0 && c === 8) {
			cellObj.v.mc = {r: 0, c: 8, rs: 1, cs: 3};
		} else if (r === 0 && (c === 9 || c === 10)) {
			cellObj.v.mc = {r: 0, c: 8};
		} else if (r === 1 && c === 8) {
			cellObj.v.mc = {r: 1, c: 8, rs: 1, cs: 3};
		} else if (r === 1 && (c === 9 || c === 10)) {
			cellObj.v.mc = {r: 1, c: 8};
		} else if (r === 2 && c === 8) {
			cellObj.v.mc = {r: 2, c: 8, rs: 1, cs: 3};
		} else if (r === 2 && (c === 9 || c === 10)) {
			cellObj.v.mc = {r: 2, c: 8};
		}
		// MN列按行合并
		else if (r === 0 && c === 12) {
			cellObj.v.mc = {r: 0, c: 12, rs: 1, cs: 2};
		} else if (r === 0 && c === 13) {
			cellObj.v.mc = {r: 0, c: 12};
		} else if (r === 1 && c === 12) {
			cellObj.v.mc = {r: 1, c: 12, rs: 1, cs: 2};
		} else if (r === 1 && c === 13) {
			cellObj.v.mc = {r: 1, c: 12};
		} else if (r === 2 && c === 12) {
			cellObj.v.mc = {r: 2, c: 12, rs: 1, cs: 2};
		} else if (r === 2 && c === 13) {
			cellObj.v.mc = {r: 2, c: 12};
		}
					// 表头字段合并（A-F列纵向合并）
					else if (r === 3 && (c >= 0 && c <= 5)) {
						cellObj.v.mc = {r: 3, c: c, rs: 2, cs: 1};
					} else if (r === 4 && (c >= 0 && c <= 5)) {
						cellObj.v.mc = {r: 3, c: c};
					}
				// 电机数量 G4:H4
				else if (r === 3 && c === 6) {
					cellObj.v.mc = {r: 3, c: 6, rs: 1, cs: 2};
				} else if (r === 3 && c === 7) {
					cellObj.v.mc = {r: 3, c: 6};
				}
				// I列：电机功率(KW)（4-5行合并）
				else if (r === 3 && c === 8) {
					cellObj.v.mc = {r: 3, c: 8, rs: 2, cs: 1};
				} else if (r === 4 && c === 8) {
					cellObj.v.mc = {r: 3, c: 8};
				}
				// 设备功率(KW) J4:K4
				else if (r === 3 && c === 9) {
					cellObj.v.mc = {r: 3, c: 9, rs: 1, cs: 2};
				} else if (r === 3 && c === 10) {
					cellObj.v.mc = {r: 3, c: 9};
				}
					// 价格（万元）L4:M4
					else if (r === 3 && c === 11) {
						cellObj.v.mc = {r: 3, c: 11, rs: 1, cs: 2};
					} else if (r === 3 && c === 12) {
						cellObj.v.mc = {r: 3, c: 11};
					}
					// N列：备注（4-5行合并）
					else if (r === 3 && c === 13) {
						cellObj.v.mc = {r: 3, c: 13, rs: 2, cs: 1};
					} else if (r === 4 && c === 13) {
						cellObj.v.mc = {r: 3, c: 13};
					}
					// 合计行AB合并（修改）
					else if (r === 19 && c === 0) {
						cellObj.v.mc = {r: 19, c: 0, rs: 1, cs: 2};
					} else if (r === 19 && c === 1) {
						cellObj.v.mc = {r: 19, c: 0};
					}
						
						simplifiedCelldata.push(cellObj);
					}
				});
			});
			
	// 简化版合并配置（14列 A-N）
	const simplifiedMergeConfig = {
		// 公司名称 A1:C3
		"0_0": {r: 0, c: 0, rs: 3, cs: 3},
		// 设备一览表 D1:F3
		"0_3": {r: 0, c: 3, rs: 3, cs: 3},
		// GH列按行合并
		"0_6": {r: 0, c: 6, rs: 1, cs: 2},
		"1_6": {r: 1, c: 6, rs: 1, cs: 2},
		"2_6": {r: 2, c: 6, rs: 1, cs: 2},
		// IJK列按行合并（空着）
		"0_8": {r: 0, c: 8, rs: 1, cs: 3},
		"1_8": {r: 1, c: 8, rs: 1, cs: 3},
		"2_8": {r: 2, c: 8, rs: 1, cs: 3},
	// L列独立（编制/校核/审核，不合并）
	// MN列1-3行各自横向合并
	"0_12": {r: 0, c: 12, rs: 1, cs: 2}, // M1:N1
	"1_12": {r: 1, c: 12, rs: 1, cs: 2}, // M2:N2
	"2_12": {r: 2, c: 12, rs: 1, cs: 2}, // M3:N3
			// 表头字段合并（第4-5行）
			"3_0": {r: 3, c: 0, rs: 2, cs: 1},  // A列：序号
			"3_1": {r: 3, c: 1, rs: 2, cs: 1},  // B列：设备名称
			"3_2": {r: 3, c: 2, rs: 2, cs: 1},  // C列：规格型号
			"3_3": {r: 3, c: 3, rs: 2, cs: 1},  // D列：技术参数及要求
			"3_4": {r: 3, c: 4, rs: 2, cs: 1},  // E列：单位
			"3_5": {r: 3, c: 5, rs: 2, cs: 1},  // F列：数量
			"3_6": {r: 3, c: 6, rs: 1, cs: 2},  // 电机数量 G4:H4
			"3_8": {r: 3, c: 8, rs: 2, cs: 1},  // I列：电机功率(KW)（4-5行合并）
			"3_9": {r: 3, c: 9, rs: 1, cs: 2},  // 设备功率(KW) J4:K4
			"3_11": {r: 3, c: 11, rs: 1, cs: 2}, // 价格（万元）L4:M4
			"3_13": {r: 3, c: 13, rs: 2, cs: 1}, // N列：备注（4-5行合并）
			// 合计行AB合并
			"19_0": {r: 19, c: 0, rs: 1, cs: 2}
		};
			
			// 设置合并单元格配置 - 完全按照参考代码
			const mergeConfig = {
                    // 公司名称 A1:D3（ABCD合并）
                    "0_0": {r: 0, c: 0, rs: 3, cs: 4},
                    // 设备一览表 E1:G3（EFG合并）
                    "0_4": {r: 0, c: 4, rs: 3, cs: 3},
                // HI列按行合并：项目名称/子项名称/项目编号（HI合并）
                "0_7": {r: 0, c: 7, rs: 1, cs: 2}, // H1:I1
                "1_7": {r: 1, c: 7, rs: 1, cs: 2}, // H2:I2
                "2_7": {r: 2, c: 7, rs: 1, cs: 2}, // H3:I3
                // J-M列（9-12）在第1-3行按行横向合并（JKLM合并）
                "0_9": {r: 0, c: 9, rs: 1, cs: 4}, // J1:M1
                "1_9": {r: 1, c: 9, rs: 1, cs: 4}, // J2:M2
                "2_9": {r: 2, c: 9, rs: 1, cs: 4}, // J3:M3
				// O-P列按行横向合并
				"0_14": {r: 0, c: 14, rs: 1, cs: 2}, // O1:P1
				"1_14": {r: 1, c: 14, rs: 1, cs: 2}, // O2:P2
				"2_14": {r: 2, c: 14, rs: 1, cs: 2}, // O3:P3
				// 表头字段合并 (第4-5行)
				"3_0": {r: 3, c: 0, rs: 2, cs: 1}, // 序号
				"3_1": {r: 3, c: 1, rs: 2, cs: 1}, // 设备位号
				"3_2": {r: 3, c: 2, rs: 2, cs: 1}, // 设备名称
				"3_3": {r: 3, c: 3, rs: 2, cs: 1}, // 规格型号
				"3_4": {r: 3, c: 4, rs: 2, cs: 1}, // 技术参数
				"3_5": {r: 3, c: 5, rs: 2, cs: 1}, // 材料
				"3_6": {r: 3, c: 6, rs: 2, cs: 1}, // 单位
				"3_7": {r: 3, c: 7, rs: 2, cs: 1}, // 数量
				"3_8": {r: 3, c: 8, rs: 1, cs: 2}, // 电机数量 I4:J4
				"3_10": {r: 3, c: 10, rs: 2, cs: 1}, // 电机功率 K4:K5
				"3_11": {r: 3, c: 11, rs: 1, cs: 2}, // 设备功率 L4:M4
				"3_13": {r: 3, c: 13, rs: 1, cs: 2}, // 价格 N4:O4
				"3_15": {r: 3, c: 15, rs: 2, cs: 1}, // 备注 P4:P5
				// 表尾合并单元格 - 合计行ABC列合并
				"19_0": {r: 19, c: 0, rs: 1, cs: 3}  // 合计 A19:C19
			};

			// Luckysheet配置 - 完全按照index123.html示例
		const options = {
			container: 'luckysheet',
			lang: 'zh',
			title: '设备参数选型系统',
			showinfobar: false,
			showtoolbar: true,
				showtoolbarConfig: {
					undoRedo: false,
					paintFormat: true,
					currencyFormat: false,
					percentageFormat: false,
					numberDecrease: false,
					numberIncrease: false,
					moreFormats: true, /* 作为"格式"下拉入口 */
					font: true,
					fontSize: true,
					bold: true,
					italic: true,
					strikethrough: true,
					underline: true,
					textColor: true,
					fillColor: true,
					border: true,
					mergeCell: true,
					horizontalAlignMode: true,
					verticalAlignMode: true,
					textWrapMode: true,
					textRotateMode: true,
					image: true,
					link: true,
					chart: true,
					postil: false, // 删除批注
					pivotTable: false, // 删除透视数据表
					function: true,
					frozenMode: true,
					sortAndFilter: true,
					conditionalFormat: true,
					dataVerification: true,
					splitColumn: false, // 删除分列
					screenshot: false, // 禁用截图功能
					findAndReplace: true,
					protection: true,
					print: true
				},
			data: [
		// 第一个sheet：简化版（删除B列和IJK列）- 默认显示
		{
			"name": "设备参数选型（简化版）",
			"color": "#70ad47",  // 清爽绿色标签
				"config": {
					"merge": simplifiedMergeConfig,
						"borderInfo": [...getSimplifiedBorderConfig(15), ...getSimplifiedDataBorderConfig(5, 15)],
							"rowlen": {
								'0': 35, '1': 35, '2': 35, '3': 28, '4': 28,
								'15': 28, '16': 28, '17': 28, '18': 28, '19': 28
							},
						"columnlen": {
							'0': 35,   // A列 - 序号
							'1': 115,  // B列 - 设备名称
							'2': 80,   // C列 - 规格型号
							'3': 200,  // D列 - 技术参数及要求
							'4': 50,   // E列 - 单位
							'5': 50,   // F列 - 数量
							'6': 40,   // G列 - 电机数量-单
							'7': 40,   // H列 - 电机数量-总
							'8': 60,   // I列 - 电机功率-单
							'9': 60,   // J列 - 电机功率-总
							'10': 60,  // K列 - 设备功率-单
							'11': 60,  // L列 - 设备功率-总
							'12': 60,  // M列 - 价格-单
							'13': 60   // N列 - 价格-总
						},
							"rowhidden": {},
							"colhidden": {}
						},
						"index": "0",
						"zoomRatio": 1,
						"order": 0,
						"status": 1,
						"row": 84,
						"column": 60,
					"celldata": simplifiedCelldata
				},
// 第二个sheet：完整版（包含B列和IJK列）
{
	"name": "设备参数选型（完整版）",
	"color": "#5b9bd5",  // 清爽蓝色标签
					"config": {
						"merge": mergeConfig,
			"borderInfo": [...getBorderConfig(15), ...getDataBorderConfig(5, 15)],
						"rowlen": {
							'0': 35, '1': 35, '2': 35, '3': 28, '4': 28,  // 表头行高
							'15': 28, '16': 28, '17': 28, '18': 28, '19': 28  // 表尾行高
						},
						"columnlen": {
				'0': 35,  // A列 - 序号
				'1': 40,  // B列 - 设备位号（宽度40，自动换行）
				'2': 115, // C列 - 设备名称
				'3': 80,  // D列 - 规格型号
							'4': 200, // E列 - 技术参数及要求
			'5': 70,  // F列 - 材料
			'6': 50,  // G列 - 单位
			'7': 50,  // H列 - 数量
			'8': 40,  // I列 - 电机数量（单）
			'9': 40,  // J列 - 电机数量（总）
		'10': 70, // K列 - 电机功率
				'11': 60, // L列 - 设备功率（单）
				'12': 60, // M列 - 设备功率（总）
				'13': 60, // N列 - 价格（单）
				'14': 60, // O列 - 价格（总）
				'15': 80  // P列 - 备注
						},
						"rowhidden": {},
						"colhidden": {}
					},
		"index": "1",
					"zoomRatio": 1,
		"order": 1,
		"status": 0,
					"row": 84,
					"column": 60,
					"celldata": celldata
				}
			]
		};
		
	// ⚠️ 只拦截alert，不操作DOM，避免影响界面交互
	const originalAlert = window.alert;
	window.alert = function(message) {
		if (typeof message === 'string' && (
			message.includes('公式不可引用其本身的单元格') ||
			message.includes('会导致计算结果不准确') ||
			message.includes('circular reference')
		)) {
			console.warn('⚠️ [已拦截循环引用警告] ' + message);
			return; // 静默拦截，不弹窗
		}
		originalAlert.apply(window, arguments);
	};
	console.log('✅ 已设置alert拦截器（仅拦截，不操作DOM）');
			
			// 按照index123.html的简洁方式初始化
			try {
				luckysheet.create(options);
				console.log('✅ Luckysheet初始化成功');
			
			// ✅ 立即设置版本信息（默认简化版，因为第一个sheet是简化版）
			setTimeout(() => {
				const currentSheet = luckysheet.getSheet();
				if (currentSheet && currentSheet.name) {
					const isSimplified = currentSheet.name.includes('简化版');
					window.currentSheetVersion = {
						isSimplified: isSimplified,
						version: isSimplified ? '简化版' : '完整版',
						expectedColumns: isSimplified ? 14 : 16
					};
					console.log(`✅ 页面加载初始化版本信息: ${window.currentSheetVersion.version} (工作表: ${currentSheet.name})`);
				} else {
					// 如果无法获取工作表，默认设置为简化版
					window.currentSheetVersion = {
						isSimplified: true,
						version: '简化版',
						expectedColumns: 14
					};
					console.log('✅ 页面加载默认设置为简化版');
				}
			}, 100);
	
// ⚠️ B4/K4单元格换行设置已禁用，避免合并单元格错误
// 原因：setSheetActive会触发Luckysheet内部的合并单元格处理，导致"Merge info is null"错误
// 解决方案：在用户实际需要时通过其他方式设置，或在文件加载后设置
console.log('⚠️ B4/K4单元格换行设置已跳过，避免合并单元格错误');
		
	// ✅ 定义全局手动计算求和函数
	window.manualCalculateSum = function() {
		try {
			// ✅ 检测当前工作表类型
			const currentSheet = luckysheet.getSheet();
			const sheetName = currentSheet ? currentSheet.name : 'unknown';
			const isSimplified = currentSheet && currentSheet.name && currentSheet.name.includes('简化版');
			console.log(`🧮 [manualCalculateSum] 工作表: "${sheetName}", 类型: ${isSimplified ? '简化版' : '完整版'}, index: ${currentSheet ? currentSheet.index : 'null'}`);
			
			const sheetData = luckysheet.getSheetData();
			let footerStartRow = -1;
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
				// ===================== 简化版求和：F/H/K/M列 =====================
				console.log(`✅ 确认简化版，开始求和...`);
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
				luckysheet.setCellValue(totalRow, 5, {  // F列
					v: Math.round(fSum),
					m: String(Math.round(fSum)),
					ct: { fa: "General", t: "n" },
					ht: 0,
					vt: 0
				});
				luckysheet.setCellValue(totalRow, 7, {  // H列
					v: Math.round(hSum),
					m: String(Math.round(hSum)),
					ct: { fa: "General", t: "n" },
					ht: 0,
					vt: 0
				});
				
				// ✅ 清除J列（简化版不需要J列合计）
				luckysheet.setCellValue(totalRow, 9, {  // J列
					v: '/',
					m: '/',
					ct: { fa: "General", t: "g" },
					ht: 0,
					vt: 0
				});
				
				luckysheet.setCellValue(totalRow, 10, {  // K列
					v: kSum,
					m: kSum.toFixed(2),
					ct: { fa: "General", t: "n" },
					ht: 0,
					vt: 0
				});
				luckysheet.setCellValue(totalRow, 12, {  // M列
					v: mSum,
					m: mSum.toFixed(2),
					ct: { fa: "0.00", t: "n" },
					ht: 0,
					vt: 0
				});
				
				// ✅ 清除O列（简化版不需要O列）
				luckysheet.setCellValue(totalRow, 14, {  // O列
					v: '',
					m: '',
					ct: { fa: "General", t: "g" },
					ht: 0,
					vt: 0
				});
					
				luckysheet.refresh();
				console.log(`🔄 简化版手动计算求和: F=${Math.round(fSum)}, H=${Math.round(hSum)}, K=${kSum.toFixed(2)}, M=${mSum.toFixed(2)}`);
				
				// ✅ 实时更新详情页的装机功率和总报价（简化版：K列和M列）
				const installedPowerEl = document.getElementById('installedPower');
				const totalQuotePriceEl = document.getElementById('totalQuotePrice');
				if (installedPowerEl) {
					installedPowerEl.value = kSum.toFixed(2);
				}
				if (totalQuotePriceEl) {
					totalQuotePriceEl.value = mSum.toFixed(2);
				}
				console.log(`✅ 简化版实时更新详情页: 装机功率=${kSum.toFixed(2)}, 总报价=${mSum.toFixed(2)}`);
				
				} else {
					// ===================== 完整版求和：H/J/M/O列（原有逻辑） =====================
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
					
					// ⚠️ 方案1：只设置计算值，不设置公式，避免循环引用警告
					// 实时更新由cellUpdated钩子触发manualCalculateSum保证
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
				
				// ✅ 实时更新详情页的装机功率和总报价（完整版：M列和O列）
				const installedPowerEl = document.getElementById('installedPower');
				const totalQuotePriceEl = document.getElementById('totalQuotePrice');
				if (installedPowerEl) {
					installedPowerEl.value = mSum.toFixed(2);
				}
				if (totalQuotePriceEl) {
					totalQuotePriceEl.value = oSum.toFixed(2);
				}
				console.log(`✅ 完整版实时更新详情页: 装机功率=${mSum.toFixed(2)}, 总报价=${oSum.toFixed(2)}`);
			}
		}
		} catch (e) {
			console.warn('⚠️ 手动计算求和失败:', e);
		}
	};
			
		// ✅ hooks将在后面统一注册（在refreshSerialNumbers定义之后）
				
				// 初始化功能模块
				setTimeout(() => {
					initDetailPanel();
					initFileHandlers();
					initDatabaseHandlers();
					
			// 初始化实时联动和双击编辑功能
			if (typeof initRealtimeSync === 'function') {
				initRealtimeSync();
			}
			if (typeof addDoubleClickEdit === 'function') {
				addDoubleClickEdit();
			}
			
			// 确保表格→详情页同步已注册
			if (typeof window.setupTableToFormSync === 'function') {
				window.setupTableToFormSync();
			}
					
					// 初始化表格计算功能
					if (typeof setupTableCalculations === 'function') {
						setupTableCalculations();
					}
				
	// 统一的单元格选择处理函数（定义在hooks之前）
	const handleCellSelection = (cell) => {
		try {
			console.log('🔍 处理单元格选择:', JSON.stringify(cell));
			
			if (cell && typeof cell.r === 'number' && typeof cell.c === 'number') {
				const row = cell.r;
				const col = cell.c;
				
				console.log(`📋 单元格位置: 第${row+1}行第${col+1}列`);
				
				// 只处理数据行（第6行开始到安装费之前）
				if (row >= 5) {
					console.log(`✅ 数据行范围内: 第${row+1}行`);
					
					// 检查是否为数据行（不是表尾行）
					const sheetData = luckysheet.getSheetData();
					if (sheetData && sheetData[row]) {
						const rowData = sheetData[row];
						
						// 检查是否为表尾行
						let isFooterRow = false;
						if (Array.isArray(rowData)) {
							isFooterRow = rowData.some(cell => {
								const cellValue = cell == null ? '' : (typeof cell === 'object' && 'v' in cell ? cell.v : cell);
								const cellText = String(cellValue);
								return cellText.includes('安装费') || cellText.includes('钢材用量') || cellText.includes('电器材料') || cellText.includes('电线电缆') || cellText.includes('合计');
							});
						}
						
						if (!isFooterRow) {
							console.log(`🔄 立即执行反向读取第${row+1}行数据`);
						// 保存当前选中行到全局变量
						window._selectedRow = row;
							// 立即执行反向读取
							if (typeof reverseReadDataToForm === 'function') {
								reverseReadDataToForm(row);
							console.log(`✅ 反向读取已触发，当前行: ${row+1}`);
							} else {
								console.error('❌ reverseReadDataToForm函数不存在');
							}
						} else {
							console.log(`⚠️ 跳过表尾行: 第${row+1}行`);
						}
					} else {
						console.warn('❌ 无法获取行数据', row);
					}
				} else {
					console.log(`⚠️ 跳过表头行: 第${row+1}行`);
				}
			} else {
				console.warn('❌ 单元格信息无效:', cell);
			}
		} catch (e) {
			console.error('❌ 单元格选择处理失败:', e, e.stack);
		}
	};

	// ✅ 刷新序号（A列）函数：数据区与表尾（前四行）排序，合计不编号
	// 必须在hooks注册之前定义，确保hooks可以调用
	window.refreshSerialNumbers = function(dataStartRow = 5, footerStartRow = null) {
		try {
			if (!window.luckysheet || !luckysheet.setCellValue) return;
			if (window.isRefreshingSerialNumbers) return; // 重入保护
			window.isRefreshingSerialNumbers = true;
			
			// 获取当前表格数据
			const sheetData = luckysheet.getSheetData();
			if (!sheetData) return;
			
			// 🔥 修复：动态查找"安装费"所在行作为表尾起始，支持简化版（B列）和完整版（C列）
			let actualFooterStart = footerStartRow || window.currentFooterStartRow || 14; // 默认14（第15行）
			let footerFound = false;
			for (let r = dataStartRow; r < sheetData.length; r++) {
				const row = sheetData[r];
				if (row) {
					// 检查B列和C列（兼容简化版和完整版）
					for (let c = 1; c <= 2; c++) {
						if (!row[c]) continue; // 跳过null/undefined单元格
						const cellValue = (typeof row[c] === 'object' && row[c] && 'v' in row[c]) ? row[c].v : row[c];
						if (cellValue && String(cellValue).includes('安装费')) {
							actualFooterStart = r;
							footerFound = true;
							break;
						}
					}
					if (footerFound) break;
				}
			}
			
			// 更新全局表尾位置
			window.currentFooterStartRow = actualFooterStart;
			
			console.log(`🔄 开始刷新序号 - 数据起始行: ${dataStartRow+1}, 表尾起始行: ${actualFooterStart+1}`);
			
		let n = 1;
		// 数据区：从第6行到表尾之前
		for (let r = dataStartRow; r < actualFooterStart; r++) {
			const prev = sheetData[r] && sheetData[r][0];
			const prevVal = (prev && typeof prev === 'object' && 'v' in prev) ? prev.v : prev;
			if (prevVal !== n) {
				window.suppressSerialRefresh = true;
				luckysheet.setCellValue(r, 0, { v: n, m: String(n), ct: { t: 'n', fa: 'General' }, ff: 'SimSun', fs: 10, ht: 0, vt: 0, bl: 0 });
				window.suppressSerialRefresh = false;
			}
			n++;
		}
			
		// 表尾前4行继续编号（安装费、钢材用量、电器材料、电线电缆）
		for (let i = 0; i < 4; i++) {
			const r = actualFooterStart + i;
			if (r < sheetData.length) {
				const prev = sheetData[r] && sheetData[r][0];
				const prevVal = (prev && typeof prev === 'object' && 'v' in prev) ? prev.v : prev;
				if (prevVal !== n) {
					window.suppressSerialRefresh = true;
					luckysheet.setCellValue(r, 0, { v: n, m: String(n), ct: { t: 'n', fa: 'General' }, ff: 'SimSun', fs: 10, ht: 0, vt: 0, bl: 0 });
					window.suppressSerialRefresh = false;
				}
				n++;
			}
		}
		
		// 合计行A列显示"合计"
		const totalRow = actualFooterStart + 4;
		if (totalRow < sheetData.length) {
			const prev = sheetData[totalRow] && sheetData[totalRow][0];
			const prevVal = (prev && typeof prev === 'object' && 'v' in prev) ? prev.v : prev;
			if (prevVal !== '合计') {
				window.suppressSerialRefresh = true;
				luckysheet.setCellValue(totalRow, 0, { v: '合计', m: '合计', ct: { t: 'g', fa: 'General' }, ff: 'SimSun', fs: 10, ht: 0, vt: 0, bl: 0 });
				window.suppressSerialRefresh = false;
			}
		}
			
			console.log(`✅ 序号已更新 - 数据区: ${dataStartRow+1}-${actualFooterStart}行（${actualFooterStart-dataStartRow}个），表尾: ${actualFooterStart+1}-${actualFooterStart+4}行（${4}个），合计行: ${totalRow+1}`);
		} catch(e) {
			console.error('序号更新失败:', e);
		} finally {
			window.isRefreshingSerialNumbers = false;
		}
	};

	// 延迟注册Luckysheet hooks，确保所有函数都已定义
	setTimeout(() => {
		if (window.luckysheet && luckysheet.createHook && !window.globalHooksRegistered) {
			window.globalHooksRegistered = true;
			
	// ✅ 监听所有可能的行操作事件，刷新序号
	// Luckysheet使用updated hook来监听所有变化
	
	// 补充：在全局updated中检测行数变化，触发序号刷新
	window.lastRowCount = 0; // 记录上次的行数
	
	// 注册updated hook（监听所有更新）
	try {
		luckysheet.createHook('updated', (operate) => {
			console.log(`🔔 Luckysheet updated:`, operate);
			
			// 检测行数变化
			setTimeout(() => {
				const currentRowCount = luckysheet.getSheetData() ? luckysheet.getSheetData().length : 0;
				if (window.lastRowCount > 0 && currentRowCount !== window.lastRowCount) {
					console.log(`🔔 检测到行数变化(updated): ${window.lastRowCount} → ${currentRowCount}`);
					if (window.serialRefreshDebounce) clearTimeout(window.serialRefreshDebounce);
					window.serialRefreshDebounce = setTimeout(() => {
						if (!window.isRefreshingSerialNumbers && typeof window.refreshSerialNumbers === 'function') {
							console.log('  ✅ 行数变化，执行刷新序号');
							window.refreshSerialNumbers(); // 自动查找表尾位置
						}
					}, 500);
				}
				window.lastRowCount = currentRowCount;
			}, 100);
				});
		console.log(`✅ 已注册updated hook`);
			} catch (e) {
		console.warn(`⚠️ 无法注册updated hook:`, e.message);
			}
			

	// 监听工作表切换事件，更新全局版本变量
	try {
		luckysheet.createHook('sheetActivate', (index, isPivotInitial, isNewSheet) => {
			console.log(`🔔 工作表切换: index=${index}`);
			window.ensureCorrectVersion();
		});
		console.log(`✅ 已注册sheetActivate hook`);
	} catch (e) {
		console.warn(`⚠️ 无法注册sheetActivate hook:`, e.message);
			}
			
	// 监听单元格更新（必须接收参数，避免影响其他hook）
	luckysheet.createHook('cellUpdated', (r, c, oldValue, newValue, isRefresh) => {
		console.log('🔔 cellUpdated触发:', { r, c, oldValue, newValue });
		
		// ⚠️ 关键修复：表格输入数据后，手动计算并更新求和
		if (r >= 5 && !isRefresh) { // 数据区域且非公式刷新
			if (window.sumRefreshTimer) clearTimeout(window.sumRefreshTimer);
			window.sumRefreshTimer = setTimeout(() => {
				try {
					const sheetData = luckysheet.getSheetData();
					// 查找表尾合计行
					let footerStartRow = -1;
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
						
						// 手动计算H/J/M/O列的和
						let hSum = 0, jSum = 0, mSum = 0, oSum = 0;
						
						for (let row = dataStartRow; row < dataEndRow; row++) {
							// H列
							const hCell = sheetData[row] && sheetData[row][7];
							const hVal = hCell && typeof hCell === 'object' ? hCell.v : hCell;
							if (hVal && hVal !== '/' && !isNaN(parseFloat(hVal))) {
								hSum += parseFloat(hVal);
							}
							
							// J列
							const jCell = sheetData[row] && sheetData[row][9];
							const jVal = jCell && typeof jCell === 'object' ? jCell.v : jCell;
							if (jVal && jVal !== '/' && !isNaN(parseFloat(jVal))) {
								jSum += parseFloat(jVal);
							}
							
							// M列
							const mCell = sheetData[row] && sheetData[row][12];
							const mVal = mCell && typeof mCell === 'object' ? mCell.v : mCell;
							if (mVal && mVal !== '/' && !isNaN(parseFloat(mVal))) {
								mSum += parseFloat(mVal);
							}
							
							// O列
							const oCell = sheetData[row] && sheetData[row][14];
							const oVal = oCell && typeof oCell === 'object' ? oCell.v : oCell;
							if (oVal && oVal !== '/' && !isNaN(parseFloat(oVal))) {
								oSum += parseFloat(oVal);
							}
						}
						
						// 直接设置合计值（不用公式）
						luckysheet.setCellValue(totalRow, 7, Math.round(hSum));
						luckysheet.setCellValue(totalRow, 9, Math.round(jSum));
						luckysheet.setCellValue(totalRow, 12, mSum);
						luckysheet.setCellValue(totalRow, 14, oSum);
						
						luckysheet.refresh();
						console.log(`🔄 手动计算求和: H=${Math.round(hSum)}, J=${Math.round(jSum)}, M=${mSum.toFixed(2)}, O=${oSum.toFixed(2)}`);
					}
				} catch (e) {
					console.warn('⚠️ 手动计算求和失败:', e);
				}
			}, 300);
		}
		
		// ✅ 检测行数变化，触发序号刷新（防止hook失效时的备用方案）
		try {
			const currentRowCount = luckysheet.getSheetData() ? luckysheet.getSheetData().length : 0;
			if (window.lastRowCount > 0 && currentRowCount !== window.lastRowCount) {
				console.log(`🔔 检测到行数变化: ${window.lastRowCount} → ${currentRowCount}`);
				if (window.serialRefreshDebounce) clearTimeout(window.serialRefreshDebounce);
				window.serialRefreshDebounce = setTimeout(() => {
					if (!window.isRefreshingSerialNumbers && typeof window.refreshSerialNumbers === 'function') {
						console.log('  ✅ 行数变化，执行刷新序号');
						window.refreshSerialNumbers(); // 自动查找表尾位置
					}
				}, 500);
			}
			window.lastRowCount = currentRowCount;
		} catch (e) { /* 忽略错误 */ }
		
		// 1. 更新设备列表
		setTimeout(() => {
			if (typeof updateDeviceListFromTable === 'function') {
				console.log('📊 数据变化，更新设备列表');
				updateDeviceListFromTable();
			}
		}, 500);
		
		// ✅ 新增：空白单元格输入时默认居中显示
		if (r >= 5 && !isRefresh) { // 只处理数据区域（第6行开始）且非公式刷新
			// 检查是否是从空白单元格输入的新内容
			const isOldEmpty = !oldValue || oldValue === '' || (typeof oldValue === 'object' && (!oldValue.v || oldValue.v === ''));
			const isNewNotEmpty = newValue && (typeof newValue === 'string' || typeof newValue === 'number' || (typeof newValue === 'object' && newValue.v));
			
			if (isOldEmpty && isNewNotEmpty) {
				setTimeout(() => {
					const currentCell = luckysheet.getCellValue(r, c);
					if (currentCell && typeof currentCell === 'object') {
						// 如果单元格没有设置对齐方式，或者不是居中，则设置为居中
						if (currentCell.ht === undefined || currentCell.ht !== 0) {
							const updatedCell = Object.assign({}, currentCell, {
								ht: 0, // 水平居中
								vt: 0  // 垂直居中
							});
							luckysheet.setCellValue(r, c, updatedCell);
							console.log(`✅ 空白单元格输入后自动居中: 第${r+1}行第${c+1}列`);
						}
					}
				}, 50);
			}
		}
		
		// ✅ 新增：监听合计行O列和M列变化，实时更新详情页面的总报价和装机功率
		setTimeout(() => {
			const sheetData = luckysheet.getSheetData();
			// 查找表尾合计行
			let footerStartRow = -1;
			for (let i = 5; i < sheetData.length; i++) {
				const row = sheetData[i];
				if (Array.isArray(row)) {
					for (let j = 0; j < row.length; j++) {
						const cell = sheetData[i][j];
						const cellValue = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
						if (String(cellValue).includes('安装费')) {
							footerStartRow = i;
							break;
						}
					}
					if (footerStartRow >= 0) break;
				}
			}
			
			if (footerStartRow >= 0) {
				const totalRow = footerStartRow + 4; // 合计行
				// 如果当前编辑的是合计行的M列（装机功率）或O列（总报价），更新详情页面
				if (r === totalRow && (c === 12 || c === 14)) {
					const totalQuotePriceField = document.getElementById('totalQuotePrice');
					const installedPowerField = document.getElementById('installedPower');
					
					if (c === 14 && totalQuotePriceField) { // O列：总报价
						const totalQuotePriceCell = sheetData[totalRow][14];
						const totalQuotePrice = totalQuotePriceCell && typeof totalQuotePriceCell === 'object' ? 
							(parseFloat(totalQuotePriceCell.v) || 0) : (parseFloat(totalQuotePriceCell) || 0);
						totalQuotePriceField.value = totalQuotePrice.toFixed(2);
						console.log(`💰 实时更新详情页总报价: ¥${totalQuotePrice.toFixed(2)}`);
					}
					
					if (c === 12 && installedPowerField) { // M列：装机功率
						const installedPowerCell = sheetData[totalRow][12];
						const installedPower = installedPowerCell && typeof installedPowerCell === 'object' ? 
							(parseFloat(installedPowerCell.v) || 0) : (parseFloat(installedPowerCell) || 0);
						installedPowerField.value = installedPower.toFixed(2);
						console.log(`⚡ 实时更新详情页装机功率: ${installedPower.toFixed(2)}kW`);
					}
				}
			}
		}, 100);
		
	// 2. 如果编辑了HIJK或N列，强制刷新公式
	if ((c >= 7 && c <= 10) || c === 13) {
		console.log(`✨ 编辑了第${String.fromCharCode(65+c)}列（第${r+1}行）`);
		
		// ✅ 立即触发公式刷新
		setTimeout(() => {
			if (luckysheet.jfrefreshgrid) {
				luckysheet.jfrefreshgrid();
				console.log('  ✅ 已触发公式刷新');
			}
			
			// 延迟检查，等待Luckysheet完成自动计算
			setTimeout(() => {
				const sheetData = luckysheet.getSheetData();
				if (sheetData && sheetData[r]) {
					const kCell = sheetData[r][10];
					const lCell = sheetData[r][11];
					const mCell = sheetData[r][12];
					const oCell = sheetData[r][14];
					
					console.log(`  📊 K${r+1}:`, kCell ? `v=${kCell.v}, m=${kCell.m}, f=${kCell.f}` : 'null');
					console.log(`  📊 L${r+1}:`, lCell ? `v=${lCell.v}, m=${lCell.m}, f=${lCell.f}` : 'null');
					console.log(`  📊 M${r+1}:`, mCell ? `v=${mCell.v}, m=${mCell.m}, f=${mCell.f}` : 'null');
					console.log(`  📊 O${r+1}:`, oCell ? `v=${oCell.v}, m=${oCell.m}, f=${oCell.f}` : 'null');
					
					// 如果L或M列显示为0但有公式，说明是显示问题
					if ((lCell && lCell.f && (lCell.v === 0 || lCell.v === null)) ||
					    (mCell && mCell.f && (mCell.v === 0 || mCell.v === null))) {
						console.warn(`  ⚠️ L或M列有公式但显示为0，再次刷新`);
						setTimeout(() => {
							if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
							if (luckysheet.refresh) luckysheet.refresh();
							console.log('  ✅ 已再次刷新显示');
						}, 100);
					}
					
					// ✅ 公式刷新后，也更新详情页面的总报价和装机功率
					let footerStartRow = -1;
					for (let i = 5; i < sheetData.length; i++) {
						const row = sheetData[i];
						if (Array.isArray(row)) {
							for (let j = 0; j < row.length; j++) {
								const cell = sheetData[i][j];
								const cellValue = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
								if (String(cellValue).includes('安装费')) {
									footerStartRow = i;
									break;
								}
							}
							if (footerStartRow >= 0) break;
						}
					}
					
					if (footerStartRow >= 0) {
						const totalRow = footerStartRow + 4; // 合计行
						const totalQuotePriceField = document.getElementById('totalQuotePrice');
						const installedPowerField = document.getElementById('installedPower');
						
						if (totalQuotePriceField && sheetData[totalRow]) {
							const totalQuotePriceCell = sheetData[totalRow][14];
							const totalQuotePrice = totalQuotePriceCell && typeof totalQuotePriceCell === 'object' ? 
								(parseFloat(totalQuotePriceCell.v) || 0) : (parseFloat(totalQuotePriceCell) || 0);
							totalQuotePriceField.value = totalQuotePrice.toFixed(2);
							console.log(`💰 公式刷新后更新详情页总报价: ¥${totalQuotePrice.toFixed(2)}`);
						}
						
						if (installedPowerField && sheetData[totalRow]) {
							const installedPowerCell = sheetData[totalRow][12];
							const installedPower = installedPowerCell && typeof installedPowerCell === 'object' ? 
								(parseFloat(installedPowerCell.v) || 0) : (parseFloat(installedPowerCell) || 0);
							installedPowerField.value = installedPower.toFixed(2);
							console.log(`⚡ 公式刷新后更新详情页装机功率: ${installedPower.toFixed(2)}kW`);
						}
					}
				}
			}, 200);
		}, 50);
	}
	
	// ✅ 3. 当编辑任何可能影响合计的列（H数量、I单台电机数量、K电机功率、M总功率、N单价、O总价）后，也更新装机功率和总报价
	// 这样确保即使不是直接编辑合计行，修改数据后也能实时更新
	if (r >= 5 && (c === 7 || c === 8 || c === 10 || c === 12 || c === 13 || c === 14)) {
		console.log(`🔔 检测到${String.fromCharCode(65+c)}列第${r+1}行变化，准备更新装机功率和总报价...`);
		
		setTimeout(() => {
			// 先触发一次刷新，确保所有公式都已计算
			if (luckysheet.jfrefreshgrid) {
				luckysheet.jfrefreshgrid();
				console.log('  ✅ 已触发公式刷新');
			}
			
			// 再次延迟读取最终值
			setTimeout(() => {
				const sheetData = luckysheet.getSheetData();
				console.log(`  📊 准备查找表尾，数据总行数: ${sheetData ? sheetData.length : 0}`);
				
				// 查找表尾合计行
				let footerStartRow = -1;
				for (let i = 5; i < sheetData.length; i++) {
					const row = sheetData[i];
					if (Array.isArray(row)) {
						for (let j = 0; j < row.length; j++) {
							const cell = sheetData[i][j];
							const cellValue = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
							if (String(cellValue).includes('安装费')) {
								footerStartRow = i;
								console.log(`  ✅ 找到表尾起始行: 第${i+1}行`);
								break;
							}
						}
						if (footerStartRow >= 0) break;
					}
				}
				
				if (footerStartRow >= 0) {
					const totalRow = footerStartRow + 4; // 合计行
					console.log(`  ✅ 合计行位置: 第${totalRow+1}行`);
					
					const totalQuotePriceField = document.getElementById('totalQuotePrice');
					const installedPowerField = document.getElementById('installedPower');
					
					console.log(`  🔍 检查元素是否存在:`, {
						totalQuotePriceField: !!totalQuotePriceField,
						installedPowerField: !!installedPowerField
					});
					
					if (sheetData[totalRow]) {
						console.log(`  📊 合计行数据:`, sheetData[totalRow]);
						
						const totalQuotePriceCell = sheetData[totalRow][14];
						const installedPowerCell = sheetData[totalRow][12];
						
						console.log(`  📊 M列(装机功率)单元格:`, installedPowerCell);
						console.log(`  📊 O列(总报价)单元格:`, totalQuotePriceCell);
						
						if (totalQuotePriceField && totalQuotePriceCell !== undefined) {
							const totalQuotePrice = totalQuotePriceCell && typeof totalQuotePriceCell === 'object' ? 
								(parseFloat(totalQuotePriceCell.v) || 0) : (parseFloat(totalQuotePriceCell) || 0);
							totalQuotePriceField.value = totalQuotePrice.toFixed(2);
							console.log(`💰 ${String.fromCharCode(65+c)}列变化后更新详情页总报价: ¥${totalQuotePrice.toFixed(2)}`);
							console.log(`  🔍 总报价字段当前值:`, totalQuotePriceField.value);
						} else {
							console.warn(`  ⚠️ 无法更新总报价:`, {
								字段存在: !!totalQuotePriceField,
								单元格值: totalQuotePriceCell
							});
						}
						
						if (installedPowerField && installedPowerCell !== undefined) {
							const installedPower = installedPowerCell && typeof installedPowerCell === 'object' ? 
								(parseFloat(installedPowerCell.v) || 0) : (parseFloat(installedPowerCell) || 0);
							installedPowerField.value = installedPower.toFixed(2);
							console.log(`⚡ ${String.fromCharCode(65+c)}列变化后更新详情页装机功率: ${installedPower.toFixed(2)}kW`);
							console.log(`  🔍 装机功率字段当前值:`, installedPowerField.value);
						} else {
							console.warn(`  ⚠️ 无法更新装机功率:`, {
								字段存在: !!installedPowerField,
								单元格值: installedPowerCell
							});
						}
					} else {
						console.warn(`⚠️ 合计行不存在: 第${totalRow+1}行超出数据范围`);
					}
				} else {
					console.warn('⚠️ 未找到表尾合计行（未找到包含"安装费"的单元格）');
				}
			}, 200);
		}, 100);
	}
	});
			
			// 监听数据加载完成
			luckysheet.createHook('updated', () => {
				setTimeout(() => {
					if (typeof updateDeviceListFromTable === 'function') {
						console.log('📊 表格更新完成，更新设备列表');
						updateDeviceListFromTable();
					}
				}, 500);
			});
			
			// 监听单元格选中事件，实现反向读取
			luckysheet.createHook('cellSelected', (sheet, cell) => {
				console.log('🎯 cellSelected事件触发:', cell);
				handleCellSelection(cell);
			});
			
			// 监听单元格点击事件
			luckysheet.createHook('cellClick', (sheet, cell) => {
				console.log('🖱️ cellClick事件触发:', cell);
				handleCellSelection(cell);
			});
			
			// 监听单元格鼠标按下事件
			luckysheet.createHook('cellMouseDown', (sheet, cell) => {
				console.log('⬇️ cellMouseDown事件触发:', cell);
				handleCellSelection(cell);
			});
			
			// 添加范围选择事件监听
			luckysheet.createHook('rangeSelect', (sheet, range) => {
				console.log('📋 rangeSelect事件触发:', range);
				if (range && range.length > 0) {
					const cell = range[0];
					handleCellSelection(cell);
				}
			});
			
			console.log('✅ 全局hooks已注册（行增删、单元格更新、选择事件）');
		}
	}, 1500); // 延迟1.5秒，确保Luckysheet完全初始化
					
				// 添加DOM点击事件作为备用（防止重复添加）
				setTimeout(() => {
					const luckysheetContainer = document.querySelector('#luckysheet');
					if (luckysheetContainer && !luckysheetContainer.hasAttribute('data-click-listener')) {
						luckysheetContainer.setAttribute('data-click-listener', 'true');
					luckysheetContainer.addEventListener('click', (e) => {
						console.log('🖱️ DOM点击事件触发');
						// 防抖处理，避免频繁调用
						clearTimeout(window.domClickTimer);
						window.domClickTimer = setTimeout(() => {
							try {
								// 使用正确的API获取选中单元格
								const sheet = luckysheet.getSheet();
								if (sheet && sheet.luckysheet_select_save && sheet.luckysheet_select_save.length > 0) {
									const selection = sheet.luckysheet_select_save[0];
									const cell = {
										r: selection.row[0],
										c: selection.column[0]
									};
									console.log('🎯 从selection获取单元格:', cell);
									handleCellSelection(cell);
								}
							} catch (selError) {
								console.log('⚠️ 无法从selection获取单元格:', selError);
							}
						}, 100);
					});
					
					// "更新设备"按钮事件监听
					$('#updateDeviceBtn').off('click').on('click', function() {
						console.log('🔄 点击更新设备按钮');
						if (typeof window._selectedRow === 'number' && window._selectedRow >= 5) {
							const sheetData = luckysheet.getSheetData();
							const footerStartRow = window.currentFooterStartRow || 15;
							if (window._selectedRow < footerStartRow) {
								console.log(`📝 准备更新第${window._selectedRow + 1}行数据`);
								// 收集表单数据
								const formData = {
									deviceName: $('#deviceName').val() || '',
									specification: $('#specification').val() || '',
									technicalParams: $('#technicalParams').val() || '',
									unit: $('#unit').val() || '',
									quantity: $('#quantity').val() || '',
									motorQuantity: $('#motorQuantity').val() || '',
									motorPower: $('#motorPower').val() || '',
									unitPrice: $('#unitPrice').val() || '',
									remarks: $('#remarks').val() || ''
								};
								
								// 直接调用 setupFormToTableSync 的逻辑来更新行
								const isSimplified = window.currentSheetVersion ? window.currentSheetVersion.isSimplified : false;
								const row = window._selectedRow;
								
								// 根据版本确定列映射
								const colMap = isSimplified ? {
									deviceName: 1, specification: 2, technicalParams: 3, unit: 4,
									quantity: 5, motorQuantity: 6, motorPower: 8, unitPrice: 11, remarks: 13
								} : {
									deviceName: 2, specification: 3, technicalParams: 4, unit: 5,
									quantity: 7, motorQuantity: 8, motorPower: 10, unitPrice: 13, remarks: 15
								};
								
								Object.keys(formData).forEach(key => {
									const col = colMap[key];
									if (col !== undefined && formData[key] !== undefined) {
										luckysheet.setCellValue(row, col, formData[key]);
									}
								});
								
							console.log(`✅ 已更新第${row + 1}行数据`);
							alert(`✅ 设备信息已更新到第${row + 1}行`);
							
							// 清空选中状态
							window._selectedRow = undefined;
							} else {
								alert('❌ 无法更新表尾行，请选择数据行');
							}
						} else {
							alert('❌ 请先选择要更新的设备行');
						}
					});
					
				// "添加设备"按钮事件监听
				$('#addDeviceBtn').off('click').on('click', function() {
					console.log('➕ 点击添加设备按钮');
					if (typeof addDevice === 'function') {
						addDevice();
					} else {
						console.error('❌ addDevice函数不存在');
					}
				});
				
			// "清空表单"按钮事件监听
			$('#clearFormBtn').off('click').on('click', function() {
				// 清空所有输入
				$('#deviceName, #specification, #technicalParams, #unit, #quantity, #motorQuantity, #motorPower, #unitPrice, #remarks').val('');
				// 清空选中状态
				window._selectedRow = undefined;
				console.log('🧹 表单已清空');
			});
				
				console.log('✅ DOM事件监听已添加（包含添加/更新/清空按钮）');
					}
				}, 1500);
			
			// 初始化设备列表（显示"暂无数据"）
			if (typeof updateDeviceListFromTable === 'function') {
				updateDeviceListFromTable();
			}
				}, 1000);
			} catch (error) {
				console.error('❌ Luckysheet初始化失败:', error);
			}
			
		// ✅ 封装版本检测函数，确保版本信息始终正确（移到try块外确保执行）
		console.log(`🔧 正在定义window.ensureCorrectVersion...`);
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
		console.log(`✅ window.ensureCorrectVersion已定义，类型:`, typeof window.ensureCorrectVersion);
			
		// 从localStorage恢复数据库
		restoreDatabase();
		
		// 初始化设备列表读取逻辑 - 完全参考handsontable代码
		initDeviceListLogic();
	});
	
	// 设备列表读取逻辑 - 参考independent-handsontable
	function initDeviceListLogic() {
		// 从当前表格获取设备名称并更新设备列表
		const updateDeviceListFromTable = function() {
			try {
				console.log('=== 开始更新设备列表 ===');
				const deviceList = document.getElementById('deviceList');
				const deviceListEmpty = document.getElementById('deviceListEmpty');
				
				if (!deviceList || !deviceListEmpty) {
					console.log('❌ 设备列表DOM元素不存在');
					return;
				}
				
				// 清空现有列表
				deviceList.innerHTML = '';
				
				// 检查Luckysheet是否已初始化
				if (!window.luckysheet) {
					console.log('❌ Luckysheet未初始化，显示暂无数据');
					deviceListEmpty.style.display = 'block';
					deviceListEmpty.textContent = '暂无数据';
					return;
				}
				
				// 获取当前表格数据 - 使用getSheet获取当前激活的工作表数据
				let currentSheetData;
				try {
					// 尝试多种方式获取数据
					if (luckysheet.getSheetData) {
						currentSheetData = luckysheet.getSheetData();
					} else if (luckysheet.getSheet) {
						const currentSheet = luckysheet.getSheet();
						currentSheetData = currentSheet.data || currentSheet.celldata || [];
						// 转换celldata格式为二维数组
						const maxRow = Math.max(...currentSheetData.map(cell => cell.r), 0);
						const maxCol = Math.max(...currentSheetData.map(cell => cell.c), 0);
						const sheetArray = [];
						for (let r = 0; r <= maxRow; r++) {
							sheetArray[r] = [];
							for (let c = 0; c <= maxCol; c++) {
								const cellObj = currentSheetData.find(cell => cell.r === r && cell.c === c);
								sheetArray[r][c] = cellObj ? cellObj.v.v : '';
							}
						}
						currentSheetData = sheetArray;
					}
				} catch (e) {
					console.error('获取表格数据失败:', e);
				}
				
				if (!currentSheetData || currentSheetData.length === 0) {
					console.log('❌ 表格数据为空，显示暂无数据');
					deviceListEmpty.style.display = 'block';
					deviceListEmpty.textContent = '暂无数据';
					return;
				}
				
				console.log('✅ 获取到表格数据，行数:', currentSheetData.length);
				console.log('前5行数据预览:', currentSheetData.slice(0, 5));
				
			// ✅ 根据工作表类型决定设备名称列：完整版C列（索引2），简化版B列（索引1）
			const currentSheet = luckysheet.getSheet();
			const isSimplified = currentSheet && currentSheet.name && currentSheet.name.includes('简化版');
			const deviceNameColIndex = isSimplified ? 1 : 2; // 简化版B列，完整版C列
			console.log(`📊 当前工作表: ${currentSheet ? currentSheet.name : '未知'}，设备名称列: ${String.fromCharCode(65 + deviceNameColIndex)}`);
				const dataStartRow = 5; // 第6行，索引5
				
				// 查找"安装费"关键字定位表尾
				let footerStartRow = -1;
				for (let i = dataStartRow; i < currentSheetData.length; i++) {
					const row = currentSheetData[i];
					if (Array.isArray(row)) {
						for (let j = 0; j < row.length; j++) {
							const cellValue = row[j];
							const cellText = cellValue == null ? '' : (typeof cellValue === 'object' && 'v' in cellValue ? cellValue.v : cellValue);
							if (String(cellText).includes('安装费')) {
								footerStartRow = i;
								break;
							}
						}
						if (footerStartRow >= 0) break;
					}
				}
				
				// 若未找到关键字，使用最后5行作为表尾
				const dataEndRow = footerStartRow >= 0 ? footerStartRow : Math.max(dataStartRow, currentSheetData.length - 5);
				
				console.log(`设备列表读取范围: 第${dataStartRow + 1}行 到 第${dataEndRow}行`);
				console.log(`表尾起始行: ${footerStartRow >= 0 ? footerStartRow + 1 : '未找到安装费关键字'}`);
				
				const items = [];
				for (let i = dataStartRow; i < dataEndRow; i++) {
					if (i >= currentSheetData.length) break;
					
					const row = currentSheetData[i];
					if (!Array.isArray(row)) continue;
					
					const raw = row[deviceNameColIndex];
					let name = '';
					if (raw !== undefined && raw !== null) {
						if (typeof raw === 'object' && 'v' in raw) {
							name = String(raw.v).trim();
						} else {
							name = String(raw).trim();
						}
					}
					
					// 过滤空值、斜杠和表尾关键字
					if (name && name !== '/' && !name.includes('安装费') && !name.includes('钢材用量') && !name.includes('电器材料') && !name.includes('电线电缆') && !name.includes('合计')) {
						items.push({ name, rowIndex: i });
						console.log(`✅ 第${i+1}行设备: ${name}`);
					}
				}
				
				if (items.length === 0) {
					console.log('❌ 未找到任何设备数据');
					deviceListEmpty.style.display = 'block';
					deviceListEmpty.textContent = '暂无设备数据';
					return;
				}
				
				console.log(`✅ 找到 ${items.length} 个设备`);
				deviceListEmpty.style.display = 'none';
				
				// 创建设备列表项
				items.forEach(({ name, rowIndex }) => {
							const li = document.createElement('li');
					li.style.cssText = 'padding:4px 8px; border-bottom:1px solid #eee; cursor:pointer; font-size:12px; transition: background-color 0.2s;';
					li.textContent = name;
					li.dataset.rowIndex = String(rowIndex);
					
							li.addEventListener('mouseenter', function() {
						this.style.backgroundColor = '#e6f3ff';
							});
					
							li.addEventListener('mouseleave', function() {
						if (!this.classList.contains('selected')) {
							this.style.backgroundColor = '';
						}
							});
							
							li.addEventListener('click', function() {
						// 移除其他项的选中状态
						document.querySelectorAll('#deviceList li').forEach(item => {
							item.classList.remove('selected');
							item.style.backgroundColor = '';
						});
						
						// 设置当前项为选中状态
						this.classList.add('selected');
						this.style.backgroundColor = '#cce7ff';
					});
					
					li.addEventListener('click', function() {
						const r = parseInt(this.dataset.rowIndex, 10);
						if (!isNaN(r)) {
							try {
								console.log(`🎯 点击设备: ${name} (第${r+1}行)`);
								
								// 使用Luckysheet的选择和滚动API，确保页面能追踪到对应位置
								if (window.luckysheet) {
									console.log(`🎯 开始跳转到第${r+1}行`);
									
									// 1. 立即滚动到目标行，确保用户能看到
									try {
										console.log(`🎯 开始精确滚动到第${r+1}行`);
										
										// 尝试多种滚动方法，确保兼容性
										let scrollSuccess = false;
										
										if (luckysheet.scrollToCellPos) {
											luckysheet.scrollToCellPos(r, deviceNameColIndex);
											scrollSuccess = true;
											console.log('✅ 使用scrollToCellPos滚动');
										} else if (luckysheet.scrollViewportTo) {
											luckysheet.scrollViewportTo(r, deviceNameColIndex);
											scrollSuccess = true;
											console.log('✅ 使用scrollViewportTo滚动');
										} else if (luckysheet.scrollTo) {
											luckysheet.scrollTo(r, deviceNameColIndex);
											scrollSuccess = true;
											console.log('✅ 使用scrollTo滚动');
										}
										
									// 使用Luckysheet原生API滚动并确保滚动条同步
									console.log('🔄 使用原生API滚动到目标行');
									
									// 直接使用Luckysheet的scroll API
									luckysheet.scroll({
										targetRow: r,
										targetColumn: 2
									});
									
									// 短暂延迟后强制刷新滚动条
									setTimeout(() => {
										const luckysheetMain = document.querySelector('#luckysheet .luckysheet-cell-main');
										if (luckysheetMain) {
											// 触发滚动事件，确保滚动条同步
											const scrollEvent = new Event('scroll');
											luckysheetMain.dispatchEvent(scrollEvent);
											console.log(`✅ 已触发滚动事件同步滚动条`);
										}
										
										// 使用Luckysheet的刷新方法
										if (luckysheet.refresh) {
											luckysheet.refresh();
										}
										
										console.log(`✅ 滚动到第${r+1}行完成`);
									}, 100);
									} catch(scrollError) {
										console.error('滚动失败:', scrollError);
									}
									
									// 2. 延迟设置选中状态，确保滚动完成
									setTimeout(() => {
										try {
											// 设置选中范围（选中整行）
											if (luckysheet.setRangeShow) {
												luckysheet.setRangeShow({ row: [r, r], column: [0, 15] });
												console.log('✅ 设置选中范围');
											}
											
											// 选中目标单元格
											if (luckysheet.selectCell) {
												luckysheet.selectCell(r, deviceNameColIndex);
												console.log('✅ 选中单元格');
											}
											
											// 设置焦点
											if (luckysheet.setCellFocus) {
												luckysheet.setCellFocus(r, deviceNameColIndex);
											}
											
											// 强制刷新视图
											if (luckysheet.refresh) {
												luckysheet.refresh();
											}
											
											console.log(`✅ 跳转完成，目标行: ${r+1}`);
										} catch(selectError) {
											console.warn('选中设置失败:', selectError);
										}
									}, 150);
									
									// 3. 再次确认滚动位置（防止选中操作影响滚动）
									setTimeout(() => {
										try {
											if (luckysheet.scrollToCellPos) {
												luckysheet.scrollToCellPos(r, deviceNameColIndex);
											}
										} catch(e) {
											// 忽略错误
										}
									}, 300);
								}
								
								// 加载设备详情到右侧面板
								if (typeof loadDeviceDataToForm === 'function') {
									loadDeviceDataToForm(name, r);
								}
								
								console.log(`✅ 成功跳转到设备: ${name} (第${r+1}行)`);
							} catch(e) {
								console.error('跳转到设备行失败:', e);
							}
						}
					});
					
					deviceList.appendChild(li);
				});
				
				console.log(`✅ 设备列表更新完成，共 ${items.length} 个设备`);
				
				// 为设备列表项添加双击编辑功能
				if (window.addDoubleClickToDeviceItems) {
					window.addDoubleClickToDeviceItems();
				}
						} catch (error) {
				console.error('❌ 更新设备列表失败:', error);
				const deviceListEmpty = document.getElementById('deviceListEmpty');
				if (deviceListEmpty) {
					deviceListEmpty.style.display = 'block';
					deviceListEmpty.textContent = '读取失败';
				}
			}
		};
		
		// 从表格加载设备数据到表单
		// 从表格加载设备数据到详情面板 - 参考independent-handsontable完整逻辑
	function loadDeviceDataToForm(selectedDeviceName, rowIndex) {
		try {
			if (!luckysheet || rowIndex === undefined) {
				return;
			}
			
			console.log(`🔍 设备列表点击: ${selectedDeviceName} (第${rowIndex+1}行) - 调用统一的反向读取逻辑`);
			
			// ✅ 直接调用reverseReadDataToForm，使用统一的反向读取逻辑
			if (typeof reverseReadDataToForm === 'function') {
				reverseReadDataToForm(rowIndex);
				console.log(`✅ 已调用reverseReadDataToForm统一处理`);
				return;
			}
			
			// 获取当前行数据
			const sheetData = luckysheet.getSheetData();
			const rowData = sheetData[rowIndex];
				
				if (!rowData) {
					console.error('无法获取行数据');
					return;
				}
				
				// 确保下拉框中存在要显示的实际值（只对select元素有效）
				const ensureOption = (selectId, value) => {
					try {
						if (value === undefined || value === null || value === '') {
							console.log(`⚠️ ensureOption: ${selectId} 的值为空`);
							return;
						}
						const sel = document.getElementById(selectId);
						if (!sel) {
							console.warn(`⚠️ ensureOption: 找不到元素 ${selectId}`);
							return;
						}
						
						// 检查是否为select元素
						if (sel.tagName.toLowerCase() !== 'select') {
							console.log(`⚠️ 元素 ${selectId} 不是select元素，跳过ensureOption`);
							return;
						}
						
						const val = String(value).trim();
						if (!val) {
							console.log(`⚠️ ensureOption: ${selectId} 的值trim后为空`);
							return;
						}
						
						console.log(`🔍 ensureOption: ${selectId} = "${val}"`);
						
						// 检查是否已存在
						let exists = false;
						if (sel.options && sel.options.length > 0) {
							for (let i = 0; i < sel.options.length; i++) {
								if (sel.options[i].value === val) { 
									exists = true; 
									break; 
								}
							}
						}
						
						// 只有不存在时才添加
						if (!exists) {
							const option = document.createElement('option');
							option.value = val;
							option.textContent = val;
							sel.appendChild(option);
							console.log(`✅ 添加选项到 ${selectId}: ${val}`);
						}
					} catch (e) {
						console.error(`ensureOption失败 (${selectId}):`, e);
					}
				};
				
				// 清空字段
				const clearFields = ['deviceNumber','deviceName','specification','technicalParams','material','unit','quantity','motorQuantity','motorPower','singleDevicePower','totalPower','unitPrice','totalPrice','remarks'];
				clearFields.forEach(id => { 
					const el = document.getElementById(id); 
					if (el) el.value = ''; 
				});
				
				// 辅助函数：正确提取Luckysheet单元格数据（避免 [object Object]）
				const getCellValue = (cellData) => {
					// 优先使用全局工具函数；若尚未定义，则使用本地回退逻辑
					if (typeof window.getCellText === 'function') {
					return window.getCellText(cellData);
					}
					if (cellData === undefined || cellData === null) return '';
					if (typeof cellData === 'string' || typeof cellData === 'number') return String(cellData).trim();
					if (typeof cellData === 'object') {
						// 优先显示文本 m
						if ('m' in cellData && cellData.m !== null && cellData.m !== undefined && cellData.m !== '') {
							const mVal = cellData.m;
							return typeof mVal === 'object' ? String(mVal.v ?? '').trim() : String(mVal).trim();
						}
						// 其次原始值 v
						if ('v' in cellData && cellData.v !== null && cellData.v !== undefined && cellData.v !== '') {
							const vVal = cellData.v;
							return typeof vVal === 'object' ? String(vVal.v ?? '').trim() : String(vVal).trim();
						}
						// 兼容 text 字段
						if ('text' in cellData && cellData.text !== null && cellData.text !== undefined && cellData.text !== '') {
							return String(cellData.text).trim();
						}
						// 兼容 ct 富文本/普通值
						if ('ct' in cellData && cellData.ct) {
							if (Array.isArray(cellData.ct.s) && cellData.ct.s.length > 0) {
								const texts = cellData.ct.s.filter(it => it && it.v).map(it => String(it.v));
								if (texts.length > 0) return texts.join('').trim();
							}
							if ('v' in cellData.ct && cellData.ct.v !== null && cellData.ct.v !== undefined && cellData.ct.v !== '') {
								return String(cellData.ct.v).trim();
							}
						}
					}
					return '';
				};
				
			// 安全设置元素值的辅助函数
			const safeSetValue = (elementId, value) => {
				const element = document.getElementById(elementId);
				if (element) {
					// 处理null、undefined等值
					if (value === null || value === undefined) {
						element.value = '';
				} else {
						element.value = String(value);
					}
			} else {
					console.warn(`元素 ${elementId} 不存在`);
				}
			};
				
				// 填充数据（完全按照independent-handsontable的顺序）
				// B列: 设备位号 (1)
				const deviceNumber = getCellValue(rowData[1]);
				safeSetValue('deviceNumber', deviceNumber);
				
				// C列: 设备名称 (2) - select元素
				const deviceName = getCellValue(rowData[2]);
				if (deviceName) ensureOption('deviceName', deviceName);
				safeSetValue('deviceName', deviceName);
				
				// D列: 规格型号 (3) - select元素
				const specification = getCellValue(rowData[3]);
				if (specification) ensureOption('specification', specification);
				safeSetValue('specification', specification);
				
				// E列: 技术参数及要求 (4) - textarea元素
				const technicalParams = getCellValue(rowData[4]);
				safeSetValue('technicalParams', technicalParams);
				
				// F列: 材料 (5) - select元素
				const material = getCellValue(rowData[5]);
				if (material) ensureOption('material', material);
				safeSetValue('material', material);
				
				// G列: 单位 (6) - input元素，不需要ensureOption
				const unit = getCellValue(rowData[6]);
				safeSetValue('unit', unit);
				
				// H列: 数量 (7)
				safeSetValue('quantity', getCellValue(rowData[7]));
				
                // I列: 单台电机数量 (8)
                safeSetValue('motorQuantity', getCellValue(rowData[8]));
				
			// K列: 电机功率 (10) - 保持原始显示（如 "11+44"）
			const motorPowerRaw = getCellValue(rowData[10]);
			safeSetValue('motorPower', motorPowerRaw);
			
			// L列: 单设备功率 (11) - 读取公式计算结果
			const lCell = rowData[11];
			let singleDevicePowerValue = 0;
			if (lCell && typeof lCell === 'object') {
				// 优先读取公式的计算结果 v
				if (lCell.v !== undefined && lCell.v !== null) {
					singleDevicePowerValue = parseFloat(lCell.v);
				} else if (lCell.m !== undefined && lCell.m !== null) {
					singleDevicePowerValue = parseFloat(lCell.m);
				}
			} else if (lCell) {
				singleDevicePowerValue = parseFloat(getCellValue(lCell));
			}
			safeSetValue('singleDevicePower', isNaN(singleDevicePowerValue) ? '' : singleDevicePowerValue.toFixed(2));
			console.log(`  📊 L列（单台设备功率）: ${singleDevicePowerValue.toFixed(2)}`);
			
			// M列: 总设备功率 (12) - 读取公式计算结果
			const mCell = rowData[12];
			let totalPowerValue = 0;
			if (mCell && typeof mCell === 'object') {
				if (mCell.v !== undefined && mCell.v !== null) {
					totalPowerValue = parseFloat(mCell.v);
				} else if (mCell.m !== undefined && mCell.m !== null) {
					totalPowerValue = parseFloat(mCell.m);
				}
			} else if (mCell) {
				totalPowerValue = parseFloat(getCellValue(mCell));
			}
			safeSetValue('totalPower', isNaN(totalPowerValue) ? '' : totalPowerValue.toFixed(2));
			console.log(`  📊 M列（总功率）: ${totalPowerValue.toFixed(2)}`);
				
			// N列: 设备单价 (13)
			const unitPrice = getCellValue(rowData[13]);
			safeSetValue('unitPrice', unitPrice);
			// 保存原始单价
			window.originalUnitPrice = parseFloat(unitPrice) || 0;
				
				// O列: 设备总价 (14)
				safeSetValue('totalPrice', getCellValue(rowData[14]));
				
				// P列: 备注 (15)
				safeSetValue('remarks', getCellValue(rowData[15]));
				
				console.log('✅ 已加载行数据到设备详情面板');
			} catch (error) {
				console.error('❌ 加载数据到设备详情面板时出错:', error);
			}
		}
		
		// 反向读取表格数据到详情面板（点击表格任意位置时调用）
		function reverseReadDataToForm(rowIndex) {
			try {
				if (!luckysheet || rowIndex === undefined) {
					return;
				}
				
				console.log(`🔄 反向读取第${rowIndex+1}行数据到详情面板`);
				
				// 记录当前选中的行，用于实时联动
				window.currentSelectedRow = rowIndex;
				
				// 获取当前行数据
				const sheetData = luckysheet.getSheetData();
				const rowData = sheetData[rowIndex];
				
				if (!rowData) {
					console.warn('无法获取行数据');
					return;
				}
				
			// 辅助函数：正确提取Luckysheet单元格数据（避免 [object Object]）
			const getCellValue = (cellData) => {
				// 优先使用全局工具函数；若尚未定义，则使用本地回退逻辑
				if (typeof window.getCellText === 'function') {
				return window.getCellText(cellData);
				}
				if (cellData === undefined || cellData === null) return '';
				if (typeof cellData === 'string' || typeof cellData === 'number') return String(cellData).trim();
				if (typeof cellData === 'object') {
					// 优先显示文本 m
					if ('m' in cellData && cellData.m !== null && cellData.m !== undefined && cellData.m !== '') {
						const mVal = cellData.m;
						return typeof mVal === 'object' ? String(mVal.v ?? '').trim() : String(mVal).trim();
					}
					// 其次原始值 v
					if ('v' in cellData && cellData.v !== null && cellData.v !== undefined && cellData.v !== '') {
						const vVal = cellData.v;
						return typeof vVal === 'object' ? String(vVal.v ?? '').trim() : String(vVal).trim();
					}
					// 兼容 text 字段
					if ('text' in cellData && cellData.text !== null && cellData.text !== undefined && cellData.text !== '') {
						return String(cellData.text).trim();
					}
					// 兼容 ct 富文本/普通值
					if ('ct' in cellData && cellData.ct) {
						if (Array.isArray(cellData.ct.s) && cellData.ct.s.length > 0) {
							const texts = cellData.ct.s.filter(it => it && it.v).map(it => String(it.v));
							if (texts.length > 0) return texts.join('').trim();
						}
						if ('v' in cellData.ct && cellData.ct.v !== null && cellData.ct.v !== undefined && cellData.ct.v !== '') {
							return String(cellData.ct.v).trim();
						}
					}
				}
				return '';
			};
			
			// ✅ 确保下拉框中存在要显示的实际值（只对select元素有效）
			const ensureOption = (selectId, value) => {
				try {
					if (value === undefined || value === null || value === '') {
						console.log(`⚠️ ensureOption: ${selectId} 的值为空`);
						return;
					}
					const sel = document.getElementById(selectId);
					if (!sel) {
						console.warn(`⚠️ ensureOption: 找不到元素 ${selectId}`);
						return;
					}
					
					// 检查是否为select元素
					if (sel.tagName.toLowerCase() !== 'select') {
						console.log(`⚠️ 元素 ${selectId} 不是select元素，跳过ensureOption`);
						return;
					}
					
					const val = String(value).trim();
					if (!val) {
						console.log(`⚠️ ensureOption: ${selectId} 的值trim后为空`);
						return;
					}
					
					console.log(`🔍 ensureOption: ${selectId} = "${val}"`);
					
					// 检查是否已存在
					let exists = false;
					if (sel.options && sel.options.length > 0) {
						for (let i = 0; i < sel.options.length; i++) {
							if (sel.options[i].value === val) { 
								exists = true; 
								break; 
							}
						}
					}
					
					// 只有不存在时才添加
					if (!exists) {
						const option = document.createElement('option');
						option.value = val;
						option.textContent = val;
						sel.appendChild(option);
						console.log(`✅ 添加选项到 ${selectId}: ${val}`);
					}
				} catch (e) {
					console.error(`ensureOption失败 (${selectId}):`, e);
				}
			};
				
				// 计算电机功率（处理22+11格式）
				const calculateMotorPower = (powerStr) => {
					if (!powerStr) return 0;
					
					const str = String(powerStr).trim();
					if (str.includes('+')) {
						// 处理 "22+11" 格式
						const parts = str.split('+').map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
						return parts.reduce((sum, val) => sum + val, 0);
					} else {
						// 单个数值
						const num = parseFloat(str);
						return isNaN(num) ? 0 : num;
					}
				};
				
				// 清空所有字段（包括价格增幅）
				const clearFields = ['deviceNumber','deviceName','specification','technicalParams','material','unit','quantity','motorQuantity','motorPower','singleDevicePower','totalPower','unitPrice','totalPrice','remarks','priceIncrease'];
				clearFields.forEach(id => { 
					const el = document.getElementById(id); 
					if (el) el.value = ''; 
				});
				
				// 清空设备类型（反向读取时清空）
				const deviceTypeSelect = document.getElementById('deviceType');
				if (deviceTypeSelect) {
					deviceTypeSelect.value = '';
				}
				
				// ⚠️ 重置原始单价（用于价格增幅计算）
				window.originalUnitPrice = 0;
				
			// 安全设置元素值的辅助函数
			const safeSetValue = (elementId, value) => {
				const element = document.getElementById(elementId);
				if (element) {
					// 处理null、undefined等值
					if (value === null || value === undefined) {
						element.value = '';
					} else {
						element.value = String(value);
					}
			} else {
					console.warn(`元素 ${elementId} 不存在`);
				}
			};
				
	// ✅ 确保版本信息正确
	if (window.ensureCorrectVersion) {
		window.ensureCorrectVersion();
	}
	
			const currentSheet = luckysheet.getSheet();
	const isSimplified = window.currentSheetVersion ? window.currentSheetVersion.isSimplified : false;
				
				// 读取并填充数据
			if (isSimplified) {
				// ===================== 简化版列映射 =====================
				console.log(`  📋 简化版列映射: B(1)=${rowData[1]}, C(2)=${rowData[2]}, D(3)=${rowData[3]}, E(4)=${rowData[4]}`);
				
				// B列: 设备名称 (1) - select元素
				const deviceName = getCellValue(rowData[1]);
				console.log(`  ✅ B列(1)设备名称: "${deviceName}"`);
				if (deviceName) ensureOption('deviceName', deviceName);
				safeSetValue('deviceName', deviceName);
				
				// 设备位号和材料设为只读（不从表格读取）
				safeSetValue('deviceNumber', '');
				safeSetValue('material', '');
				// 禁用这两个字段
				const deviceNumberEl = document.getElementById('deviceNumber');
				const materialEl = document.getElementById('material');
				if (deviceNumberEl) {
					deviceNumberEl.readOnly = true;
					deviceNumberEl.style.backgroundColor = '#f5f5f5';
				}
				if (materialEl) {
					materialEl.readOnly = true;
					materialEl.style.backgroundColor = '#f5f5f5';
				}
				
				// C列: 规格型号 (2) - select元素
				const specification = getCellValue(rowData[2]);
				console.log(`  ✅ C列(2)规格型号: "${specification}"`);
				if (specification) ensureOption('specification', specification);
				safeSetValue('specification', specification);
				
				// D列: 技术参数 (3)
				const technicalParams = getCellValue(rowData[3]);
				console.log(`  ✅ D列(3)技术参数: "${technicalParams}"`);
				safeSetValue('technicalParams', technicalParams);
				
				// E列: 单位 (4)
				const unit = getCellValue(rowData[4]);
				console.log(`  ✅ E列(4)单位: "${unit}"`);
				safeSetValue('unit', unit);
				
				// F列: 数量 (5)
				const quantity = getCellValue(rowData[5]);
				const quantityNum = parseFloat(quantity) || 0;
				safeSetValue('quantity', quantity);
				
				// G列: 单台电机数量 (6)
				const motorQuantity = getCellValue(rowData[6]);
				const motorQuantityNum = parseFloat(motorQuantity) || 0;
				safeSetValue('motorQuantity', motorQuantity);
				
			// I列: 电机功率 (8)
			const motorPowerStr = getCellValue(rowData[8]);
			const motorPowerNum = calculateMotorPower(motorPowerStr);
			const isMultiMotorType = motorPowerStr && String(motorPowerStr).includes('+');
			// ✅ 始终显示原始值（如 "11+44"），计算时使用求和后的值
			safeSetValue('motorPower', motorPowerStr);
			console.log(`  📊 简化版I列（电机功率）: 显示="${motorPowerStr}", 计算值=${motorPowerNum}, 多电机类型=${isMultiMotorType}`);
			
			// J列：单台设备功率 (9)
			let singleDevicePower = 0;
			const jCell = rowData[9];
			if (jCell) {
				if (typeof jCell === 'object' && jCell.v !== undefined && jCell.v !== null) {
					singleDevicePower = parseFloat(jCell.v);
				} else if (typeof jCell === 'object' && jCell.m !== undefined && jCell.m !== null) {
					singleDevicePower = parseFloat(jCell.m);
				} else {
					singleDevicePower = parseFloat(getCellValue(jCell));
				}
			}
			// 如果J列为空或为0，手动计算
			if (!singleDevicePower || isNaN(singleDevicePower)) {
				if (isMultiMotorType) {
					// ✅ "11+44" 类型：单台设备功率 = 电机功率的和（不乘以单台电机数量）
					singleDevicePower = motorPowerNum;
				} else {
					// 普通类型：单台设备功率 = 电机功率 × 单台电机数量
					singleDevicePower = motorPowerNum * motorQuantityNum;
				}
			}
			safeSetValue('singleDevicePower', singleDevicePower.toFixed(2));
			console.log(`  📊 简化版J列（单台设备功率）: ${singleDevicePower.toFixed(2)} ${isMultiMotorType ? '(多电机类型，直接使用电机功率和)' : `(I=${motorPowerNum} × G=${motorQuantityNum})`}`);
				
				// K列：总设备功率 (10) = J列 × F列
				const totalPower = singleDevicePower * quantityNum;
				safeSetValue('totalPower', totalPower.toFixed(2));
				
				// L列: 设备单价 (11)
				const unitPrice = getCellValue(rowData[11]);
				const unitPriceNum = parseFloat(unitPrice) || 0;
				safeSetValue('unitPrice', unitPrice);
				// 保存原始单价
				window.originalUnitPrice = unitPriceNum;
			console.log(`  ✅ L列(11)设备单价: "${unitPrice}"`);
			
			// M列：设备总价 (12) - 直接读取M列的值
			const totalPriceValue = getCellValue(rowData[12]);
			const totalPriceNum = parseFloat(totalPriceValue) || 0;
			safeSetValue('totalQuotePrice', totalPriceNum.toFixed(2));
			console.log(`  ✅ M列(12)设备总价: "${totalPriceValue}" → 显示到总报价字段`);
				
				// N列: 备注 (13)
				const remarks = getCellValue(rowData[13]);
				safeSetValue('remarks', remarks);
			
			} else {
				// ===================== 完整版列映射（原有逻辑） =====================
			// B列: 设备位号 (1) - 完整版始终显示 "/"
			safeSetValue('deviceNumber', '/');
			// 启用设备位号字段
			const deviceNumberEl = document.getElementById('deviceNumber');
			if (deviceNumberEl) {
				deviceNumberEl.readOnly = false;
				deviceNumberEl.style.backgroundColor = '';
			}
				
				// C列: 设备名称 (2) - select元素
				const deviceName = getCellValue(rowData[2]);
				if (deviceName) ensureOption('deviceName', deviceName);
				safeSetValue('deviceName', deviceName);
				
				// D列: 规格型号 (3) - select元素
				const specification = getCellValue(rowData[3]);
				if (specification) ensureOption('specification', specification);
				safeSetValue('specification', specification);
				
			// E列: 技术参数 (4)
				const technicalParams = getCellValue(rowData[4]);
			safeSetValue('technicalParams', technicalParams);
				
				// F列: 材料 (5) - select元素
				const material = getCellValue(rowData[5]);
				if (material) ensureOption('material', material);
				safeSetValue('material', material);
				// 启用材料字段
				const materialEl = document.getElementById('material');
				if (materialEl) {
					materialEl.readOnly = false;
					materialEl.style.backgroundColor = '';
				}
				
				// G列: 单位 (6)
				const unit = getCellValue(rowData[6]);
				safeSetValue('unit', unit);
				
				// H列: 数量 (7)
				const quantity = getCellValue(rowData[7]);
				const quantityNum = parseFloat(quantity) || 0;
				safeSetValue('quantity', quantity);
				
				// I列: 单台电机数量 (8)
				const motorQuantity = getCellValue(rowData[8]);
				const motorQuantityNum = parseFloat(motorQuantity) || 0;
				safeSetValue('motorQuantity', motorQuantity);
				
				// K列: 电机功率 (10)
				const motorPowerStr = getCellValue(rowData[10]);
				const motorPowerNum = calculateMotorPower(motorPowerStr);
			const isMultiMotorType = motorPowerStr && String(motorPowerStr).includes('+');
			// ✅ 始终显示原始值（如 "11+44"），计算时使用求和后的值
				safeSetValue('motorPower', motorPowerStr);
			console.log(`  📊 完整版K列（电机功率）: 显示="${motorPowerStr}", 计算值=${motorPowerNum}, 多电机类型=${isMultiMotorType}`);
				
            // L列：单台设备功率
			let singleDevicePower = 0;
			const lCell = rowData[11];
			if (lCell) {
				if (typeof lCell === 'object' && lCell.v !== undefined && lCell.v !== null) {
					singleDevicePower = parseFloat(lCell.v);
				} else if (typeof lCell === 'object' && lCell.m !== undefined && lCell.m !== null) {
					singleDevicePower = parseFloat(lCell.m);
				} else {
					singleDevicePower = parseFloat(getCellValue(lCell));
				}
			}
            // 如果L列为空或为0，手动计算
            if (!singleDevicePower || isNaN(singleDevicePower)) {
				if (isMultiMotorType) {
					// ✅ "11+44" 类型：单台设备功率 = 电机功率的和（不乘以单台电机数量）
					singleDevicePower = motorPowerNum;
				} else {
					// 普通类型：单台设备功率 = 电机功率 × 单台电机数量
                singleDevicePower = motorPowerNum * motorQuantityNum;
				}
            }
			safeSetValue('singleDevicePower', singleDevicePower.toFixed(2));
			console.log(`  📊 完整版L列（单台设备功率）: ${singleDevicePower.toFixed(2)} ${isMultiMotorType ? '(多电机类型，直接使用电机功率和)' : `(K=${motorPowerNum} × I=${motorQuantityNum})`}`);
				
				// M列：总功率计算 = L列数据 × H列数据
				const totalPower = singleDevicePower * quantityNum;
				safeSetValue('totalPower', totalPower.toFixed(2));
				
				// N列: 单价 (13)
			const unitPrice = getCellValue(rowData[13]);
			const unitPriceNum = parseFloat(unitPrice) || 0;
			safeSetValue('unitPrice', unitPrice);
			// 保存原始单价
			window.originalUnitPrice = unitPriceNum;
				
				// O列：总价计算 = N列单价 × H列数量
				const totalPrice = unitPriceNum * quantityNum;
				safeSetValue('totalPrice', totalPrice.toFixed(2));
				
				// P列: 备注 (15)
				const remarks = getCellValue(rowData[15]);
				safeSetValue('remarks', remarks);
			}
				
				// ✅ 读取表尾的装机功率（M列合计）和总报价（O列合计）
				// 找到表尾合计行
				let footerStartRow = -1;
				for (let i = 5; i < sheetData.length; i++) {
					const row = sheetData[i];
					if (Array.isArray(row)) {
						for (let j = 0; j < row.length; j++) {
							const cellValue = getCellValue(sheetData[i][j]);
							if (String(cellValue).includes('安装费')) {
								footerStartRow = i;
								break;
							}
						}
						if (footerStartRow >= 0) break;
					}
				}
				
				if (footerStartRow >= 0) {
					const totalRow = footerStartRow + 4; // 合计行
					if (totalRow < sheetData.length) {
					let installedPower = 0;
					let totalQuotePrice = 0;
					
					if (isSimplified) {
						// 简化版：装机功率(总功率)在K列(10)，总报价在M列(12)
						const installedPowerFromSheet = getCellValue(sheetData[totalRow][10]);
						installedPower = parseFloat(installedPowerFromSheet) || 0;
						safeSetValue('installedPower', installedPower.toFixed(2));
						
						const totalQuotePriceFromSheet = getCellValue(sheetData[totalRow][12]);
						totalQuotePrice = parseFloat(totalQuotePriceFromSheet) || 0;
						safeSetValue('totalQuotePrice', totalQuotePrice.toFixed(2));
						
						console.log(`📊 简化版表尾数据 - 装机功率(K列): ${installedPower}kW, 总报价(M列): ¥${totalQuotePrice}`);
					} else {
						// 完整版：装机功率(总功率)在M列(12)，总报价在O列(14)
						const installedPowerFromSheet = getCellValue(sheetData[totalRow][12]);
						installedPower = parseFloat(installedPowerFromSheet) || 0;
						safeSetValue('installedPower', installedPower.toFixed(2));
						
						const totalQuotePriceFromSheet = getCellValue(sheetData[totalRow][14]);
						totalQuotePrice = parseFloat(totalQuotePriceFromSheet) || 0;
						safeSetValue('totalQuotePrice', totalQuotePrice.toFixed(2));
						
						console.log(`📊 完整版表尾数据 - 装机功率(M列): ${installedPower}kW, 总报价(O列): ¥${totalQuotePrice}`);
					}
					}
				}
				
				console.log(`✅ 反向读取完成 - 设备: ${deviceName}, 单台功率: ${singleDevicePower}kW, 总功率: ${totalPower}kW, 总价: ¥${totalPrice}`);
			} catch (error) {
				console.error('❌ 反向读取数据失败:', error);
			}
		}
		
	// 实现表单与表格的实时联动
	function initRealtimeSync() {
		console.log('🔄 初始化实时联动功能（双向绑定）');
		
		// 存储当前选中的行索引
		window.currentSelectedRow = null;
		
	// 保存原始单价（用于价格增幅计算）
	window.originalUnitPrice = 0;
	
    // ✅ 动态获取当前工作表类型对应的字段列表（统一用全局版本变量，避免名称误判）
	function getSyncFields() {
        // 如果详情页→表格同步已经注册，避免重复注册导致重复写回
        if (window.formToTableSyncRegistered) {
            console.log('⚠️ getSyncFields: 已存在详情页→表格同步监听，返回空映射避免重复');
            return [];
        }
        const isSimplified = window.currentSheetVersion ? !!window.currentSheetVersion.isSimplified : false;
        console.log(`[getSyncFields] 版本检测: ${isSimplified ? '简化版' : '完整版'} (来源: ${window.currentSheetVersion ? '全局变量' : '默认值'})`);
		
		if (isSimplified) {
			// 简化版列映射（无设备位号B列和材料F列）
			return [
				{ id: 'deviceName', column: 1 },          // B列
				{ id: 'specification', column: 2 },       // C列
				{ id: 'technicalParams', column: 3 },     // D列
				{ id: 'unit', column: 4 },                // E列
				{ id: 'quantity', column: 5 },            // F列
				{ id: 'motorQuantity', column: 6 },       // G列（单台电机数量）
				{ id: 'motorPower', column: 8 },          // I列
				// J列（单台设备功率）只读，由公式自动计算
				// K列（总设备功率）只读，由公式自动计算
				{ id: 'unitPrice', column: 11 },          // L列
				// M列（设备总价）只读，由公式自动计算
				{ id: 'remarks', column: 13 }             // N列
			];
		} else {
			// 完整版列映射
			return [
		{ id: 'deviceNumber', column: 1 },        // B列
		{ id: 'deviceName', column: 2 },          // C列
		{ id: 'specification', column: 3 },       // D列
		{ id: 'technicalParams', column: 4 },     // E列
		{ id: 'material', column: 5 },            // F列
		{ id: 'unit', column: 6 },                // G列
		{ id: 'quantity', column: 7 },            // H列
        { id: 'motorQuantity', column: 8 },       // I列（单台电机数量）
		{ id: 'motorPower', column: 10 },         // K列
		// L列（单台设备功率）只读，由公式自动计算
		// M列（总功率）只读，由公式自动计算
		{ id: 'unitPrice', column: 13 },          // N列
		// O列（总报价）只读，由公式自动计算
		{ id: 'remarks', column: 15 }             // P列
	];
		}
	}
		
	// 反向同步：监听表格变化，更新到详情页面
	// 注意：这个函数用于注册全局hook，只在初始化时调用一次
	window.setupTableToFormSync = function() {
		if (window.luckysheet && luckysheet.createHook && !window.tableToFormSyncRegistered) {
			window.tableToFormSyncRegistered = true;
			
			luckysheet.createHook('cellUpdated', (sheet, cell) => {
				// 只有当前有选中行，且变化的单元格在当前选中行时，才更新详情页
				if (window.currentSelectedRow === null || window.currentSelectedRow < 5) return;
				
				try {
					// cell可能是数组 [row, col] 或对象 {row, column}
					let row, col;
					if (Array.isArray(cell)) {
						[row, col] = cell;
					} else if (cell && typeof cell === 'object') {
						row = cell.row !== undefined ? cell.row : cell.r;
						col = cell.column !== undefined ? cell.column : cell.c;
					} else {
						return;
					}
					
					console.log(`📝 表格单元格更新: 第${row+1}行第${col+1}列, 当前选中行: ${window.currentSelectedRow+1}`);
					
					if (row === window.currentSelectedRow) {
						console.log(`🔄 表格第${row+1}行第${col+1}列被编辑，同步到详情页`);
					
					// ✅ 动态获取当前工作表的字段映射
					const syncFields = getSyncFields();
						
						// 查找对应的字段
						const field = syncFields.find(f => f.column === col);
						if (field) {
							const element = document.getElementById(field.id);
							if (element) {
								const cellValue = luckysheet.getCellValue(row, col);
								const textValue = window.getCellText ? window.getCellText(cellValue) : (
									cellValue && typeof cellValue === 'object' && 'v' in cellValue ? 
									String(cellValue.v) : String(cellValue)
								);
								
								console.log(`🔍 获取到单元格值:`, cellValue, `→ 文本:`, textValue);
								
								// 避免循环更新：只有值不同时才更新
								if (element.value !== textValue) {
									element.value = textValue;
									console.log(`✅ 已同步表格 → 详情页: ${field.id} = "${textValue}"`);
								} else {
									console.log(`⏭️ 跳过更新（值相同）: ${field.id}`);
								}
							} else {
								console.warn(`❌ 找不到元素: ${field.id}`);
							}
						} else {
							console.log(`⏭️ 列${col+1}不在监听范围内`);
						}
					} else {
						console.log(`⏭️ 跳过更新（不是当前选中行）`);
					}
				} catch (e) {
					console.error('❌ 表格→详情页同步失败:', e, e.stack);
				}
			});
			
			console.log('✅ 已启用表格→详情页双向同步');
		}
	};
	
	// 立即调用一次（如果luckysheet已初始化）
	window.setupTableToFormSync();

// ✅ 详情页→表格实时同步（反向读取后修改详情页数据时同步）
window.setupFormToTableSync = function() {
	if (window.formToTableSyncRegistered) {
		console.log('⚠️ 详情页→表格同步已注册，跳过');
		return;
	}
	window.formToTableSyncRegistered = true;
	
	// 需要实时同步的字段（包含motorPower，它会触发单台设备功率和总功率的计算）
	const syncFieldIds = ['quantity', 'motorQuantity', 'motorPower', 'unitPrice', 'priceIncrease', 'material', 'technicalParams', 'deviceName', 'remarks'];
	
	syncFieldIds.forEach(fieldId => {
		const element = document.getElementById(fieldId);
		if (!element) {
			console.warn(`⚠️ 找不到元素: ${fieldId}`);
			return;
		}
		
		// 监听输入事件
		element.addEventListener('input', function() {
			// 只有当前有选中行时才同步
			if (window.currentSelectedRow === null || window.currentSelectedRow < 5) {
				console.log(`⏭️ 跳过同步（未选中行）: ${fieldId}`);
				return;
			}
			
			const row = window.currentSelectedRow;
			const value = element.value;
			
		// ✅ 检测当前工作表类型（优先使用全局变量，避免多工作表干扰）
		const isSimplified = window.currentSheetVersion ? window.currentSheetVersion.isSimplified : false;
		console.log(`📊 详情页回写版本检测: ${isSimplified ? '简化版' : '完整版'} (来源: ${window.currentSheetVersion ? '全局变量' : '默认值'})`);
		console.log(`  🔍 currentSheetVersion详情:`, window.currentSheetVersion);
		
		// ✅ 价格增幅字段不需要验证（它只是触发单价计算，不直接回写到表格）
		if (fieldId !== 'priceIncrease') {
			// ✅ 验证必填字段：设备名称和规格型号必须已填写
			const deviceNameEl = document.getElementById('deviceName');
			const specificationEl = document.getElementById('specification');
			const deviceName = deviceNameEl ? deviceNameEl.value : '';
			const specification = specificationEl ? specificationEl.value : '';
			
			if (!deviceName || !deviceName.trim() || deviceName.trim() === '') {
				console.log(`⏭️ 跳过同步（未选择设备名称）: ${fieldId}`);
				return;
			}
			
			if (!specification || !specification.trim() || specification.trim() === '') {
				console.log(`⏭️ 跳过同步（未选择规格型号）: ${fieldId}`);
				return;
			}
		}
			
			console.log(`📝 详情页字段变化 (${isSimplified ? '简化版' : '完整版'}): ${fieldId} = "${value}"，同步到第${row+1}行`);
			
			// ✅ 根据工作表类型和字段ID找到对应的列
			let col = -1;
		if (isSimplified) {
			// 简化版列映射
			if (fieldId === 'quantity') col = 5; // F列
			else if (fieldId === 'motorQuantity') col = 6; // G列
			else if (fieldId === 'technicalParams') col = 3; // D列：技术参数
			else if (fieldId === 'deviceName') col = 1; // B列：设备名称
			else if (fieldId === 'remarks') col = 13; // N列：备注
			else if (fieldId === 'motorPower') {
				console.log(`  📍 简化版列映射: ${fieldId} → motorPower特殊处理`);
				col = 8; // I列
				// 写入电机功率到I列
				luckysheet.setCellValue(row, col, {
					v: value,
					m: String(value),
					ct: { fa: "General", t: "g" },
					ht: 0,
					vt: 0
				});
				
				// 触发单台设备功率和总功率的重新计算
				// J列 = I × G（电机功率 × 单台电机数量）
				// K列 = J × F（单台设备功率 × 数量）
				setTimeout(() => {
					if (luckysheet.jfrefreshgrid) {
						luckysheet.jfrefreshgrid();
						console.log(`✅ 电机功率更新后触发公式刷新`);
					}
				}, 50);
				
				console.log(`✅ 简化版已同步电机功率到I列: ${value}`);
				return;
			}
			else if (fieldId === 'unitPrice') {
				console.log(`  📍 简化版列映射: ${fieldId} → unitPrice特殊处理`);
					col = 11; // L列
					// 单价变化时需要重新计算总价列
					const quantity = parseFloat(document.getElementById('quantity').value) || 0;
					const unitPrice = parseFloat(value) || 0;
					const totalPrice = quantity * unitPrice;
					
					// 更新单价列（简化版L列，完整版N列）
					luckysheet.setCellValue(row, col, {
						v: unitPrice,
						m: String(unitPrice),
						ct: { fa: "General", t: "n" },
						ht: 0,
						vt: 0
					});
					
				// 更新总价列（简化版M列12）
				const totalPriceCol = 12; // 简化版M列
				if (totalPrice > 0) {
					luckysheet.setCellValue(row, totalPriceCol, {
						v: totalPrice,
						m: totalPrice.toFixed(2),
						ct: { fa: "0.00", t: "n" },
						ht: 0,
						vt: 0
					});
				}
				
				// ✅ 清空N列和O列（简化版不使用这两列）
				luckysheet.setCellValue(row, 13, {
					v: '',
					m: '',
					ct: { fa: "General", t: "g" },
					ht: 0,
					vt: 0
				});
				luckysheet.setCellValue(row, 14, {
					v: '',
					m: '',
					ct: { fa: "General", t: "g" },
					ht: 0,
					vt: 0
				});
				
				// 触发求和更新
				setTimeout(() => {
					if (window.manualCalculateSum) window.manualCalculateSum();
				}, 100);
				
				console.log(`✅ 简化版已同步单价到L列和M列，清空N/O列: ${unitPrice.toFixed(2)} → ${totalPrice.toFixed(2)}`);
				return;
				}
		} else {
			// 完整版列映射
			if (fieldId === 'quantity') col = 7; // H列
			else if (fieldId === 'motorQuantity') col = 8; // I列
			else if (fieldId === 'motorPower') {
				console.log(`  📍 完整版列映射: ${fieldId} → motorPower特殊处理`);
				col = 10; // K列
				// 写入电机功率到K列
				luckysheet.setCellValue(row, col, {
					v: value,
					m: String(value),
					ct: { fa: "General", t: "g" },
					ht: 0,
					vt: 0
				});
				
				// 触发单台设备功率和总功率的重新计算
				// L列 = K × I（电机功率 × 单台电机数量）
				// M列 = L × H（单台设备功率 × 数量）
				setTimeout(() => {
					if (luckysheet.jfrefreshgrid) {
						luckysheet.jfrefreshgrid();
						console.log(`✅ 电机功率更新后触发公式刷新`);
					}
				}, 50);
				
				console.log(`✅ 完整版已同步电机功率到K列: ${value}`);
				return;
			}
			else if (fieldId === 'technicalParams') col = 4; // E列：技术参数
			else if (fieldId === 'deviceName') col = 2; // C列：设备名称
			else if (fieldId === 'remarks') col = 15; // P列：备注
			else if (fieldId === 'unitPrice') {
				console.log(`  📍 完整版列映射: ${fieldId} → unitPrice特殊处理`);
					col = 13; // N列
					// 单价变化时需要重新计算总价列
					const quantity = parseFloat(document.getElementById('quantity').value) || 0;
					const unitPrice = parseFloat(value) || 0;
					const totalPrice = quantity * unitPrice;
					
					// 更新单价列N列
					luckysheet.setCellValue(row, col, {
						v: unitPrice,
						m: String(unitPrice),
						ct: { fa: "General", t: "n" },
						ht: 0,
						vt: 0
					});
					
					// 更新总价列O列(14)
					if (totalPrice > 0) {
						luckysheet.setCellValue(row, 14, {
							v: totalPrice,
							m: totalPrice.toFixed(2),
							ct: { fa: "0.00", t: "n" },
							ht: 0,
							vt: 0
						});
					}
					
					// 触发求和更新
					setTimeout(() => {
						if (window.manualCalculateSum) window.manualCalculateSum();
					}, 100);
					
				console.log(`✅ 完整版已同步单价到N列和O列: ${unitPrice.toFixed(2)} → ${totalPrice.toFixed(2)}`);
				return;
			}
		}
		
		// 价格增幅处理
		if (fieldId === 'priceIncrease') {
			// 价格增幅变化时重新计算单价
			const priceIncrease = parseFloat(value) || 0;
			const originalPrice = window.originalUnitPrice || 0;
			const newUnitPrice = originalPrice * (1 + priceIncrease / 100);
			
			// 更新单价字段
			document.getElementById('unitPrice').value = newUnitPrice.toFixed(2);
			
			// 触发单价的同步逻辑
			const event = new Event('input', { bubbles: true });
			document.getElementById('unitPrice').dispatchEvent(event);
			
			console.log(`✅ 价格增幅变化: ${priceIncrease}% → 新单价: ${newUnitPrice.toFixed(2)}`);
			return;
		}
		
		// 材料字段处理
		if (fieldId === 'material') {
			// 只有完整版才同步材料字段
			if (!isSimplified) {
				// 材料字段同步到完整版F列
				luckysheet.setCellValue(row, 5, {
					v: value,
					m: value,
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				console.log(`✅ 完整版已同步材料到F列: "${value}"`);
			} else {
				console.log(`⏭️ 简化版跳过材料字段同步`);
			}
			return;
		}
			
			// 输出最终选择的列索引
			console.log(`  ✅ 最终列索引: ${fieldId} → col=${col} (${isSimplified ? '简化版' : '完整版'})`);
		
	if (col >= 0) {
		// 区分文本字段和数值字段
		const textFields = ['technicalParams', 'deviceName', 'remarks'];
		const isTextField = textFields.includes(fieldId);
		
		if (isTextField) {
			// 文本字段同步
			luckysheet.setCellValue(row, col, {
				v: value,
				m: value,
				ct: { fa: "General", t: "g" },
				ff: "SimSun",
				fs: 10,
				ht: 0,
				vt: col === 3 || col === 4 ? 2 : 0, // D/E列(技术参数)左对齐
				bl: 0,
				it: 0,
				cl: 0
			});
			
			// 技术参数变化时，重新计算行高
			if (fieldId === 'technicalParams') {
				setTimeout(() => {
					if (window.adjustRowHeights) {
						window.adjustRowHeights([row]);
					}
				}, 100);
			}
			
			console.log(`✅ 已同步文本字段 → 表格: ${fieldId} = "${value}" → 第${row+1}行第${col+1}列`);
		} else {
			// 数值字段同步
			const numValue = parseFloat(value) || 0;
			luckysheet.setCellValue(row, col, {
				v: numValue,
				m: String(numValue),
				ct: { fa: "General", t: "n" },
				ht: 0,
				vt: 0
			});
			
			console.log(`✅ 已同步数值字段 → 表格: ${fieldId} = ${numValue} → 第${row+1}行第${col+1}列`);
		}
		
		// 数量或电机数量变化时，触发公式列重新计算
		if (fieldId === 'quantity' || fieldId === 'motorQuantity') {
				setTimeout(() => {
					const sheetData = luckysheet.getSheetData();
					
					if (isSimplified) {
						// ===================== 简化版公式重算 =====================
						// G列：单台电机数量，F列：数量
						const gVal = sheetData[row] && sheetData[row][6];
						const fVal = sheetData[row] && sheetData[row][5];
						const gNum = parseFloat((gVal && typeof gVal === 'object') ? (gVal.v || gVal.m) : gVal) || 0;
						const fNum = parseFloat((fVal && typeof fVal === 'object') ? (fVal.v || fVal.m) : fVal) || 0;
						
						// H列：总电机数量 = G*F
						const hResult = Math.round(gNum * fNum);
						if (hResult > 0) {
							luckysheet.setCellValue(row, 7, {
								v: hResult,
								m: String(hResult),
								ct: { fa: "General", t: "n" },
								ht: 0,
								vt: 0
							});
						}
						
						// J列和K列也需要重新计算（如果I列有值）
						const iCell = sheetData[row] && sheetData[row][8];
						const iVal = (iCell && typeof iCell === 'object') ? (iCell.v || iCell.m) : iCell;
						const iStr = String(iVal || '').trim();
						
					let jResult = 0, kResult = 0; // 初始化变量
						if (iStr && iStr !== '/') {
							const iNum = parseFloat(iStr) || 0;
						jResult = iNum * gNum; // J = I * G
							
							// J列：单台设备功率
							luckysheet.setCellValue(row, 9, {
								v: jResult > 0 ? jResult : '',
								m: jResult > 0 ? String(jResult) : '',
								ct: { fa: "General", t: "n" },
								ff: "SimSun",
								fs: 10,
								ht: 0,
								vt: 0
							});
							
						kResult = jResult * fNum; // K = J * F
							// K列：设备总功率
							luckysheet.setCellValue(row, 10, {
								v: kResult > 0 ? kResult : '',
								m: kResult > 0 ? String(kResult) : '',
								ct: { fa: "General", t: "n" },
								ff: "SimSun",
								fs: 10,
								ht: 0,
								vt: 0
							});
						}
						
						// M列：设备总价 = L*F
						const lCell = sheetData[row] && sheetData[row][11];
						const lNum = parseFloat((lCell && typeof lCell === 'object') ? (lCell.v || lCell.m) : lCell) || 0;
						const mResult = lNum * fNum;
						
						if (mResult > 0) {
							luckysheet.setCellValue(row, 12, {
								v: mResult,
								m: mResult.toFixed(2),
								ct: { fa: "0.00", t: "n" },
								ht: 0,
								vt: 0
							});
						}
						
						console.log(`✅ 简化版公式重算完成: H=${hResult}, J=${jResult}, K=${kResult}, M=${mResult.toFixed(2)}`);
						
					} else {
						// ===================== 完整版公式重算 =====================
						const iVal = sheetData[row] && sheetData[row][8];
						const hVal = sheetData[row] && sheetData[row][7];
						const iNum = parseFloat((iVal && typeof iVal === 'object') ? (iVal.v || iVal.m) : iVal) || 0;
						const hNum = parseFloat((hVal && typeof hVal === 'object') ? (hVal.v || hVal.m) : hVal) || 0;
						
						// J列：I*H
						const jResult = Math.round(iNum * hNum);
						if (jResult > 0) {
							luckysheet.setCellValue(row, 9, {
								v: jResult,
								m: String(jResult),
								ct: { fa: "General", t: "n" },
								ht: 0,
								vt: 0
							});
						}
						
						// 初始化变量
						let lResult = 0, mResult = 0;
						
						// L列和M列也需要重新计算（如果K列有值）
						const kCell = sheetData[row] && sheetData[row][10];
						const kVal = (kCell && typeof kCell === 'object') ? (kCell.v || kCell.m) : kCell;
						const kStr = String(kVal || '').trim();
						
						if (kStr && kStr !== '/') {
							const kNum = parseFloat(kStr) || 0;
							lResult = kNum * iNum;
							
							// L列：总是设置，空值时也设置居中
							luckysheet.setCellValue(row, 11, {
								v: lResult > 0 ? lResult : '',
								m: lResult > 0 ? String(lResult) : '',
								ct: { fa: "General", t: "n" },
								ff: "SimSun",
								fs: 10,
								ht: 0,
								vt: 0
							});
							
							mResult = lResult * hNum;
							// M列：总是设置，空值时也设置居中
							luckysheet.setCellValue(row, 12, {
								v: mResult > 0 ? mResult : '',
								m: mResult > 0 ? String(mResult) : '',
								ct: { fa: "General", t: "n" },
								ff: "SimSun",
								fs: 10,
								ht: 0,
								vt: 0
							});
						}
						
						// O列：N*H
						const nCell = sheetData[row] && sheetData[row][13];
						const nNum = parseFloat((nCell && typeof nCell === 'object') ? (nCell.v || nCell.m) : nCell) || 0;
						const oResult = nNum * hNum;
						
						if (oResult > 0) {
							luckysheet.setCellValue(row, 14, {
								v: oResult,
								m: oResult.toFixed(2),
								ct: { fa: "0.00", t: "n" },
								ht: 0,
								vt: 0
							});
						}
						
						console.log(`✅ 完整版公式重算完成: J=${jResult}, L=${lResult}, M=${mResult}, O=${oResult.toFixed(2)}`);
					}
					
				// 触发求和更新（manualCalculateSum内部会更新详情页）
				if (window.manualCalculateSum) window.manualCalculateSum();
				
			// 刷新显示
			if (luckysheet.refresh) luckysheet.refresh();
		}, 100);
	}
}
});
});
	
	console.log('✅ 已启用详情页→表格实时同步');
};

// 立即调用一次
window.setupFormToTableSync();
		
	// 统一获取价格相关字段
	const unitPriceField = document.getElementById('unitPrice');
	const totalPriceField = document.getElementById('totalPrice');
	const quantityField = document.getElementById('quantity');
	const priceIncreaseField = document.getElementById('priceIncrease');
	
	if (unitPriceField) {
		unitPriceField.addEventListener('input', function(event) {
			// 保存原始单价
			window.originalUnitPrice = parseFloat(this.value) || 0;
			console.log(`💰 保存原始单价: ${window.originalUnitPrice}`);
			
			// 实时更新总价
			const quantity = parseFloat(quantityField?.value) || 0;
			const totalPrice = window.originalUnitPrice * quantity;
			if (totalPriceField) {
				totalPriceField.value = totalPrice.toFixed(2);
				console.log(`💰 单价变化，实时更新总价: ${window.originalUnitPrice} × ${quantity} = ${totalPrice}`);
			}
			
			// ✅ 新增：延迟触发表格更新后，更新装机功率和总报价
			// 注意：这里不直接更新，而是等待syncFields的监听器更新表格后，由cellUpdated hook处理
		});
	}
		
	// 单独处理价格增幅字段：从原始单价计算
	if (priceIncreaseField) {
		priceIncreaseField.addEventListener('input', function(event) {
			if (!event || !event.isTrusted) return;
			
			const increasePercent = parseFloat(this.value) || 0;
			const originalPrice = window.originalUnitPrice || 0;
			
			// 从原始单价计算新单价
			const newPrice = originalPrice * (1 + increasePercent / 100);
			
			console.log(`📈 价格增幅: ${increasePercent}%, 原价: ${originalPrice}, 新价: ${newPrice}`);
			
			// 更新单价显示
			if (unitPriceField) {
				// ✅ 修复：保留2位小数精度
				const roundedPrice = Math.round(newPrice * 100) / 100;
				unitPriceField.value = roundedPrice.toFixed(2);
				
				// 实时更新总价
				const quantity = parseFloat(quantityField?.value) || 0;
                const totalPrice = roundedPrice * quantity;
                if (totalPriceField) {
                    totalPriceField.value = (Math.round(totalPrice * 100) / 100).toFixed(2);
					console.log(`💰 实时更新总价: ${roundedPrice} × ${quantity} = ${totalPrice.toFixed(2)}`);
				}
				
			// 更新表格中的单价
				if (window.currentSelectedRow !== null && window.currentSelectedRow >= 5) {
					if (window.luckysheet && luckysheet.setCellValue) {
					// ✅ 检测当前工作表类型
					const currentSheet = luckysheet.getSheet();
					const isSimplified = currentSheet && currentSheet.name && currentSheet.name.includes('简化版');
					
					// ✅ 根据工作表类型确定单价列和总价列
					const unitPriceCol = isSimplified ? 11 : 13; // 简化版L列，完整版N列
					const totalPriceCol = isSimplified ? 12 : 14; // 简化版M列，完整版O列
					
					// 更新单价列
					luckysheet.setCellValue(window.currentSelectedRow, unitPriceCol, roundedPrice);
					console.log(`✅ ${isSimplified ? '简化版' : '完整版'}已更新表格单价列: ${roundedPrice.toFixed(2)}`);
					
					// 更新总价列
					const quantity = parseFloat(quantityField?.value) || 0;
					const totalPriceValue = roundedPrice * quantity;
					if (totalPriceValue > 0) {
						luckysheet.setCellValue(window.currentSelectedRow, totalPriceCol, {
							v: totalPriceValue,
							m: totalPriceValue.toFixed(2),
							ct: { fa: "0.00", t: "n" },
							ht: 0,
							vt: 0
						});
						console.log(`✅ ${isSimplified ? '简化版' : '完整版'}已更新表格总价列: ${totalPriceValue.toFixed(2)}`);
					}
					
					// ✅ 简化版需要清空N列和O列
					if (isSimplified) {
						luckysheet.setCellValue(window.currentSelectedRow, 13, {
							v: '',
							m: '',
							ct: { fa: "General", t: "g" },
							ht: 0,
							vt: 0
						});
						luckysheet.setCellValue(window.currentSelectedRow, 14, {
							v: '',
							m: '',
							ct: { fa: "General", t: "g" },
							ht: 0,
							vt: 0
						});
						console.log(`✅ 简化版已清空N/O列`);
					}
					
					// ⚠️ 多次刷新确保公式计算
					setTimeout(() => {
						if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
						if (luckysheet.refresh) luckysheet.refresh();
						console.log('🔄 价格增幅后第1次刷新');
					}, 100);
					
					setTimeout(() => {
						if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
						if (luckysheet.refresh) luckysheet.refresh();
						console.log('🔄 价格增幅后第2次刷新');
					}, 300);
					
					// ⚠️ 手动计算求和
					setTimeout(() => {
						if (window.manualCalculateSum) {
							window.manualCalculateSum();
							console.log('✅ 价格增幅后手动计算求和完成');
						}
					}, 500);
						
						// ✅ 更新详情页总报价和装机功率
						setTimeout(() => {
							if (window.updateDetailTotalsFromFooter) {
								window.updateDetailTotalsFromFooter();
								console.log('✅ 价格增幅后更新详情页总计完成');
							}
						}, 700);
					}
				}
			}
		});
	}
	
	// 监听数量变化，实时更新总价
	if (quantityField && unitPriceField && totalPriceField) {
		quantityField.addEventListener('input', function(event) {
			const quantity = parseFloat(this.value) || 0;
			const unitPrice = parseFloat(unitPriceField.value) || 0;
            const totalPrice = unitPrice * quantity;
            totalPriceField.value = (Math.round(totalPrice * 100) / 100).toString();
			console.log(`💰 数量变化，实时更新总价: ${unitPrice} × ${quantity} = ${totalPrice}`);
		});
	}
		
		// ✅ 动态获取当前工作表的字段映射
		const syncFields = getSyncFields();
		
		// 为每个字段添加变化监听
		syncFields.forEach(field => {
			const element = document.getElementById(field.id);
			if (element) {
				console.log(`✅ 找到元素 ${field.id}，添加监听器`);
				
			// ✅ 统一从表尾读取并刷新详情页“装机功率/总报价”
		window.updateDetailTotalsFromFooter = function() {
			try {
				const totalQuotePriceField = document.getElementById('totalQuotePrice');
				const installedPowerField = document.getElementById('installedPower');
				if (!window.luckysheet || !luckysheet.getSheetData || !totalQuotePriceField || !installedPowerField) return;
				
				// ✅ 检测当前工作表类型
				const currentSheet = luckysheet.getSheet();
				const isSimplified = currentSheet && currentSheet.name && currentSheet.name.includes('简化版');
				
				const sheetData = luckysheet.getSheetData();
				if (!Array.isArray(sheetData)) return;
				let footerStartRow = -1;
				for (let i = 5; i < sheetData.length; i++) {
					const row = sheetData[i];
					if (!Array.isArray(row)) continue;
					for (let j = 0; j < row.length; j++) {
						const cell = row[j];
						const val = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
						if (String(val).includes('安装费')) { footerStartRow = i; break; }
					}
					if (footerStartRow >= 0) break;
				}
				if (footerStartRow < 0) return;
				const totalRow = footerStartRow + 4;
				
				let installedPowerVal, totalQuoteVal;
				if (isSimplified) {
					// 简化版：装机功率从K列读取，总报价从M列读取
					const kCell = sheetData[totalRow] ? sheetData[totalRow][10] : undefined;  // K列
					const mCell = sheetData[totalRow] ? sheetData[totalRow][12] : undefined;  // M列
					installedPowerVal = kCell && typeof kCell === 'object' ? (parseFloat(kCell.v) || 0) : (parseFloat(kCell) || 0);
					totalQuoteVal = mCell && typeof mCell === 'object' ? (parseFloat(mCell.v) || 0) : (parseFloat(mCell) || 0);
				} else {
					// 完整版：装机功率从M列读取，总报价从O列读取
					const mCell = sheetData[totalRow] ? sheetData[totalRow][12] : undefined;  // M列
					const oCell = sheetData[totalRow] ? sheetData[totalRow][14] : undefined;  // O列
					installedPowerVal = mCell && typeof mCell === 'object' ? (parseFloat(mCell.v) || 0) : (parseFloat(mCell) || 0);
					totalQuoteVal = oCell && typeof oCell === 'object' ? (parseFloat(oCell.v) || 0) : (parseFloat(oCell) || 0);
				}
				
				installedPowerField.value = (isNaN(installedPowerVal) ? 0 : installedPowerVal).toFixed(2);
				totalQuotePriceField.value = (isNaN(totalQuoteVal) ? 0 : totalQuoteVal).toFixed(2);
				console.log(`⚡ [updateDetailTotalsFromFooter] ${isSimplified ? '简化版' : '完整版'} - 装机功率: ${installedPowerField.value} / 总报价: ${totalQuotePriceField.value}`);
			} catch (e) { /* 忽略 */ }
		};
				
    // 创建更新函数，只有在已添加到表格后的行才允许写回
const updateTableCell = function(event) {
	const newValue = this.value;
	console.log(`🔔 updateTableCell被调用: 字段=${field.id}, 新值="${newValue}", 列=${field.column}`);
	
	// ✅ 防止在加载数据时触发写回（只在用户主动输入时写回）
	// 如果是程序设置的值（没有event或event.isTrusted为false），则跳过
	if (!event || !event.isTrusted) {
		console.log(`⚠️ 跳过程序设置的值写回: ${field.id} = "${newValue}", event=${!!event}, isTrusted=${event?.isTrusted}`);
		return;
	}
	
	// ✅ 防止从数据库加载时自动写回表格
	if (window.isLoadingFromDatabase) {
		console.log(`⚠️ 正在从数据库加载，跳过写回: ${field.id} = "${newValue}"`);
		return;
	}
	
    // 仅当当前选中的是表格中的有效数据行，且该行已存在（通过行内有设备名称等判断）时才写回
    if (window.currentSelectedRow !== null && window.currentSelectedRow >= 5) {
        const rowData = luckysheet.getSheetData()[window.currentSelectedRow] || [];
        const nameCell = rowData[2]; // C列 设备名称
        const hasAdded = !!(nameCell && ((typeof nameCell === 'object' && nameCell.v) || (typeof nameCell !== 'object' && nameCell)));
		console.log(`🔍 行检查: 当前行=${window.currentSelectedRow}, C列值=${JSON.stringify(nameCell)}, hasAdded=${hasAdded}`);
        if (!hasAdded) {
            console.log('⏭️ 未添加到表格（设备名称为空），禁止写回，需先点击"添加设备"');
            return;
        }
			// 更新表格中对应的单元格
			if (window.luckysheet && luckysheet.setCellValue) {
				try {
				// ✅ K列（motorPower）保持原始文本显示（如 "11+44" 或 "15"）
				// 不转换为公式，保持用户输入的原始值
				if (field.id === 'motorPower' || field.column === 10) {
					const str = String(newValue).trim();
					console.log(`🔧 motorPower写回触发: 新值="${str}", 当前行=${window.currentSelectedRow}, event.isTrusted=${event?.isTrusted}`);
					
					// ✅ 检查K列值是否真的改变了
					const currentKCell = luckysheet.getCellValue(window.currentSelectedRow, 10);
					const currentKValue = (currentKCell !== null && typeof currentKCell === 'object' && currentKCell.v !== undefined) ? currentKCell.v : currentKCell;
					// 正确处理null/undefined：统一转为空字符串比较
					const currentKStr = (currentKValue === null || currentKValue === undefined || currentKValue === '') ? '' : String(currentKValue).trim();
					console.log(`🔍 K列当前值="${currentKStr}", 新值="${str}", 是否改变=${currentKStr !== str}`);
					
					if (currentKStr === str) {
						console.log(`⚠️ K列值未改变，跳过更新`);
						return;
					}
					
					// 直接写入原始值，不转换为公式；若为"/"则写为纯文本对象，避免被公式识别
				if (str === '/') {
					luckysheet.setCellValue(window.currentSelectedRow, 10, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
					console.log(`✅ 已写入K列: "/" (纯文本)`);
				} else {
		luckysheet.setCellValue(window.currentSelectedRow, 10, { v: str, m: String(str), ht: 0, vt: 0 });
					console.log(`✅ 已写入K列: "${str}"`);
				}
			
                // ✅ 更新L列（表达式类型：直接显示计算结果；数字类型：写入计算值，不写公式）
                if (str && str !== '/' && /[+\-*/]/.test(str) && !/^[\-]?\d+(\.\d+)?$/.test(str)) {
				// K是表达式，L直接显示计算结果
				try {
					const result = eval(str);
                    luckysheet.setCellValue(window.currentSelectedRow, 11, { v: result, m: String(result), ct: { fa: "General", t: "g" }, ht: 0, vt: 0 });
				} catch (e) {
                    luckysheet.setCellValue(window.currentSelectedRow, 11, { v: '', m: '', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 });
				}
			} else {
                // K是数字，L=K×I 写入计算值（不写公式）
                const iCellVal = luckysheet.getCellValue(window.currentSelectedRow, 8);
                const iNum = (typeof iCellVal === 'object' && iCellVal !== null) ? parseFloat(iCellVal.v ?? iCellVal.m) : parseFloat(iCellVal);
                const kNum = parseFloat(str) || 0;
                const lResult = (isNaN(iNum) ? 0 : iNum) * (isNaN(kNum) ? 0 : kNum);
				luckysheet.setCellValue(window.currentSelectedRow, 11, {
                    v: lResult > 0 ? lResult : '',
                    m: lResult > 0 ? String(lResult) : '',
                    ct: { fa: "General", t: "n" },
                    ht: 0,
                    vt: 0
				});
			}
            } else if (field.id === 'motorQuantity' || field.column === 8) {
                // ✅ I列（单台电机数量）改变时，规范为整数并更新L=K×I
                const iNum = parseFloat(newValue);
                if (!isNaN(iNum)) {
                    luckysheet.setCellValue(window.currentSelectedRow, 8, Math.round(iNum));
					
                // 读取K列值，更新L列
                    const kCell = luckysheet.getCellValue(window.currentSelectedRow, 10);
				const kValue = (kCell !== null && typeof kCell === 'object' && kCell.v !== undefined) ? kCell.v : kCell;
				const kStr = kValue ? String(kValue).trim() : '';
				
                    // 新规则：表达式 → 直接显示计算结果；数字 → K×I公式
				if (kStr && /[+\-*/]/.test(kStr) && !/^[\-]?\d+(\.\d+)?$/.test(kStr)) {
					try {
						const result = eval(kStr);
						luckysheet.setCellValue(window.currentSelectedRow, 11, { v: result, m: String(result), ht: 0, vt: 0 });
					} catch (e) {
						luckysheet.setCellValue(window.currentSelectedRow, 11, { v: '', m: '', ht: 0, vt: 0 });
					}
				} else {
                    // K是数字，L=K×I 写入计算值（不写公式）
                    const iNum2 = isNaN(iNum) ? 0 : iNum;
                    const kNum2 = parseFloat(kStr) || 0;
                    const lRes2 = iNum2 * (isNaN(kNum2) ? 0 : kNum2);
					luckysheet.setCellValue(window.currentSelectedRow, 11, {
                        v: lRes2 > 0 ? lRes2 : '',
                        m: lRes2 > 0 ? String(lRes2) : '',
                        ct: { fa: "General", t: "n" },
                        ht: 0,
                        vt: 0
					});
				}
				}
			} else {
					// ⚠️ 其他列，直接写值（需要保留居中属性）
					// 特别处理N列（单价），需要居中显示
					if (field.id === 'unitPrice' || field.column === 13) {
						const r = window.currentSelectedRow;
						const numValue = parseFloat(newValue) || 0;
						
						// N列：单价（居中显示）
						luckysheet.setCellValue(r, 13, {
							v: numValue,
							m: String(numValue),
							ct: { fa: "General", t: "n" },
							ht: 0,
							vt: 0
						});
						console.log(`✅ 已更新N列单价（居中）: ${numValue}`);
						
                        // O列：写入计算值（不写公式），空结果写空
                        const hCellVal = luckysheet.getCellValue(r, 7);
                        const hNum = (typeof hCellVal === 'object' && hCellVal !== null) ? parseFloat(hCellVal.v ?? hCellVal.m) : parseFloat(hCellVal);
                        const oVal = (isNaN(hNum) ? 0 : hNum) * (isNaN(numValue) ? 0 : numValue);
                        luckysheet.setCellValue(r, 14, {
                            v: oVal > 0 ? oVal : '',
                            m: oVal > 0 ? (Math.round(oVal * 100) / 100).toFixed(2) : '',
                            ct: { fa: "0.00", t: "n" },
                            ht: 0,
                            vt: 0
                        });
                        console.log(`✅ 已更新O列计算值`);
			} else {
					// 其他列，直接写值
					luckysheet.setCellValue(window.currentSelectedRow, field.column, newValue);
					}
				}
						
					console.log(`✅ 实时更新表格第${window.currentSelectedRow+1}行第${field.column+1}列: "${newValue}"`);
					
					// ✅ 立即刷新表格显示和公式计算
					if (luckysheet.jfrefreshgrid) {
						luckysheet.jfrefreshgrid();
					}
					if (luckysheet.refresh) {
						luckysheet.refresh();
					}
				
				// ✅ 三段刷新确保表尾求和实时更新
				setTimeout(() => {
					if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
					if (luckysheet.refresh) luckysheet.refresh();
				}, 80);
				setTimeout(() => {
					if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
				}, 180);
				
                // ✅ 延迟更新J/M列为计算值（避免与求和冲突，且不写公式，仅在K列修改时）
                if (field.id === 'motorPower' || field.column === 10) {
                    setTimeout(() => {
                        try {
                            const r = window.currentSelectedRow;
                            // J = I * H
                            const iCell = luckysheet.getCellValue(r, 8);
                            const hCell = luckysheet.getCellValue(r, 7);
                            const iNum = (typeof iCell === 'object' && iCell !== null) ? parseFloat(iCell.v ?? iCell.m) : parseFloat(iCell);
                            const hNum = (typeof hCell === 'object' && hCell !== null) ? parseFloat(hCell.v ?? hCell.m) : parseFloat(hCell);
                            const jVal = (isNaN(iNum) ? 0 : iNum) * (isNaN(hNum) ? 0 : hNum);
                            luckysheet.setCellValue(r, 9, {
                                v: jVal > 0 ? Math.round(jVal) : '',
                                m: jVal > 0 ? String(Math.round(jVal)) : '',
                                ct: { fa: "General", t: "n" },
                                ht: 0,
                                vt: 0
                            });

                            // M = L * H
                            const lCell = luckysheet.getCellValue(r, 11);
                            const lNum = (typeof lCell === 'object' && lCell !== null) ? parseFloat(lCell.v ?? lCell.m) : parseFloat(lCell);
                            const mVal = (isNaN(lNum) ? 0 : lNum) * (isNaN(hNum) ? 0 : hNum);
                            luckysheet.setCellValue(r, 12, {
                                v: mVal > 0 ? mVal : '',
                                m: mVal > 0 ? String(mVal) : '',
                                ct: { fa: "General", t: "n" },
                                ht: 0,
                                vt: 0
                            });

                            if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
                            if (luckysheet.refresh) luckysheet.refresh();
                            console.log(`✅ 已延迟更新J/M列为计算值（K列修改后）`);
                        } catch (e) {
                            console.warn('⚠️ 延迟更新J/M列计算失败:', e);
                        }
                    }, 250);
                }
				
				// ✅ 多次强制刷新表尾求和公式（确保J/M/O列求和实时更新）
				// 第1次刷新（350ms）
				setTimeout(() => {
					try {
						if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
						console.log(`🔄 第1次刷新表尾求和公式`);
					} catch (e) {
						console.warn('⚠️ 第1次刷新表尾求和失败:', e);
					}
				}, 350);
				
				// 第2次刷新（500ms）
				setTimeout(() => {
					try {
						if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
						if (luckysheet.refresh) luckysheet.refresh();
						console.log(`🔄 第2次刷新表尾求和公式（双重刷新）`);
					} catch (e) {
						console.warn('⚠️ 第2次刷新表尾求和失败:', e);
					}
				}, 500);
				
				// 第3次刷新（700ms）- 确保所有公式计算完成
				setTimeout(() => {
					try {
						if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
						console.log(`🔄 第3次刷新表尾求和公式（最终确认）`);
					} catch (e) {
						console.warn('⚠️ 第3次刷新表尾求和失败:', e);
					}
				}, 700);
				
					// ✅ 详情页修改后，手动计算求和（不依赖公式）
					setTimeout(() => {
						if (window.manualCalculateSum) window.manualCalculateSum();
						if (window.updateDetailTotalsFromFooter) window.updateDetailTotalsFromFooter();
					}, 500);
					setTimeout(() => {
						if (window.manualCalculateSum) window.manualCalculateSum();
						if (window.updateDetailTotalsFromFooter) window.updateDetailTotalsFromFooter();
					}, 800);
					setTimeout(() => {
						if (window.manualCalculateSum) window.manualCalculateSum();
						if (window.updateDetailTotalsFromFooter) window.updateDetailTotalsFromFooter();
					}, 1000);
						
						// 如果是设备名称变化，需要更新设备列表
						if (field.id === 'deviceName') {
							setTimeout(() => {
								if (typeof updateDeviceListFromTable === 'function') {
									updateDeviceListFromTable();
								}
							}, 100);
						}
					} catch (e) {
						console.error('❌ 更新表格失败:', e);
					}
				}
			}
		};
		
		// 对于所有输入框和文本框，使用input事件实现真正的实时更新
		if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
			element.addEventListener('input', updateTableCell);
			console.log(`✅ 已为 ${field.id} 添加input事件监听（实时无延迟）`);
			
			// 关键字段增加冗余触发，避免部分环境只点击或失焦不触发写回
			if (field.id === 'motorPower') {
				element.addEventListener('change', updateTableCell);
				element.addEventListener('blur', updateTableCell);
			}
			
			// ✅ 如果是电机数量、电机功率、数量或单价，添加额外的实时计算监听
            if (field.id === 'motorQuantity' || field.id === 'motorPower' || field.id === 'quantity' || field.id === 'unitPrice') {
				element.addEventListener('input', function() {
					// 实时计算单台设备功率和总功率
					setTimeout(() => {
                        const motorQuantity = parseFloat(document.getElementById('motorQuantity')?.value) || 0; // I列 单台电机数量
						const motorPowerStr = document.getElementById('motorPower')?.value || '0';
						const quantity = parseFloat(document.getElementById('quantity')?.value) || 0;
						const unitPrice = parseFloat(document.getElementById('unitPrice')?.value) || 0;
						
					// ✅ 计算电机功率（处理表达式）
					let motorPower = 0;
					const str = String(motorPowerStr).trim();
					if (/[+\-*/]/.test(str)) {
						// 包含运算符，使用eval计算（安全的数学表达式）
						try {
							motorPower = eval(str.replace(/[^0-9.+\-*/\s]/g, ''));
						} catch (e) {
							motorPower = 0;
						}
					} else {
						motorPower = parseFloat(str) || 0;
					}
					
                    // ✅ 单台设备功率逻辑（新：L = K × I）
					let singleDevicePower = 0;
                    singleDevicePower = motorPower * motorQuantity;
					document.getElementById('singleDevicePower').value = singleDevicePower.toFixed(2);
						
						// ✅ 总功率 = 单台设备功率 × 数量（M列 = L × H）
						const totalPower = singleDevicePower * quantity;
						document.getElementById('totalPower').value = totalPower.toFixed(2);
						
						// ✅ 总价 = 单价 × 数量（O列 = N × H）
						const totalPrice = unitPrice * quantity;
						document.getElementById('totalPrice').value = totalPrice.toFixed(2);
						
						console.log(`🔄 实时计算: K(电机功率)=${motorPower.toFixed(2)}, J(电机数量)=${motorQuantity}, L(单台功率)=${singleDevicePower.toFixed(2)}, H(数量)=${quantity}, M(总功率)=${totalPower.toFixed(2)}, N(单价)=${unitPrice.toFixed(2)}, O(总价)=${totalPrice.toFixed(2)}`);
					}, 50);
				});
			}
		}
		
        // 全局辅助：统一提取Luckysheet单元格的显示文本，避免 [object Object]
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

		// 对于下拉框，使用change事件立即更新
		if (element.tagName === 'SELECT') {
			element.addEventListener('change', updateTableCell);
			console.log(`✅ 已为 ${field.id} 添加change事件监听（立即更新）`);
		}
			} else {
				console.warn(`⚠️ 未找到元素 ${field.id}`);
			}
		});
		}
		
		// 添加设备列表双击编辑功能
		function addDoubleClickEdit() {
			console.log('🔄 初始化双击编辑功能');
			
			// 这个函数会在设备列表更新时被调用
			window.addDoubleClickToDeviceItems = function() {
				const deviceListItems = document.querySelectorAll('#deviceList li');
				deviceListItems.forEach(li => {
					// 移除之前的监听器避免重复
					li.removeEventListener('dblclick', handleDoubleClick);
					
					// 添加双击监听
					li.addEventListener('dblclick', handleDoubleClick);
				});
			};
			
		function handleDoubleClick(event) {
			event.stopPropagation();
			event.preventDefault();
			
			const li = event.currentTarget;
			
			// 防止重复编辑
			if (li.querySelector('input')) {
				console.log('⚠️ 已经在编辑状态');
				return;
			}
			
			const originalName = li.textContent.trim();
			const rowIndex = parseInt(li.dataset.rowIndex, 10);
			
			console.log(`✏️ 双击编辑设备: ${originalName} (第${rowIndex+1}行)`);
			
			// 创建输入框
			const input = document.createElement('input');
			input.type = 'text';
			input.value = originalName;
			input.style.cssText = 'width: 100%; padding: 2px; font-size: 12px; border: 1px solid #007acc; background: white; box-sizing: border-box;';
			
			// 替换文本内容
			li.textContent = '';
			li.appendChild(input);
			input.focus();
			input.select();
			
			// 标记正在编辑
			let isEditing = true;
			
			// 处理输入完成
			const finishEdit = () => {
				if (!isEditing) return;
				isEditing = false;
				
				const newName = input.value.trim();
				console.log(`📝 编辑完成: "${originalName}" → "${newName}"`);
				
				// 移除输入框
				if (input.parentNode === li) {
					li.removeChild(input);
				}
				
				if (newName && newName !== originalName) {
					// 更新表格中的设备名称
					if (window.luckysheet && luckysheet.setCellValue) {
						try {
							luckysheet.setCellValue(rowIndex, 2, newName); // C列
							console.log(`✅ 已更新表格设备名称: ${originalName} → ${newName}`);
							
							// 更新设备列表显示
							li.textContent = newName;
							
							// 如果当前选中的是这一行，也要更新详情面板
							if (window.currentSelectedRow === rowIndex) {
								const deviceNameField = document.getElementById('deviceName');
								if (deviceNameField) {
									deviceNameField.value = newName;
								}
							}
							
							// 刷新表格和设备列表
							setTimeout(() => {
								if (luckysheet.refresh) {
									luckysheet.refresh();
								}
								if (typeof updateDeviceListFromTable === 'function') {
									updateDeviceListFromTable();
								}
							}, 200);
						} catch (e) {
							console.error('❌ 更新设备名称失败:', e);
							li.textContent = originalName;
						}
					} else {
						li.textContent = newName;
					}
				} else {
					// 未修改或为空，恢复原名称
					li.textContent = originalName || '未命名';
				}
			};
			
			// 按回车键完成编辑
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					input.blur();
				} else if (e.key === 'Escape') {
					isEditing = false;
					if (input.parentNode === li) {
						li.removeChild(input);
					}
					li.textContent = originalName;
				}
			});
			
			// 失去焦点时完成编辑
			input.addEventListener('blur', finishEdit);
		}
		}
		
		// 表格自动计算功能：L列和M列、O列的公式计算
		function setupTableCalculations() {
			console.log('🧮 设置表格自动计算功能');
			
			// 计算电机功率（处理22+11格式）
			const calculateMotorPower = (powerStr) => {
				if (!powerStr) return 0;
				const str = String(powerStr).trim();
				if (str.includes('+')) {
					const parts = str.split('+').map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
					return parts.reduce((sum, val) => sum + val, 0);
				} else {
					const num = parseFloat(str);
					return isNaN(num) ? 0 : num;
				}
			};
			
			// 获取单元格值的辅助函数
			const getCellValue = (sheetData, row, col) => {
				if (!sheetData || !sheetData[row] || !sheetData[row][col]) return '';
				const cellData = sheetData[row][col];
				if (typeof cellData === 'object' && 'v' in cellData) {
					return cellData.v;
				}
				return cellData;
			};
			
		// 注意：不再需要updateCalculations函数，公式会自动计算
		// 注意：hook已在主初始化中注册，这里不再重复注册
			
	// 为所有数据行添加计算公式
	const addFormulasToAllRows = () => {
			try {
				console.log('📐 为所有数据行添加计算公式');
				
				if (!window.luckysheet) return;
				
				// ✅ 检测当前工作表类型
				const currentSheet = luckysheet.getSheet();
				const isSimplified = currentSheet && currentSheet.name && currentSheet.name.includes('简化版');
				console.log(`📋 addFormulasToAllRows - 工作表: "${currentSheet ? currentSheet.name : 'unknown'}", 类型: ${isSimplified ? '简化版' : '完整版'}`);
				
				const sheetData = luckysheet.getSheetData();
				if (!sheetData) return;
					
					// 找到表尾起始行
					let footerStartRow = -1;
					for (let i = 5; i < sheetData.length; i++) {
						const row = sheetData[i];
						if (Array.isArray(row)) {
							for (let j = 0; j < row.length; j++) {
								const cellValue = getCellValue(sheetData, i, j);
								if (String(cellValue).includes('安装费')) {
									footerStartRow = i;
									break;
								}
							}
							if (footerStartRow >= 0) break;
						}
					}
					
		// 确定数据行范围
		const startRow = 5; // 第6行开始（索引5）
		const endRow = footerStartRow >= 0 ? footerStartRow : Math.max(5, sheetData.length - 5);
		// endRow 是"安装费"行的索引，最后一行数据的索引是 endRow-1
		// SUM公式中需要用行号（1-based），所以最后数据行号 = endRow-1+1 = endRow
		const lastDataRow = endRow; // 用于SUM公式的行号（Excel行号）
					// 记录全局表尾位置，供其他逻辑使用
					if (footerStartRow >= 0) {
						window.currentFooterStartRow = footerStartRow;
					}
					
			// 为数据行添加公式，不包括表尾
			// ✅ 处理所有数据行，不限制行数
            console.log(`📊 准备为第${startRow+1}行到第${lastDataRow}行添加公式（endRow=${endRow} 为表尾首行）`);
				
			// 直接逐个设置公式，确保每个都能正确添加
		for (let r = startRow; r < endRow; r++) {
	// ⚠️ 安全检查：确保行存在
	if (!sheetData[r] || !Array.isArray(sheetData[r])) {
		console.warn(`⚠️ 第${r+1}行不存在或格式错误，跳过`);
		continue;
	}
	
		// H列：数量规范为整数，避免SUM无法计算
		const hVal = getCellValue(sheetData, r, 7);
		if (hVal !== null && hVal !== undefined && hVal !== '' && hVal !== '/') {
			const hNum = parseFloat(hVal);
			if (!isNaN(hNum)) {
				luckysheet.setCellValue(r, 7, Math.round(hNum));
			}
		}
		
		// I列：单台电机数量（读取判断是否为"/"）
		const iVal = getCellValue(sheetData, r, 8);
		const iStr = String(iVal || '').trim();
		
        // J列：总电机数量 = I×H（计算并设置值，不设置公式）
	const jCell = sheetData[r] && sheetData[r][9];
	const jRawValue = (jCell && typeof jCell === 'object') ? (jCell.v || jCell.m) : jCell;
	const jStr = String(jRawValue || '').trim();
	
	if (jStr !== '/') {
		const iNum = parseFloat(iStr) || 0;
		const hNum = parseFloat(hVal) || 0;
		const jResult = Math.round(iNum * hNum);
		
		if (jResult > 0) {
            luckysheet.setCellValue(r, 9, {
				v: jResult,
				m: String(jResult),
				ct: { fa: "General", t: "n" },
				ht: 0,
				vt: 0
			});
		}
		}
			
		// ✅ K列：电机功率（保持原始显示，如 "11+44" 或 "15"）
		// 不转换K列，保持原始文本或数字
	
	// ✅ L列：单台设备功率逻辑
		// 规则1：如果L列本身是"/"，跳过不设置公式
		// 规则2：如果K列是表达式（如"11+44"），L列直接显示计算结果
		// 规则3：如果K列是数字，L列公式=K×I
		
		// 读取L列当前值，判断是否为"/"
		const lCell = sheetData[r] && sheetData[r][11];
		const lRawValue = (lCell && typeof lCell === 'object') ? (lCell.m || lCell.v) : lCell;
		const lStr = String(lRawValue || '').trim();
		
	// ✅ 只要不是"/"就设置公式（覆盖旧公式或空值）
	if (lStr !== '/') {
		// 读取K列的原始值
		const kCell = sheetData[r] && sheetData[r][10];
		let kRawValue = null;
		if (kCell) {
			if (typeof kCell === 'object') {
				kRawValue = kCell.m || kCell.v || kCell;
			} else {
				kRawValue = kCell;
			}
		}
		
		const kStr = String(kRawValue || '').trim();
		
// 判断并写入L列：K是表达式则显示结果，否则设置公式
	const hasOperator = /[\+\-\*\/]/.test(kStr);
	const isPureNumber = /^[\-]?\d+(\.\d+)?$/.test(kStr);
	const isExpression = hasOperator && !isPureNumber && kStr && kStr !== '/';
	
	if (isExpression) {
		// K是表达式（包含运算符且不是纯数字），L列直接显示计算结果
	console.log(`📝 L列第${r+1}行: K="${kStr}"是表达式，直接显示计算结果`);
		try {
			const result = eval(kStr);
			luckysheet.setCellValue(r, 11, {
				v: result,
				ct: { fa: "General", t: "g" },
				ht: 0,
				vt: 0
			});
		} catch (e) {
			luckysheet.setCellValue(r, 11, {
				v: '',
				m: '',
				ct: { fa: "General", t: "g" },
				ht: 0,
				vt: 0
			});
		}
	} else {
	// 其他情况（K为空或数字），L=K×I计算值
	const iCell = sheetData[r] && sheetData[r][8];
	const iVal = (iCell && typeof iCell === 'object') ? (iCell.v || iCell.m) : iCell;
	const iNum = parseFloat(iVal) || 0;
	const kNum = parseFloat(kStr) || 0;
	const lResult = kNum * iNum;
	
	if (lResult > 0) {
		luckysheet.setCellValue(r, 11, {
			v: lResult,
			m: String(lResult),
			ct: { fa: "General", t: "n" },
			ht: 0,
			vt: 0
		});
		console.log(`📐 L列第${r+1}行: 已计算值=${lResult} (K=${kNum}, I=${iNum})`);
	}
}
	}
		
// M列：总功率 = L × H（计算并设置值，不设置公式）
const mCell = sheetData[r] && sheetData[r][12];
const mRawValue = (mCell && typeof mCell === 'object') ? (mCell.v || mCell.m) : mCell;
const mStr = String(mRawValue || '').trim();

if (mStr !== '/') {
	// 获取L列和H列的值进行计算
	const lCell = sheetData[r] && sheetData[r][11];
	const lVal = (lCell && typeof lCell === 'object') ? (lCell.v || lCell.m) : lCell;
	const lNum = parseFloat(lVal) || 0;
	const hNum = parseFloat(hVal) || 0;
	const mResult = lNum * hNum;
	
	if (mResult > 0) {
		luckysheet.setCellValue(r, 12, {
			v: mResult,
			m: String(mResult),
			ct: { fa: "General", t: "n" },
			ht: 0,
			vt: 0
		});
	}
	}
			
		// N列：确保单价是数字格式（保留实际精度，按实际小数位显示）+ 居中对齐
		const nVal = getCellValue(sheetData, r, 13);
		const nStr = String(nVal || '').trim();
		
		if (nVal !== null && nVal !== undefined && nVal !== '' && nVal !== '/') {
			const nNum = parseFloat(nVal);
			if (!isNaN(nNum)) {
				luckysheet.setCellValue(r, 13, { 
					v: nNum, 
					ct: { fa: "General", t: "n" },
					ht: 0,
					vt: 0
				});
			}
		} else if (nVal === '/') {
			luckysheet.setCellValue(r, 13, { 
				v: '/', 
				m: '/',
				ct: { fa: "General", t: "g" },
				ht: 0,
				vt: 0
			});
		}
			
        // O列：总价 = N × H（计算并设置值，不设置公式）
		const oCell = sheetData[r] && sheetData[r][14];
		const oRawValue = (oCell && typeof oCell === 'object') ? (oCell.v || oCell.m) : oCell;
		const oStr = String(oRawValue || '').trim();
		
		if (oStr !== '/') {
			const nNum = parseFloat(nVal) || 0;
			const hNum = parseFloat(hVal) || 0;
			const oResult = nNum * hNum;
			
			if (oResult > 0) {
			luckysheet.setCellValue(r, 14, {
					v: oResult,
					m: oResult.toFixed(2),
					ct: { fa: "0.00", t: "n" },
					ht: 0,
					vt: 0
				});
			}
		}
		}
			
			console.log(`✅ 已为第${startRow+1}行到第${endRow}行添加计算公式`);
				
		// 为表尾合计行（第5行）添加求和公式
		if (footerStartRow >= 0) {
			const totalRow = footerStartRow + 4; // 合计行是表尾第5行
			
	// 先计算初始值，确保加载后立即显示
	let jSum = 0, lSum = 0, mSum = 0, oSum = 0;
	
	// 辅助函数：计算公式结果
	const calcFormula = (row, col) => {
		const cellData = sheetData[row] && sheetData[row][col];
		if (!cellData) return 0;
		
		// 如果有公式，手动计算
		if (typeof cellData === 'object' && cellData.f) {
			const formula = cellData.f;
			
			// L列公式：=I*K
			if (col === 11 && formula.includes('*')) {
				const iVal = parseFloat(getCellValue(sheetData, row, 8)) || 0;
				const kVal = parseFloat(getCellValue(sheetData, row, 10)) || 0;
				return iVal * kVal;
			}
			
			// M列公式：=L*H
			if (col === 12 && formula.includes('*')) {
				const lVal = calcFormula(row, 11); // 递归计算L列
				const hVal = parseFloat(getCellValue(sheetData, row, 7)) || 0;
				return lVal * hVal;
			}
			
			// O列公式：=N*H
			if (col === 14 && formula.includes('*')) {
				const nVal = parseFloat(getCellValue(sheetData, row, 13)) || 0;
				const hVal = parseFloat(getCellValue(sheetData, row, 7)) || 0;
				return nVal * hVal;
			}
		}
		
		// 没有公式，直接返回值
		const val = getCellValue(sheetData, row, col);
		return parseFloat(val) || 0;
	};
	
	// 计算所有数据行的和
	let hSum = 0; // H列（数量）
	for (let r = 5; r < endRow; r++) {
		hSum += calcFormula(r, 7);
		jSum += calcFormula(r, 9);
		lSum += calcFormula(r, 11);
		mSum += calcFormula(r, 12);
		oSum += calcFormula(r, 14);
	}
	
	// 格式化为2位小数
	const formatNum = (num) => Math.round(num * 100) / 100;
	
	console.log(`💡 初始合计: H=${Math.round(hSum)}, J=${Math.round(jSum)}, L=${formatNum(lSum)}, M=${formatNum(mSum)}, O=${formatNum(oSum)}`);
	
	// ✅ H列合计：只设置初始计算值，不设置公式（避免循环引用）
        luckysheet.setCellValue(totalRow, 7, {
		v: Math.round(hSum),
		m: String(Math.round(hSum)),
		ct: { fa: "General", t: "n" },
		ht: 0,
		vt: 0
	});
	console.log(`✅ H列合计: ${Math.round(hSum)}（纯值，无公式）`);
	
	// ✅ I列合计：显示 / + 居中对齐
	luckysheet.setCellValue(totalRow, 8, {
		v: '/',
		m: '/',
		ct: { fa: "General", t: "g" },
		ht: 0,
		vt: 0
	});
	console.log(`✅ I列合计: 显示 /`);
	
	// ✅ J列合计：简化版显示/，完整版显示数值
	if (isSimplified) {
		luckysheet.setCellValue(totalRow, 9, {
			v: '/',
			m: '/',
			ct: { fa: "General", t: "g" },
			ht: 0,
			vt: 0
		});
		console.log(`✅ J列合计: / (简化版)`);
	} else {
		luckysheet.setCellValue(totalRow, 9, {
			v: Math.round(jSum),
			m: String(Math.round(jSum)),
			ct: { fa: "General", t: "n" },
			ht: 0,
			vt: 0
		});
		console.log(`✅ J列合计: ${Math.round(jSum)}（完整版）`);
	}
	
	// ✅ L列合计：不需要求和，按需显示"/"并居中
			luckysheet.setCellValue(totalRow, 11, {
				v: '/',
				m: '/',
				ct: { fa: "General", t: "g" },
				ht: 0,
				vt: 0
			});
			console.log(`✅ L列合计: 显示 /`);
	
	// ✅ M列合计：只设置初始计算值，不设置公式
        luckysheet.setCellValue(totalRow, 12, {
		v: formatNum(mSum),
		m: formatNum(mSum).toFixed(2),
		ct: { fa: "General", t: "n" },
		ht: 0,
		vt: 0
	});
	console.log(`✅ M列合计: ${formatNum(mSum).toFixed(2)}（纯值，无公式）`);

	// ✅ O列合计：只在完整版设置
	if (!isSimplified) {
		luckysheet.setCellValue(totalRow, 14, {
			v: formatNum(oSum),
			m: formatNum(oSum).toFixed(2),
			ct: { fa: "0.00", t: "n" },
			ht: 0,
			vt: 0
		});
		console.log(`✅ O列合计: ${formatNum(oSum).toFixed(2)}（完整版）`);
	} else {
		console.log(`⏭️ O列跳过（简化版不使用）`);
	}
				
		
			console.log(`✅ 已为合计行（第${totalRow+1}行）添加求和公式（H/J/M/O列）`);
	}
		
	// ⚠️ 强制重置表头第5行（索引4）的内容，防止被公式或数据覆盖
	console.log('🔧 强制重置表头第5行内容');
	if (isSimplified) {
		// 简化版：G/H列是"单/总"，J/K列是"单/总"，L/M列是"单/总"
		luckysheet.setCellValue(4, 6, { v: '单', m: '单', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // G5: 单
		luckysheet.setCellValue(4, 7, { v: '总', m: '总', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // H5: 总
		luckysheet.setCellValue(4, 9, { v: '单', m: '单', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // J5: 单
		luckysheet.setCellValue(4, 10, { v: '总', m: '总', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // K5: 总
		luckysheet.setCellValue(4, 11, { v: '单', m: '单', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // L5: 单
		luckysheet.setCellValue(4, 12, { v: '总', m: '总', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // M5: 总
		console.log('✅ 表头第5行内容已重置（简化版）');
	} else {
		// 完整版：I/J列是"单/总"，L/M列是"单/总"，N/O列是"单/总"
		luckysheet.setCellValue(4, 8, { v: '单', m: '单', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // I5: 单
		luckysheet.setCellValue(4, 9, { v: '总', m: '总', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // J5: 总
		luckysheet.setCellValue(4, 10, { v: '', m: '', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // K5: 空（K列是4-5行合并）
		luckysheet.setCellValue(4, 11, { v: '单', m: '单', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // L5: 单
		luckysheet.setCellValue(4, 12, { v: '总', m: '总', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // M5: 总
		luckysheet.setCellValue(4, 13, { v: '单', m: '单', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // N5: 单
		luckysheet.setCellValue(4, 14, { v: '总', m: '总', ct: { fa: "General", t: "g" }, ht: 0, vt: 0 }); // O5: 总
		console.log('✅ 表头第5行内容已重置（完整版）');
	}
	
	// ⚠️ 关键修复：立即刷新表格，确保所有公式（包括H列求和）正确计算和显示
	if (luckysheet.jfrefreshgrid) {
		luckysheet.jfrefreshgrid();
	}
	if (luckysheet.refresh) {
		luckysheet.refresh();
		console.log('✅ 数据行和表尾公式添加完成，已刷新（包含H列求和）');
	}
	
        // ✅ 优化刷新：三次刷新（部署公式→计算→渲染），确保显示稳定
		if (footerStartRow >= 0) {
			setTimeout(() => {
				if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
				if (luckysheet.refresh) luckysheet.refresh();
                console.log('✅ 表尾公式第1次刷新完成');
			}, 150);
			setTimeout(() => {
				if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
				if (luckysheet.refresh) luckysheet.refresh();
				console.log('✅ 表尾公式第2次刷新完成');
			}, 450);
            setTimeout(() => {
                if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
                if (luckysheet.refresh) luckysheet.refresh();
                console.log('✅ 表尾公式第3次刷新完成');
            }, 800);
		}
			
			} catch (e) {
				console.error('❌ 添加公式失败:', e);
			}
		};
			
			// 暴露函数供外部调用
			window.addFormulasToAllRows = addFormulasToAllRows;
			
            // 初始阶段不再自动为所有行写入公式，只计算并写入值
			if (!window.formulasInitialized) {
				window.formulasInitialized = true;
				setTimeout(() => {
                    console.log('🎬 首次初始化：仅计算并写入值（不写公式）');
					addFormulasToAllRows();
				}, 1000);
			}
		}
		
		// 暴露函数供全局使用
		window.updateDeviceListFromTable = updateDeviceListFromTable;
		window.loadDeviceDataToForm = loadDeviceDataToForm;
		window.reverseReadDataToForm = reverseReadDataToForm;
		window.initRealtimeSync = initRealtimeSync;
		window.addDoubleClickEdit = addDoubleClickEdit;
		window.setupTableCalculations = setupTableCalculations;
			// 全局防抖与重入标记（用于序号刷新）
			window.isRefreshingSerialNumbers = false;
			window.suppressSerialRefresh = false;
		
		// 绑定刷新按钮事件
		const refreshBtn = document.getElementById('refreshDbBtn');
		if (refreshBtn) {
			refreshBtn.addEventListener('click', function() {
			console.log('🔄 手动刷新：添加边框 + 公式与合计 + 设备列表 + 序号');
			try {
				if (!window.luckysheet || !luckysheet.getSheetData) return;
				
				// ✅ 检测当前工作表类型
				const currentSheet = luckysheet.getSheet();
				const isSimplified = currentSheet && currentSheet.name && currentSheet.name.includes('简化版');
				console.log(`📊 当前工作表: ${currentSheet ? currentSheet.name : '未知'}，${isSimplified ? '简化版' : '完整版'}`);
				
				// ⚠️ 简化版工作表不支持刷新功能（列结构不同）
				if (isSimplified) {
					alert('简化版工作表不支持刷新功能，请切换到完整版工作表进行刷新操作。');
					console.warn('⚠️ 简化版工作表不支持刷新功能');
					return;
				}
				
				const maxCol = 15; // 完整版到P列(15)
				const sheetData = luckysheet.getSheetData();
				
				// ✅ 1. 查找表尾起始行（安装费所在行）
				let footerStartRow = -1;
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
				
				if (footerStartRow < 0) {
					console.warn('⚠️ 未找到表尾（安装费）');
					footerStartRow = sheetData.length; // 默认到数据末尾
				}
				
				console.log(`✅ 找到表尾起始行: 第${footerStartRow + 1}行`);
				
				// ✅ 2. 为数据区域（第6行到表尾前）添加边框
				if (footerStartRow >= 0) {
					try {
						// 使用Luckysheet的边框配置API
						const borderConfig = [];
						for (let r = 5; r < footerStartRow; r++) {
							for (let c = 0; c <= maxCol; c++) {
								borderConfig.push({
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
						
						// 直接修改配置中的borderInfo
						const currentConfig = luckysheet.getConfig();
						if (currentConfig && currentConfig.borderInfo) {
							// 先移除数据区域的旧边框
							currentConfig.borderInfo = currentConfig.borderInfo.filter(b => {
								if (b.rangeType === 'cell' && b.value) {
									const r = b.value.row_index;
									return r < 5 || r >= footerStartRow; // 保留表头和表尾的边框
								}
								return true;
							});
							// 添加新边框
							currentConfig.borderInfo.push(...borderConfig);
							luckysheet.refresh();
							console.log(`✅ 已为数据区域（第6行到第${footerStartRow}行）添加边框`);
						} else {
							console.warn('⚠️ 无法获取配置，跳过边框设置');
						}
					} catch (e) {
						console.warn('⚠️ 边框设置失败:', e.message);
					}
				}
					
			// ✅ 3. 先规范化IJLMO列的"/"为文本，再刷新公式和合计
				const dataEnd = footerStartRow >= 0 ? footerStartRow : sheetData.length - 5;
				console.log('📝 规范IJLMO列的"/"为纯文本');
				for (let r = 5; r < dataEnd; r++) {
					// I列（单台电机数量）
					const iCell = luckysheet.getCellValue(r, 8);
					const iVal = (iCell && typeof iCell === 'object') ? (iCell.v || iCell.m) : iCell;
					if (String(iVal).trim() === '/') {
						luckysheet.setCellValue(r, 8, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
					}
					
					// J列（总电机数量）
					const jCell = luckysheet.getCellValue(r, 9);
					const jVal = (jCell && typeof jCell === 'object') ? (jCell.v || jCell.m) : jCell;
					if (String(jVal).trim() === '/') {
						luckysheet.setCellValue(r, 9, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
					}
					
					// L列（单台设备功率）
					const lCell = luckysheet.getCellValue(r, 11);
					const lVal = (lCell && typeof lCell === 'object') ? (lCell.v || lCell.m) : lCell;
					if (String(lVal).trim() === '/') {
						luckysheet.setCellValue(r, 11, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
					}
					
					// M列（总功率）
					const mCell = luckysheet.getCellValue(r, 12);
					const mVal = (mCell && typeof mCell === 'object') ? (mCell.v || mCell.m) : mCell;
					if (String(mVal).trim() === '/') {
						luckysheet.setCellValue(r, 12, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
					}
					
					// O列（总报价）
					const oCell = luckysheet.getCellValue(r, 14);
					const oVal = (oCell && typeof oCell === 'object') ? (oCell.v || oCell.m) : oCell;
					if (String(oVal).trim() === '/') {
						luckysheet.setCellValue(r, 14, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
					}
				}
				
				// 然后再部署公式
					if (typeof window.addFormulasToAllRows === 'function') {
						window.addFormulasToAllRows();
					}
						if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
						if (luckysheet.refresh) luckysheet.refresh();
				
				// ⚠️ 刷新后清除JLMO列的0值（不管有无公式，都重新设置了公式）
				setTimeout(() => {
					console.log('🧹 刷新后清除JLMO列的0值');
					const cleanData = luckysheet.getSheetData();
					let cleanCount = 0;
					
					let footerTmp = -1;
					for (let i = 5; i < cleanData.length; i++) {
						const row = cleanData[i];
						if (Array.isArray(row)) {
							for (let j = 0; j < row.length; j++) {
								const v = (row[j] && typeof row[j] === 'object' && 'v' in row[j]) ? row[j].v : row[j];
								if (String(v).includes('安装费')) { footerTmp = i; break; }
							}
							if (footerTmp >= 0) break;
						}
					}
					const dataEndRow = footerTmp >= 0 ? footerTmp : cleanData.length;
					
					for (let r = 5; r < dataEndRow; r++) {
						// J列
						const jCell = cleanData[r] && cleanData[r][9];
						const jVal = jCell && typeof jCell === 'object' ? jCell.v : jCell;
                        if (jVal === 0 || jVal === '0' || (typeof jVal === 'number' && Math.abs(jVal) < 0.01)) {
                            luckysheet.setCellValue(r, 9, { 
                                v: '', 
                                m: '', 
                                ct: { fa: "General", t: "n" }, 
                                ht: 0, 
                                vt: 0 
                            });
							cleanCount++;
						}
						
						// L列
						const lCell = cleanData[r] && cleanData[r][11];
						const lVal = lCell && typeof lCell === 'object' ? lCell.v : lCell;
                        if (lVal === 0 || lVal === '0' || (typeof lVal === 'number' && Math.abs(lVal) < 0.01)) {
                            luckysheet.setCellValue(r, 11, { 
                                v: '', 
                                m: '', 
                                ct: { fa: "General", t: "n" }, 
                                ht: 0, 
                                vt: 0 
                            });
							cleanCount++;
						}
						
						// M列 - 加强判断
						const mCell = cleanData[r] && cleanData[r][12];
						const mVal = mCell && typeof mCell === 'object' ? mCell.v : mCell;
                        if (mVal === 0 || mVal === '0' || (typeof mVal === 'number' && Math.abs(mVal) < 0.01)) {
                            luckysheet.setCellValue(r, 12, { 
                                v: '', 
                                m: '', 
                                ct: { fa: "General", t: "n" }, 
                                ht: 0, 
                                vt: 0 
                            });
							cleanCount++;
							console.log(`  清除M列第${r+1}行的0值（原值: ${mVal}）`);
						}
						
						// O列
						const oCell = cleanData[r] && cleanData[r][14];
						const oVal = oCell && typeof oCell === 'object' ? oCell.v : oCell;
                        if (oVal === 0 || oVal === '0' || (typeof oVal === 'number' && Math.abs(oVal) < 0.01)) {
                            luckysheet.setCellValue(r, 14, { 
                                v: '', 
                                m: '', 
                                ct: { fa: "0.00", t: "n" }, 
                                ht: 0, 
                                vt: 0 
                            });
							cleanCount++;
						}
					}
					
					console.log(`✅ 刷新后第1次清除了${cleanCount}个0值`);
					if (luckysheet.refresh) luckysheet.refresh();
					
					// ⚠️ M列可能需要第二次清除（因为依赖L列）
					setTimeout(() => {
						console.log('🧹 刷新后第2次清除M列的0值');
						const cleanData2 = luckysheet.getSheetData();
						let cleanCount2 = 0;
						
						let footerTmp2 = -1;
						for (let i = 5; i < cleanData2.length; i++) {
							const row = cleanData2[i];
							if (Array.isArray(row)) {
								for (let j = 0; j < row.length; j++) {
									const v = (row[j] && typeof row[j] === 'object' && 'v' in row[j]) ? row[j].v : row[j];
									if (String(v).includes('安装费')) { footerTmp2 = i; break; }
								}
								if (footerTmp2 >= 0) break;
							}
						}
						const dataEndRow2 = footerTmp2 >= 0 ? footerTmp2 : cleanData2.length;
						
						for (let r = 5; r < dataEndRow2; r++) {
							const mCell = cleanData2[r] && cleanData2[r][12];
							const mVal = mCell && typeof mCell === 'object' ? mCell.v : mCell;
                            if (mVal === 0 || mVal === '0' || (typeof mVal === 'number' && Math.abs(mVal) < 0.01)) {
                                luckysheet.setCellValue(r, 12, { 
                                    v: '', 
                                    m: '', 
                                    ct: { fa: "General", t: "n" }, 
                                    ht: 0, 
                                    vt: 0 
                                });
								cleanCount2++;
								console.log(`  第2次清除M列第${r+1}行的0值`);
							}
						}
						
						if (cleanCount2 > 0) {
							console.log(`✅ 刷新后第2次清除了${cleanCount2}个M列0值`);
							if (luckysheet.refresh) luckysheet.refresh();
						}
						
						// ⚠️ 清除完成后，手动计算求和
						setTimeout(() => {
							if (window.manualCalculateSum) {
								window.manualCalculateSum();
								console.log('✅ 刷新后手动计算求和完成');
							}
						}, 200);
					}, 500);
				}, 800);

				// ✅ 5.1 清理数据区Q列（索引16）意外的0：将空值或非数字的显示为空白
				try {
					const cleanSheet = luckysheet.getSheetData();
					let footerRowTmp = -1;
					for (let i = 5; i < cleanSheet.length; i++) {
						const row = cleanSheet[i];
						if (!Array.isArray(row)) continue;
						for (let j = 0; j < row.length; j++) {
							const v = (row[j] && typeof row[j] === 'object' && 'v' in row[j]) ? row[j].v : row[j];
							if (String(v).includes('安装费')) { footerRowTmp = i; break; }
						}
						if (footerRowTmp >= 0) break;
					}
					const dataEnd = footerRowTmp >= 0 ? footerRowTmp : cleanSheet.length - 5;
					for (let r = 5; r < dataEnd; r++) {
						const qCell = luckysheet.getCellValue(r, 16);
						const raw = (qCell && typeof qCell === 'object') ? qCell.v : qCell;
						if (raw === 0 || raw === '0' || raw === null || raw === undefined) {
							luckysheet.setCellValue(r, 16, { v: '', m: '', ct: { fa: 'General', t: 'g' } });
						}
					}
				} catch(e) { /* 忽略清理异常 */ }
				
				// ✅ 6. E列行高自适应（根据内容多少自动调整）
				setTimeout(() => {
					const currentSheetData = luckysheet.getSheetData();
					let footerRow = -1;
					for (let i = 5; i < currentSheetData.length; i++) {
						const row = currentSheetData[i];
						if (Array.isArray(row)) {
							for (let j = 0; j < row.length; j++) {
								const cell = row[j];
								const val = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
								if (String(val).includes('安装费')) {
									footerRow = i;
									break;
								}
							}
							if (footerRow >= 0) break;
						}
					}
					
					if (footerRow < 0) footerRow = currentSheetData.length;
					console.log(`🔍 行高调整：表尾在第${footerRow + 1}行，数据行：5 到 ${footerRow - 1}`);
					
					// 调用统一的行高自适应函数
					if (typeof adjustRowHeights === 'function') {
						adjustRowHeights(5, footerRow - 1);
					}
				}, 300);
				
				// ✅ 7. 刷新序号
				setTimeout(() => {
					if (typeof window.refreshSerialNumbers === 'function') {
						window.refreshSerialNumbers(5, footerStartRow);
						console.log('✅ 已刷新序号');
					}
				}, 300);
				
				// ✅ 8. 刷新设备列表
				setTimeout(() => {
					updateDeviceListFromTable && updateDeviceListFromTable();
					console.log('✅ 已刷新设备列表');
				}, 500);
				
			} catch(e) { 
				console.error('❌ 刷新失败:', e); 
			}
			});
		}
		
		// 监听表格数据变化自动更新设备列表
		// 这将在Luckysheet初始化后自动调用
		setTimeout(() => {
			updateDeviceListFromTable();
		}, 1000);
	}
		
		// 创建边框配置函数
		function getBorderConfig(footerStartRow = 15) {
			const borderInfo = [];
			
			// 表头A-P行（0-4行，0-15列）添加边框
			for (let row = 0; row <= 4; row++) {
				for (let col = 0; col <= 15; col++) {
					borderInfo.push({
								"rangeType": "cell",
								"value": {
							"row_index": row,
							"col_index": col,
							"l": {"style": 1, "color": "#000000"}, // 左边框
							"r": {"style": 1, "color": "#000000"}, // 右边框
							"t": {"style": 1, "color": "#000000"}, // 上边框
							"b": {"style": 1, "color": "#000000"}  // 下边框
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
							"l": {"style": 1, "color": "#000000"}, // 左边框
							"r": {"style": 1, "color": "#000000"}, // 右边框
							"t": {"style": 1, "color": "#000000"}, // 上边框
							"b": {"style": 1, "color": "#000000"}  // 下边框
						}
					});
				}
			}
			
			return borderInfo;
		}
		
		// 获取数据行边框配置（A-P列所有边框）
		function getDataBorderConfig(startRow, endRow) {
			const borderInfo = [];
			
			// 为数据行（从startRow到endRow-1）的A-P列（0-15列）添加边框
			for (let r = startRow; r < endRow; r++) {
				for (let c = 0; c < 16; c++) { // A-P列（0-15）
					borderInfo.push({
						rangeType: "cell",
						value: {
							row_index: r,
							col_index: c,
							l: { style: 1, color: "#000000" }, // 左边框
							r: { style: 1, color: "#000000" }, // 右边框
							t: { style: 1, color: "#000000" }, // 上边框
							b: { style: 1, color: "#000000" }  // 下边框
						}
					});
				}
			}
			
			return borderInfo;
		}
		
		// ✅ refreshSerialNumbers 已在hooks注册之前定义（行1666）
		
		// 创建表头模板数据的函数 - 完全参考handsontable_excel_app
		function createTableHeader() {
			// 创建足够的行数：5行表头 + 10行数据区 + 5行表尾 = 20行
			// 这确保了表尾始终在正确的位置（最后5行）
			const data = [];
			const totalRows = 20; // 保持20行，确保表尾在15-19行
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
			
		// 设置表头内容（后移到新位置）
		// ABCD列（0-3列）1-3行合并显示公司名称（换行显示，16号字体）
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
		
		// HI列（7-8列）1-3行分别水平合并：项目名称/子项名称/项目编号
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
			
			// 将编制/校核/审核移动到N列（索引13）第1-3行
			data[0][13] = '编制';
			data[1][13] = '校核';
			data[2][13] = '审核';
			// O-P列（14-15）1-3行按行合并，留空
			for (let r = 0; r <= 2; r++) {
				data[r][14] = '';
				data[r][15] = '';
			}
			
			// 设置第3-4行（对应Excel的第4-5行）表头
			// 序号在A列4行5行合并单元格
			data[3][0] = '序号';
			
		// 设备位号在B列4行5行合并单元格（内部换行显示）
		data[3][1] = '设备\n位号';
			
			// 设备名称在C列4行5行合并单元格
			data[3][2] = '设备名称';
			
			// 规格型号在D列4行5行合并单元格
			data[3][3] = '规格型号';
			
			// 技术参数及要求在E列4行5行合并单元格
			data[3][4] = '技术参数及要求';
			
			// 材料在F列4行5行合并单元格
			data[3][5] = '材料';
			
			// 单位在G列4行5行合并单元格
			data[3][6] = '单位';
			
			// 数量在H列4行5行合并单元格
			data[3][7] = '数量';
			
			// 重量列已删除
			
			// 电机数量在IJ列4行合并单元格，I行5行"单"，J行5行"总"
			data[3][8] = '电机数量';
			data[4][8] = '单';
			data[4][9] = '总';
			
			// 在J列后新增K列：4、5行纵向合并为"电机功率（KW）"
			data[3][10] = '电机功率（KW）';
			data[4][10] = '';
			
			// 设备功率(KW)整体右移一列：现在在L-M（11-12）合并，单在L行5， 总在M行5
			data[3][11] = '设备功率(KW)';
			data[4][11] = '单';
			data[4][12] = '总';
			
			// 价格（万元）同步右移：现在在N-O（13-14）合并，单在N行5，总在O行5
			data[3][13] = '价格（万元）';
			data[4][13] = '单';
			data[4][14] = '总';
			
			// 备注顺延至P列（15）4行5行合并
			data[3][15] = '备注';
			
			// 设置表尾初始数据（最后5行：15-19行）
			// 不再使用fixedRowsBottom，表尾作为普通数据行
			const footerStartIndex = totalRows - 5; // 15
			
			// 倒数第5行（索引15）：安装费
			data[footerStartIndex][0] = ''; // A列：空着的
			data[footerStartIndex][1] = '/'; // B列：/
			data[footerStartIndex][2] = '安装费'; // C列：安装费
			data[footerStartIndex][3] = '/'; // D列：规格型号
			data[footerStartIndex][4] = '/'; // E列：技术参数
			data[footerStartIndex][5] = '/'; // F列：材料
		data[footerStartIndex][6] = '套'; // G列：单位（与H列交换）
		data[footerStartIndex][7] = '/'; // H列：数量（与G列交换）
			data[footerStartIndex][8] = '/'; // I列：/
			data[footerStartIndex][9] = '/'; // J列：电机数量(总)
			data[footerStartIndex][10] = '/'; // K列：电机功率
			data[footerStartIndex][11] = '/'; // L列：设备功率(单)
			data[footerStartIndex][12] = '/'; // M列：设备功率(总)
			data[footerStartIndex][13] = '/'; // N列：价格(单)
			data[footerStartIndex][14] = '/'; // O列：价格(总)
			data[footerStartIndex][15] = '/'; // P列：备注
			
			// 倒数第4行（索引16）：钢材用量
			data[footerStartIndex + 1][0] = ''; // A列：空着的
			data[footerStartIndex + 1][1] = '/'; // B列：/
			data[footerStartIndex + 1][2] = '钢材用量'; // C列：钢材用量
			data[footerStartIndex + 1][3] = '/';
			data[footerStartIndex + 1][4] = '/';
			data[footerStartIndex + 1][5] = '/';
		data[footerStartIndex + 1][6] = '吨'; // G列：单位（与H列交换）
		data[footerStartIndex + 1][7] = '/'; // H列：数量（与G列交换）
			data[footerStartIndex + 1][8] = '/'; // I列：/
			data[footerStartIndex + 1][9] = '/';
			data[footerStartIndex + 1][10] = '/';
			data[footerStartIndex + 1][11] = '/';
			data[footerStartIndex + 1][12] = '/';
			data[footerStartIndex + 1][13] = '/';
			data[footerStartIndex + 1][14] = '/';
			data[footerStartIndex + 1][15] = '/';
			
			// 倒数第3行（索引17）：电器材料
			data[footerStartIndex + 2][0] = ''; // A列：空着的
			data[footerStartIndex + 2][1] = '/'; // B列：/
			data[footerStartIndex + 2][2] = '电器材料'; // C列：电器材料
			data[footerStartIndex + 2][3] = '/';
			data[footerStartIndex + 2][4] = '/';
			data[footerStartIndex + 2][5] = '/';
		data[footerStartIndex + 2][6] = '套'; // G列：单位（与H列交换）
		data[footerStartIndex + 2][7] = '/'; // H列：数量（与G列交换）
			data[footerStartIndex + 2][8] = '/'; // I列：/
			data[footerStartIndex + 2][9] = '/';
			data[footerStartIndex + 2][10] = '/';
			data[footerStartIndex + 2][11] = '/';
			data[footerStartIndex + 2][12] = '/';
			data[footerStartIndex + 2][13] = '/';
			data[footerStartIndex + 2][14] = '/';
			data[footerStartIndex + 2][15] = '/';
			
			// 倒数第2行（索引18）：电线电缆
			data[footerStartIndex + 3][0] = ''; // A列：空着的
			data[footerStartIndex + 3][1] = '/'; // B列：/
			data[footerStartIndex + 3][2] = '电线电缆'; // C列：电线电缆
			data[footerStartIndex + 3][3] = '/';
			data[footerStartIndex + 3][4] = '/';
			data[footerStartIndex + 3][5] = '/';
		data[footerStartIndex + 3][6] = '套'; // G列：单位（与H列交换）
		data[footerStartIndex + 3][7] = '/'; // H列：数量（与G列交换）
			data[footerStartIndex + 3][8] = '/'; // I列：/
			data[footerStartIndex + 3][9] = '/';
			data[footerStartIndex + 3][10] = '/';
			data[footerStartIndex + 3][11] = '/';
			data[footerStartIndex + 3][12] = '/';
			data[footerStartIndex + 3][13] = '/';
			data[footerStartIndex + 3][14] = '/';
			data[footerStartIndex + 3][15] = '/';
			
			// 倒数第1行（索引19）：合计 - ABC列合并
			data[footerStartIndex + 4][0] = '合计'; // A列：合计（ABC列合并的主单元格）
			data[footerStartIndex + 4][1] = ''; // B列：空（被合并）
			data[footerStartIndex + 4][2] = ''; // C列：空（被合并）
			data[footerStartIndex + 4][3] = '/';
			data[footerStartIndex + 4][4] = '/';
			data[footerStartIndex + 4][5] = '/';
			data[footerStartIndex + 4][6] = '/';
			data[footerStartIndex + 4][7] = '/';
			data[footerStartIndex + 4][8] = '/';
			data[footerStartIndex + 4][9] = ''; // J列：空的
			data[footerStartIndex + 4][10] = '/';
			data[footerStartIndex + 4][11] = '/';
			data[footerStartIndex + 4][12] = ''; // M列：空的
			data[footerStartIndex + 4][13] = '/';
			data[footerStartIndex + 4][14] = ''; // O列：空的
			data[footerStartIndex + 4][15] = '/';
			
			return data;
		}
		
		// 设置表头合并单元格 - 使用更简单稳定的方法
		function setupHeaderMerging() {
			try {
				// 等待Luckysheet完全初始化
				if (!window.luckysheet) {
					console.warn('Luckysheet未完全初始化，延迟设置合并单元格');
					setTimeout(setupHeaderMerging, 1000);
					return;
				}
				
				console.log('🔍 setupHeaderMerging: 开始设置表头合并单元格');
				
				// 使用更简单的合并方法：通过数据配置设置
				try {
					// 直接修改sheet数据的合并配置
					const currentSheet = luckysheet.getSheet();
					if (currentSheet && currentSheet.config) {
						currentSheet.config.merge = {
								// 公司名称合并 (A1:D3)
								"0_0": {r: 0, c: 0, rs: 3, cs: 4},
								// 设备一览表合并 (E1:G3)
								"0_4": {r: 0, c: 4, rs: 3, cs: 3},
								// 表头第1-3行：HI合并、JKLM合并
								"0_7": {r: 0, c: 7, rs: 1, cs: 2},
								"1_7": {r: 1, c: 7, rs: 1, cs: 2},
								"2_7": {r: 2, c: 7, rs: 1, cs: 2},
								"0_9": {r: 0, c: 9, rs: 1, cs: 4},
								"1_9": {r: 1, c: 9, rs: 1, cs: 4},
								"2_9": {r: 2, c: 9, rs: 1, cs: 4},
							// 表头字段合并
							"3_0": {r: 3, c: 0, rs: 2, cs: 1}, // 序号
							"3_1": {r: 3, c: 1, rs: 2, cs: 1}, // 设备位号
							"3_2": {r: 3, c: 2, rs: 2, cs: 1}, // 设备名称
							"3_3": {r: 3, c: 3, rs: 2, cs: 1}, // 规格型号
							"3_4": {r: 3, c: 4, rs: 2, cs: 1}, // 技术参数
							"3_5": {r: 3, c: 5, rs: 2, cs: 1}, // 材料
							"3_6": {r: 3, c: 6, rs: 2, cs: 1}, // 单位
							"3_7": {r: 3, c: 7, rs: 2, cs: 1}, // 数量
							"3_8": {r: 3, c: 8, rs: 1, cs: 2}, // 电机数量 (I4:J4)
							"3_10": {r: 3, c: 10, rs: 2, cs: 1}, // 电机功率
							"3_11": {r: 3, c: 11, rs: 1, cs: 2}, // 设备功率 (L4:M4)
							"3_13": {r: 3, c: 13, rs: 1, cs: 2}, // 价格 (N4:O4)
							"3_15": {r: 3, c: 15, rs: 2, cs: 1}  // 备注
						};
						
						// 刷新表格显示
						luckysheet.refresh();
						console.log('✅ 表头合并单元格设置成功');
					}
				} catch(e) {
					console.error('❌ 表头合并单元格设置失败:', e);
				}
				
				console.log('✅ setupHeaderMerging: 表头合并单元格已设置完成');
			} catch (e) {
				console.error('❌ setupHeaderMerging: 设置表头合并单元格时出错:', e);
			}
		}
		
		// 设置表尾合并单元格 - 使用配置方式
		function setupFooterMerging() {
			try {
				console.log('🔍 setupFooterMerging: 开始设置表尾合并单元格');
				
				// 添加表尾合并配置到现有的合并配置中
				const currentSheet = luckysheet.getSheet();
				if (currentSheet && currentSheet.config && currentSheet.config.merge) {
					// 添加表尾合并配置
					currentSheet.config.merge["15_1"] = {r: 15, c: 1, rs: 1, cs: 2}; // 安装费 B16:C16
					currentSheet.config.merge["16_1"] = {r: 16, c: 1, rs: 1, cs: 2}; // 运输费 B17:C17
					currentSheet.config.merge["17_0"] = {r: 17, c: 0, rs: 1, cs: 2}; // 合计 A18:B18
					currentSheet.config.merge["18_0"] = {r: 18, c: 0, rs: 1, cs: 2}; // 税金 A19:B19
					currentSheet.config.merge["19_0"] = {r: 19, c: 0, rs: 1, cs: 2}; // 总计 A20:B20
					
					// 刷新表格显示
					luckysheet.refresh();
					console.log('✅ 表尾合并单元格设置成功');
				}
				
				console.log('✅ setupFooterMerging: 表尾合并单元格已设置完成');
			} catch (e) {
				console.error('❌ setupFooterMerging: 设置表尾合并单元格时出错:', e);
			}
		}
		
		// 初始化详情面板功能
		function initDetailPanel() {
			const collapseToggle = document.getElementById('collapseToggle');
			const detailPanel = document.getElementById('detailPanel');
			const tableContainer = document.querySelector('.table-container');
			
			// 折叠/展开功能
            collapseToggle.addEventListener('click', function() {
				isDetailPanelCollapsed = !isDetailPanelCollapsed;
				
				if (isDetailPanelCollapsed) {
					detailPanel.classList.add('collapsed');
					tableContainer.classList.add('expanded'); // 表格扩宽
					collapseToggle.innerHTML = '展开面板';
					collapseToggle.title = '展开面板';
				} else {
					detailPanel.classList.remove('collapsed');
					tableContainer.classList.remove('expanded'); // 表格恢复
					collapseToggle.innerHTML = '折叠面板';
					collapseToggle.title = '折叠面板';
				}
				
                // 触发Luckysheet重新计算尺寸（多重保障）
                setTimeout(() => {
                    try { if (window.luckysheet && luckysheet.resize) luckysheet.resize(); } catch(e) {}
                    window.dispatchEvent(new Event('resize'));
                }, 50);
			});
			
			// 标签页切换
			const deviceTabBtn = document.getElementById('deviceTabBtn');
			const projectTabBtn = document.getElementById('projectTabBtn');
		const equipmentDataTabBtn = document.getElementById('equipmentDataTabBtn');
			const deviceDetailContent = document.getElementById('deviceDetailContent');
			const projectDetailContent = document.getElementById('projectDetailContent');
		const equipmentDataContent = document.getElementById('equipmentDataContent');
			
	// 切换到设备详情
			deviceTabBtn.addEventListener('click', function() {
				deviceTabBtn.classList.remove('secondary');
				projectTabBtn.classList.add('secondary');
		equipmentDataTabBtn.classList.add('secondary');
		supplierTabBtn.classList.add('secondary');
				deviceDetailContent.style.display = 'block';
				projectDetailContent.style.display = 'none';
		equipmentDataContent.style.display = 'none';
		supplierContent.style.display = 'none';
			});
			
	// 切换到项目明细
			projectTabBtn.addEventListener('click', function() {
				projectTabBtn.classList.remove('secondary');
				deviceTabBtn.classList.add('secondary');
			equipmentDataTabBtn.classList.add('secondary');
			supplierTabBtn.classList.add('secondary');
				projectDetailContent.style.display = 'block';
				deviceDetailContent.style.display = 'none';
		equipmentDataContent.style.display = 'none';
		supplierContent.style.display = 'none';
	});
		
	// 切换到设备资料
	equipmentDataTabBtn.addEventListener('click', function() {
		equipmentDataTabBtn.classList.remove('secondary');
		deviceTabBtn.classList.add('secondary');
		projectTabBtn.classList.add('secondary');
		supplierTabBtn.classList.add('secondary');
		equipmentDataContent.style.display = 'block';
		deviceDetailContent.style.display = 'none';
		projectDetailContent.style.display = 'none';
		supplierContent.style.display = 'none';
	});
	
	// 切换到配套厂家
	const supplierTabBtn = document.getElementById('supplierTabBtn');
	const supplierContent = document.getElementById('supplierContent');
	
	supplierTabBtn.addEventListener('click', function() {
		supplierTabBtn.classList.remove('secondary');
		deviceTabBtn.classList.add('secondary');
		projectTabBtn.classList.add('secondary');
		equipmentDataTabBtn.classList.add('secondary');
		supplierContent.style.display = 'block';
		deviceDetailContent.style.display = 'none';
		projectDetailContent.style.display = 'none';
		equipmentDataContent.style.display = 'none';
			});
			
			// 设备表单操作
			initDeviceFormHandlers();
		}
		
		// 初始化设备表单处理
		function initDeviceFormHandlers() {
		// 注意：按钮事件已在DOM事件监听部分统一绑定，这里不再重复绑定
		// const addBtn = document.getElementById('addDeviceBtn');
		// const clearBtn = document.getElementById('clearFormBtn');
		// addBtn && addBtn.addEventListener('click', addDevice);
		// clearBtn && clearBtn.addEventListener('click', clearForm);
		
	// ✅ 设备位号默认显示 /
	const deviceNumberInput = document.getElementById('deviceNumber');
	if (deviceNumberInput && !deviceNumberInput.value) {
		deviceNumberInput.value = '/';
	}
	
	// ✅ 添加详情页面到表格的实时同步（延迟调用，确保函数已定义）
	setTimeout(() => {
		if (typeof window.setupFormToTableSync === 'function') {
			window.setupFormToTableSync();
		} else {
			console.warn('⚠️ setupFormToTableSync 函数未定义');
		}
	}, 100);
			
			// 级联下拉框
			initCascadingDropdowns();
		
	// 设备资料页面按钮
	initEquipmentDataHandlers();
	
	// 配套厂家页面按钮
	initSupplierHandlers();
}
	
	// 初始化设备资料处理
	function initEquipmentDataHandlers() {
		const saveBtn = document.getElementById('saveEquipmentDataBtn');
		const clearBtn = document.getElementById('clearEquipmentDataBtn');
		
		if (saveBtn) {
			saveBtn.addEventListener('click', function() {
				console.log('保存设备资料');
				alert('设备资料保存功能待实现');
			});
		}
		
		if (clearBtn) {
			clearBtn.addEventListener('click', function() {
				document.getElementById('equipmentCategory').value = '';
				document.getElementById('equipmentModel').value = '';
				document.getElementById('equipmentManufacturer').value = '';
				document.getElementById('equipmentPower').value = '';
				document.getElementById('equipmentVoltage').value = '';
				document.getElementById('equipmentWeight').value = '';
				document.getElementById('equipmentDimensions').value = '';
				document.getElementById('equipmentStandard').value = '';
				document.getElementById('equipmentCertificate').value = '';
				document.getElementById('equipmentWarranty').value = '';
				document.getElementById('equipmentNotes').value = '';
				console.log('已清空设备资料');
		});
	}
	}
	
	// 初始化配套厂家处理
	function initSupplierHandlers() {
		const saveBtn = document.getElementById('saveSupplierBtn');
		const clearBtn = document.getElementById('clearSupplierBtn');
		
		if (saveBtn) {
			saveBtn.addEventListener('click', function() {
				console.log('保存配套厂家');
				alert('配套厂家信息保存功能待实现');
			});
		}
		
		if (clearBtn) {
			clearBtn.addEventListener('click', function() {
				document.getElementById('supplierName').value = '';
				document.getElementById('supplierContact').value = '';
				document.getElementById('supplierPhone').value = '';
				document.getElementById('supplierEmail').value = '';
				document.getElementById('supplierAddress').value = '';
				document.getElementById('supplierWebsite').value = '';
				document.getElementById('supplierType').value = '';
				document.getElementById('supplierLevel').value = '';
				document.getElementById('supplierPayment').value = '';
				document.getElementById('supplierDelivery').value = '';
				document.getElementById('supplierWarranty').value = '';
				document.getElementById('supplierNotes').value = '';
				console.log('已清空配套厂家信息');
			});
		}
		}
		
		// 初始化级联下拉框
		function initCascadingDropdowns() {
			const deviceTypeSelect = document.getElementById('deviceType');
			const deviceNameSelect = document.getElementById('deviceName');
			const specificationSelect = document.getElementById('specification');
			
			deviceTypeSelect.addEventListener('change', function() {
			// ✅ 设置标志，防止自动写回表格
			window.isLoadingFromDatabase = true;
			
			// ⚠️ 关键修复：选择设备类型后，清空当前选中行，防止详情页修改写回到原有数据
			if (window.currentSelectedRow !== null) {
				console.log(`🔓 选择设备类型后，清空currentSelectedRow（原值：${window.currentSelectedRow + 1}行），防止修改原有数据`);
				window.currentSelectedRow = null;
			}
			
				const selectedType = this.value;
				populateDeviceNames(selectedType);
				clearSpecifications();
				clearRelatedFields();
			
			// 延迟清除标志
			setTimeout(() => {
				window.isLoadingFromDatabase = false;
			}, 100);
			});
			
			deviceNameSelect.addEventListener('change', function() {
			// ✅ 设置标志，防止自动写回表格
			window.isLoadingFromDatabase = true;
			
			// ⚠️ 关键修复：选择设备名称后，清空当前选中行，防止详情页修改写回到原有数据
			if (window.currentSelectedRow !== null) {
				console.log(`🔓 选择设备名称后，清空currentSelectedRow（原值：${window.currentSelectedRow + 1}行），防止修改原有数据`);
				window.currentSelectedRow = null;
			}
			
				const selectedType = deviceTypeSelect.value;
				const selectedName = this.value;
				populateSpecifications(selectedType, selectedName);
				clearRelatedFields();
			
			// 延迟清除标志
			setTimeout(() => {
				window.isLoadingFromDatabase = false;
			}, 100);
			});
			
			specificationSelect.addEventListener('change', function() {
			// ✅ 设置标志，防止自动写回表格
			window.isLoadingFromDatabase = true;
			
				const selectedType = deviceTypeSelect.value;
				const selectedName = deviceNameSelect.value;
				const selectedSpec = this.value;
				fillRelatedFields(selectedType, selectedName, selectedSpec);
			
			// fillRelatedFields内部也会延迟清除标志，这里不需要再清除
			});
		}
		
		// 初始化文件处理功能
		function initFileHandlers() {
			const openBtn = document.getElementById('openFileBtn');
			const saveBtn = document.getElementById('saveFileBtn');
			const newBtn = document.getElementById('newFileBtn');
			const fileInput = document.getElementById('fileInput');
			
			// 绑定原按钮事件
			openBtn.addEventListener('click', () => fileInput.click());
			saveBtn.addEventListener('click', saveToExcel);
			newBtn.addEventListener('click', createNewSheet);
			fileInput.addEventListener('change', handleFileSelect);
			
			// 移除覆盖在Luckysheet内部的重复按钮，统一使用顶部按钮
		}
		
		// 初始化数据库处理功能
		// 移除复杂的样式修复，完全按照官方示例的简洁方式
		
		function initDatabaseHandlers() {
			const loadDbBtn = document.getElementById('loadDatabaseBtn');
			const refreshDbBtn = document.getElementById('refreshDbBtn');
			const dbFileInput = document.getElementById('databaseFileInput');
			
			loadDbBtn.addEventListener('click', () => dbFileInput.click());
			refreshDbBtn.addEventListener('click', refreshDeviceOptions);
			dbFileInput.addEventListener('change', handleDatabaseFileSelect);
		}
		
		// ✅ 提取行高自适应函数，供多处调用
		function adjustRowHeights(startRow, endRow) {
			console.log(`🔍 调整行高: 第${startRow + 1}行 到 第${endRow + 1}行`);
			
			const currentConfig = luckysheet.getConfig();
			if (!currentConfig) {
				console.warn('⚠️ 无法获取配置');
				return;
			}
			
			if (!currentConfig.rowlen) currentConfig.rowlen = {};
			let adjustedCount = 0;
			
			for (let r = startRow; r <= endRow; r++) {
				const eCell = luckysheet.getCellValue(r, 4); // E列
				if (eCell) {
					const text = (typeof eCell === 'object' && eCell.v) ? eCell.v : eCell;
					const textStr = String(text || '');
					
					if (textStr && textStr.trim()) {
						const rowHeight = computeRowHeightFromText(textStr);
						currentConfig.rowlen[r] = rowHeight;
						adjustedCount++;
						console.log(`📏 第${r+1}行：行高=${rowHeight}px`);
					}
				}
			}
			
			if (adjustedCount > 0) {
				luckysheet.refresh();
				console.log(`✅ 已自动调整 ${adjustedCount} 行的行高`);
			} else {
				console.log('ℹ️ 没有需要调整的行高');
			}
		}

	function computeRowHeightFromText(text) {
		const textStr = String(text || '').trim();
		if (!textStr) return 40;
		
		// 精简的行高计算：基于字符数和换行符
		const charsPerLine = 30; // 每行约30个字符
		let totalLines = 1;
		
		if (textStr.includes('\n')) {
			const lines = textStr.split('\n');
			totalLines = lines.reduce((sum, line) => {
				if (!line || line.trim() === '') return sum + 1; // 空行也占1行
				const lineChars = line.length;
				return sum + Math.max(1, Math.ceil(lineChars / charsPerLine));
			}, 0);
		} else {
			totalLines = Math.max(1, Math.ceil(textStr.length / charsPerLine));
		}
		
		// 精简行高公式：每行16px + 上下边距6px
		const lineHeight = 16;  // 每行16px（紧凑）
		const padding = 6;      // 上下边距各3px
		return Math.max(40, totalLines * lineHeight + padding);
		}
		
		// 设备操作函数
		function addDevice() {
			const deviceData = getFormData();
			if (!deviceData.deviceType || !deviceData.deviceName) {
				alert('请至少选择设备类型和设备名称');
				return;
			}
			
			// 添加到表格（会在当前选中行下方插入，如果没有选中行则在默认位置插入）
			addDeviceToSheet(deviceData);
			
			// 添加到设备列表
			currentDeviceList.push(deviceData);
			updateDeviceList();
			
			console.log('✅ 设备已添加:', deviceData);
		}
		
        // 移除了更新/删除设备功能按钮与处理
		
		function clearForm() {
			const form = document.getElementById('deviceDetailContent');
			const inputs = form.querySelectorAll('input, select, textarea');
			inputs.forEach(input => {
				if (input.id === 'deviceNumber') {
					input.value = '/';
				} else {
					input.value = '';
				}
			});
		}
		
		// 获取表单数据
		function getFormData() {
			return {
				deviceNumber: document.getElementById('deviceNumber').value,
				deviceType: document.getElementById('deviceType').value,
				deviceName: document.getElementById('deviceName').value,
				specification: document.getElementById('specification').value,
				material: document.getElementById('material').value,
			unit: document.getElementById('unit').value,
			quantity: parseFloat(document.getElementById('quantity').value) || 1,  // 默认为1
			motorQuantity: parseFloat(document.getElementById('motorQuantity').value) || 0,
			motorPower: document.getElementById('motorPower').value || '',  // 保持原始字符串（可能是表达式）
			singleDevicePower: parseFloat(document.getElementById('singleDevicePower').value) || 0,
			totalPower: parseFloat(document.getElementById('totalPower').value) || 0,
			unitPrice: parseFloat(document.getElementById('unitPrice').value) || 0,
				totalPrice: parseFloat(document.getElementById('totalPrice').value) || 0,
				priceIncrease: parseFloat(document.getElementById('priceIncrease').value) || 0,
				installedPower: parseFloat(document.getElementById('installedPower').value) || 0,
				totalQuotePrice: parseFloat(document.getElementById('totalQuotePrice').value) || 0,
				technicalParams: document.getElementById('technicalParams').value,
				remarks: document.getElementById('remarks').value
			};
		}
		
		// ========== 自动识别Excel版本类型的函数 ==========
		function detectExcelVersion(celldata) {
			console.log('🔍 开始识别Excel文件版本...');
			
			// 方法1: 检查工作表名称（如果有）
			// 方法2: 检查第4行（索引3）的列标题
			// 完整版特征：有"设备位号"列（B列，索引1）
			// 简化版特征：没有"设备位号"列，B列直接是"设备名称"
			
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
		}
		
		// 文件处理函数
		function handleFileSelect(event) {
			const file = event.target.files[0];
			if (!file) return;
			console.log('正在加载文件(保留样式):', file.name);
			// 使用 LuckyExcel 解析，尽可能保留样式/合并/列宽等
			LuckyExcel.transformExcelToLucky(file, function(exportJson, luckysheetfile){
				try {
					if(exportJson.sheets==null || exportJson.sheets.length==0){
						alert('读取失败：文件中没有任何工作表');
						return;
					}
				// 仅提取第一个sheet，并裁剪数据：保留表头(0-2行)、标题行(3-4行)、数据行、表尾
					const sheet = exportJson.sheets[0];
					const fullData = sheet.celldata || [];
				
				// ========== 🔍 识别Excel版本 ==========
				const versionInfo = detectExcelVersion(fullData);
				console.log(`📊 打开的文件是: ${versionInfo.version}`);
				console.log(`📋 原工作表名称: "${sheet.name}"`);
				
				// 强制根据识别结果设置工作表名称（覆盖原有名称）
				sheet.name = `设备参数选型（${versionInfo.version}）`;
				sheet.color = versionInfo.isSimplified ? '#70ad47' : '#5b9bd5';
				// 保存版本信息到全局变量，供详情页回写使用
				window.currentSheetVersion = versionInfo;
				console.log(`✅ 已设置工作表名称为: "${sheet.name}"，版本信息已保存到全局变量`);
				
				// 找到"安装费"所在行
					let endRow = fullData.reduce((acc, cell) => {
						if (cell && cell.v && typeof cell.v.v === 'string' && cell.v.v.includes('安装费')) {
							acc = Math.min(acc, cell.r);
						}
						return acc;
					}, Number.POSITIVE_INFINITY);
					if (!isFinite(endRow)) endRow = sheet.row || 84; // 找不到则默认不裁剪
				
				// 保留表头(0-2行)、标题行(3-4行)、数据行(5到安装费之前)
				// 过滤规则：保留 0-4 行，以及 5 到 endRow 之前的行
				const filtered = fullData.filter(cell => cell.r <= 4 || (cell.r >= 5 && cell.r < endRow));
				
					// 替换 celldata
					sheet.celldata = filtered;
				console.log(`📊 保留数据：表头(0-2行) + 标题(3-4行) + 数据(5-${endRow-1}行)`);
				console.log(`📊 识别的版本: ${versionInfo.version}, 预期${versionInfo.expectedColumns}列`);
					// 保留列宽、合并、边框等配置
					sheet.config = sheet.config || {};
				
				// 打印当前列宽配置以便调试
				if (sheet.config.columnlen) {
					console.log('📏 打开文件时的列宽配置:', sheet.config.columnlen);
					console.log('📏 B列宽度:', sheet.config.columnlen['1'] || '未设置');
				}
				
				// ========== 根据版本调整配置 ==========
				// 简化版：隐藏多余的列（如果有超过14列的）
				if (versionInfo.isSimplified && versionInfo.detectedColumns > 14) {
					console.log('⚠️ 简化版但检测到超过14列，将隐藏多余列');
				}
				
					// 重新创建 Luckysheet
					luckysheet.destroy();
					luckysheet.create({
						container: 'luckysheet',
						lang: 'zh',
						showinfobar: false,
						data: [sheet]
					});
					console.log(`✅ 读取完成 - 版本: ${versionInfo.version}, 数据行: 第6行~第${endRow}行`);
					
					// 显示版本识别提示
					setTimeout(() => {
						const tipDiv = document.createElement('div');
						tipDiv.style.cssText = `
							position: fixed;
							top: 60px;
							right: 20px;
							background: ${versionInfo.isSimplified ? '#d4edda' : '#d1ecf1'};
							color: ${versionInfo.isSimplified ? '#155724' : '#0c5460'};
							border: 2px solid ${versionInfo.isSimplified ? '#c3e6cb' : '#bee5eb'};
							padding: 15px 25px;
							border-radius: 8px;
							box-shadow: 0 4px 12px rgba(0,0,0,0.15);
							z-index: 10001;
							font-size: 15px;
							font-weight: bold;
							animation: slideIn 0.3s ease-out;
						`;
						tipDiv.innerHTML = `
							📊 已识别: <strong>${versionInfo.version}</strong> Excel文件<br>
							<small style="font-weight: normal; opacity: 0.8;">表头行数: 5行 | 数据从第6行开始</small>
							<button onclick="this.parentElement.remove()" style="
								position: absolute;
								top: 5px;
								right: 8px;
								background: transparent;
								border: none;
								font-size: 18px;
								cursor: pointer;
								color: inherit;
								opacity: 0.6;
							">×</button>
						`;
						document.body.appendChild(tipDiv);
						
						// 3秒后自动消失
						setTimeout(() => {
							tipDiv.style.animation = 'fadeOut 0.3s ease-out';
							setTimeout(() => tipDiv.remove(), 300);
						}, 3000);
					}, 500);
					
					// 强制写入表头文字（防止缺失）
					setTimeout(() => {
						try {
							luckysheet.setCellValue(0, 0, {
								v: '温岭市泽国化工机械\n有限公司',
								m: '温岭市泽国化工机械\n有限公司',
								fs: 16,
								ff: 'SimSun',
								tb: 2,  // 换行显示 (数字类型)
								ht: 0,  // 居中对齐
								vt: 0   // 垂直居中
							});
							luckysheet.setCellValue(0, 4, '设备一览表');
							luckysheet.setCellValue(0, 7, '项目名称');
							luckysheet.setCellValue(1, 7, '子项名称');
							luckysheet.setCellValue(2, 7, '项目编号');
							luckysheet.refresh();
						} catch(e) { console.warn('打开文件后写表头失败', e); }
					}, 50);
			// 打开文件后：统一部署公式，规范"/"为文本，清理Q列意外0
			setTimeout(() => {
				try {
					if (!window.luckysheet || !luckysheet.getSheetData) return;
					const sd = luckysheet.getSheetData();
					let footerStartRow = -1;
					for (let i = 5; i < sd.length; i++) {
						const row = sd[i];
						if (!Array.isArray(row)) continue;
						for (let j = 0; j < row.length; j++) {
							const cell = row[j];
							const val = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
							if (String(val).includes('安装费')) { footerStartRow = i; break; }
						}
						if (footerStartRow >= 0) break;
					}
				const dataEnd = footerStartRow >= 0 ? footerStartRow : sd.length - 5;

		// 1) 先规范IJLMO列的"/"为文本（不清空空值，让公式部署处理）
		console.log('📝 规范IJLMO列的"/"为纯文本');
		for (let r = 5; r < dataEnd; r++) {
			// I列（单台电机数量）
			const iCell = luckysheet.getCellValue(r, 8);
			const iVal = (iCell && typeof iCell === 'object') ? (iCell.v || iCell.m) : iCell;
			if (String(iVal).trim() === '/') {
				luckysheet.setCellValue(r, 8, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
				console.log(`  ✅ I列第${r+1}行设置为文本"/"`);
			}
			
			// J列（总电机数量）
			const jCell = luckysheet.getCellValue(r, 9);
			const jVal = (jCell && typeof jCell === 'object') ? (jCell.v || jCell.m) : jCell;
			if (String(jVal).trim() === '/') {
				luckysheet.setCellValue(r, 9, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
				console.log(`  ✅ J列第${r+1}行设置为文本"/"`);
			}
			
			// L列（单台设备功率）：只处理"/"为文本，空值交给公式部署
			const lCell = luckysheet.getCellValue(r, 11);
			const lVal = (lCell && typeof lCell === 'object') ? (lCell.v || lCell.m) : lCell;
			if (String(lVal).trim() === '/') {
				luckysheet.setCellValue(r, 11, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
				console.log(`  ✅ L列第${r+1}行设置为文本"/"`);
			}
			
			// M列（总功率）：只处理"/"为文本，空值交给公式部署
			const mCell = luckysheet.getCellValue(r, 12);
			const mVal = (mCell && typeof mCell === 'object') ? (mCell.v || mCell.m) : mCell;
			if (String(mVal).trim() === '/') {
				luckysheet.setCellValue(r, 12, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
				console.log(`  ✅ M列第${r+1}行设置为文本"/"`);
			}
			
			// O列（总报价）
			const oCell = luckysheet.getCellValue(r, 14);
			const oVal = (oCell && typeof oCell === 'object') ? (oCell.v || oCell.m) : oCell;
			if (String(oVal).trim() === '/') {
				luckysheet.setCellValue(r, 14, { v: '/', m: '/', ct: { fa: 'General', t: 'g' }, ht: 0, vt: 0 });
				console.log(`  ✅ O列第${r+1}行设置为文本"/"`);
			}
		}

				// 2) 统一部署公式（IJL MO列为"/"的单元格会自动跳过）
				if (typeof window.addFormulasToAllRows === 'function') {
					window.addFormulasToAllRows();
				}

					// 3) 清理数据区 Q 列意外的 0
					for (let r = 5; r < (footerStartRow >= 0 ? footerStartRow : sd.length); r++) {
						const qCell = luckysheet.getCellValue(r, 16);
						const raw = (qCell && typeof qCell === 'object') ? qCell.v : qCell;
						if (raw === 0 || raw === '0') {
							luckysheet.setCellValue(r, 16, { v: '', m: '', ct: { fa: 'General', t: 'g' } });
						}
					}

					// 先刷新，让公式计算完成
					if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
					if (luckysheet.refresh) luckysheet.refresh();
					
					// 4) 延迟清除JLMO列的0值
					setTimeout(() => {
						console.log('🧹 清除JLMO列的0值');
						const cleanData = luckysheet.getSheetData();
						let cleanCountWithFormula = 0;
						let cleanCountWithoutFormula = 0;
						
						// 找到表尾位置
						let footerStart = -1;
						for (let i = 5; i < cleanData.length; i++) {
							const row = cleanData[i];
							if (Array.isArray(row)) {
								for (let j = 0; j < row.length; j++) {
									const cell = row[j];
									const val = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
									if (String(val).includes('安装费')) {
										footerStart = i;
										break;
									}
								}
								if (footerStart >= 0) break;
							}
						}
						
						const dataEndRow = footerStart >= 0 ? footerStart : cleanData.length;
						
						// ⚠️ 清除JLMO列中的空值、0值和公式（全部设置为空单元格，保存时根据C列统一设置公式）
						let cleanCount = 0;
						for (let r = 5; r < dataEndRow; r++) {
							// J列：如果有公式、为空、为0，清空为空单元格
							const jCell = cleanData[r] && cleanData[r][9];
							if (jCell) {
								const jVal = (typeof jCell === 'object') ? (jCell.v !== undefined ? jCell.v : jCell.m) : jCell;
								const hasFormula = (typeof jCell === 'object' && jCell.f);
								const isEmpty = (jVal === null || jVal === undefined || jVal === '' || jVal === 0 || jVal === '0');
								
								if (hasFormula || isEmpty) {
									luckysheet.setCellValue(r, 9, { 
										v: '', 
										m: '', 
										ct: { fa: "General", t: "n" },
										ff: "SimSun",
										fs: 10,
										ht: 0, 
										vt: 0 
									});
									cleanCount++;
								}
							}
							
							// L列：如果有公式、为空、为0，清空为空单元格
							const lCell = cleanData[r] && cleanData[r][11];
							if (lCell) {
								const lVal = (typeof lCell === 'object') ? (lCell.v !== undefined ? lCell.v : lCell.m) : lCell;
								const hasFormula = (typeof lCell === 'object' && lCell.f);
								const isEmpty = (lVal === null || lVal === undefined || lVal === '' || lVal === 0 || lVal === '0');
								
								if (hasFormula || isEmpty) {
									luckysheet.setCellValue(r, 11, { 
										v: '', 
										m: '', 
										ct: { fa: "General", t: "n" },
										ff: "SimSun",
										fs: 10,
										ht: 0, 
										vt: 0 
									});
									cleanCount++;
								}
							}
							
							// M列：如果有公式、为空、为0，清空为空单元格
							const mCell = cleanData[r] && cleanData[r][12];
							if (mCell) {
								const mVal = (typeof mCell === 'object') ? (mCell.v !== undefined ? mCell.v : mCell.m) : mCell;
								const hasFormula = (typeof mCell === 'object' && mCell.f);
								const isEmpty = (mVal === null || mVal === undefined || mVal === '' || mVal === 0 || mVal === '0');
								
								if (hasFormula || isEmpty) {
									luckysheet.setCellValue(r, 12, { 
										v: '', 
										m: '', 
										ct: { fa: "General", t: "n" },
										ff: "SimSun",
										fs: 10,
										ht: 0, 
										vt: 0 
									});
									cleanCount++;
								}
							}
							
							// O列：如果有公式、为空、为0，清空为空单元格
							const oCell = cleanData[r] && cleanData[r][14];
							if (oCell) {
								const oVal = (typeof oCell === 'object') ? (oCell.v !== undefined ? oCell.v : oCell.m) : oCell;
								const hasFormula = (typeof oCell === 'object' && oCell.f);
								const isEmpty = (oVal === null || oVal === undefined || oVal === '' || oVal === 0 || oVal === '0');
								
								if (hasFormula || isEmpty) {
									luckysheet.setCellValue(r, 14, { 
										v: '', 
										m: '', 
										ct: { fa: "0.00", t: "n" },
										ff: "SimSun",
										fs: 10,
										ht: 0, 
										vt: 0 
									});
									cleanCount++;
								}
							}
						}
						
						console.log(`✅ 清除JLMO列空值/0值/公式完成，共清除 ${cleanCount} 个单元格（保存时根据C列统一设置公式）`);
						if (luckysheet.refresh) luckysheet.refresh();
						
					// 5) 清除完成后，手动计算求和
					setTimeout(() => {
						if (window.manualCalculateSum) window.manualCalculateSum();
						
						// 6) 再次刷新以确保所有0值都被清除
						setTimeout(() => {
							if (luckysheet.refresh) {
								luckysheet.refresh();
								console.log('✅ 加载文件后自动刷新完成，0值已清除');
							}
						}, 300);
					}, 200);
				}, 500);
				} catch (e) { console.warn('文件打开后统一部署公式失败:', e.message); }
			}, 200);

				// 移除此处的addFormulasToAllRows调用，统一在后面一次性执行

			// ✅ 延迟注册hooks（确保Luckysheet完全初始化）
			setTimeout(() => {
				window.globalHooksRegistered = false; // 重置标志
			window.lastRowCount = 0; // 重置行数计数器，确保打开文件后序号自动更新生效
				if (window.luckysheet && luckysheet.createHook) {
					window.globalHooksRegistered = true;
					console.log('🔧 重新注册Luckysheet hooks（打开文件后）...');
					
			// 注册updated hook（监听所有更新，包括手动增删行）
			try {
				luckysheet.createHook('updated', (operate) => {
					console.log(`🔔 Luckysheet updated(文件打开后):`, operate);
					
					// 检测行数变化
					setTimeout(() => {
						const currentRowCount = luckysheet.getSheetData() ? luckysheet.getSheetData().length : 0;
						if (window.lastRowCount > 0 && currentRowCount !== window.lastRowCount) {
							console.log(`🔔 检测到行数变化(文件打开后): ${window.lastRowCount} → ${currentRowCount}`);
							if (window.serialRefreshDebounce) clearTimeout(window.serialRefreshDebounce);
							window.serialRefreshDebounce = setTimeout(() => {
								if (!window.isRefreshingSerialNumbers && typeof window.refreshSerialNumbers === 'function') {
									console.log('  ✅ 行数变化，执行刷新序号');
									window.refreshSerialNumbers(5, window.currentFooterStartRow || 19);
								}
							}, 500);
						}
						window.lastRowCount = currentRowCount;
					}, 100);
				});
				console.log(`✅ 已注册updated hook (文件打开后)`);
			} catch (e) {
				console.warn(`⚠️ 无法注册updated hook:`, e.message);
			}
					
					// 监听单元格更新
					luckysheet.createHook('cellUpdated', (r, c, oldValue, newValue, isRefresh) => {
						console.log('🔔 cellUpdated触发:', { r, c, oldValue, newValue });
				
				// ⚠️ 关键修复：表格输入数据后，手动计算并更新求和
				if (r >= 5 && !isRefresh) { // 数据区域且非公式刷新
					if (window.sumRefreshTimer) clearTimeout(window.sumRefreshTimer);
					window.sumRefreshTimer = setTimeout(() => {
						try {
							const sheetData = luckysheet.getSheetData();
							let footerStartRow = -1;
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
								
								luckysheet.setCellValue(totalRow, 7, Math.round(hSum));
								luckysheet.setCellValue(totalRow, 9, Math.round(jSum));
								luckysheet.setCellValue(totalRow, 12, mSum);
								luckysheet.setCellValue(totalRow, 14, oSum);
								
								luckysheet.refresh();
								console.log(`🔄 手动计算求和（文件打开后）: H=${Math.round(hSum)}, J=${Math.round(jSum)}, M=${mSum.toFixed(2)}, O=${oSum.toFixed(2)}`);
							}
						} catch (e) {
							console.warn('⚠️ 手动计算求和失败:', e);
						}
					}, 300);
				}
				
				// ✅ 检测行数变化，触发序号刷新
				try {
					const currentRowCount = luckysheet.getSheetData() ? luckysheet.getSheetData().length : 0;
					if (window.lastRowCount > 0 && currentRowCount !== window.lastRowCount) {
						console.log(`🔔 检测到行数变化: ${window.lastRowCount} → ${currentRowCount}`);
						if (window.serialRefreshDebounce) clearTimeout(window.serialRefreshDebounce);
						window.serialRefreshDebounce = setTimeout(() => {
							if (!window.isRefreshingSerialNumbers && typeof window.refreshSerialNumbers === 'function') {
								console.log('  ✅ 行数变化，执行刷新序号');
								window.refreshSerialNumbers(5, window.currentFooterStartRow || 19);
							}
						}, 500);
					}
					window.lastRowCount = currentRowCount;
				} catch (e) { /* 忽略错误 */ }
						
						// 1. 更新设备列表
						setTimeout(() => {
							if (typeof updateDeviceListFromTable === 'function') {
								console.log('📊 数据变化，更新设备列表');
								updateDeviceListFromTable();
							}
						}, 500);
						
					// ✅ 新增：空白单元格输入时默认居中显示
					if (r >= 5 && !isRefresh) { // 只处理数据区域（第6行开始）且非公式刷新
						// 检查是否是从空白单元格输入的新内容
						const isOldEmpty = !oldValue || oldValue === '' || (typeof oldValue === 'object' && (!oldValue.v || oldValue.v === ''));
						const isNewNotEmpty = newValue && (typeof newValue === 'string' || typeof newValue === 'number' || (typeof newValue === 'object' && newValue.v));
						
						if (isOldEmpty && isNewNotEmpty) {
							setTimeout(() => {
								const currentCell = luckysheet.getCellValue(r, c);
								if (currentCell && typeof currentCell === 'object') {
									// 如果单元格没有设置对齐方式，或者不是居中，则设置为居中
									if (currentCell.ht === undefined || currentCell.ht !== 0) {
										const updatedCell = Object.assign({}, currentCell, {
											ht: 0, // 水平居中
											vt: 0  // 垂直居中
										});
										luckysheet.setCellValue(r, c, updatedCell);
										console.log(`✅ 空白单元格输入后自动居中: 第${r+1}行第${c+1}列`);
									}
								}
							}, 50);
						}
					}
					
					// ✅ 新增：监听合计行O列和M列变化，实时更新详情页面的总报价和装机功率
					setTimeout(() => {
						const sheetData = luckysheet.getSheetData();
						// 查找表尾合计行
						let footerStartRow = -1;
						for (let i = 5; i < sheetData.length; i++) {
							const row = sheetData[i];
							if (Array.isArray(row)) {
								for (let j = 0; j < row.length; j++) {
									const cell = sheetData[i][j];
									const cellValue = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
									if (String(cellValue).includes('安装费')) {
										footerStartRow = i;
										break;
									}
								}
								if (footerStartRow >= 0) break;
							}
						}
						
						if (footerStartRow >= 0) {
							const totalRow = footerStartRow + 4; // 合计行
							// 如果当前编辑的是合计行的M列（装机功率）或O列（总报价），更新详情页面
							if (r === totalRow && (c === 12 || c === 14)) {
								const totalQuotePriceField = document.getElementById('totalQuotePrice');
								const installedPowerField = document.getElementById('installedPower');
								
								if (c === 14 && totalQuotePriceField) { // O列：总报价
									const totalQuotePriceCell = sheetData[totalRow][14];
									const totalQuotePrice = totalQuotePriceCell && typeof totalQuotePriceCell === 'object' ? 
										(parseFloat(totalQuotePriceCell.v) || 0) : (parseFloat(totalQuotePriceCell) || 0);
									totalQuotePriceField.value = totalQuotePrice.toFixed(2);
									console.log(`💰 实时更新详情页总报价: ¥${totalQuotePrice.toFixed(2)}`);
								}
								
								if (c === 12 && installedPowerField) { // M列：装机功率
									const installedPowerCell = sheetData[totalRow][12];
									const installedPower = installedPowerCell && typeof installedPowerCell === 'object' ? 
										(parseFloat(installedPowerCell.v) || 0) : (parseFloat(installedPowerCell) || 0);
									installedPowerField.value = installedPower.toFixed(2);
									console.log(`⚡ 实时更新详情页装机功率: ${installedPower.toFixed(2)}kW`);
								}
							}
						}
					}, 100);
						
					// 2. 如果编辑了HIJK或N列，强制刷新公式
					if ((c >= 7 && c <= 10) || c === 13) {
						console.log(`✨ 编辑了第${String.fromCharCode(65+c)}列（第${r+1}行）`);
						
						// ✅ 立即触发公式刷新
						setTimeout(() => {
							if (luckysheet.jfrefreshgrid) {
								luckysheet.jfrefreshgrid();
								console.log('  ✅ 已触发公式刷新');
							}
							
							// 延迟检查，等待Luckysheet完成自动计算
							setTimeout(() => {
								const sheetData = luckysheet.getSheetData();
								if (sheetData && sheetData[r]) {
									const kCell = sheetData[r][10];
									const lCell = sheetData[r][11];
									const mCell = sheetData[r][12];
									const oCell = sheetData[r][14];
									
									console.log(`  📊 K${r+1}:`, kCell ? `v=${kCell.v}, m=${kCell.m}, f=${kCell.f}` : 'null');
									console.log(`  📊 L${r+1}:`, lCell ? `v=${lCell.v}, m=${lCell.m}, f=${lCell.f}` : 'null');
									console.log(`  📊 M${r+1}:`, mCell ? `v=${mCell.v}, m=${mCell.m}, f=${mCell.f}` : 'null');
									console.log(`  📊 O${r+1}:`, oCell ? `v=${oCell.v}, m=${oCell.m}, f=${oCell.f}` : 'null');
									
									// 如果L或M列显示为0但有公式，说明是显示问题
									if ((lCell && lCell.f && (lCell.v === 0 || lCell.v === null)) ||
									    (mCell && mCell.f && (mCell.v === 0 || mCell.v === null))) {
										console.warn(`  ⚠️ L或M列有公式但显示为0，再次刷新`);
										setTimeout(() => {
											if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
											if (luckysheet.refresh) luckysheet.refresh();
											console.log('  ✅ 已再次刷新显示');
										}, 100);
									}
							
							// ✅ 公式刷新后，也更新详情页面的总报价和装机功率
							let footerStartRow = -1;
							for (let i = 5; i < sheetData.length; i++) {
								const row = sheetData[i];
								if (Array.isArray(row)) {
									for (let j = 0; j < row.length; j++) {
										const cell = sheetData[i][j];
										const cellValue = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
										if (String(cellValue).includes('安装费')) {
											footerStartRow = i;
											break;
										}
									}
									if (footerStartRow >= 0) break;
								}
							}
							
							if (footerStartRow >= 0) {
								const totalRow = footerStartRow + 4; // 合计行
								const totalQuotePriceField = document.getElementById('totalQuotePrice');
								const installedPowerField = document.getElementById('installedPower');
								
								if (totalQuotePriceField && sheetData[totalRow]) {
									const totalQuotePriceCell = sheetData[totalRow][14];
									const totalQuotePrice = totalQuotePriceCell && typeof totalQuotePriceCell === 'object' ? 
										(parseFloat(totalQuotePriceCell.v) || 0) : (parseFloat(totalQuotePriceCell) || 0);
									totalQuotePriceField.value = totalQuotePrice.toFixed(2);
									console.log(`💰 公式刷新后更新详情页总报价: ¥${totalQuotePrice.toFixed(2)}`);
								}
								
								if (installedPowerField && sheetData[totalRow]) {
									const installedPowerCell = sheetData[totalRow][12];
									const installedPower = installedPowerCell && typeof installedPowerCell === 'object' ? 
										(parseFloat(installedPowerCell.v) || 0) : (parseFloat(installedPowerCell) || 0);
									installedPowerField.value = installedPower.toFixed(2);
									console.log(`⚡ 公式刷新后更新详情页装机功率: ${installedPower.toFixed(2)}kW`);
								}
									}
								}
							}, 200);
						}, 50);
			}
			
	// ✅ 3. 当编辑任何可能影响合计的列（H数量、I单台电机数量、K电机功率、M总功率、N单价、O总价）后，也更新装机功率和总报价
	// 这样确保即使不是直接编辑合计行，修改数据后也能实时更新
	if (r >= 5 && (c === 7 || c === 8 || c === 10 || c === 12 || c === 13 || c === 14)) {
		console.log(`🔔 检测到${String.fromCharCode(65+c)}列第${r+1}行变化，准备更新装机功率和总报价...`);
		
		setTimeout(() => {
			// 先触发一次刷新，确保所有公式都已计算
			if (luckysheet.jfrefreshgrid) {
				luckysheet.jfrefreshgrid();
				console.log('  ✅ 已触发公式刷新');
			}
			
			// 再次延迟读取最终值
			setTimeout(() => {
				const sheetData = luckysheet.getSheetData();
				console.log(`  📊 准备查找表尾，数据总行数: ${sheetData ? sheetData.length : 0}`);
				
				// 查找表尾合计行
				let footerStartRow = -1;
				for (let i = 5; i < sheetData.length; i++) {
					const row = sheetData[i];
					if (Array.isArray(row)) {
						for (let j = 0; j < row.length; j++) {
							const cell = sheetData[i][j];
							const cellValue = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
							if (String(cellValue).includes('安装费')) {
								footerStartRow = i;
								console.log(`  ✅ 找到表尾起始行: 第${i+1}行`);
								break;
							}
						}
						if (footerStartRow >= 0) break;
					}
				}
				
				if (footerStartRow >= 0) {
					const totalRow = footerStartRow + 4; // 合计行
					console.log(`  ✅ 合计行位置: 第${totalRow+1}行`);
					
					const totalQuotePriceField = document.getElementById('totalQuotePrice');
					const installedPowerField = document.getElementById('installedPower');
					
					console.log(`  🔍 检查元素是否存在:`, {
						totalQuotePriceField: !!totalQuotePriceField,
						installedPowerField: !!installedPowerField
					});
					
					if (sheetData[totalRow]) {
						console.log(`  📊 合计行数据:`, sheetData[totalRow]);
						
						const totalQuotePriceCell = sheetData[totalRow][14];
						const installedPowerCell = sheetData[totalRow][12];
						
						console.log(`  📊 M列(装机功率)单元格:`, installedPowerCell);
						console.log(`  📊 O列(总报价)单元格:`, totalQuotePriceCell);
						
						if (totalQuotePriceField && totalQuotePriceCell !== undefined) {
							const totalQuotePrice = totalQuotePriceCell && typeof totalQuotePriceCell === 'object' ? 
								(parseFloat(totalQuotePriceCell.v) || 0) : (parseFloat(totalQuotePriceCell) || 0);
							totalQuotePriceField.value = totalQuotePrice.toFixed(2);
							console.log(`💰 ${String.fromCharCode(65+c)}列变化后更新详情页总报价: ¥${totalQuotePrice.toFixed(2)}`);
							console.log(`  🔍 总报价字段当前值:`, totalQuotePriceField.value);
						} else {
							console.warn(`  ⚠️ 无法更新总报价:`, {
								字段存在: !!totalQuotePriceField,
								单元格值: totalQuotePriceCell
							});
						}
						
						if (installedPowerField && installedPowerCell !== undefined) {
							const installedPower = installedPowerCell && typeof installedPowerCell === 'object' ? 
								(parseFloat(installedPowerCell.v) || 0) : (parseFloat(installedPowerCell) || 0);
							installedPowerField.value = installedPower.toFixed(2);
							console.log(`⚡ ${String.fromCharCode(65+c)}列变化后更新详情页装机功率: ${installedPower.toFixed(2)}kW`);
							console.log(`  🔍 装机功率字段当前值:`, installedPowerField.value);
						} else {
							console.warn(`  ⚠️ 无法更新装机功率:`, {
								字段存在: !!installedPowerField,
								单元格值: installedPowerCell
							});
						}
					} else {
						console.warn(`⚠️ 合计行不存在: 第${totalRow+1}行超出数据范围`);
					}
				} else {
					console.warn('⚠️ 未找到表尾合计行（未找到包含"安装费"的单元格）');
				}
			}, 200);
		}, 100);
					}
			});
				
				console.log('✅ 全局hooks已注册（cellUpdated）');
			} else {
				console.error('❌ 无法注册hooks: luckysheet或createHook不存在');
			}
		}, 500); // 延迟500ms确保Luckysheet完全初始化
				
	// 加载完成后，重新初始化功能
		setTimeout(() => {
			console.log('📊 开始重新初始化功能...');
			
		// ✅ 先添加公式到所有行（包括表尾），再刷新
		console.log('🧮 添加公式到所有行（包括表尾）...');
		if (typeof window.addFormulasToAllRows === 'function') {
			// 获取当前表数据并找到表尾起始行
			const sheetData = luckysheet.getSheetData();
			let footerStartRow = -1;
			for (let r = 5; r < sheetData.length; r++) {
				const cell = sheetData[r] && sheetData[r][2];
				const val = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
				if (String(val).includes('安装费')) {
					footerStartRow = r + 4; // 合计行在安装费后4行
					break;
				}
			}
			
			if (footerStartRow > 0) {
				window.currentFooterStartRow = footerStartRow;
				console.log(`📍 表尾合计行: 第${footerStartRow + 1}行`);
				
				// 调用addFormulasToAllRows添加所有公式
				window.addFormulasToAllRows(5, footerStartRow);
			} else {
				console.warn('⚠️ 未找到表尾位置');
			}
		} else {
			console.error('❌ addFormulasToAllRows函数不存在');
		}
		
	// 多次刷新确保公式计算完成（加强L列公式识别）
	setTimeout(() => {
		if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
		if (luckysheet.refresh) luckysheet.refresh();
	}, 200);
	
	setTimeout(() => {
		if (luckysheet.jfrefreshgrid) luckysheet.jfrefreshgrid();
		if (luckysheet.refresh) luckysheet.refresh();
	}, 500);
	
	// 更新设备列表
	setTimeout(() => {
		if (typeof updateDeviceListFromTable === 'function') {
			console.log('📋 更新设备列表');
			updateDeviceListFromTable();
		}
	}, 1000);
	
	// 刷新序号
	setTimeout(() => {
		if (typeof refreshSerialNumbers === 'function') {
			console.log('🔢 刷新序号');
			refreshSerialNumbers(5, window.currentFooterStartRow);
		}
	}, 1200);
}, 1000);
				} catch (e) {
					console.error('❌ LuckyExcel 读取失败，回退到简单读取:', e);
					loadExcelFile(file);
				}
			});
		}
		
		function loadExcelFile(file) {
			const reader = new FileReader();
			reader.onload = function(e) {
				try {
					// 检查 XLSX 是否加载
					if (typeof XLSX === 'undefined') {
						console.error('❌ XLSX 库未加载，请稍后重试');
						callback({
							sheets: [],
							info: { name: '错误', creator: 'XLSX未加载' }
						}, '');
						return;
					}
					const data = new Uint8Array(e.target.result);
					const workbook = XLSX.read(data, {type: 'array'});
					const sheetName = workbook.SheetNames[0];
					const worksheet = workbook.Sheets[sheetName];
					const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
					
					// 转换为Luckysheet格式
					const celldata = [];
					jsonData.forEach((row, r) => {
						row.forEach((cell, c) => {
							if (cell !== undefined && cell !== null && cell !== '') {
								celldata.push({
									r: r,
									c: c,
									v: {
										v: cell,
										m: cell.toString(),
										ct: {fa: "General", t: "g"}
									}
								});
							}
						});
					});
					
					// 重新初始化Luckysheet
					const newOptions = {
						container: 'luckysheet',
						lang: 'zh',
						title: false,
						showinfobar: false,
						showstatisticBar: false,
						allowCopy: true,
						allowEdit: true,
						data: [{
							"name": file.name.replace(/\.[^/.]+$/, ""),
							"config": {
								"borderInfo": [],
								"rowlen": {
									'0': 35, '1': 35, '2': 35, '3': 28, '4': 28,  // 表头行高
									'15': 28, '16': 28, '17': 28, '18': 28, '19': 28  // 表尾行高
								},
								"columnlen": {
									'0': 50,  // A列
							'1': 40,  // B列
									'2': 80,  // C列
									'3': 80,  // D列
									'4': 200, // E列 - 技术参数及要求
									'5': 80,  // F列
									'6': 50,  // G列
									'7': 50,  // H列
									'8': 40,  // I列
									'9': 40,  // J列
								'10': 70, // K列
									'11': 40, // L列
									'12': 40, // M列
									'13': 60, // N列
									'14': 60, // O列
									'15': 80  // P列
								},
								"rowhidden": {},
								"colhidden": {},
								"authority": {}
							},
							"index": "0",
							"order": 0,
							"status": 1,
							"row": Math.max(jsonData.length, 84),
							"column": Math.max(jsonData[0] ? jsonData[0].length : 0, 60),
							"celldata": celldata
						}]
					};
					
					luckysheet.destroy();
					setTimeout(() => {
						luckysheet.create(newOptions);
						console.log('✅ 文件加载成功:', file.name);
						
						// 重新启用合并单元格功能
						console.log('✅ 文件加载完成，正在设置合并单元格');
						
						setTimeout(() => {
							setupHeaderMerging();
							setTimeout(() => {
								setupFooterMerging();
							}, 200);
							
							setTimeout(() => {
								if (window.updateDeviceListFromTable) {
									window.updateDeviceListFromTable();
								}
							}, 500);
						}, 1000);
					}, 100);
					
				} catch (error) {
					console.error('❌ 文件加载失败:', error);
					alert('文件加载失败: ' + error.message);
				}
			};
			reader.readAsArrayBuffer(file);
		}
		
async function saveToExcel() {
	try {
		console.log('📥 开始保存Excel（使用ExcelJS）...');
		
		// 获取所有工作表
		const sheets = luckysheet.getAllSheets();
		if (!sheets || sheets.length === 0) {
				alert('没有数据可保存');
				return;
			}
			
		console.log('📊 工作表数量:', sheets.length);
		
		// 生成文件名：HJSJ{YYMMDD}QDZX004V1.0-{造粒机数量}台项目（设备参数选型）.xlsx
		const now = new Date();
		const yy = String(now.getFullYear()).slice(2); // 后两位年份
		const mm = String(now.getMonth() + 1).padStart(2, '0');
		const dd = String(now.getDate()).padStart(2, '0');
		const dateStr = yy + mm + dd;
		
		// 统计造粒机的H列数量
		let granulatorCount = 0;
		const sheetData = luckysheet.getSheetData();
		let footerStartRow = -1;
		
		// 查找表尾起始行
		for (let r = 5; r < sheetData.length; r++) {
			const row = sheetData[r];
			if (Array.isArray(row)) {
				for (let c = 0; c < row.length; c++) {
					const cellValue = row[c];
					const val = (cellValue && typeof cellValue === 'object' && 'v' in cellValue) ? cellValue.v : cellValue;
					if (String(val).includes('安装费')) {
						footerStartRow = r;
						break;
					}
				}
				if (footerStartRow >= 0) break;
			}
		}
		
		// 统计造粒机数量（查找C列设备名称包含"造粒机"的行，累加其H列数量）
		if (footerStartRow >= 0) {
			for (let r = 5; r < footerStartRow; r++) {
				const nameCell = sheetData[r] && sheetData[r][2]; // C列：设备名称
				const nameVal = (nameCell && typeof nameCell === 'object' && 'v' in nameCell) ? nameCell.v : nameCell;
				
				if (nameVal && String(nameVal).includes('造粒机')) {
					const qtyCell = sheetData[r] && sheetData[r][7]; // H列：数量
					const qtyVal = (qtyCell && typeof qtyCell === 'object' && 'v' in qtyCell) ? qtyCell.v : qtyCell;
					const qty = parseFloat(qtyVal) || 0;
					granulatorCount += qty;
				}
			}
		}
		
		const defaultFileName = `HJSJ${dateStr}QDZX004V1.0-${Math.round(granulatorCount)}台项目（设备参数选型）`;
		console.log(`📄 生成默认文件名: ${defaultFileName}`);
			
        // 让用户通过对话框勾选要保存的工作表
        let selectedSheets = [];
		try {
			selectedSheets = await window.selectSheetsForExport(sheets);
			if (!Array.isArray(selectedSheets) || selectedSheets.length === 0) {
				alert('未选择任何工作表，已取消保存');
				return;
			}
		} catch (_) {
			// 发生异常时，默认全部
			selectedSheets = sheets;
		}
			
        // 🔥 新增：让用户确认或修改文件名
        const userFileName = await window.promptFileName('请输入文件名', defaultFileName, '.xlsx');
        if (!userFileName) {
            console.log('⚠️ 用户取消保存');
            return;
        }
        
        // 确保文件名有.xlsx扩展名
        let fileName = userFileName.endsWith('.xlsx') ? userFileName : userFileName + '.xlsx';
        console.log(`✅ 最终文件名: ${fileName}`);
			
		// 使用ExcelJS导出
		if (typeof ExcelJS !== 'undefined') {
			console.log('✅ 使用ExcelJS导出（完整格式支持）');
            const blob = await exportSheetExcelJS(selectedSheets, fileName);
			
			// 检测是否在 Electron 环境中
			const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;
			
			if (isElectron) {
				// Electron 环境：直接保存到下载目录
				console.log('🖥️ Electron 环境，保存到下载目录');
                fallbackDownload(blob, fileName);
				console.log('✅ 文件保存成功');
                alert('✅ 保存成功！\n\n文件已保存到下载目录\n文件名：' + fileName);
				// 保存到历史记录
				await saveExcelToHistory(blob, fileName);
			} else {
				// 浏览器环境：检测并使用最佳保存方式
				console.log('🔍 检测保存API支持情况...');
				console.log('  - showSaveFilePicker:', typeof window.showSaveFilePicker);
				console.log('  - 协议:', window.location.protocol);
				console.log('  - 浏览器:', navigator.userAgent);
				
				// 检查是否支持文件保存API
				const supportsFilePicker = 'showSaveFilePicker' in window;
				const isSecureContext = window.isSecureContext;
				
				console.log('  - 支持FilePicker:', supportsFilePicker);
				console.log('  - 安全上下文:', isSecureContext);
				
				if (supportsFilePicker && isSecureContext) {
					// 尝试使用文件保存对话框
					try {
						console.log('💾 尝试打开文件保存对话框...');
						const handle = await window.showSaveFilePicker({
                            suggestedName: fileName,
							types: [{ 
								description: 'Excel 工作簿', 
								accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } 
							}]
						});
						console.log('✅ 用户已选择保存位置');
						const writable = await handle.createWritable();
						await writable.write(blob);
						await writable.close();
						console.log('✅ 文件写入成功');
						alert('✅ 保存成功！\n\n文件已保存到您选择的位置\n文件名：' + fileName);
						// 保存到历史记录
						await saveExcelToHistory(blob, fileName);
					} catch (saveError) {
						if (saveError.name === 'AbortError') {
							console.log('⚠️ 用户取消保存');
							return; // 用户取消，不再执行
						} else {
							console.error('❌ 保存对话框错误:', saveError);
							console.error('错误详情:', saveError.message, saveError.stack);
							alert('⚠️ 保存对话框失败，将使用下载方式\n\n错误：' + saveError.message);
							fallbackDownload(blob, fileName);
							console.log('✅ 已使用下载方式');
							// 保存到历史记录
							await saveExcelToHistory(blob, fileName);
						}
					}
				} else {
					// 不支持或不是安全上下文
					if (!supportsFilePicker) {
						console.warn('⚠️ 浏览器不支持 showSaveFilePicker API');
						console.warn('💡 当前浏览器:', navigator.userAgent);
						console.warn('💡 建议使用: Chrome 86+, Edge 86+, Opera 72+');
					}
					if (!isSecureContext) {
						console.warn('⚠️ 非安全上下文（需要HTTPS或localhost）');
						console.warn('💡 当前协议:', window.location.protocol);
						console.warn('💡 File System Access API 需要在安全上下文中运行');
					}
					
                    fallbackDownload(blob, fileName);
					console.log('✅ 文件已下载到浏览器下载目录');
					
					let msg = '✅ 文件已下载到浏览器默认下载目录\n\n文件名：' + fileName;
					if (!supportsFilePicker) {
						msg += '\n\n💡 提示：使用 Chrome 86+ 或 Edge 86+ 浏览器可以选择保存位置';
					}
					if (!isSecureContext && window.location.protocol === 'file:') {
						msg += '\n\n⚠️ 注意：使用本地服务器（http://localhost）可以获得更好的体验';
					}
					alert(msg);
					// 保存到历史记录
					await saveExcelToHistory(blob, fileName);
				}
			}
		} else {
			// ExcelJS未安装
			console.error('❌ ExcelJS未安装，无法保存Excel文件');
			alert('❌ ExcelJS未安装！\n\n请先安装ExcelJS：\n1. 访问 src/libs/download-exceljs.html\n2. 下载 exceljs.min.js\n3. 放到 src/libs/ 和 dist/libs/ 目录\n4. 刷新页面');
		}
	} catch (e) {
		console.error('❌ 保存失败:', e);
		alert('保存失败: ' + e.message);
	}
}

// 勾选对话框：选择要导出的工作表
window.selectSheetsForExport = function(allSheets) {
	return new Promise((resolve) => {
		try {
			const overlay = document.createElement('div');
			overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;display:flex;align-items:center;justify-content:center;';
			const box = document.createElement('div');
			box.style.cssText = 'background:#fff;border-radius:8px;min-width:360px;max-width:500px;padding:16px 18px;box-shadow:0 8px 30px rgba(0,0,0,0.2);font-family:Segoe UI,Arial,sans-serif;';
			box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:8px;">选择要导出的工作表</div>';
			const list = document.createElement('div');
			list.style.cssText = 'max-height:260px;overflow:auto;padding:8px 4px;border:1px solid #eee;border-radius:6px;';
			const names = (allSheets || []).map(s => (s && s.name) ? s.name : 'Sheet');
			// 优先显示简化版/完整版
			const ordered = [...names].sort((a,b)=>{
				const aw = a.includes('简化版') ? 0 : a.includes('完整版') ? 1 : 2;
				const bw = b.includes('简化版') ? 0 : b.includes('完整版') ? 1 : 2;
				return aw - bw || a.localeCompare(b);
			});
			ordered.forEach(name => {
				const id = 'exp_' + Math.random().toString(36).slice(2);
				const row = document.createElement('label');
				row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;';
				row.innerHTML = `<input id="${id}" type="checkbox" ${/简化版|完整版/.test(name)?'checked':''} style="width:16px;height:16px;"> <span>${name}</span>`;
				list.appendChild(row);
			});
			const actions = document.createElement('div');
			actions.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;margin-top:12px;';
			const cancelBtn = document.createElement('button');
			cancelBtn.textContent = '取消';
			cancelBtn.style.cssText = 'padding:6px 12px;border:1px solid #ccc;background:#f8f8f8;border-radius:4px;cursor:pointer;';
			const okBtn = document.createElement('button');
			okBtn.textContent = '导出';
			okBtn.style.cssText = 'padding:6px 12px;border:1px solid #0d6efd;background:#0d6efd;color:#fff;border-radius:4px;cursor:pointer;';
			actions.appendChild(cancelBtn);
			actions.appendChild(okBtn);
			box.appendChild(list);
			box.appendChild(actions);
			overlay.appendChild(box);
			document.body.appendChild(overlay);
			const finish = (picked) => { document.body.removeChild(overlay); resolve(picked); };
			cancelBtn.onclick = () => finish([]);
			okBtn.onclick = () => {
				const checks = list.querySelectorAll('input[type="checkbox"]');
				const selectedNames = [];
				checks.forEach((chk, idx) => { if (chk.checked) selectedNames.push(ordered[idx]); });
				const picked = (allSheets || []).filter(s => selectedNames.includes(s.name));
				finish(picked);
			};
		} catch (_) { resolve(allSheets || []); }
	});
};

	function fallbackDownload(blob, fileName) {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
		a.download = fileName;
			a.style.display = 'none';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(url), 100);
	}

	// ExcelJS导出函数（参考 https://blog.csdn.net/zinchliang/article/details/120262185）
	async function exportSheetExcelJS(luckysheetData, name = "file") {
		console.log('🔧 ExcelJS导出开始');
		
		// 创建工作簿
		const workbook = new ExcelJS.Workbook();
		workbook.creator = '设备参数选型系统';
		workbook.created = new Date();
		
		// 遍历所有sheet
		for (const table of luckysheetData) {
			if (!table.data || table.data.length === 0) continue;
			
			const sheetName = 'Sheet1';
			console.log(`📄 处理工作表: ${table.name || '未命名'} → 导出为: ${sheetName}`);
			
			const worksheet = workbook.addWorksheet(sheetName);
			
			// 设置单元格样式和值
			setStyleAndValue(table.data, worksheet, table);
			
			// 设置合并单元格
			if (table.config && table.config.merge) {
				setMerge(table.config.merge, worksheet);
			}
			
			// 设置边框
			setBorder(table, worksheet);
			
			// 设置列宽和行高
			setColumnWidth(table, worksheet);
			setRowHeight(table, worksheet);
		}
		
		// 写入buffer并返回blob
		const buffer = await workbook.xlsx.writeBuffer();
		return new Blob([buffer], { 
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' 
		});
	}

	// 设置单元格样式和值
	function setStyleAndValue(data, worksheet, table) {
		console.log(`📝 设置单元格样式和值，共 ${data.length} 行`);
		
		// ✅ 检测工作表类型
		const isSimplified = table.name && table.name.includes('简化版');
		console.log(`📊 保存工作表: ${table.name || '未命名'} (${isSimplified ? '简化版' : '完整版'})`);
		
		// 确定实际的数据范围（只包含有数据的区域）
		let maxRow = 0;
		let maxCol = 0;
		
		for (let r = 0; r < data.length; r++) {
			const row = data[r];
			if (!row) continue;
			
			for (let c = 0; c < row.length; c++) {
				const cellData = row[c];
				// 只要单元格有任何内容（值、公式、样式），就认为是有效区域
				if (cellData && (cellData.v !== undefined || cellData.m !== undefined || cellData.f)) {
					maxRow = Math.max(maxRow, r);
					maxCol = Math.max(maxCol, c);
				}
			}
		}
		
		maxRow += 1; // 转换为长度
		maxCol += 1; // 转换为长度
		
		console.log(`📊 有效数据范围: ${maxRow} 行 × ${maxCol} 列`);
		
		// ⚠️ 查找表尾起始行（"安装费"所在行）
		let footerStartRow = -1;
		for (let r = 5; r < data.length; r++) {
			const row = data[r];
			if (!row) continue;
			for (let c = 0; c < row.length; c++) {
				const cellData = row[c];
                const cellValue = (typeof window.getCellText === 'function') ? (window.getCellText(cellData) || '') : (function cdToText(cd){
                    if (cd === undefined || cd === null) return '';
                    if (typeof cd === 'string' || typeof cd === 'number') return String(cd).trim();
                    if (typeof cd === 'object') {
                        if ('m' in cd && cd.m) return typeof cd.m === 'object' ? String(cd.m.v ?? '').trim() : String(cd.m).trim();
                        if ('v' in cd && cd.v) return typeof cd.v === 'object' ? String(cd.v.v ?? '').trim() : String(cd.v).trim();
                        if ('text' in cd && cd.text) return String(cd.text).trim();
                        if ('ct' in cd && cd.ct) {
                            if (Array.isArray(cd.ct.s) && cd.ct.s.length > 0) {
                                const texts = cd.ct.s.filter(it => it && it.v).map(it => String(it.v));
                                if (texts.length > 0) return texts.join('').trim();
                            }
                            if ('v' in cd.ct && cd.ct.v) return String(cd.ct.v).trim();
                        }
                    }
                    return '';
                })(cellData);
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
		
        // 扩展遍历范围：至少覆盖数据区到表尾（即使当前luckysheet中为空也写公式）
        const effectiveMaxRow = Math.max(maxRow, dataRowEnd, totalRow + 1);
        const effectiveMaxCol = Math.max(maxCol, 16); // 至少覆盖到 O 列（索引14）

        // 只遍历有效数据区域（扩展后）
        for (let r = 0; r < effectiveMaxRow; r++) {
			const row = data[r] || [];
			const isTotalRow = (r === totalRow); // 是否为合计行
			
            for (let c = 0; c < effectiveMaxCol; c++) {
				const cellData = row[c];
				const excelRow = r + 1;
				const excelCol = c + 1;
				const cell = worksheet.getCell(excelRow, excelCol);
				
			// 设置值
			if (cellData) {
			// 🔥 修复：表头行（r<3）的公司名称单元格，保留原始值（含\n换行符）
			let actualValue;
			if (r < 3 && c === 0) {
				// 公司名称单元格：直接从v或m获取，保留\n
				if (cellData.v !== undefined && cellData.v !== null) {
					actualValue = cellData.v;
				} else if (cellData.m !== undefined && cellData.m !== null) {
					actualValue = cellData.m;
				} else {
					actualValue = '';
				}
			} else {
            // ✅ 获取实际显示值（带本地回退，避免 window.getCellText 未定义）
                    actualValue = (typeof window.getCellText === 'function') ? window.getCellText(cellData) : (function cdToText(cd){
                        if (cd === undefined || cd === null) return '';
                        if (typeof cd === 'string' || typeof cd === 'number') return String(cd).trim();
                        if (typeof cd === 'object') {
                            if ('m' in cd && cd.m !== null && cd.m !== undefined && cd.m !== '') return typeof cd.m === 'object' ? String(cd.m.v ?? '').trim() : String(cd.m).trim();
                            if ('v' in cd && cd.v !== null && cd.v !== undefined && cd.v !== '') return typeof cd.v === 'object' ? String(cd.v.v ?? '').trim() : String(cd.v).trim();
                            if ('text' in cd && cd.text) return String(cd.text).trim();
                            if ('ct' in cd && cd.ct) {
                                if (Array.isArray(cd.ct.s) && cd.ct.s.length > 0) {
                                    const texts = cd.ct.s.filter(it => it && it.v).map(it => String(it.v));
                                    if (texts.length > 0) return texts.join('').trim();
                                }
                                if ('v' in cd.ct && cd.ct.v) return String(cd.ct.v).trim();
                            }
                        }
                        return '';
                    })(cellData);
			}
					
					// 如果 getCellText 返回空，尝试直接提取 v 或 m
					if (!actualValue) {
						if (cellData.v !== undefined && cellData.v !== null) {
							actualValue = cellData.v;
						} else if (cellData.m !== undefined && cellData.m !== null) {
							actualValue = cellData.m;
						}
					}
					
			// ⚠️ 特殊处理：第4-5行（索引3-4）的表头内容，确保都能保存
			if (r === 3 || r === 4) {
				if (r === 4) {
					// 不再强行填充固定文本，按原表头保存
					if (actualValue) {
						cell.value = actualValue;
					}
				} else if (r === 3) {
					// 🔥 修复：电机功率(KW)表头换行显示
					if (actualValue) {
						let headerValue = String(actualValue);
						// 简化版I列(索引8)或完整版K列(索引10)的"电机功率(KW)"需要换行
						if ((c === 8 || c === 10) && headerValue.includes('电机功率') && headerValue.includes('(KW)')) {
							// 在"电机功率"和"(KW)"之间添加换行符
							headerValue = headerValue.replace('电机功率(KW)', '电机功率\n(KW)');
						}
						cell.value = headerValue;
					}
				}
			}
					// A列（索引0）序号强制为数字格式
				else if (c === 0 && actualValue !== null) {
						const numValue = parseFloat(actualValue);
						if (!isNaN(numValue)) {
							cell.value = numValue;
							cell.numFmt = '0'; // 整数格式
						} else {
							cell.value = actualValue; // "合计"等文本
						}
					}
				// F列（索引5）：简化版合计行SUM，其余行数字；非简化版按值
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
				// G列（索引6）：数字
				else if (c === 6) {
					if (actualValue !== null) {
						const numValue = parseFloat(actualValue);
						if (!isNaN(numValue)) { cell.value = numValue; cell.numFmt = '0.##########'; }
						else if (String(actualValue).trim() === '/') { cell.value = '/'; }
						else { cell.value = actualValue; }
					}
				}
				// H列（索引7）：简化版→数据行为 G*F（总电机数量=单台电机数量×设备数量），合计行SUM；完整版按值
				else if (c === 7) {
					if (isSimplified) {
						if (isTotalRow) {
							cell.value = { formula: `SUM(H${dataRowStart + 1}:H${dataRowEnd})` };
						} else {
							// 🔥 修复：G*F（单台电机数量G × 设备数量F = 总电机数量H）
							cell.value = { formula: `IFERROR(IF(G${excelRow}*F${excelRow}=0,"",G${excelRow}*F${excelRow}),"")` };
							console.log(`📐 H列保存公式 G×F: ${cell.address} (简化版)`);
						}
					} else if (actualValue !== null) {
						const numValue = parseFloat(actualValue);
						if (!isNaN(numValue)) { cell.value = numValue; cell.numFmt = '0.##########'; }
						else if (String(actualValue).trim() === '/') { cell.value = '/'; }
						else { cell.value = actualValue; }
						}
					}
				// I列（索引8）：简化版为电机功率(保持原始格式-表达式或数值)，完整版为单台电机数量(数字格式)
				else if (c === 8 && actualValue !== null) {
					if (isSimplified) {
						// 🔥 简化版：I列是电机功率，保持原始格式（表达式如"11+22"或数值如"11"）
						const strValue = String(actualValue).trim();
						if (strValue === '/' || strValue === '') {
							cell.value = '/';
						} else if (/[\+\-\*\/]/.test(strValue) && !/^[\-]?\d+(\.\d+)?$/.test(strValue)) {
							// 包含运算符且不是负数 → 表达式，保存为文本
							cell.value = strValue;
							cell.numFmt = '@'; // 文本格式
							console.log(`📝 简化版I列保存表达式: ${strValue} (文本格式)`);
						} else {
							// 数值，保存为数字
							const numValue = parseFloat(strValue);
							if (!isNaN(numValue)) {
								cell.value = numValue;
								cell.numFmt = '0.##########';
								console.log(`📝 简化版I列保存数值: ${numValue} (数字格式)`);
							} else {
								cell.value = strValue;
							}
						}
					} else {
						// 完整版：I列是单台电机数量，数字格式
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
				}
			// J列（索引9）：简化版→数据行为I×G（单台设备功率=电机功率×单台电机数量），合计行为"/"；完整版→保持原值
			else if (c === 9) {
				const strValue = actualValue !== null ? String(actualValue).trim() : '';
				const isDataRow = (r >= dataRowStart && r < dataRowEnd);
				
				if (isTotalRow) {
					if (isSimplified) {
						cell.value = '/';
					} else {
						cell.value = { formula: `SUM(J${dataRowStart + 1}:J${dataRowEnd})` };
					}
				} else if (strValue === '/') {
					cell.value = '/';
                } else if (isDataRow) {
					// 🔥 修复：区分简化版和完整版
					if (isSimplified) {
						// 🔥 修复：简化版J列 = I × G（电机功率I × 单台电机数量G = 单台设备功率J）
						cell.value = { formula: `IFERROR(IF(I${excelRow}*G${excelRow}=0,"",I${excelRow}*G${excelRow}),"")` };
						console.log(`📐 J列保存公式 I×G: ${cell.address} (简化版)`);
					} else {
						// 完整版：保持原值（数字或特殊格式如11+22）
						if (strValue && /[\+\-\*\/]/.test(strValue) && !/^[\-]?\d+(\.\d+)?$/.test(strValue)) {
							// 特殊格式（如11+22）保持原样
							cell.value = strValue;
						} else {
							const numValue = parseFloat(strValue);
							if (!isNaN(numValue)) {
								cell.value = numValue;
								cell.numFmt = '0.##########';
							} else {
								cell.value = strValue || '';
							}
						}
					}
				}
				// 非数据行且非合计行，不保存
			}
				// K列（索引10）：简化版→数据行为J×F，合计行SUM；完整版→保持原值
				else if (c === 10) {
					const strValue = String(actualValue ?? '').trim();
					const isDataRow = (r >= dataRowStart && r < dataRowEnd);
					
					if (isSimplified) {
						// 简化版逻辑
						if (isTotalRow) {
							cell.value = { formula: `SUM(K${dataRowStart + 1}:K${dataRowEnd})` };
							console.log(`📐 K列合计保存SUM公式: ${cell.address} (简化版)`);
						} else if (isDataRow) {
							// 数据行：K = J × F
							cell.value = { formula: `IFERROR(IF(J${excelRow}*F${excelRow}=0,"",J${excelRow}*F${excelRow}),"")` };
							console.log(`📐 K列保存公式 J×F: ${cell.address} (简化版)`);
						} else if (strValue === '/') {
							cell.value = '/';
						}
					} else if (actualValue !== null) {
						// 完整版逻辑：保持原值
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
			// L列（索引11）：简化版和完整版都保持原值
		else if (c === 11) {
			const strValue = actualValue !== null ? String(actualValue).trim() : '';
			const isDataRow = (r >= dataRowStart && r < dataRowEnd);
			
			if (strValue === '/') {
				cell.value = '/';
            } else if (isDataRow || isTotalRow) {
				// 简化版和完整版：L列都保留为值，不需要公式
				const numValue = parseFloat(strValue);
				if (!isNaN(numValue)) { 
					cell.value = numValue; 
					cell.numFmt = '0.##########'; 
				} else { 
					cell.value = strValue || ''; 
				}
			}
			// 非数据行，不保存
		}
   // M列（索引12）：简化版数据行为 F×L，合计行SUM；完整版为 L×H
	else if (c === 12) {
		const strValue = actualValue !== null ? String(actualValue).trim() : '';
		const isDataRow = (r >= dataRowStart && r < dataRowEnd);
		
		if (isTotalRow) {
			// 合计行：保存SUM公式
			cell.value = { formula: `SUM(M${dataRowStart + 1}:M${dataRowEnd})` };
			console.log(`📐 M列合计保存SUM公式: ${cell.address} = SUM(M${dataRowStart + 1}:M${dataRowEnd})`);
		} else if (strValue === '/') {
			cell.value = '/';
        } else if (isDataRow) {
           // 数据行：简化版 M=L×F；完整版 M=L×H
           if (isSimplified) {
               cell.value = { formula: `IFERROR(IF(L${excelRow}*F${excelRow}=0,"",L${excelRow}*F${excelRow}),"")` };
               console.log(`📐 M列保存IFERROR(IF(L*F=0,"",L*F),"") 公式: ${cell.address} (简化版)`);
           } else {
            cell.value = { formula: `IFERROR(IF(L${excelRow}*H${excelRow}=0,"",L${excelRow}*H${excelRow}),"")` };
               console.log(`📐 M列保存IFERROR(IF(L*H=0,"",L*H),"") 公式: ${cell.address} (完整版)`);
           }
		}
		// 非数据行且非合计行，不保存
					}
					// N列（索引13）强制为数字格式 + 居中对齐
					else if (c === 13 && actualValue !== null) {
						const numValue = parseFloat(actualValue);
						if (!isNaN(numValue)) {
							cell.value = numValue;
							cell.numFmt = '0.##########';
							cell.alignment = { horizontal: 'center', vertical: 'middle' };
						} else if (actualValue === '/' || String(actualValue).trim() === '/') {
							cell.value = '/';
							cell.alignment = { horizontal: 'center', vertical: 'middle' };
						} else {
							cell.value = actualValue;
							cell.alignment = { horizontal: 'center', vertical: 'middle' };
						}
					}
			// O列（索引14）总报价：简化版不加边框（样式处控制），其余逻辑不变
		else if (c == 14) {
			const strValue = actualValue !== null ? String(actualValue).trim() : '';
			const isDataRow = (r >= dataRowStart && r < dataRowEnd);
			
			if (isTotalRow) {
				// 合计行：保存SUM公式
				cell.value = { formula: `SUM(O${dataRowStart + 1}:O${dataRowEnd})` };
				console.log(`📐 O列合计保存SUM公式: ${cell.address} = SUM(O${dataRowStart + 1}:O${dataRowEnd})`);
			} else if (strValue === '/') {
				cell.value = '/';
        } else if (isDataRow) {
            // 数据行：统一保存IF公式 + IFERROR，结果为0或错误时显示空白
            cell.value = { formula: `IFERROR(IF(N${excelRow}*H${excelRow}=0,"",N${excelRow}*H${excelRow}),"")` };
            console.log(`📐 O列保存IFERROR(IF(N*H=0,"",N*H),"") 公式: ${cell.address}`);
			}
			// 非数据行且非合计行，不保存
					}
					else if (actualValue !== null) {
						cell.value = actualValue;
				}
			}
				
		// 🔥 修复：需要自动换行的列和单元格
				const isColumnD = (c === 3);  // D列数据（简化版设备名称）
				const isColumnE = (c === 4);  // E列数据（完整版设备名称）
			const isDevicePositionHeader = (r === 3 && c === 1); // B4: 设备位号
			const isMotorPowerHeaderSimple = (r === 3 && c === 8); // I4: 电机功率(KW) - 简化版
			const isMotorPowerHeaderFull = (r === 3 && c === 10); // K4: 电机功率(KW) - 完整版
			// 公司名换行（检查是否包含"温岭市泽国化工机械"、"有限公司"或换行符）
			const actualTextForStyle = (typeof actualValue !== 'undefined' && actualValue !== null) ? String(actualValue) : '';
			const isCompanyNameCell = actualTextForStyle.indexOf('温岭市泽国化工机械') !== -1 || 
			                          actualTextForStyle.indexOf('有限公司') !== -1 ||
									  actualTextForStyle.indexOf('\n') !== -1;
			const needWrapText = isColumnD || isColumnE || isDevicePositionHeader || 
			                     isMotorPowerHeaderSimple || isMotorPowerHeaderFull || isCompanyNameCell;
				
		// 只为A-P列（索引0-15）设置边框（简化版不为O/P加边框）
		const needBorder = isSimplified ? (c >= 0 && c <= 13) : (c >= 0 && c <= 15);
		
				// 🔥 修复：默认样式（12号宋体，确保所有文字都是宋体）
				const style = {
					alignment: { 
						horizontal: 'center', 
						vertical: 'middle',
						wrapText: needWrapText
					},
					font: {
						name: '宋体',  // 使用中文名称确保兼容性
						size: 12,      // 默认12号字体
						color: { argb: 'FF000000' }
					}
				};
			
			// 只为A-P列添加边框
			if (needBorder) {
				style.border = {
					top: { style: 'thin', color: { argb: 'FF000000' } },
					left: { style: 'thin', color: { argb: 'FF000000' } },
					bottom: { style: 'thin', color: { argb: 'FF000000' } },
					right: { style: 'thin', color: { argb: 'FF000000' } }
				};
			}
				
				// 读取Luckysheet的样式（如果有cellData）
				if (cellData) {
					if (cellData.bl === 1) style.font.bold = true;
					if (cellData.fs) style.font.size = Number(cellData.fs);
					// 🔥 修复：保持宋体，即使cellData中有其他字体
					if (cellData.ff) {
						const fontFamily = String(cellData.ff);
						// 将所有字体统一为宋体
						if (fontFamily === 'SimSun' || fontFamily === '宋体' || fontFamily === 'Arial' || fontFamily === 'Calibri') {
							style.font.name = '宋体';
						} else {
							style.font.name = '宋体'; // 默认使用宋体
						}
					}
					
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
			}
		}
		

		// 追加一步：确保数据区所有 J/L/M/O 空白单元格也写入公式（即便Luckysheet中没有值）
		try {
			const isSlash = (rowIdx, colIdx) => {
				const raw = data[rowIdx] && data[rowIdx][colIdx];
            const txt = (typeof window.getCellText === 'function') ? window.getCellText(raw) : (function(cd){
                if (!cd) return '';
                if (typeof cd === 'string' || typeof cd === 'number') return String(cd).trim();
                if (cd.m) return String(cd.m).trim();
                if (cd.v) return String(cd.v).trim();
                return '';
            })(raw);
				return (txt && String(txt).trim() === '/');
			};
			for (let r = dataRowStart; r < dataRowEnd; r++) {
				const excelRow = r + 1;
				// J 列（excelCol=10）
				if (!isSlash(r, 9)) {
					const cellJ = worksheet.getCell(excelRow, 10);
					const vJ = cellJ.value;
					const emptyJ = (vJ === undefined || vJ === null || (typeof vJ === 'string' && vJ === ''));
					if (emptyJ) {
						cellJ.value = { formula: `IFERROR(IF(I${excelRow}*H${excelRow}=0,"",I${excelRow}*H${excelRow}),"")` };
					}
				}
				// L 列（excelCol=12）
				if (!isSlash(r, 11)) {
					const cellL = worksheet.getCell(excelRow, 12);
					const vL = cellL.value;
					const emptyL = (vL === undefined || vL === null || (typeof vL === 'string' && vL === ''));
					if (emptyL) {
						cellL.value = { formula: `IFERROR(IF(K${excelRow}*I${excelRow}=0,"",K${excelRow}*I${excelRow}),"")` };
					}
				}
				// M 列（excelCol=13）
				if (!isSlash(r, 12)) {
					const cellM = worksheet.getCell(excelRow, 13);
					const vM = cellM.value;
					const emptyM = (vM === undefined || vM === null || (typeof vM === 'string' && vM === ''));
					if (emptyM) {
						cellM.value = { formula: `IFERROR(IF(L${excelRow}*H${excelRow}=0,"",L${excelRow}*H${excelRow}),"")` };
					}
				}
				// O 列（excelCol=15）
				if (!isSlash(r, 14)) {
					const cellO = worksheet.getCell(excelRow, 15);
					const vO = cellO.value;
					const emptyO = (vO === undefined || vO === null || (typeof vO === 'string' && vO === ''));
					if (emptyO) {
						cellO.value = { formula: `IFERROR(IF(N${excelRow}*H${excelRow}=0,"",N${excelRow}*H${excelRow}),"")` };
					}
				}
			}
			console.log('✅ 追加：为空白的J/L/M/O单元格补充公式完成');
		} catch (e) {
			console.warn('⚠️ 追加补充公式失败：', e);
		}
		
		console.log('✅ 单元格样式和值设置完成');
	}

	// 设置合并单元格
	function setMerge(luckyMerge = {}, worksheet) {
		const mergearr = Object.values(luckyMerge);
		console.log(`🔗 设置合并单元格，共 ${mergearr.length} 个`);
		
		const mergedRanges = new Set(); // 记录已合并的区域
		mergearr.forEach(elem => {
			// elem格式：{r: 0, c: 0, rs: 1, cs: 2}
			const key = `${elem.r}_${elem.c}_${elem.rs}_${elem.cs}`;
			if (!mergedRanges.has(key)) {
				try {
			// 按开始行，开始列，结束行，结束列合并
			worksheet.mergeCells(
				elem.r + 1, 
				elem.c + 1, 
				elem.r + elem.rs, 
				elem.c + elem.cs
			);
					mergedRanges.add(key);
				} catch (e) {
					console.warn(`⚠️ 跳过重复合并: 行${elem.r+1}-${elem.r+elem.rs} 列${elem.c+1}-${elem.c+elem.cs}`, e.message);
				}
			}
		});
		
		console.log('✅ 合并单元格设置完成');
	}

	// 设置边框
	function setBorder(table, worksheet) {
		console.log('🖼️ 设置边框');
		
		// 为所有单元格添加边框（已在setStyleAndValue中处理）
		// 这里可以添加额外的边框逻辑
		
		console.log('✅ 边框设置完成');
	}

	// 设置列宽
function setColumnWidth(table, worksheet) {
	console.log('📏 设置列宽');
	
	// 其他列从配置读取
	if (table.config && table.config.columnlen) {
		Object.keys(table.config.columnlen).forEach(col => {
			const colIndex = parseInt(col);
			
			const widthPx = table.config.columnlen[col];
			// ExcelJS使用字符宽度，Excel显示的列宽 ≈ 像素宽度 / 8
			const widthChar = widthPx / 8;
			worksheet.getColumn(colIndex + 1).width = Math.max(widthChar, 8);
			console.log(`  列 ${String.fromCharCode(65 + colIndex)}: ${widthPx}px → ${widthChar.toFixed(2)}字符`);
		});
	}
	
	// A列（索引0）固定宽度（最后设置，确保不被覆盖）
	worksheet.getColumn(1).width = 5;
	console.log('  ✅ A列: 固定宽度 5字符');
	
	// 🔥 修复：I列（索引8）加大列宽，方便显示"电机功率(KW)"
	const iColWidth = worksheet.getColumn(9).width || 0;
	worksheet.getColumn(9).width = Math.max(iColWidth, 12); // 至少12字符宽
	console.log('  ✅ I列: 加大列宽至至少12字符');
	
	console.log('✅ 列宽设置完成');
}

	// 设置行高
	function setRowHeight(table, worksheet) {
		console.log('📏 开始设置行高');
		
		const dataLength = table.data ? table.data.length : 0;
		
		// 只从Luckysheet配置读取自定义行高（表头等固定行）
		if (table.config && table.config.rowlen) {
			console.log('  从配置读取', Object.keys(table.config.rowlen).length, '行自定义高度');
			
			Object.keys(table.config.rowlen).forEach(row => {
				const rowIndex = parseInt(row);
				const heightPx = table.config.rowlen[row];
				// Luckysheet使用像素，ExcelJS使用点（pt）
				const heightPt = heightPx * 0.75; // 转换系数
				const finalHeight = Math.max(heightPt, 20); // 最小20pt
				worksheet.getRow(rowIndex + 1).height = finalHeight;
				console.log(`  行 ${rowIndex + 1}: ${heightPx}px → ${finalHeight.toFixed(1)}pt（配置）`);
			});
		}
		
		// 对于数据行（有E列内容的行），不设置固定行高
		// 让Excel根据wrapText自动调整行高
		console.log('  数据行将由Excel根据内容自动调整行高（wrapText已启用）');
		
		console.log('✅ 行高设置完成');
	}
	
	function createExcelBlob(sheetData, sheetConfig) {
		console.log('📊 使用增强的XLSX.js创建Excel（尽可能保留格式）');
		console.log('📊 sheetData行数:', sheetData.length);
		console.log('📊 sheetData列数:', sheetData[0] ? sheetData[0].length : 0);
		
		// 创建工作簿
		const wb = XLSX.utils.book_new();
		wb.Props = {
			Title: "设备参数选型",
			Subject: "设备参数",
			Author: "设备参数选型系统",
			CreatedDate: new Date()
		};
	
	// 从celldata构建worksheet，保留公式和格式
	const ws = {};
	const range = { s: { r: Infinity, c: Infinity }, e: { r: 0, c: 0 } };
	
	// 遍历celldata来构建worksheet
	if (sheetConfig.celldata && Array.isArray(sheetConfig.celldata)) {
		console.log('📊 从celldata构建worksheet，共', sheetConfig.celldata.length, '个单元格');
		
		sheetConfig.celldata.forEach(cell => {
			if (cell.r === undefined || cell.c === undefined) return;
			
			const cellRef = XLSX.utils.encode_cell({ r: cell.r, c: cell.c });
			const cellData = cell.v || {};
			
			// 更新范围
			if (cell.r < range.s.r) range.s.r = cell.r;
			if (cell.r > range.e.r) range.e.r = cell.r;
			if (cell.c < range.s.c) range.s.c = cell.c;
			if (cell.c > range.e.c) range.e.c = cell.c;
			
			// 提取值
			let value = '';
			if (cellData.v !== undefined && cellData.v !== null) {
				value = cellData.v;
			} else if (cellData.m !== undefined && cellData.m !== null) {
				value = cellData.m;
			}
			
			// 创建单元格对象
			const cellObj = { v: value };
			
			// 确定类型
			if (typeof value === 'number') {
				cellObj.t = 'n';
			} else if (typeof value === 'boolean') {
				cellObj.t = 'b';
			} else if (value === '') {
				cellObj.t = 's';
				cellObj.v = '';
			} else {
				cellObj.t = 's';
				cellObj.v = String(value);
			}
			
			// 保存公式
			if (cellData.f) {
				cellObj.f = cellData.f;
				console.log(`📐 单元格 ${cellRef} 包含公式: ${cellData.f}`);
			}
			
		// 添加样式：边框、居中、字体（尽可能从celldata推断）
		const style = {
			alignment: { 
				horizontal: 'center', 
				vertical: 'center',
				wrapText: false
			},
			border: {
				left: { style: 'thin', color: { rgb: '000000' } },
				right: { style: 'thin', color: { rgb: '000000' } },
				top: { style: 'thin', color: { rgb: '000000' } },
				bottom: { style: 'thin', color: { rgb: '000000' } }
			},
			font: {
				name: 'SimSun',
				sz: 10,
				color: { rgb: '000000' }
			}
		};
		
		// 读取字体与背景色（Luckysheet单元格可能包含 bl 粗体, fs 字号, ff 字体名, bg 背景）
		if (cellData) {
			if (cellData.bl === 1) style.font.bold = true;
			if (cellData.fs) style.font.sz = Number(cellData.fs);
			if (cellData.ff) style.font.name = String(cellData.ff);
			if (cellData.fc) {
				const fc = String(cellData.fc);
				if (fc.startsWith('#')) {
					style.font.color = { rgb: fc.replace('#', '') };
				}
			}
			if (cellData.bg) {
				const bg = String(cellData.bg);
				if (bg.startsWith('#')) {
					style.fill = { 
						patternType: 'solid', 
						fgColor: { rgb: bg.replace('#', '') },
						bgColor: { rgb: bg.replace('#', '') }
					};
				}
			}
			// 读取对齐方式
			if (cellData.ht !== undefined) {
				const htMap = { 0: 'center', 1: 'left', 2: 'right' };
				style.alignment.horizontal = htMap[cellData.ht] || 'center';
			}
			if (cellData.vt !== undefined) {
				const vtMap = { 0: 'center', 1: 'top', 2: 'bottom' };
				style.alignment.vertical = vtMap[cellData.vt] || 'center';
			}
		}
		cellObj.s = style;
			
			ws[cellRef] = cellObj;
		});
		
		// 设置范围
		ws['!ref'] = XLSX.utils.encode_range(range);
		console.log('✅ Worksheet构建完成，范围:', ws['!ref']);
	} else {
		// 如果没有celldata，使用sheetData
		console.log('⚠️ 没有celldata，使用sheetData构建');
		const cleanedData = [];
		for (let r = 0; r < sheetData.length; r++) {
			cleanedData[r] = [];
			for (let c = 0; c < (sheetData[r] ? sheetData[r].length : 0); c++) {
				let val = sheetData[r][c];
				if (val && typeof val === 'object' && !Array.isArray(val)) {
					if ('v' in val) val = val.v;
					else if ('m' in val) val = val.m;
					else val = '';
				}
				if (val === null || val === undefined) val = '';
				cleanedData[r][c] = val;
			}
		}
		const tempWs = XLSX.utils.aoa_to_sheet(cleanedData);
		Object.assign(ws, tempWs);
	}
		
	// 保留列宽（使用像素单位wpx，保持精确）
		if (sheetConfig.config && sheetConfig.config.columnlen) {
			const cols = [];
			Object.keys(sheetConfig.config.columnlen).forEach(col => {
				const colIndex = parseInt(col);
			const widthPx = sheetConfig.config.columnlen[col];
			// 使用wpx（像素）单位，保持原始宽度
			cols[colIndex] = { wpx: Math.max(widthPx, 20) };
			});
			ws['!cols'] = cols;
		console.log('✅ 已保存列宽配置:', cols.length, '列');
		}
		
	// 保留行高（只设置表头等固定行，数据行不设置让Excel自动调整）
		if (sheetConfig.config && sheetConfig.config.rowlen) {
			const rows = [];
			Object.keys(sheetConfig.config.rowlen).forEach(row => {
				const rowIndex = parseInt(row);
				const heightPx = sheetConfig.config.rowlen[row];
				// 只保留配置中的行高（通常是表头行）
				rows[rowIndex] = { hpx: Math.max(heightPx, 16) };
			});
			ws['!rows'] = rows;
			console.log('✅ 已保存行高配置:', rows.length, '行（仅表头等固定行）');
		}
		
		// 注意：XLSX.js社区版不支持wrapText，所以数据行可能显示不完整
		// 建议安装ExcelJS以获得完整格式支持
		
		// 保留合并单元格
		const mergeConfig = sheetConfig.config?.merge || {};
		if (Object.keys(mergeConfig).length > 0) {
			const merges = [];
			Object.values(mergeConfig).forEach(merge => {
				if (merge.rs && merge.cs) {
					merges.push({
						s: { r: merge.r, c: merge.c },
						e: { r: merge.r + merge.rs - 1, c: merge.c + merge.cs - 1 }
					});
				}
			});
			ws['!merges'] = merges;
		}
		
		// 添加工作表到工作簿
		XLSX.utils.book_append_sheet(wb, ws, "设备参数选型");
		
	console.log('📊 工作表对象样本:', ws['A1']);
	console.log('📊 工作表范围:', ws['!ref']);
	
	// 生成Excel文件（注意：标准XLSX.js不完全支持样式，需要xlsx-style）
	// 但我们尽可能设置样式属性
	const excelBuffer = XLSX.write(wb, { 
		bookType: 'xlsx', 
		type: 'array',
		cellStyles: true,
		bookSST: true,
		compression: true
	});
	
	console.log('✅ Excel生成完成，大小:', excelBuffer.byteLength, 'bytes');
	
		return new Blob([excelBuffer], { 
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
		});
	}
		
		function createNewSheet() {
			try {
			// 检查是否有数据
			const sheets = luckysheet.getAllSheets();
			if (sheets && sheets.length > 0) {
				const currentSheet = sheets[0];
				const data = currentSheet.data;
				
				// 检查是否有数据行（第6行到第15行之间是否有数据）
				let hasData = false;
				if (data && data.length > 5) {
					for (let r = 5; r < Math.min(15, data.length); r++) {
						const row = data[r];
						if (row) {
							// 检查是否有非空单元格（除了公式列）
							for (let c = 0; c < 16; c++) {
								const cell = row[c];
								if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
									hasData = true;
									break;
								}
							}
							if (hasData) break;
						}
					}
				}
				
				// 如果有数据，提示用户确认
				if (hasData) {
					const confirmed = confirm('当前表格有数据，新建将清空所有数据。\n\n确定要新建吗？');
					if (!confirmed) {
						console.log('⚠️ 用户取消新建');
						return;
					}
				}
			}
			
			console.log('🔄 开始新建表格...');
			
			// 销毁当前实例
				luckysheet.destroy();
			
				setTimeout(() => {
					// 创建表头表尾数据
					const headerData = createTableHeader();
					const celldata = [];
					
				// 转换为Luckysheet格式（与初始化使用相同的格式设置）
					headerData.forEach((row, r) => {
						row.forEach((cell, c) => {
							if (cell !== undefined && cell !== null && cell !== '') {
							let fontSize = 12; // 统一12号字体
								let fontWeight = 0; // 0=normal, 1=bold
								
						// 根据行位置设置字体大小和粗细（与初始化保持一致）
						if (r === 0 && c === 0) { // 公司名称（ABCD合并）
							fontSize = 14;
										fontWeight = 1;
						} else if (r === 0 && c === 4) { // 设备一览表（EFG合并）
							fontSize = 20;
										fontWeight = 1;
							} else if (r <= 4) { // 其他表头行
										fontSize = 12;
										fontWeight = 1;
							} else if (r >= 15) { // 表尾行 - 不加粗
								fontSize = 10; // 表尾10号字体
								fontWeight = 0; // 表尾不加粗
								}
								
								celldata.push({
									r: r,
									c: c,
									v: {
										v: cell,
										m: cell.toString(),
										ct: {fa: "General", t: "g"},
										bg: null,
										bl: fontWeight,
										it: 0,
										ff: "SimSun", // 宋体
										fs: fontSize,
										fc: "rgb(51, 51, 51)",
									ht: (c === 4 && r > 4 && r < 15) ? 1 : 0, // 只有数据区域E列左对齐，其他都居中
									vt: 0, // 垂直居中 (0=居中, 1=顶部对齐, 2=底部对齐)
									tb: 2, // 文本换行 (0=不换行, 1=溢出, 2=自动换行)
									tr: 0  // 文本旋转角度
									}
								});
							}
						});
					});
					
				// ========== 生成简化版数据 ==========
				const simplifiedHeaderData = createSimplifiedTableHeader();
				const simplifiedCelldata = [];
				simplifiedHeaderData.forEach((row, r) => {
					row.forEach((cell, c) => {
						if (cell !== undefined && cell !== null && cell !== '') {
							let fontSize = 12, fontWeight = 0;
							if (r === 0 && c === 0) { fontSize = 14; fontWeight = 1; }
							else if (r === 0 && c === 3) { fontSize = 20; fontWeight = 1; }
							else if (r <= 4) { fontSize = 12; fontWeight = 1; }
							else if (r >= 15) { fontSize = 10; fontWeight = 0; }
							simplifiedCelldata.push({
								r: r, c: c,
								v: { v: cell, m: cell.toString(), ct: {fa: "General", t: "g"},
									bg: null, bl: fontWeight, it: 0, ff: "SimSun", fs: fontSize,
									fc: "rgb(51, 51, 51)", ht: (c === 3 && r > 4 && r < 15) ? 1 : 0,
									vt: 0, tb: 2, tr: 0 }
							});
						}
					});
				});

				// 简化版合并配置
				const simplifiedMergeConfig = {
					"0_0": {r: 0, c: 0, rs: 3, cs: 3}, "0_3": {r: 0, c: 3, rs: 3, cs: 3},
					"0_6": {r: 0, c: 6, rs: 1, cs: 2}, "1_6": {r: 1, c: 6, rs: 1, cs: 2}, "2_6": {r: 2, c: 6, rs: 1, cs: 2},
					"0_8": {r: 0, c: 8, rs: 1, cs: 3}, "1_8": {r: 1, c: 8, rs: 1, cs: 3}, "2_8": {r: 2, c: 8, rs: 1, cs: 3},
					// L列独立，M/N列不合并
					"3_0": {r: 3, c: 0, rs: 2, cs: 1}, "3_1": {r: 3, c: 1, rs: 2, cs: 1}, "3_2": {r: 3, c: 2, rs: 2, cs: 1},
					"3_3": {r: 3, c: 3, rs: 2, cs: 1}, "3_4": {r: 3, c: 4, rs: 2, cs: 1}, "3_5": {r: 3, c: 5, rs: 2, cs: 1},
					"3_6": {r: 3, c: 6, rs: 1, cs: 2}, "3_8": {r: 3, c: 8, rs: 1, cs: 2}, "3_10": {r: 3, c: 10, rs: 1, cs: 2},
					"3_12": {r: 3, c: 12, rs: 1, cs: 2}, "3_13": {r: 3, c: 13, rs: 2, cs: 1},
					"19_0": {r: 19, c: 0, rs: 1, cs: 3}
				};

				// 完整版合并配置
                const mergeConfig = {
                    "0_0": {r: 0, c: 0, rs: 3, cs: 4}, "0_4": {r: 0, c: 4, rs: 3, cs: 3},
                    "0_7": {r: 0, c: 7, rs: 1, cs: 2}, "1_7": {r: 1, c: 7, rs: 1, cs: 2}, "2_7": {r: 2, c: 7, rs: 1, cs: 2},
                    "0_9": {r: 0, c: 9, rs: 1, cs: 4}, "1_9": {r: 1, c: 9, rs: 1, cs: 4}, "2_9": {r: 2, c: 9, rs: 1, cs: 4},
					"0_14": {r: 0, c: 14, rs: 1, cs: 2}, "1_14": {r: 1, c: 14, rs: 1, cs: 2}, "2_14": {r: 2, c: 14, rs: 1, cs: 2},
					"3_0": {r: 3, c: 0, rs: 2, cs: 1}, "3_1": {r: 3, c: 1, rs: 2, cs: 1}, "3_2": {r: 3, c: 2, rs: 2, cs: 1},
					"3_3": {r: 3, c: 3, rs: 2, cs: 1}, "3_4": {r: 3, c: 4, rs: 2, cs: 1}, "3_5": {r: 3, c: 5, rs: 2, cs: 1},
					"3_6": {r: 3, c: 6, rs: 2, cs: 1}, "3_7": {r: 3, c: 7, rs: 2, cs: 1}, "3_8": {r: 3, c: 8, rs: 1, cs: 2},
					"3_10": {r: 3, c: 10, rs: 2, cs: 1}, "3_11": {r: 3, c: 11, rs: 1, cs: 2}, "3_13": {r: 3, c: 13, rs: 1, cs: 2},
					"3_15": {r: 3, c: 15, rs: 2, cs: 1}, "19_0": {r: 19, c: 0, rs: 1, cs: 3}
				};

					const options = {
						container: 'luckysheet',
						lang: 'zh',
					title: '设备参数选型系统',
						showinfobar: false,
					showtoolbar: true,
					showtoolbarConfig: {
						undoRedo: false,
						paintFormat: true,
						currencyFormat: false,
						percentageFormat: false,
						numberDecrease: false,
						numberIncrease: false,
						moreFormats: true,
						font: true,
						fontSize: true,
						bold: true,
						italic: true,
						strikethrough: true,
						underline: true,
						textColor: true,
						fillColor: true,
						border: true,
						mergeCell: true,
						horizontalAlignMode: true,
						verticalAlignMode: true,
						textWrapMode: true,
						textRotateMode: true,
						image: true,
						link: true,
						chart: true,
						postil: false,
						pivotTable: false,
						function: true,
						frozenMode: true,
						sortAndFilter: true,
						conditionalFormat: true,
						dataVerification: true,
						splitColumn: false,
						screenshot: false,
						findAndReplace: true,
						protection: true,
						print: true
					},
						data: [
							// 第一个sheet：简化版 - 默认显示
							{
								"name": "设备参数选型（简化版）",
								"color": "#70ad47",
								"config": {
									"merge": simplifiedMergeConfig,
									"borderInfo": [...getSimplifiedBorderConfig(15), ...getSimplifiedDataBorderConfig(5, 15)],
									"rowlen": {
										'0': 35, '1': 35, '2': 35, '3': 28, '4': 28,
										'15': 28, '16': 28, '17': 28, '18': 28, '19': 28
									},
									"columnlen": {
										'0': 35, '1': 115, '2': 80, '3': 200, '4': 50,
										'5': 50, '6': 40, '7': 40, '8': 60, '9': 60,
										'10': 60, '11': 60, '12': 60, '13': 60
									},
									"rowhidden": {},
									"colhidden": {}
								},
								"index": "0",
								"zoomRatio": 1,
								"order": 0,
								"status": 1,
								"row": 84,
								"column": 60,
								"celldata": simplifiedCelldata
							},
							// 第二个sheet：完整版
							{
								"name": "设备参数选型（完整版）",
								"color": "#5b9bd5",
							"config": {
							"merge": mergeConfig,
							"borderInfo": [...getBorderConfig(15), ...getDataBorderConfig(5, 15)],
						"rowlen": {
								'0': 35, '1': 35, '2': 35, '3': 28, '4': 28,
								'15': 28, '16': 28, '17': 28, '18': 28, '19': 28
						},
						"columnlen": {
								'0': 50, '1': 40, '2': 140, '3': 80, '4': 200,
								'5': 80, '6': 50, '7': 50, '8': 40, '9': 40,
								'10': 70, '11': 60, '12': 60, '13': 60, '14': 60, '15': 80
								},
								"rowhidden": {},
								"colhidden": {}
					},
								"index": "1",
						"zoomRatio": 1,
								"order": 1,
								"status": 0,
							"row": 84,
							"column": 60,
							"celldata": celldata
							}
						]
					};
				
					luckysheet.create(options);
				
				// 设置全局版本变量（默认激活简化版，因为status=1）
			window.currentSheetVersion = {
				isSimplified: true,
				version: '简化版',
				expectedColumns: 14
			};
			// 🔥 修复：初始化表尾起始行（简化版和完整版都是第15行，索引14）
			window.currentFooterStartRow = 14;
			console.log('✅ 新建表格，默认激活简化版，版本信息已保存到全局变量');
			console.log('   🔍 验证版本信息:', window.currentSheetVersion);
			console.log('   📍 表尾起始行:', window.currentFooterStartRow + 1, '(安装费所在行)');
			
			// 延迟再次确认版本信息（防止被覆盖）
			setTimeout(() => {
				if (!window.currentSheetVersion || !window.currentSheetVersion.isSimplified) {
					console.warn('⚠️ 版本信息被覆盖，重新设置！');
					window.currentSheetVersion = {
						isSimplified: true,
						version: '简化版',
						expectedColumns: 14
					};
					console.log('   ✅ 已重新设置版本信息:', window.currentSheetVersion);
				} else {
					console.log('   ✅ 版本信息保持正确:', window.currentSheetVersion);
				}
			}, 200);
				
					// 强制写入表头文字（防止缺失）
					setTimeout(() => {
						try {
							const s = luckysheet.getSheet();
							if (s && s.data) {
							// 公司名称 A1:D3 起点 A1（换行显示，16号字体）
							luckysheet.setCellValue(0, 0, {
								v: '温岭市泽国化工机械\n有限公司',
								m: '温岭市泽国化工机械\n有限公司',
								fs: 16,
								ff: 'SimSun',
								tb: 2,  // 换行显示 (数字类型)
								ht: 0,  // 居中对齐
								vt: 0   // 垂直居中
							});
								// 设备一览表 E1:G3 起点 E1
								luckysheet.setCellValue(0, 4, '设备一览表');
								// 项目名称/子项名称/项目编号 H1/H2/H3
								luckysheet.setCellValue(0, 7, '项目名称');
								luckysheet.setCellValue(1, 7, '子项名称');
								luckysheet.setCellValue(2, 7, '项目编号');
							}
							luckysheet.refresh();
						} catch(e) { console.warn('写入表头文字失败', e); }
					}, 100);
					console.log('✅ 新建表格完成');
					
					// 初始化公式
						setTimeout(() => {
						if (typeof window.addFormulasToAllRows === 'function') {
							window.addFormulasToAllRows();
						}
						// 更新设备列表
							if (window.updateDeviceListFromTable) {
								window.updateDeviceListFromTable();
							}
						}, 500);
				
				}, 100);
			
			} catch (error) {
				console.error('❌ 新建表格失败:', error);
				alert('新建表格失败，请刷新页面重试。');
			}
		}
		
		// 数据库处理函数
		function handleDatabaseFileSelect(event) {
			const file = event.target.files[0];
			if (!file) return;
			
			console.log('正在加载数据库文件:', file.name);
			loadDatabaseFile(file);
		}
		
		function loadDatabaseFile(file) {
			// 检查 XLSX 是否加载
			if (typeof XLSX === 'undefined') {
				alert('❌ XLSX 库正在加载中，请稍等几秒后重试');
				console.error('❌ XLSX 库未加载，无法处理 Excel 文件');
				return;
			}
			
			const reader = new FileReader();
			reader.onload = function(e) {
				try {
					if (file.name.endsWith('.json')) {
						const data = JSON.parse(e.target.result);
						processDatabase(data);
					} else {
					// ✅ Excel文件：工作表名称作为设备类型
					// 使用ExcelJS读取，保持与左侧表格读取位置一致
						const workbook = XLSX.read(e.target.result, {type: 'binary'});
					console.log('📚 Excel工作表列表:', workbook.SheetNames);
					
					deviceDatabase = {};
					
			// 遍历所有工作表，工作表名称作为设备类型
			workbook.SheetNames.forEach(sheetName => {
				console.log(`🔄 处理工作表: ${sheetName}`);
						const worksheet = workbook.Sheets[sheetName];
				
				// ✅ 检查工作表是否存在且有数据
				if (!worksheet) {
					console.log(`⚠️ 工作表 ${sheetName} 不存在，跳过`);
					return;
				}
				
				if (!worksheet['!ref'] || worksheet['!ref'] === undefined) {
					console.log(`⚠️ 工作表 ${sheetName} 无数据或!ref为空，跳过`);
					return;
				}
				
				// ✅ 按照单元格位置读取（与左侧表格一致）
				// 从第6行（索引5）开始读取数据，直到遇到空行
				let range;
				try {
					range = XLSX.utils.decode_range(worksheet['!ref']);
				} catch (e) {
					console.error(`⚠️ 工作表 ${sheetName} 解析范围失败:`, e.message, 'ref值:', worksheet['!ref']);
					return;
				}
				
				const startRow = 5; // 第6行（数据起始行）
				const endRow = range.e.r; // 最后一行
						
						// 工作表名称作为设备类型
						const deviceType = sheetName;
						if (!deviceDatabase[deviceType]) {
							deviceDatabase[deviceType] = {};
						}
						
						let deviceCount = 0;
						
						// 遍历每一行，按列位置读取
						for (let r = startRow; r <= endRow; r++) {
							// C列：设备名称（索引2）
							const nameCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 2 })];
							const name = nameCell ? String(nameCell.v || '').trim() : '';
							
							// D列：规格型号（索引3）
							const specCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 3 })];
							const spec = specCell ? String(specCell.v || '').trim() : '';
							
							// 如果设备名称或规格型号为空，跳过此行
							if (!name || !spec || name === '/' || spec === '/') continue;
							
							// 如果遇到"安装费"等关键字，停止读取
							if (name.includes('安装费') || name.includes('合计')) break;
							
							// F列：材质（索引5）
							const materialCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 5 })];
							const material = materialCell ? String(materialCell.v || '').trim() : '';
							
							// G列：单位（索引6）
							const unitCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 6 })];
							const unit = unitCell ? String(unitCell.v || '').trim() : '';
							
						// I列：单台电机数量（索引8）
						const motorQuantityCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 8 })];
						const motorQuantity = motorQuantityCell ? (parseFloat(motorQuantityCell.v) || 0) : 0;
						
						// K列：电机功率（索引10）
						const motorPowerCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 10 })];
						const motorPower = motorPowerCell ? String(motorPowerCell.v || '').trim() : '';
						
						// N列：单价（索引13）
						const unitPriceCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 13 })];
						const unitPrice = unitPriceCell ? parseFloat(unitPriceCell.v) || 0 : 0;
						
						// E列：技术参数（索引4）
						const techParamsCell = worksheet[XLSX.utils.encode_cell({ r: r, c: 4 })];
						const technicalParams = techParamsCell ? String(techParamsCell.v || '').trim() : '';
					
					// 🔍 调试日志：打印每个设备的motorQuantity
					if (deviceCount < 3) { // 只打印前3个设备，避免日志过多
						console.log(`🔍 设备${deviceCount + 1}: ${name} - ${spec}`, {
							I列单元格: motorQuantityCell,
							I列原始值: motorQuantityCell ? motorQuantityCell.v : 'undefined',
							解析后motorQuantity: motorQuantity,
							K列motorPower: motorPower,
							N列unitPrice: unitPrice
						});
					}
						
						// 构建设备数据库结构
						if (!deviceDatabase[deviceType][name]) {
							deviceDatabase[deviceType][name] = {};
						}
						
						deviceDatabase[deviceType][name][spec] = {
							material: material,
							unit: unit,
							unitPrice: unitPrice,
							motorPower: motorPower,
							motorQuantity: motorQuantity,
							technicalParams: technicalParams
						};
							
							deviceCount++;
						}
						
						console.log(`✅ 工作表 ${sheetName} 处理完成，设备数量: ${deviceCount}`);
					});
					}
					
					console.log('最终数据库结构:', deviceDatabase);
					
					// 刷新下拉框选项
					refreshDeviceOptions();
					
					// 更新状态
					document.getElementById('dbFileStatus').textContent = file.name;
					
					// 保存到localStorage
					localStorage.setItem('deviceDatabase', JSON.stringify(deviceDatabase));
					localStorage.setItem('dbFileName', file.name);
					
					console.log('✅ 数据库加载成功:', file.name);
					alert('数据库加载成功！');
					
					// 数据库加载后，尝试从表格读取设备列表
					setTimeout(() => {
						if (typeof updateDeviceListFromTable === 'function') {
							updateDeviceListFromTable();
							console.log('✅ 已从表格更新设备列表');
						}
					}, 300);
					
				} catch (error) {
					console.error('❌ 数据库加载失败:', error);
					alert('数据库加载失败: ' + error.message);
				}
			};
			
			if (file.name.endsWith('.json')) {
				reader.readAsText(file);
			} else {
				reader.readAsBinaryString(file);
			}
		}
		
		function processDatabase(data) {
			deviceDatabase = {};
			
			data.forEach(row => {
				const type = row['设备类型'] || row['deviceType'];
				const name = row['设备名称'] || row['deviceName'];
				const spec = row['规格型号'] || row['specification'];
				
				if (!type || !name || !spec) return;
				
				if (!deviceDatabase[type]) {
					deviceDatabase[type] = {};
				}
				if (!deviceDatabase[type][name]) {
					deviceDatabase[type][name] = {};
				}
				
				deviceDatabase[type][name][spec] = {
					material: row['材料'] || row['material'] || '',
					unit: row['单位'] || row['unit'] || '',
					unitPrice: parseFloat(row['单价'] || row['unitPrice']) || 0,
				motorPower: row['电机功率'] || row['motorPower'] || '',
				motorQuantity: parseFloat(row['单台电机数量'] || row['motorQuantity']) || 0,
					technicalParams: row['技术参数'] || row['technicalParams'] || ''
				};
			});
			
			refreshDeviceOptions();
		}
		
		function refreshDeviceOptions() {
			const deviceTypeSelect = document.getElementById('deviceType');
			if (!deviceTypeSelect) {
				console.warn('设备类型下拉框不存在');
				return;
			}
			
			// 清空现有选项
			deviceTypeSelect.innerHTML = '<option value="">请选择设备类型</option>';
			
			console.log('🔄 刷新设备类型选项，数据库结构:', deviceDatabase);
			
			if (!deviceDatabase || Object.keys(deviceDatabase).length === 0) {
				console.log('❌ 设备数据库为空');
				return;
			}
			
			// 添加所有设备类型（工作表名称）
			Object.keys(deviceDatabase).forEach(type => {
				const option = document.createElement('option');
				option.value = type;
				option.textContent = type;
				deviceTypeSelect.appendChild(option);
				console.log(`✅ 添加设备类型: ${type}`);
			});
			
			console.log(`✅ 设备类型选项刷新完成，共 ${Object.keys(deviceDatabase).length} 个类型`);
		}
		
		function populateDeviceNames(deviceType) {
			const deviceNameSelect = document.getElementById('deviceName');
			if (!deviceNameSelect) {
				console.warn('设备名称下拉框不存在');
				return;
			}
			
			// 清空现有选项
			deviceNameSelect.innerHTML = '<option value="">请选择设备名称</option>';
			
			console.log(`🔄 填充设备名称选项，设备类型: ${deviceType}`);
			
			if (!deviceType || !deviceDatabase[deviceType]) {
				console.log(`❌ 设备类型 "${deviceType}" 不存在或数据为空`);
				return;
			}
			
			console.log(`设备类型 "${deviceType}" 的设备列表:`, Object.keys(deviceDatabase[deviceType]));
			
			// 添加该类型下的所有设备名称（已自动去重）
				Object.keys(deviceDatabase[deviceType]).forEach(name => {
					const option = document.createElement('option');
					option.value = name;
					option.textContent = name;
					deviceNameSelect.appendChild(option);
				console.log(`✅ 添加设备名称: ${name}`);
				});
			
			console.log(`✅ 设备名称选项填充完成，共 ${Object.keys(deviceDatabase[deviceType]).length} 个设备`);
		}
		
		function populateSpecifications(deviceType, deviceName) {
			const specificationSelect = document.getElementById('specification');
			if (!specificationSelect) {
				console.warn('规格型号下拉框不存在');
				return;
			}
			
			// 清空现有选项
			specificationSelect.innerHTML = '<option value="">请选择规格型号</option>';
			
			console.log(`🔄 填充规格型号选项，设备类型: ${deviceType}, 设备名称: ${deviceName}`);
			
			if (!deviceType || !deviceName || !deviceDatabase[deviceType] || !deviceDatabase[deviceType][deviceName]) {
				console.log(`❌ 规格型号数据不存在: ${deviceType} -> ${deviceName}`);
				return;
			}
			
			console.log(`设备 "${deviceName}" 的规格型号列表:`, Object.keys(deviceDatabase[deviceType][deviceName]));
			
			// 添加该设备的所有规格型号
				Object.keys(deviceDatabase[deviceType][deviceName]).forEach(spec => {
					const option = document.createElement('option');
					option.value = spec;
					option.textContent = spec;
					specificationSelect.appendChild(option);
				console.log(`✅ 添加规格型号: ${spec}`);
				});
			
			console.log(`✅ 规格型号选项填充完成，共 ${Object.keys(deviceDatabase[deviceType][deviceName]).length} 个规格`);
		}
		
		function clearSpecifications() {
			document.getElementById('specification').innerHTML = '<option value="">请选择规格型号</option>';
		}
		
		function clearRelatedFields() {
			document.getElementById('material').value = '';
			document.getElementById('unit').value = '';
			document.getElementById('unitPrice').value = '';
			document.getElementById('motorPower').value = '';
		}
		
		function fillRelatedFields(deviceType, deviceName, specification) {
		console.log('🔍 填充相关字段:', { deviceType, deviceName, specification });
		
			if (deviceType && deviceName && specification && 
				deviceDatabase[deviceType] && 
				deviceDatabase[deviceType][deviceName] && 
				deviceDatabase[deviceType][deviceName][specification]) {
				
				const data = deviceDatabase[deviceType][deviceName][specification];
			console.log('📋 找到设备数据:', data);
		console.log('🔍 详细检查 motorQuantity:', {
			value: data.motorQuantity,
			type: typeof data.motorQuantity,
			isUndefined: data.motorQuantity === undefined,
			isNull: data.motorQuantity === null,
			is0: data.motorQuantity === 0
		});
			
			// ✅ 设置标志，防止自动写回表格
			window.isLoadingFromDatabase = true;
			
		// 填充表单字段
		const materialEl = document.getElementById('material');
		const unitEl = document.getElementById('unit');
		const unitPriceEl = document.getElementById('unitPrice');
		const motorPowerEl = document.getElementById('motorPower');
		const motorQuantityEl = document.getElementById('motorQuantity');
		const quantityEl = document.getElementById('quantity');
		const technicalParamsEl = document.getElementById('technicalParams');
	
	console.log('🔍 检查元素是否存在:', {
		materialEl: !!materialEl,
		unitEl: !!unitEl,
		unitPriceEl: !!unitPriceEl,
		motorPowerEl: !!motorPowerEl,
		motorQuantityEl: !!motorQuantityEl,
		quantityEl: !!quantityEl,
		technicalParamsEl: !!technicalParamsEl
	});
		
		if (materialEl) {
			materialEl.value = data.material || '';
			console.log('✅ 材料:', data.material);
		}
		if (unitEl) {
			unitEl.value = data.unit || '';
			console.log('✅ 单位:', data.unit);
		}
		if (unitPriceEl) {
			unitPriceEl.value = data.unitPrice || '';
			console.log('✅ 单价:', data.unitPrice);
		}
		if (motorPowerEl) {
			motorPowerEl.value = data.motorPower || '';
			console.log('✅ 电机功率:', data.motorPower);
		}
		if (motorQuantityEl) {
	const finalValue = (data.motorQuantity !== undefined && data.motorQuantity !== null) ? data.motorQuantity : '';
	console.log('🔍 准备设置单台电机数量:', { finalValue, type: typeof finalValue });
	motorQuantityEl.value = finalValue;
	console.log('✅ 单台电机数量已设置:', motorQuantityEl.value);
} else {
	console.error('❌ motorQuantityEl 元素不存在！');
		}
		if (quantityEl && !quantityEl.value) {
			quantityEl.value = '1';
			console.log('✅ 设备数量默认为: 1');
		}
		if (technicalParamsEl) {
			technicalParamsEl.value = data.technicalParams || '';
			console.log('✅ 技术参数:', data.technicalParams);
		}
			
			console.log('✅ 相关字段填充完成');
		
		// ✅ 触发实时计算，更新单台设备功率和总功率
		setTimeout(() => {
			const motorQuantity = parseFloat(motorQuantityEl?.value) || 0;
			const motorPowerStr = motorPowerEl?.value || '0';
			const quantity = parseFloat(quantityEl?.value) || 0;
			const unitPrice = parseFloat(unitPriceEl?.value) || 0;
			
		// 计算电机功率（处理表达式）
		let motorPower = 0;
		const isMultiMotorType = motorPowerStr.includes('+');
		if (isMultiMotorType) {
			motorPower = motorPowerStr.split('+').reduce((sum, val) => sum + (parseFloat(val.trim()) || 0), 0);
		} else if (motorPowerStr.includes('×') || motorPowerStr.includes('*')) {
			const parts = motorPowerStr.split(/[×*]/);
			motorPower = parts.reduce((product, val) => product * (parseFloat(val.trim()) || 1), 1);
		} else {
			motorPower = parseFloat(motorPowerStr) || 0;
		}
		
		// 单台设备功率计算
		let singleDevicePower = 0;
		if (isMultiMotorType) {
			// ✅ "11+44" 类型：单台设备功率 = 电机功率的和（不乘以单台电机数量）
			singleDevicePower = motorPower;
		} else {
			// 普通类型：单台设备功率 = 电机功率 × 单台电机数量
			singleDevicePower = motorPower * motorQuantity;
		}
			const singleDevicePowerEl = document.getElementById('singleDevicePower');
			if (singleDevicePowerEl) {
				singleDevicePowerEl.value = singleDevicePower.toFixed(2);
			}
			
			// 总功率 = L × H
			const totalPower = singleDevicePower * quantity;
			const totalPowerEl = document.getElementById('totalPower');
			if (totalPowerEl) {
				totalPowerEl.value = totalPower.toFixed(2);
			}
			
			// 总价 = N × H
			const totalPrice = unitPrice * quantity;
			const totalPriceEl = document.getElementById('totalPrice');
			if (totalPriceEl) {
				totalPriceEl.value = totalPrice.toFixed(2);
			}
			
			console.log(`🔄 选型后自动计算: 电机功率原值="${motorPowerStr}", 计算值=${motorPower.toFixed(2)}, 多电机类型=${isMultiMotorType}, 单台电机数量=${motorQuantity}, 单台设备功率=${singleDevicePower.toFixed(2)} ${isMultiMotorType ? '(多电机类型，直接使用电机功率和)' : `(${motorPower.toFixed(2)} × ${motorQuantity})`}, 数量=${quantity}, 总功率=${totalPower.toFixed(2)}, 单价=${unitPrice.toFixed(2)}, 总价=${totalPrice.toFixed(2)}`);
		}, 50);
			
			// ✅ 延迟清除标志，确保所有change事件都被忽略
			setTimeout(() => {
				window.isLoadingFromDatabase = false;
			}, 100);
		} else {
			console.warn('❌ 未找到设备数据或数据不完整');
			}
		}
		
		function restoreDatabase() {
			try {
				const savedDatabase = localStorage.getItem('deviceDatabase');
				const savedFileName = localStorage.getItem('dbFileName');
				
				if (savedDatabase && savedDatabase !== 'null' && savedDatabase !== 'undefined') {
					deviceDatabase = JSON.parse(savedDatabase);
					refreshDeviceOptions();
					
					if (savedFileName) {
						document.getElementById('dbFileStatus').textContent = savedFileName;
					}
					
					console.log('✅ 数据库已从缓存恢复');
				}
			} catch (error) {
				console.error('❌ 数据库恢复失败:', error);
				localStorage.removeItem('deviceDatabase');
				localStorage.removeItem('dbFileName');
			}
		}
		
		// 添加设备到表格
		function addDeviceToSheet(deviceData) {
		console.log('📝 添加设备到表格:', deviceData);
		
		try {
// ✅ 确保版本信息正确
console.log(`📍 addDeviceToSheet开始 - 调用ensureCorrectVersion前`);
console.log(`   window.ensureCorrectVersion存在吗？`, typeof window.ensureCorrectVersion);
try {
	if (window.ensureCorrectVersion) {
		console.log(`   准备调用ensureCorrectVersion...`);
		const updated = window.ensureCorrectVersion();
		console.log(`   ensureCorrectVersion返回: ${updated ? '已更新' : '未变化'}`);
	} else {
		console.warn(`   ⚠️ window.ensureCorrectVersion不存在`);
	}
} catch (e) {
	console.error(`   ❌ ensureCorrectVersion调用失败:`, e);
}

	// ✅ 检测当前工作表类型
	const currentSheet = luckysheet.getSheet();
console.log(`   currentSheet.name: "${currentSheet?.name}"`);
console.log(`   window.currentSheetVersion:`, window.currentSheetVersion);
const isSimplified = window.currentSheetVersion ? window.currentSheetVersion.isSimplified : false;
	console.log(`📊 当前工作表: ${currentSheet ? currentSheet.name : '未知'}，${isSimplified ? '简化版' : '完整版'}`);
		
		// ✅ 验证必填字段：设备名称和规格型号
		const deviceName = deviceData.deviceName || '';
		const specification = deviceData.specification || '';
		
		if (!deviceName || !deviceName.trim() || deviceName.trim() === '') {
			alert('⚠️ 请先选择设备名称！');
			console.warn('❌ 添加失败：未选择设备名称');
				return;
			}
			
		if (!specification || !specification.trim() || specification.trim() === '') {
			alert('⚠️ 请先选择规格型号！');
			console.warn('❌ 添加失败：未选择规格型号');
			return;
		}
		
		console.log(`✅ 必填字段验证通过: 设备名称="${deviceName}", 规格型号="${specification}"`);
			
			// 查找数据区域和表尾位置
			const sheetData = luckysheet.getSheetData();
			let dataStartRow = 5; // 数据起始行（第6行）
			let footerStartRow = -1;
			
			// 查找"安装费"行，确定表尾位置
			for (let r = 5; r < sheetData.length; r++) {
				const cell = sheetData[r] && sheetData[r][2];
				const val = (cell && typeof cell === 'object' && 'v' in cell) ? cell.v : cell;
				if (String(val).includes('安装费')) {
					footerStartRow = r;
					break;
				}
			}
			
			if (footerStartRow === -1) {
				footerStartRow = sheetData.length - 5; // 默认位置
			}
			
			console.log('📊 数据区域: 第' + (dataStartRow + 1) + '行 到 第' + footerStartRow + '行');
			
			// 确定插入位置
			let insertRow;
			let selectedRow = null;
			
            // 尝试获取当前选中的单元格（兼容无选区场景）
            const sheetObj = luckysheet.getSheet && luckysheet.getSheet();
            const selection = sheetObj && sheetObj.luckysheet_select_save ? sheetObj.luckysheet_select_save : [];
            if (selection && selection.length > 0 && selection[0].row && selection[0].row[0] !== undefined) {
				selectedRow = selection[0].row[0]; // 选中区域的起始行
				console.log('📍 当前选中行:', selectedRow + 1);
				
				// 在选中行的下方插入
				insertRow = selectedRow + 1;
			
			// 确保插入位置在数据区域内
			if (insertRow < dataStartRow) {
				insertRow = dataStartRow;
			}
				if (insertRow > footerStartRow) {
					insertRow = footerStartRow;
				}
				
				console.log('➕ 插入位置: 在第' + (selectedRow + 1) + '行的下方（新行将是第' + (insertRow + 1) + '行）');
			} else {
				// 没有选中，查找最后一个有数据的行
				let lastDataRow = dataStartRow - 1;
				for (let r = dataStartRow; r < footerStartRow; r++) {
					const row = sheetData[r];
					if (row) {
						// 检查C列（设备名称）是否有数据
						const nameCell = row[2];
						const hasData = nameCell && ((typeof nameCell === 'object' && nameCell.v) || (typeof nameCell !== 'object' && nameCell));
						if (hasData) {
							lastDataRow = r;
						}
					}
				}
				
				// 在最后一个有数据的行下方插入
				insertRow = lastDataRow + 1;
				
				// 确保不超过表尾
			if (insertRow >= footerStartRow) {
					insertRow = footerStartRow;
			}
			
				console.log('📍 未选中单元格，在最后一个有数据的行（第' + (lastDataRow + 1) + '行）下方插入');
			console.log('➕ 插入位置: 第' + (insertRow + 1) + '行');
			}
			
        // 在指定位置插入一行前，先显式选中该行，避免API内部读取 row[1] 报错
            try {
                luckysheet.setRangeShow({ row: [insertRow, insertRow], column: [0, 15] });
            } catch (e) { console.warn('⚠️ 选区设置失败(可忽略):', e.message); }
            // 在指定位置插入一行（插入后新行的索引就是insertRow）
            try {
                luckysheet.insertRow(insertRow, 1);
            } catch (e) {
                console.warn('⚠️ insertRow(insertRow,1) 失败，回退到单参:', e.message);
			luckysheet.insertRow(insertRow);
            }
			console.log('✅ 已插入新行');
			
			// 等待插入完成后填充数据
			setTimeout(() => {
				console.log('🔄 开始填充设备数据...');
				
			// ✅ 根据工作表类型决定列映射
			if (isSimplified) {
				// ===================== 简化版列映射 =====================
				// 跳过B列（设备位号）
				
				// B列：设备名称（宋体，居中）
				luckysheet.setCellValue(insertRow, 1, {
					v: deviceData.deviceName || '',
					m: deviceData.deviceName || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// C列：规格型号（宋体，居中）
				luckysheet.setCellValue(insertRow, 2, {
					v: deviceData.specification || '',
					m: deviceData.specification || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// D列：技术参数（宋体，自动换行，左对齐）
				const technicalParams = deviceData.technicalParams || '';
				luckysheet.setCellValue(insertRow, 3, {
					v: technicalParams,
					m: technicalParams,
					ct: { fa: "General", t: "g" },
					tb: "2", // 自动换行
					ff: "SimSun",
					fs: 10,
					ht: 1, // 左对齐
					vt: 0  // 垂直居中
				});
				
				// 跳过F列（材料）
				
				// E列：单位（宋体，居中）
				luckysheet.setCellValue(insertRow, 4, {
					v: deviceData.unit || '',
					m: deviceData.unit || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// F列：数量（宋体，居中）
				const quantity = deviceData.quantity === '/' || deviceData.quantity === '' || deviceData.quantity == null ? 0 : (parseFloat(deviceData.quantity) || 0);
				luckysheet.setCellValue(insertRow, 5, {
					v: quantity,
					m: String(quantity),
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// G列：单台电机数量（宋体，居中）
				const iQty = deviceData.motorQuantity === '/' || deviceData.motorQuantity === '' || deviceData.motorQuantity == null ? 0 : (parseFloat(deviceData.motorQuantity) || 0);
				luckysheet.setCellValue(insertRow, 6, {
					v: Math.round(iQty),
					m: String(Math.round(iQty)),
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// H列：总电机数量（计算值）
				const hInitialValue = Math.round(iQty * quantity);
				luckysheet.setCellValue(insertRow, 7, { 
					v: hInitialValue || '',
					m: hInitialValue ? String(hInitialValue) : '',
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// I列：电机功率（宋体，保持原始格式，可能是表达式）
				const motorPowerRaw = (deviceData.motorPower === '/' || deviceData.motorPower == null) ? '' : (deviceData.motorPower || '');
				luckysheet.setCellValue(insertRow, 8, {
					v: motorPowerRaw,
					m: motorPowerRaw,
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// 🔥 J列：单台设备功率（I列是表达式→直接显示结果，I列是数字→I×G）
				const iVal = String(motorPowerRaw || '').trim();
				let jValue = '';
				
				if (iVal && /[\+\-\*\/]/.test(iVal) && !/^[\-]?\d+(\.\d+)?$/.test(iVal)) {
					// 情况1：I是表达式（如"11+22"），J直接显示计算结果
					try {
						jValue = eval(iVal);
					} catch (e) {
						jValue = '';
					}
					console.log(`✅ 简化版J列：I列是表达式"${iVal}"，J列显示计算结果 ${jValue}`);
				} else if (iVal && iVal !== '/') {
					// 情况2：I是数字（如"11"），J = I × G（G列：单台电机数量）
					const iNum = parseFloat(iVal) || 0;
					jValue = iNum * iQty; // 使用iQty（G列值）
					console.log(`✅ 简化版J列：I列是数字"${iVal}"，J = I × G = ${iNum} × ${iQty} = ${jValue}`);
				}
				
				luckysheet.setCellValue(insertRow, 9, {
					v: jValue || '',
					m: jValue ? String(jValue) : '',
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// 🔥 K列：总设备功率 = J × F（直接计算值）
				const kValue = jValue ? (parseFloat(jValue) * quantity) : '';
				luckysheet.setCellValue(insertRow, 10, {
					v: kValue || '',
					m: kValue ? String(kValue) : '',
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				console.log(`✅ 简化版K列：K = J × F = ${jValue} × ${quantity} = ${kValue}`);
				
				// L列：设备单价（宋体，居中）
				const unitPrice = parseFloat(deviceData.unitPrice) || 0;
				luckysheet.setCellValue(insertRow, 11, {
					v: unitPrice,
					m: String(unitPrice),
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// M列：设备总价（直接计算值）
				const mInitialValue = unitPrice * quantity;
				luckysheet.setCellValue(insertRow, 12, {
					v: mInitialValue || '',
					m: mInitialValue ? mInitialValue.toFixed(2) : '',
					ct: { fa: "0.00", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// N列：备注（宋体）
				luckysheet.setCellValue(insertRow, 13, {
					v: deviceData.remarks || '',
					m: deviceData.remarks || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10
				});
				
			} else {
				// ===================== 完整版列映射（原有逻辑） =====================
				
				// B列：设备编号（宋体，居中）
				luckysheet.setCellValue(insertRow, 1, {
					v: deviceData.deviceNumber || '/',
					m: deviceData.deviceNumber || '/',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// C列：设备名称（宋体，居中）
				luckysheet.setCellValue(insertRow, 2, {
					v: deviceData.deviceName || '',
					m: deviceData.deviceName || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// D列：规格型号（宋体，居中）
				luckysheet.setCellValue(insertRow, 3, {
					v: deviceData.specification || '',
					m: deviceData.specification || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// E列：技术参数（宋体，自动换行，左对齐）
			const technicalParams = deviceData.technicalParams || '';
			luckysheet.setCellValue(insertRow, 4, {
				v: technicalParams,
				m: technicalParams,
				ct: { fa: "General", t: "g" },
					tb: "2", // 自动换行
					ff: "SimSun",
					fs: 10,
					ht: 1, // 左对齐
					vt: 0  // 垂直居中
				});
				
				// F列：材质（宋体，居中）
				luckysheet.setCellValue(insertRow, 5, {
					v: deviceData.material || '',
					m: deviceData.material || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// G列：单位（宋体，居中）
				luckysheet.setCellValue(insertRow, 6, {
					v: deviceData.unit || '',
					m: deviceData.unit || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// H列：数量（宋体，居中）
				const quantity = deviceData.quantity === '/' || deviceData.quantity === '' || deviceData.quantity == null ? 0 : (parseFloat(deviceData.quantity) || 0);
				luckysheet.setCellValue(insertRow, 7, {
					v: quantity,
					m: String(quantity),
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// I列：单台电机数量（宋体，居中）
				const iQty = deviceData.motorQuantity === '/' || deviceData.motorQuantity === '' || deviceData.motorQuantity == null ? 0 : (parseFloat(deviceData.motorQuantity) || 0);
				luckysheet.setCellValue(insertRow, 8, {
					v: Math.round(iQty),
					m: String(Math.round(iQty)),
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// J列：总电机数量（先设置公式，稍后会被计算值覆盖）
				const jInitialValue = Math.round(iQty * quantity);
				luckysheet.setCellValue(insertRow, 9, { 
					v: jInitialValue || '',
					m: jInitialValue ? String(jInitialValue) : '',
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// K列：电机功率（宋体，保持原始格式，可能是表达式）
				const motorPowerRaw = (deviceData.motorPower === '/' || deviceData.motorPower == null) ? '' : (deviceData.motorPower || '');
				luckysheet.setCellValue(insertRow, 10, {
					v: motorPowerRaw,
					m: motorPowerRaw,
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// L列：单台设备功率（表达式直接显示结果，数字直接计算值）
		const kVal = String(motorPowerRaw || '').trim();
				let lInitialValue = '';
		if (kVal && /[\+\-\*\/]/.test(kVal) && !/^[\-]?\d+(\.\d+)?$/.test(kVal)) {
			// K是表达式，L直接显示计算结果
			try {
						lInitialValue = eval(kVal);
			} catch (e) {
						lInitialValue = '';
					}
				} else if (kVal && kVal !== '/') {
					// K是数字，L=K×I
					const kNum = parseFloat(kVal) || 0;
					lInitialValue = kNum * iQty;
				}
				
				luckysheet.setCellValue(insertRow, 11, {
					v: lInitialValue || '',
					m: lInitialValue ? String(lInitialValue) : '',
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// M列：总功率（直接计算值）
				const mInitialValue = lInitialValue ? (parseFloat(lInitialValue) * quantity) : '';
			luckysheet.setCellValue(insertRow, 12, {
					v: mInitialValue || '',
					m: mInitialValue ? String(mInitialValue) : '',
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// N列：单价（宋体，居中）
				const unitPrice = parseFloat(deviceData.unitPrice) || 0;
				luckysheet.setCellValue(insertRow, 13, {
					v: unitPrice,
					m: String(unitPrice),
					ct: { fa: "General", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// O列：总报价（直接计算值）
				const oInitialValue = unitPrice * quantity;
			luckysheet.setCellValue(insertRow, 14, {
					v: oInitialValue || '',
					m: oInitialValue ? oInitialValue.toFixed(2) : '',
					ct: { fa: "0.00", t: "n" },
					ff: "SimSun",
					fs: 10,
					ht: 0,
					vt: 0
				});
				
				// P列：备注（宋体）
				luckysheet.setCellValue(insertRow, 15, {
					v: deviceData.remarks || '',
					m: deviceData.remarks || '',
					ct: { fa: "General", t: "g" },
					ff: "SimSun",
					fs: 10
				});
			}
				
				console.log('✅ 设备数据填充完成');
				
// ⚠️ 只刷新一次，避免多次刷新导致公式错误
			setTimeout(() => {
		// 强制刷新样式，确保左对齐立即生效
		luckysheet.refresh();
				console.log('✅ 已刷新表格显示');
				
// ⚠️ 立即计算公式列的值并显示（只设置值，不设置公式，避免循环引用）
				setTimeout(() => {
					try {
			const sheetData = luckysheet.getSheetData();
			
			if (isSimplified) {
				// ===================== 简化版公式计算 =====================
				// H列：G*F（总电机数量 = 单台电机数量 * 数量）
				const gVal = sheetData[insertRow] && sheetData[insertRow][6];  // G列：单台电机数量
				const fVal = sheetData[insertRow] && sheetData[insertRow][5];  // F列：数量
				const gNum = parseFloat((gVal && typeof gVal === 'object') ? (gVal.v || gVal.m) : gVal) || 0;
				const fNum = parseFloat((fVal && typeof fVal === 'object') ? (fVal.v || fVal.m) : fVal) || 0;
				const hResult = gNum * fNum;
				
				if (hResult > 0) {
					luckysheet.setCellValue(insertRow, 7, {
						v: Math.round(hResult),
						m: String(Math.round(hResult)),
						ct: { fa: "General", t: "n" },
						ff: "SimSun",
						fs: 10,
						ht: 0,
						vt: 0
					});
					console.log(`✅ 简化版H列已计算: ${Math.round(hResult)}`);
				}
				
				// J列：I*G（单台设备功率 = 电机功率 * 单台电机数量，如果I是数字）
				const iVal = sheetData[insertRow] && sheetData[insertRow][8];  // I列：电机功率
				const iRaw = (iVal && typeof iVal === 'object') ? (iVal.v || iVal.m) : iVal;
				const iStr = String(iRaw || '').trim();
				const isExpression = /[\+\-\*\/]/.test(iStr) && !/^[\-]?\d+(\.\d+)?$/.test(iStr);
				
				if (!isExpression && iStr && iStr !== '/') {
					const iNum = parseFloat(iStr) || 0;
					const jResult = iNum * gNum;
					
					if (jResult > 0) {
						luckysheet.setCellValue(insertRow, 9, {
							v: jResult,
							m: String(jResult),
							ct: { fa: "General", t: "n" },
							ff: "SimSun",
							fs: 10,
							ht: 0,
							vt: 0
						});
						console.log(`✅ 简化版J列已计算: ${jResult}`);
						
					// 🔥 修复：K列设置公式而不是值（K = J × F）
					luckysheet.setCellValue(insertRow, 10, {
						f: `=J${insertRow+1}*F${insertRow+1}`,
						ct: { fa: "General", t: "n" },
						ff: "SimSun",
						fs: 10,
						ht: 0,
						vt: 0
					});
					console.log(`✅ 简化版K列已设置公式: =J${insertRow+1}*F${insertRow+1}`);
					}
				}
				
			// 🔥 修复：M列设置公式而不是值（M = L × F）
			luckysheet.setCellValue(insertRow, 12, {
				f: `=L${insertRow+1}*F${insertRow+1}`,
				ct: { fa: "0.00", t: "n" },
				ff: "SimSun",
				fs: 10,
				ht: 0,
				vt: 0
			});
			console.log(`✅ 简化版M列已设置公式: =L${insertRow+1}*F${insertRow+1}`);
			
		} else {
				// ===================== 完整版公式计算（原有逻辑） =====================
				// J列：I*H
				const iVal = sheetData[insertRow] && sheetData[insertRow][8];
				const hVal = sheetData[insertRow] && sheetData[insertRow][7];
				const iNum = parseFloat((iVal && typeof iVal === 'object') ? (iVal.v || iVal.m) : iVal) || 0;
				const hNum = parseFloat((hVal && typeof hVal === 'object') ? (hVal.v || hVal.m) : hVal) || 0;
				const jResult = iNum * hNum;
				
				if (jResult > 0) {
					luckysheet.setCellValue(insertRow, 9, {
						v: Math.round(jResult),
						m: String(Math.round(jResult)),
						ct: { fa: "General", t: "n" },
						ff: "SimSun",
						fs: 10,
						ht: 0,
						vt: 0
					});
					console.log(`✅ 完整版J列已计算: ${Math.round(jResult)}`);
				}
				
				// L列：K*I（如果K是数字）
				const kVal = sheetData[insertRow] && sheetData[insertRow][10];
				const kRaw = (kVal && typeof kVal === 'object') ? (kVal.v || kVal.m) : kVal;
				const kStr = String(kRaw || '').trim();
				const isExpression = /[\+\-\*\/]/.test(kStr) && !/^[\-]?\d+(\.\d+)?$/.test(kStr);
				
				if (!isExpression && kStr && kStr !== '/') {
					const kNum = parseFloat(kStr) || 0;
					const lResult = kNum * iNum;
					
					if (lResult > 0) {
						luckysheet.setCellValue(insertRow, 11, {
							v: lResult,
							m: String(lResult),
							ct: { fa: "General", t: "n" },
							ff: "SimSun",
							fs: 10,
							ht: 0,
							vt: 0
						});
						console.log(`✅ 完整版L列已计算: ${lResult}`);
						
						// M列：L*H
						const mResult = lResult * hNum;
						if (mResult > 0) {
							luckysheet.setCellValue(insertRow, 12, {
								v: mResult,
								m: String(mResult),
								ct: { fa: "General", t: "n" },
								ff: "SimSun",
								fs: 10,
								ht: 0,
								vt: 0
							});
							console.log(`✅ 完整版M列已计算: ${mResult}`);
						}
					}
				}
				
				// O列：N*H
				const nVal = sheetData[insertRow] && sheetData[insertRow][13];
				const nNum = parseFloat((nVal && typeof nVal === 'object') ? (nVal.v || nVal.m) : nVal) || 0;
				const oResult = nNum * hNum;
				
				if (oResult > 0) {
					luckysheet.setCellValue(insertRow, 14, {
						v: oResult,
						m: oResult.toFixed(2),
						ct: { fa: "0.00", t: "n" },
						ff: "SimSun",
						fs: 10,
						ht: 0,
						vt: 0
					});
					console.log(`✅ 完整版O列已计算: ${oResult.toFixed(2)}`);
				}
			}
				
				// 刷新显示
				if (luckysheet.refresh) luckysheet.refresh();
				console.log('✅ 公式列计算完成并刷新');
				
					} catch (e) {
				console.warn('⚠️ 强制计算公式失败:', e);
					}
				}, 50);
				
			// ⚠️ 手动计算求和（不使用jfrefreshgrid，避免公式循环引用错误）
			setTimeout(() => {
				if (window.manualCalculateSum) {
					window.manualCalculateSum();
					console.log('✅ 添加设备后手动计算求和完成');
				}
				// 最后统一刷新一次
				if (luckysheet.refresh) luckysheet.refresh();
			}, 300);
				
			// ✅ 直接用 Luckysheet 官方 API 设置当前新行行高（优先级最高）
			setTimeout(() => {
				try {
					// 简化版技术参数在D列（索引3），完整版在E列（索引4）
					const techParamsColIdx = isSimplified ? 3 : 4;
					const techParamsCellVal = luckysheet.getCellValue(insertRow, techParamsColIdx);
					const rowHeight = computeRowHeightFromText(
						(typeof techParamsCellVal === 'object' && techParamsCellVal && 'v' in techParamsCellVal) ? techParamsCellVal.v : techParamsCellVal
					);
						if (typeof luckysheet.setRowHeight === 'function') {
							luckysheet.setRowHeight({ [insertRow]: rowHeight });
							window._lastRowHeightApplied = { row: insertRow, at: Date.now() };
							console.log(`✅ setRowHeight 应用: 第${insertRow + 1}行 → ${rowHeight}px`);
						} else {
							const cfg = luckysheet.getConfig();
							if (cfg) {
								if (!cfg.rowlen) cfg.rowlen = {};
								cfg.rowlen[insertRow] = rowHeight;
								window._lastRowHeightApplied = { row: insertRow, at: Date.now() };
								if (luckysheet.refresh) luckysheet.refresh();

								console.log(`✅ config.rowlen 应用: 第${insertRow + 1}行 → ${rowHeight}px`);
							}
						}
					} catch (err) {
						console.error('❌ 行高应用失败:', err);
					}
				}, 200);
				
			// 刷新序号（注意：footerStartRow就是表尾起始行，不需要+1）
				setTimeout(() => {
					if (typeof window.refreshSerialNumbers === 'function') {
					window.refreshSerialNumbers(5, footerStartRow);
						console.log('✅ 已刷新序号');
					}
				}, 100);
				
				// 更新设备列表
				setTimeout(() => {
					if (typeof updateDeviceListFromTable === 'function') {
						updateDeviceListFromTable();
						console.log('✅ 已更新设备列表');
					}
				}, 200);
				
				alert('✅ 设备已成功添加到第' + (insertRow + 1) + '行！');
			}, 100);
			}, 100);
			
		} catch (e) {
			console.error('❌ 添加设备失败:', e);
			alert('添加设备失败: ' + e.message);
		}
		}
		
		// 更新设备列表显示
		function updateDeviceList() {
			const deviceList = document.getElementById('deviceList');
			const deviceListEmpty = document.getElementById('deviceListEmpty');
			
			if (currentDeviceList.length === 0) {
				deviceListEmpty.style.display = 'block';
				deviceList.style.display = 'none';
			} else {
				deviceListEmpty.style.display = 'none';
				deviceList.style.display = 'block';
				deviceList.innerHTML = '';
				
				currentDeviceList.forEach((device, index) => {
					const li = document.createElement('li');
					li.style.cssText = 'padding: 8px; margin-bottom: 4px; background: #fff; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;';
					li.innerHTML = `
						<div style="font-weight: 500;">${device.deviceName}</div>
						<div style="font-size: 11px; color: #666;">${device.specification}</div>
					`;
					li.addEventListener('click', () => loadDeviceToForm(device));
					deviceList.appendChild(li);
				});
			}
		}
		
		// 加载设备数据到表单
		function loadDeviceToForm(deviceData) {
			Object.keys(deviceData).forEach(key => {
				const element = document.getElementById(key);
				if (element) {
					element.value = deviceData[key];
				}
			});
		}
	


	(function() {
		'use strict';
		
	// PDF导出配置
	let pdfConfig = {
		rangeType: 'all',
		customRange: '',
		orientation: 'landscape',
		pageSize: 'a4',
		enableWatermark: true,  // ✅ 默认启用水印
		watermarkText: '泽国化机',  // ✅ 默认水印文字
		watermarkFontSize: 40,  // 降低字体大小：80 → 40
		watermarkRotation: -45,
		watermarkOpacity: 0.2,  // ✅ 透明度0.2
		watermarkDensity: 9,  // ✅ 密度9
		watermarkColor: 'gray'
	};
		
		// 初始化PDF导出功能
		function initPdfExport() {
			const exportBtn = document.getElementById('exportPdfBtn');
			const modal = document.getElementById('pdfPreviewModal');
			const closeBtn = document.getElementById('closePdfModal');
			const cancelBtn = document.getElementById('cancelPdfExport');
			const confirmBtn = document.getElementById('confirmPdfExport');
			const refreshBtn = document.getElementById('refreshPdfPreview');
		const rangeTypeSelect = document.getElementById('pdfRangeType');
		const customRangeInput = document.getElementById('customRangeInput');
		const enableWatermark = document.getElementById('enableWatermark');
		const watermarkSettings = document.getElementById('watermarkSettings');
			
		if (!exportBtn) return;
		if (!modal || !closeBtn || !cancelBtn || !confirmBtn || !refreshBtn) {
			console.warn('⚠️ PDF预览模态框元素未找到，跳过初始化');
			return;
		}
		
		// ✅ 页面加载时设置默认水印配置
		if (enableWatermark) enableWatermark.checked = true;  // 默认启用
		const watermarkTextInput = document.getElementById('watermarkText');
		if (watermarkTextInput) watermarkTextInput.value = '泽国化机';  // 默认文字
		if (watermarkSettings) watermarkSettings.style.display = 'block';  // 显示水印设置
		
		// 打开PDF预览模态框
		exportBtn.addEventListener('click', function() {
			modal.style.display = 'block';
			
			// ✅ 设置默认水印配置
			console.log('🎯 设置水印默认值...');
			document.getElementById('enableWatermark').checked = true;
			document.getElementById('watermarkText').value = '泽国化机';
			document.getElementById('watermarkOpacity').value = 0.2;
			document.getElementById('watermarkDensity').value = 9;
			document.getElementById('watermarkSettings').style.display = 'block';
			
			console.log('📊 更新PDF配置...');
			updatePdfConfig();
			console.log('💧 pdfConfig.enableWatermark:', pdfConfig.enableWatermark);
			console.log('📝 pdfConfig.watermarkText:', pdfConfig.watermarkText);
			console.log('🔢 pdfConfig.watermarkOpacity:', pdfConfig.watermarkOpacity);
			console.log('📐 pdfConfig.watermarkDensity:', pdfConfig.watermarkDensity);
			
			generatePreview();
		});
		
		// 关闭模态框
		closeBtn.addEventListener('click', closeModal);
		cancelBtn.addEventListener('click', closeModal);
			
			// 范围类型切换
			rangeTypeSelect.addEventListener('change', function() {
				if (this.value === 'custom') {
					customRangeInput.style.display = 'block';
				} else {
					customRangeInput.style.display = 'none';
				}
				updatePdfConfig();
			});
			
		// 水印开关
		enableWatermark.addEventListener('change', function() {
			if (this.checked) {
				watermarkSettings.style.display = 'block';
			} else {
				watermarkSettings.style.display = 'none';
			}
			updatePdfConfig();
			generatePreview(); // 刷新预览
		});
		
		// 水印参数变化时刷新预览
		['watermarkText', 'watermarkFontSize', 'watermarkRotation', 'watermarkOpacity', 'watermarkDensity', 'watermarkColor'].forEach(function(id) {
			const element = document.getElementById(id);
			if (element) {
				element.addEventListener('input', function() {
					updatePdfConfig();
					if (pdfConfig.enableWatermark) {
						generatePreview();
					}
				});
			}
		});
			
			// 刷新预览
			refreshBtn.addEventListener('click', function() {
				updatePdfConfig();
				generatePreview();
			});
			
			// 确认导出
			confirmBtn.addEventListener('click', async function() {
				// ✅ 关键修复：在用户点击时立即获取文件句柄（在用户手势上下文中）
				await exportToPdfWithSaveDialog();
			});
			
			// 其他选项变化（添加方向切换时刷新预览）
			document.getElementById('pdfOrientation').addEventListener('change', function() {
				updatePdfConfig();
				generatePreview(); // 方向改变时刷新预览
			});
		document.getElementById('pdfPageSize').addEventListener('change', updatePdfConfig);
		document.getElementById('pdfCustomRange').addEventListener('input', updatePdfConfig);
	}
		
		// 关闭模态框
		function closeModal() {
			document.getElementById('pdfPreviewModal').style.display = 'none';
		}
		
	// 更新PDF配置
	function updatePdfConfig() {
		pdfConfig.rangeType = document.getElementById('pdfRangeType').value;
		pdfConfig.customRange = document.getElementById('pdfCustomRange').value;
		pdfConfig.orientation = document.getElementById('pdfOrientation').value;
		pdfConfig.pageSize = document.getElementById('pdfPageSize').value;
		pdfConfig.enableWatermark = document.getElementById('enableWatermark').checked;
		pdfConfig.watermarkText = document.getElementById('watermarkText').value;
		pdfConfig.watermarkFontSize = parseInt(document.getElementById('watermarkFontSize').value) || 40;  // ✅ 默认40
		pdfConfig.watermarkRotation = parseInt(document.getElementById('watermarkRotation').value) || -45;
		pdfConfig.watermarkOpacity = parseFloat(document.getElementById('watermarkOpacity').value) || 0.2;  // ✅ 默认0.2
		pdfConfig.watermarkDensity = parseInt(document.getElementById('watermarkDensity').value) || 9;  // ✅ 默认9
		pdfConfig.watermarkColor = document.getElementById('watermarkColor').value || 'gray';
	}
		
		// 获取导出范围
		function getExportRange() {
			try {
				// 🔥 修复：使用当前激活的工作表，而不是总是使用第一个工作表
				const sheet = luckysheet.getSheet();
				if (!sheet || !sheet.data) {
					throw new Error('无法获取表格数据');
				}
				
				// 判断是简化版还是完整版
				const isSimplified = sheet.name && sheet.name.includes('简化版');
				const maxCol = isSimplified ? 13 : 15; // 简化版14列(0-13)，完整版16列(0-15)
				console.log(`📊 PDF导出 - 当前激活工作表: ${sheet.name}, ${isSimplified ? '简化版' : '完整版'}, 列范围: 0-${maxCol}`);
				
				let startRow = 0, endRow = 0, startCol = 0, endCol = 0;
				
				if (pdfConfig.rangeType === 'all') {
					// 导出全部内容
					startRow = 0;
					endRow = sheet.data.length - 1;
					startCol = 0;
					endCol = maxCol;
				} else if (pdfConfig.rangeType === 'current') {
					// 导出当前选区
					const selection = luckysheet.getRange();
					console.log('📍 当前选区:', selection);
					
					if (!selection || selection.length === 0) {
						// 如果没有选区，默认导出全部内容
						console.warn('⚠️ 未检测到选区，改为导出全部内容');
						alert('未检测到选区，将导出全部内容');
						startRow = 0;
						endRow = sheet.data.length - 1;
						startCol = 0;
						endCol = maxCol;
					} else {
                        const sel = selection[0] || {};
                        console.log('📍 选区详情:', sel);
						
						// 兼容多种返回结构
                        let rowArr = null;
						let colArr = null;
						
						// 尝试从 row/column 属性获取
						if (Array.isArray(sel.row) && sel.row.length >= 2) {
							rowArr = sel.row;
						}
						if (Array.isArray(sel.column) && sel.column.length >= 2) {
							colArr = sel.column;
						}
						
						// 如果没有，尝试从 r/c 属性获取
						if (!rowArr && typeof sel.r === 'number') {
							rowArr = [sel.r, sel.r];
						}
						if (!colArr && typeof sel.c === 'number') {
							colArr = [sel.c, sel.c];
						}
						
						// 如果还是没有，尝试从其他可能的属性获取
						if (!rowArr && sel.row_focus !== undefined) {
							rowArr = [sel.row_focus, sel.row_focus];
						}
						if (!colArr && sel.column_focus !== undefined) {
							colArr = [sel.column_focus, sel.column_focus];
						}

                        if (!rowArr || rowArr.length === 0) {
                            console.error('❌ 无法解析选区行范围，选区对象:', sel);
                            throw new Error('无法获取选区行范围，请重新选择');
                        }
                        if (!colArr || colArr.length === 0) {
                            console.error('❌ 无法解析选区列范围，选区对象:', sel);
                            throw new Error('无法获取选区列范围，请重新选择');
                        }

                        startRow = typeof rowArr[0] === 'number' ? rowArr[0] : 0;
                        endRow = typeof rowArr[1] === 'number' ? rowArr[1] : rowArr[0];
                        startCol = typeof colArr[0] === 'number' ? colArr[0] : 0;
                        endCol = typeof colArr[1] === 'number' ? colArr[1] : colArr[0];

                        // 边界保护（使用之前定义的maxCol）
                        const maxRow = sheet.data.length - 1;
                        startRow = Math.max(0, Math.min(startRow, maxRow));
                        endRow = Math.max(0, Math.min(endRow, maxRow));
                        startCol = Math.max(0, Math.min(startCol, maxCol));
                        endCol = Math.max(0, Math.min(endCol, maxCol));
						
						console.log(`✅ 选区范围: 行${startRow+1}-${endRow+1}, 列${startCol+1}-${endCol+1}`);
					}
				} else if (pdfConfig.rangeType === 'custom') {
					// 自定义范围
					if (!pdfConfig.customRange) {
						throw new Error('请输入自定义范围');
					}
					const range = parseRange(pdfConfig.customRange);
					startRow = range.startRow;
					endRow = range.endRow;
					startCol = range.startCol;
					endCol = range.endCol;
				}
				
				return { startRow, endRow, startCol, endCol, data: sheet.data };
			} catch (error) {
				console.error('获取导出范围失败:', error);
				alert('获取导出范围失败: ' + error.message);
				return null;
			}
		}
		
		// 解析范围字符串（如 "A1:O20"）
		function parseRange(rangeStr) {
			const match = rangeStr.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/i);
			if (!match) {
				throw new Error('范围格式不正确，请使用如 A1:O20 的格式');
			}
			
			const startCol = columnToIndex(match[1]);
			const startRow = parseInt(match[2]) - 1;
			const endCol = columnToIndex(match[3]);
			const endRow = parseInt(match[4]) - 1;
			
			return { startRow, endRow, startCol, endCol };
		}
		
		// 列字母转索引
		function columnToIndex(col) {
			let index = 0;
			for (let i = 0; i < col.length; i++) {
				index = index * 26 + (col.charCodeAt(i) - 64);
			}
			return index - 1;
		}
		
// 生成预览（带分页和页码）
function generatePreview() {
	const previewContent = document.getElementById('pdfPreviewContent');
	// 完全清空内容，移除所有旧水印
	previewContent.innerHTML = '';
	// 保持居中布局
	previewContent.style.display = 'flex';
	previewContent.style.flexDirection = 'column';
	previewContent.style.alignItems = 'center';
	previewContent.style.margin = '0 auto';
	previewContent.style.gap = '20px';
	previewContent.style.padding = '0';
	previewContent.innerHTML = '<p style="text-align: center; color: #999; padding: 50px 0;">正在生成预览...</p>';
	
	setTimeout(function() {
		const range = getExportRange();
		if (!range) return;
		
		const html = generateTableHtml(range);
		
		// 先获取页面尺寸配置
		const tempPageSize = pdfConfig.pageSize;
		const tempOrientation = pdfConfig.orientation;
		let tempWidth = 900; // 默认宽度
		
		// 根据纸张大小设置临时div宽度
		if (tempPageSize === 'a4') {
			tempWidth = tempOrientation === 'portrait' ? 794 : 1122;
		} else if (tempPageSize === 'a3') {
			tempWidth = tempOrientation === 'portrait' ? 1122 : 1587;
		}
		
		// 创建临时元素来测量高度（使用fixed定位和屏幕外位置，更稳定）
		const tempDiv = document.createElement('div');
		tempDiv.style.cssText = `
			position: fixed;
			left: -9999px;
			top: 0;
			width: ${tempWidth}px;
			visibility: visible;
			background: white;
		`;
		tempDiv.innerHTML = html;
		document.body.appendChild(tempDiv);
		
		// 获取内容高度
		const contentHeight = tempDiv.offsetHeight;
		
		// 计算页面高度和宽度（根据方向和纸张大小）
		const pageSize = pdfConfig.pageSize;
		const orientation = pdfConfig.orientation;
		let pageHeight, pageWidth;
		
		// A4: 210×297mm, A3: 297×420mm
		// 按照常见的96dpi转换：1mm ≈ 3.78px
		if (pageSize === 'a4') {
			if (orientation === 'portrait') {
				pageWidth = 794;   // 210mm
				pageHeight = 1122; // 297mm
			} else {
				pageWidth = 1122;  // 297mm
				pageHeight = 794;  // 210mm
			}
		} else if (pageSize === 'a3') {
			if (orientation === 'portrait') {
				pageWidth = 1122;  // 297mm
				pageHeight = 1587; // 420mm
			} else {
				pageWidth = 1587;  // 420mm
				pageHeight = 1122; // 297mm
			}
		} else { // letter
			if (orientation === 'portrait') {
				pageWidth = 816;   // 216mm
				pageHeight = 1054; // 279mm
			} else {
				pageWidth = 1054;  // 279mm
				pageHeight = 816;  // 216mm
			}
		}
		
		// 减去上下边距（减少边距，增加内容空间）
		const availableHeight = pageHeight - 60; // 减少到60px边距
		
		// 计算需要的页数
		const totalPages = Math.ceil(contentHeight / availableHeight);
		
        // 基于行高切分，保证一行不会被分页截断
        previewContent.innerHTML = '';
        previewContent.style.display = 'flex';
        previewContent.style.flexDirection = 'column';
        previewContent.style.alignItems = 'center';
        previewContent.style.margin = '0 auto';
        previewContent.style.gap = '20px';
        previewContent.style.padding = '0';

        const tempTable = tempDiv.querySelector('table');
        const tempRows = Array.from(tempTable.querySelectorAll('tr'));
        const slices = [];
        let startIdx = 0;
        let acc = 0;
        for (let i = 0; i < tempRows.length; i++) {
            const h = tempRows[i].getBoundingClientRect().height || 35; // 使用getBoundingClientRect更准确，默认35px
            if (acc + h > availableHeight || (i === tempRows.length - 1)) {
                // 若最后一行也一起加入
                const endIdx = (acc + h > availableHeight) ? i - 1 : i;
                if (endIdx >= startIdx) slices.push([startIdx, endIdx]);
                startIdx = (acc + h > availableHeight) ? i : i + 1;
                acc = 0;
            } else {
                acc += h;
            }
        }

        const totalPagesComputed = slices.length || 1;
        
        for (let p = 0; p < totalPagesComputed; p++) {
            const [rowStart, rowEnd] = slices[p] || [0, tempRows.length - 1];

            // 页面容器（设置具体宽度和高度）
            const pageDiv = document.createElement('div');
            pageDiv.className = 'preview-page';
            pageDiv.style.cssText = `
                position: relative;
                width: ${pageWidth}px;
                height: ${pageHeight}px;
                margin-bottom: 20px;
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
                page-break-after: always;
                flex-shrink: 0;
            `;

            // 克隆表格并保留当前页的行
            const tableClone = tempTable.cloneNode(true);
            const cloneRows = Array.from(tableClone.querySelectorAll('tr'));
            cloneRows.forEach((tr, idx) => {
                if (idx < rowStart || idx > rowEnd) tr.parentNode.removeChild(tr);
            });
            // 为新页第一行补齐顶部边框，避免跨页时断线
            const firstRowTds = tableClone.querySelectorAll('tr:first-child td');
            firstRowTds.forEach(td => {
                td.style.borderTop = '0.5px solid #333';
            });

            const contentDiv = document.createElement('div');
            contentDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                padding: 10px 10px 30px 10px; /* 减少底部padding */
                display: flex;
                justify-content: center; /* 水平居中 */
                align-items: flex-start; /* 垂直顶部对齐 */
            `;
            contentDiv.appendChild(tableClone);
            pageDiv.appendChild(contentDiv);

            // 分隔线（页码上方）
            if (p < totalPagesComputed - 1) {
                const divider = document.createElement('div');
                divider.style.cssText = `
                    position: absolute;
                    left: 10px; right: 10px;
                    bottom: 40px;
                    height: 0;
                    border-top: 0.5px solid #ddd;
                `;
                pageDiv.appendChild(divider);
            }

            // 页码（固定在底部）- v4.6 优化速度
            const pageNum = document.createElement('div');
            pageNum.className = 'page-num';
            pageNum.setAttribute('data-version', 'v4.6'); // 版本标识
            pageNum.style.cssText = `
                position: absolute;
                bottom: 15px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 11px;
                color: #999;
                background: white;
                padding: 5px 0;
                font-family: Arial, sans-serif;
            `;
            // ✅ v4.6: 使用纯数字格式（不使用中文）
            const pageNumText = `${p + 1} / ${totalPagesComputed}`;
            pageNum.textContent = pageNumText;
            pageNum.innerHTML = pageNumText; // 同时设置innerHTML确保没有嵌套元素
            console.log(`📄 [v4.6] 设置页码 ${p + 1}:`, pageNumText);
            pageDiv.appendChild(pageNum);

            previewContent.appendChild(pageDiv);
        }
		
		// 删除临时div
		document.body.removeChild(tempDiv);
		
		// 添加水印预览（为每页添加）
		console.log('🔍 检查水印条件:', {
			enableWatermark: pdfConfig.enableWatermark,
			watermarkText: pdfConfig.watermarkText,
			shouldAdd: pdfConfig.enableWatermark && pdfConfig.watermarkText
		});
		if (pdfConfig.enableWatermark && pdfConfig.watermarkText) {
			console.log('💧 添加水印到预览...');
			addWatermarkToPreview();
		} else {
			console.warn('⚠️ 水印未添加！原因:', {
				enabled: pdfConfig.enableWatermark,
				hasText: !!pdfConfig.watermarkText
			});
		}
	
	// 调整预览容器样式（保持居中对齐）
	previewContent.style.display = 'flex';
	previewContent.style.flexDirection = 'column';
	previewContent.style.alignItems = 'center';
	previewContent.style.margin = '0 auto';
	previewContent.style.gap = '20px';
	previewContent.style.padding = '0';
}, 100);
}
		
	// 生成表格HTML
	function generateTableHtml(range) {
		const { startRow, endRow, startCol, endCol, data } = range;
		
		// 🔥 修复：获取当前激活的工作表的合并单元格信息
		const sheet = luckysheet.getSheet();
		const mergeConfig = sheet.config && sheet.config.merge ? sheet.config.merge : {};
		
	// 获取行高和列宽配置（保持当前表格实际显示的宽度）
		const rowlenConfig = sheet.config && sheet.config.rowlen ? sheet.config.rowlen : {};
		const columnlenConfig = sheet.config && sheet.config.columnlen ? sheet.config.columnlen : {};
	
	console.log('📏 PDF导出使用的列宽配置:', columnlenConfig);
		
		// 用于跟踪哪些单元格已被合并（应该跳过）
		const mergedCells = {};
		
        // 生成colgroup来定义列宽（统一线条宽度为0.5px，更清晰）
        let html = '<table style="border-collapse: collapse; font-family: SimSun, serif; font-size: 13px; table-layout: fixed; border: 0.5px solid #333; -webkit-font-smoothing: antialiased;">';
		html += '<colgroup>';
		for (let c = startCol; c <= endCol; c++) {
			const colWidth = columnlenConfig[c] || 73; // 默认列宽73px
			html += '<col style="width: ' + colWidth + 'px;">';
		}
		html += '</colgroup>';
		
        for (let r = startRow; r <= endRow; r++) {
            // 表头1-3行使用配置的行高，数据区行高自适应
            if (r <= 2) {
                const headerHeight = rowlenConfig[r] || 35;
                html += '<tr style="height: ' + headerHeight + 'px;">';
            } else {
                html += '<tr>';
            }
			const row = data[r];
			
			for (let c = startCol; c <= endCol; c++) {
				// 检查是否被合并（应该跳过）
				const cellKey = r + '_' + c;
				if (mergedCells[cellKey]) {
					continue;
				}
				
    const cell = row ? row[c] : null;
    let cellValue = '';
    let cellStyle = 'border: 0.5px solid #333; padding: 5px; line-height: 1.4; -webkit-font-smoothing: antialiased; '; // 边框0.5px，padding 5px，行高1.4
	let rowspan = 1;
	let colspan = 1;
				
				// 检查是否是合并单元格的起始位置
				if (mergeConfig[cellKey]) {
					const merge = mergeConfig[cellKey];
					rowspan = merge.rs || 1;
					colspan = merge.cs || 1;
					
					// 标记被合并的单元格
					for (let mr = r; mr < r + rowspan; mr++) {
						for (let mc = c; mc < c + colspan; mc++) {
							if (mr !== r || mc !== c) {
								mergedCells[mr + '_' + mc] = true;
							}
						}
					}
				}
				
				if (cell) {
					// 获取单元格值
					cellValue = window.getCellText ? window.getCellText(cell) : (cell.v || cell.m || '');
					
					// 应用样式
					if (cell.bl === 1) cellStyle += 'font-weight: bold; ';
					if (cell.it === 1) cellStyle += 'font-style: italic; ';
					if (cell.fs) cellStyle += 'font-size: ' + cell.fs + 'px; ';
					if (cell.fc) cellStyle += 'color: ' + cell.fc + '; ';
					if (cell.bg) cellStyle += 'background-color: ' + cell.bg + '; ';
					if (cell.ht === 0) cellStyle += 'text-align: center; ';
					if (cell.ht === 1) cellStyle += 'text-align: left; ';
					if (cell.ht === 2) cellStyle += 'text-align: right; ';
					if (cell.vt === 0) cellStyle += 'vertical-align: middle; ';
					if (cell.vt === 1) cellStyle += 'vertical-align: top; ';
					if (cell.vt === 2) cellStyle += 'vertical-align: bottom; ';
			}
			
                // 检查是否需要换行显示（包含换行符或公司名称单元格）
                const needLineBreak = (cellValue && cellValue.indexOf('\n') !== -1) || (r <= 2 && c === 0);
                
                // 列样式：E列、包含换行符的单元格、公司名称单元格允许换行
                if (c === 4 || needLineBreak) {
                    cellStyle += 'white-space: pre-wrap; word-break: break-word;';
                } else {
                    cellStyle += 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
                }

                // 表头1-3行强制居中显示
                if (r <= 2) {
                    cellStyle += 'text-align: center; vertical-align: middle;';
                }

                // 添加合并属性
				let tdAttrs = '';
				if (rowspan > 1) tdAttrs += ' rowspan="' + rowspan + '"';
				if (colspan > 1) tdAttrs += ' colspan="' + colspan + '"';
				
				html += '<td' + tdAttrs + ' style="' + cellStyle + '">' + (cellValue || '&nbsp;') + '</td>';
			}
			html += '</tr>';
		}
		
		html += '</table>';
		return html;
	}
	
// 添加水印到预览（为每个预览页面添加）
function addWatermarkToPreview() {
	const { watermarkText, watermarkFontSize, watermarkRotation, watermarkOpacity, watermarkDensity, watermarkColor } = pdfConfig;
	
	// 如果水印文字为空或只有空格，直接返回
	if (!watermarkText || !watermarkText.trim()) return;
	
	// 获取所有预览页面
	const previewPages = document.querySelectorAll('.preview-page');
	
	// 获取颜色RGB值（使用更浅的颜色）
	const colorMap = {
		gray: '180, 180, 180',  // 更浅的灰色
		red: '255, 180, 180',
		blue: '180, 180, 255',
		green: '180, 255, 180',
		black: '120, 120, 120'
	};
	const colorRGB = colorMap[watermarkColor] || '180, 180, 180';
	
	// 计算网格布局
	const gridSize = Math.sqrt(watermarkDensity);
	
	// 为每个预览页面添加水印
	previewPages.forEach(function(pageDiv) {
		for (let i = 0; i < watermarkDensity; i++) {
			const row = Math.floor(i / gridSize);
			const col = i % gridSize;
			
			const watermarkDiv = document.createElement('div');
			watermarkDiv.style.position = 'absolute';
			watermarkDiv.style.top = ((row + 0.5) / gridSize * 100) + '%';
			watermarkDiv.style.left = ((col + 0.5) / gridSize * 100) + '%';
			watermarkDiv.style.transform = `translate(-50%, -50%) rotate(${watermarkRotation}deg)`;
			watermarkDiv.style.fontSize = watermarkFontSize + 'px';
			watermarkDiv.style.color = `rgba(${colorRGB}, ${watermarkOpacity})`;
			watermarkDiv.style.fontWeight = 'bold';
			watermarkDiv.style.pointerEvents = 'none';
			watermarkDiv.style.userSelect = 'none';
			watermarkDiv.style.whiteSpace = 'nowrap';
			watermarkDiv.style.zIndex = '10';
			watermarkDiv.textContent = watermarkText;
			
			pageDiv.appendChild(watermarkDiv);
		}
	});
}
// ✅ 新函数：在用户点击时立即获取保存位置，然后渲染PDF
async function exportToPdfWithSaveDialog() {
	const confirmBtn = document.getElementById('confirmPdfExport');
	
	// 🔥 新增：先让用户输入文件名
	const defaultName = `设备参数选型_${new Date().toISOString().slice(0,10)}`;
	const userFileName = await window.promptFileName('请输入PDF文件名', defaultName, '.pdf');
	if (!userFileName) {
		console.log('⚠️ 用户取消保存');
		return;
	}
	
	// 确保文件名有.pdf扩展名
	const fileName = userFileName.endsWith('.pdf') ? userFileName : userFileName + '.pdf';
	console.log(`✅ 最终PDF文件名: ${fileName}`);
	
	// 检测环境
	const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;
	const supportsFilePicker = 'showSaveFilePicker' in window && window.isSecureContext;
	
	let fileHandle = null;
	
	// ✅ 关键：在用户手势上下文中立即请求文件句柄
	if (!isElectron && supportsFilePicker) {
		try {
			console.log('💾 正在打开保存对话框（用户手势上下文中）...');
			fileHandle = await window.showSaveFilePicker({
				suggestedName: fileName,
				types: [{
					description: 'PDF文件',
					accept: {'application/pdf': ['.pdf']}
				}]
			});
			console.log('✅ 用户已选择保存位置');
		} catch (err) {
			if (err.name === 'AbortError') {
				console.log('⚠️ 用户取消保存');
				return; // 用户取消，直接返回
			} else {
				console.error('❌ 保存对话框失败:', err);
				// 失败后继续，稍后使用直接下载方式
			}
		}
	}
	
	// 然后开始渲染PDF（将文件句柄传递下去）
	exportToPdf(fileHandle);
}
		
// 导出为PDF（逐页渲染）
function exportToPdf(fileHandle) {
	const confirmBtn = document.getElementById('confirmPdfExport');
	
	confirmBtn.disabled = true;
	confirmBtn.textContent = '正在导出...';
	
	// 获取所有预览页面
	const previewPages = document.querySelectorAll('.preview-page');
	const totalPages = previewPages.length;
	let pageIndex = 0;
	
	if (totalPages === 0) {
		alert('没有可导出的内容');
		confirmBtn.disabled = false;
		confirmBtn.textContent = '📥 确认导出';
		return;
	}
	
	console.log(`📊 开始渲染PDF，共 ${totalPages} 页`);
	console.log(`⚙️ 渲染参数: scale=3, 预计每页2-3秒`);
	
	// 获取jsPDF
	const { jsPDF } = window.jspdf;
	
	// 页面尺寸设置
	const pageSize = pdfConfig.pageSize.toUpperCase();
	const orientation = pdfConfig.orientation;
	
	const pdf = new jsPDF({
		orientation: orientation,
		unit: 'mm',
		format: pageSize,
		compress: true
	});
	
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	
	function renderPage() {
        if (pageIndex >= totalPages) {
			// 所有页面渲染完成，保存PDF
			// 注意：水印和页码已经通过html2canvas截图包含在图片中，无需重复添加
			console.log(`✅ 所有页面渲染完成，正在保存...`);
			savePdfFile(pdf, confirmBtn, fileHandle);
			return;
		}
		
		// 更新进度提示
		confirmBtn.textContent = `正在渲染 ${pageIndex + 1}/${totalPages} 页...`;
		console.log(`📄 正在渲染第 ${pageIndex + 1}/${totalPages} 页...`);
		
        const pageDiv = previewPages[pageIndex];
		
		// 渲染当前页（高清模式 - 平衡清晰度和速度）
		html2canvas(pageDiv, {
			scale: 3,  // ✅ 高清晰度：平衡质量和速度（3倍原始分辨率）
			useCORS: true,
			logging: false,
			backgroundColor: '#ffffff',
			letterRendering: true,  // ✅ 优化文字渲染
			allowTaint: false,
			imageTimeout: 0,
			removeContainer: true,
			foreignObjectRendering: false,  // ✅ 禁用外部对象渲染以提高清晰度
			width: pageDiv.offsetWidth,
			height: pageDiv.offsetHeight,
			windowWidth: pageDiv.scrollWidth,
			windowHeight: pageDiv.scrollHeight,
			willReadFrequently: true,  // ✅ 优化Canvas性能，避免getImageData警告
			onclone: function(clonedDoc) {
				// ✅ 在克隆的文档中优化字体渲染
				const clonedDiv = clonedDoc.querySelector('.preview-page');
				if (clonedDiv) {
					clonedDiv.style.transform = 'scale(1)';
					clonedDiv.style.transformOrigin = 'top left';
				}
			}
		}).then(function(canvas) {
			const imgData = canvas.toDataURL('image/png', 0.95);  // ✅ PNG格式，质量95%（平衡大小和质量）
			
			// 如果不是第一页，添加新页
			if (pageIndex > 0) {
				pdf.addPage();
			}
			
			// 🔥 修复：根据canvas实际比例计算图片尺寸，确保居中
            const margin = 10; // 页面边距（左右上下各5mm）
            const maxWidth = pageWidth - margin;
            const maxHeight = pageHeight - margin;
            
            // 计算canvas的宽高比
            const canvasRatio = canvas.width / canvas.height;
            const pageRatio = maxWidth / maxHeight;
            
            let imgWidth, imgHeight;
            if (canvasRatio > pageRatio) {
                // canvas更宽，以宽度为准
                imgWidth = maxWidth;
                imgHeight = imgWidth / canvasRatio;
            } else {
                // canvas更高，以高度为准
                imgHeight = maxHeight;
                imgWidth = imgHeight * canvasRatio;
            }
			
            // 🔥 计算居中位置
            const xPos = (pageWidth - imgWidth) / 2; // 水平居中
            const yPos = (pageHeight - imgHeight) / 2; // 垂直居中
			
            console.log(`📄 PDF页面: ${pageWidth}mm × ${pageHeight}mm`);
            console.log(`🖼️ 图片尺寸: ${imgWidth.toFixed(2)}mm × ${imgHeight.toFixed(2)}mm`);
            console.log(`📍 居中位置: (${xPos.toFixed(2)}, ${yPos.toFixed(2)})`);
			
            // 添加图片（页码和水印已包含在截图中）
            pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
			
			// 渲染下一页
			pageIndex++;
			renderPage();
		}).catch(function(error) {
			console.error('渲染第' + (pageIndex + 1) + '页失败:', error);
			pageIndex++;
			renderPage();
		});
	}
	
	// 开始渲染第一页
	renderPage();
}

// 添加水印到PDF的所有页
function addWatermarkToPdf(pdf, totalPages) {
	// 如果未启用水印，或水印文字为空/只有空格，直接返回
	if (!pdfConfig.enableWatermark || !pdfConfig.watermarkText || !pdfConfig.watermarkText.trim()) {
		return;
	}
	
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	
	// 颜色映射（使用更浅的颜色）
	const colorMap = {
		gray: [220, 220, 220],  // 更浅的灰色
		red: [255, 220, 220],
		blue: [220, 220, 255],
		green: [220, 255, 220],
		black: [180, 180, 180]
	};
	const color = colorMap[pdfConfig.watermarkColor] || [220, 220, 220];
	
	// 为每一页添加水印
	for (let p = 1; p <= totalPages; p++) {
		pdf.setPage(p);
		
		pdf.setFontSize(pdfConfig.watermarkFontSize * 0.5);  // 缩小水印：0.75 → 0.5
		pdf.setTextColor(color[0], color[1], color[2]);
		pdf.setGState(new pdf.GState({opacity: pdfConfig.watermarkOpacity}));
		
		// 网格布局
		const gridSize = Math.sqrt(pdfConfig.watermarkDensity);
		
		for (let i = 0; i < pdfConfig.watermarkDensity; i++) {
			const row = Math.floor(i / gridSize);
			const col = i % gridSize;
			
			const x = ((col + 0.5) / gridSize) * pageWidth;
			const y = ((row + 0.5) / gridSize) * pageHeight;
			
			pdf.text(pdfConfig.watermarkText, x, y, {
				angle: pdfConfig.watermarkRotation,
				align: 'center',
				baseline: 'middle'
			});
		}
	}
}

// 保存PDF文件（使用提前获取的文件句柄）
async function savePdfFile(pdf, confirmBtn, fileHandle) {
	const fileName = `设备参数选型_${new Date().toISOString().slice(0,10)}.pdf`;
	
	// 检测是否在 Electron 环境中
	const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;
	
	try {
		const blob = pdf.output('blob');
		
		// ✅ 如果有文件句柄（在用户手势时已获取），直接写入
		if (fileHandle) {
			console.log('✅ 使用提前获取的文件句柄写入PDF...');
			const writable = await fileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
			console.log('✅ PDF已保存到用户选择的位置');
			alert('✅ PDF导出成功！\n\n文件已保存到您选择的位置');
			confirmBtn.disabled = false;
			confirmBtn.textContent = '📥 确认导出';
			closeModal();
			// 保存到历史记录
			await savePdfToHistory(blob, fileName);
		}
		// Electron环境或旧浏览器：直接下载
		else if (isElectron || !('showSaveFilePicker' in window)) {
			console.log('📥 使用直接下载方式...');
			pdf.save(fileName);
			confirmBtn.disabled = false;
			confirmBtn.textContent = '📥 确认导出';
			alert('✅ PDF已下载到默认下载目录\n\n文件名：' + fileName);
			closeModal();
			// 保存到历史记录
			await savePdfToHistory(blob, fileName);
		}
		// 不应该到这里（fileHandle应该在前面已获取）
		else {
			console.warn('⚠️ 意外情况：没有文件句柄，使用直接下载');
			pdf.save(fileName);
			confirmBtn.disabled = false;
			confirmBtn.textContent = '📥 确认导出';
			closeModal();
			// 保存到历史记录
			await savePdfToHistory(blob, fileName);
		}
	} catch (error) {
		console.error('❌ 保存失败:', error);
		// 出错时回退到直接下载
		pdf.save(fileName);
		alert('⚠️ 保存失败，已使用直接下载方式\n\n错误：' + error.message);
		confirmBtn.disabled = false;
		confirmBtn.textContent = '📥 确认导出';
		closeModal();
	}
}

// 保存Excel到历史记录
window.saveExcelToHistory = async function saveExcelToHistory(blob, fileName) {
	try {
		// 检查是否有SelectionHistory模块
		if (typeof SelectionHistory === 'undefined') {
			console.warn('⚠️ SelectionHistory模块未加载，跳过历史记录保存');
			return;
		}
		
		console.log('📤 保存Excel到历史记录...');
		console.log('📄 文件名:', fileName);
		
		// 🔥 修复：获取项目名称（保留完整文件名，仅去掉扩展名）
		let projectName = fileName.replace(/\.xlsx$/i, '');
		console.log('📋 提取的项目名称:', projectName);
		
		// 转换blob为base64
		const reader = new FileReader();
		reader.onloadend = async () => {
			try {
				const base64 = reader.result.split(',')[1];
				
				// 获取当前登录用户信息
				const currentUser = window.currentUser;
				const userPhone = currentUser && currentUser.phone ? currentUser.phone : 'unknown';
				
				// 准备数据
				const recordData = {
					project_name: projectName,
					selection_type: 'other',
					excel_filename: fileName,
					excel_content: base64,
					excel_size: blob.size,
					phone: userPhone, // 添加用户手机号
					notes: `Excel保存于 ${new Date().toLocaleString('zh-CN')}`
				};
				
				// 保存到云端
				await SelectionHistory.saveToCloud(recordData);
				
				console.log('✅ Excel已保存到历史记录');
				console.log('📄 保存的文件名:', fileName);
				SelectionHistory.showSuccess(`✅ Excel已自动保存到历史记录\n📄 文件名：${fileName}`, 3000);
			} catch (error) {
				console.error('❌ 保存Excel到历史记录失败:', error);
				SelectionHistory.showError('⚠️ 历史记录保存失败：' + error.message, 3000);
			}
		};
		reader.onerror = () => {
			console.error('❌ Excel Base64转换失败');
		};
		reader.readAsDataURL(blob);
		
	} catch (error) {
		console.error('❌ 保存Excel到历史记录失败:', error);
	}
};

// 保存PDF到历史记录
window.savePdfToHistory = async function savePdfToHistory(blob, fileName) {
	try {
		// 检查是否有SelectionHistory模块
		if (typeof SelectionHistory === 'undefined') {
			console.warn('⚠️ SelectionHistory模块未加载，跳过历史记录保存');
			return;
		}
		
		console.log('📤 保存PDF到历史记录...');
		console.log('📄 文件名:', fileName);
		
		// 🔥 修复：获取项目名称（从文件名中提取，去掉扩展名和日期后缀）
		const projectName = fileName.replace(/\.pdf$/i, '').replace(/_\d{4}-\d{2}-\d{2}$/, '');
		
		// 转换blob为base64
		const reader = new FileReader();
		reader.onloadend = async () => {
			try {
				const base64 = reader.result.split(',')[1];
				
				// 准备数据
				const recordData = {
					project_name: projectName,
					selection_type: 'other',
					pdf_filename: fileName,
					pdf_content: base64,
					pdf_size: blob.size,
					notes: `PDF导出于 ${new Date().toLocaleString('zh-CN')}`
				};
				
				// 保存到云端
				await SelectionHistory.saveToCloud(recordData);
				
				console.log('✅ PDF已保存到历史记录');
				console.log('📄 保存的文件名:', fileName);
				SelectionHistory.showSuccess(`✅ PDF已自动保存到历史记录\n📄 文件名：${fileName}`, 3000);
			} catch (error) {
				console.error('❌ 保存PDF到历史记录失败:', error);
				SelectionHistory.showError('⚠️ 历史记录保存失败：' + error.message, 3000);
			}
		};
		reader.onerror = () => {
			console.error('❌ PDF Base64转换失败');
		};
		reader.readAsDataURL(blob);
		
	} catch (error) {
		console.error('❌ 保存PDF到历史记录失败:', error);
	}
};

// 关闭模态框
function closeModal() {
	const modal = document.getElementById('pdfPreviewModal');
	if (modal) {
		modal.style.display = 'none';
	}
}

// 页面加载后初始化
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initPdfExport);
} else {
	initPdfExport();
}
	})();
	



    console.log('LEGACY CODE MODULE LOADED');
})();
