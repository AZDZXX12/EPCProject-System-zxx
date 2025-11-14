// ==================== Word编辑器打开功能（已注释，代码保留）====================
/* 
(function() {
	'use strict';
	
	function initWordEditor() {
		const wordBtn = document.getElementById('openWordEditorBtn');
		if (!wordBtn) {
			console.warn('⚠️ Word编辑器按钮未找到');
			return;
		}
		
		wordBtn.addEventListener('click', function() {
			// 检测是否在Electron环境
			const isElectron = typeof window !== 'undefined' && 
			                   window.process && 
			                   window.process.type === 'renderer';
			
			console.log('📝 正在打开Word编辑器...');
			
			if (isElectron && window.require) {
				// Electron环境：通过IPC创建独立窗口
				const { ipcRenderer } = window.require('electron');
				ipcRenderer.send('open-child-window', {
					url: 'word-editor.html',
					title: 'Word文档编辑器',
					width: 1200,
					height: 800,
					key: 'word-editor'
				});
				console.log('✅ 已发送打开Word编辑器窗口请求');
			} else {
				// 浏览器环境：在新标签页打开
				window.open('./word-editor.html', '_blank');
			}
		});
		
		console.log('✅ Word编辑器打开功能已初始化（Electron独立窗口模式）');
	}
	
	// 页面加载后初始化
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initWordEditor);
	} else {
		initWordEditor();
	}
})();
*/

// ==================== 离心风机选型工具打开功能（已注释，代码保留）====================
/*
(function() {
	'use strict';
	
	function initFanSelector() {
		const fanBtn = document.getElementById('openFanSelectorBtn');
		if (!fanBtn) {
			console.warn('⚠️ 离心风机选型按钮未找到');
			return;
		}
		
		fanBtn.addEventListener('click', function() {
			// 检测是否在Electron环境
			const isElectron = typeof window !== 'undefined' && 
			                   window.process && 
			                   window.process.type === 'renderer';
			
			console.log('🌀 正在打开离心风机选型工具...');
			
			if (isElectron && window.require) {
				// Electron环境：通过IPC创建独立窗口
				const { ipcRenderer } = window.require('electron');
				ipcRenderer.send('open-child-window', {
					url: 'fan-selector.html',
					title: '离心风机选型工具',
					width: 1600,
					height: 1000,
					key: 'fan-selector'
				});
				console.log('✅ 已发送打开风机选型窗口请求');
			} else {
				// 浏览器环境：在新标签页打开
				window.open('./fan-selector.html', '_blank');
			}
		});
		
		console.log('✅ 离心风机选型工具打开功能已初始化（Electron独立窗口模式）');
	}
	
	// 页面加载后初始化
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initFanSelector);
	} else {
		initFanSelector();
	}
})();
*/

// ==================== 电缆选型工具打开功能（已注释，代码保留）====================
/*
(function() {
	'use strict';
	
	function initCableSelector() {
		const cableBtn = document.getElementById('openCableSelectorBtn');
		if (!cableBtn) {
			console.warn('⚠️ 电缆选型按钮未找到');
			return;
		}
		
		cableBtn.addEventListener('click', function() {
			// 检测是否在Electron环境
			const isElectron = typeof window !== 'undefined' && 
			                   window.process && 
			                   window.process.type === 'renderer';
			
			console.log('⚡ 正在打开电缆选型工具...');
			
			if (isElectron && window.require) {
				// Electron环境：通过IPC创建独立窗口
				const { ipcRenderer } = window.require('electron');
				ipcRenderer.send('open-child-window', {
					url: 'cable-selector/index.html',
					title: '电缆选型工具',
					width: 1600,
					height: 1000,
					key: 'cable-selector'
				});
				console.log('✅ 已发送打开电缆选型窗口请求');
			} else {
				// 浏览器环境：检查HTTP协议
				const isHTTP = window.location.protocol === 'http:' || window.location.protocol === 'https:';
				
				if (!isHTTP) {
					alert('⚠️ 电缆选型工具需要通过HTTP服务器访问！\n\n请使用以下方式启动：\n1. 双击 "启动.bat"\n2. 或运行: cd dist-refactored && python -m http.server 8000\n3. 然后访问: http://localhost:8000/index.html');
					console.error('❌ 电缆选型工具需要HTTP服务器。当前协议:', window.location.protocol);
					return;
				}
				
				// 浏览器环境：在新标签页打开
				const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
				const cableAppUrl = baseUrl + 'cable-selector/index.html';
				window.open(cableAppUrl, '_blank');
			}
		});
		
		console.log('✅ 电缆选型工具打开功能已初始化（Electron独立窗口模式）');
	}
	
	// 页面加载后初始化
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCableSelector);
	} else {
		initCableSelector();
	}
})();
*/

// ==================== YJV电缆数据表打开功能（已注释，代码保留）====================
/*
(function() {
	'use strict';
	
	function initCableTable() {
		const tableBtn = document.getElementById('openCableTableBtn');
		if (!tableBtn) {
			console.warn('⚠️ YJV数据表按钮未找到');
			return;
		}
		
		tableBtn.addEventListener('click', function() {
			// 检测是否在Electron环境
			const isElectron = typeof window !== 'undefined' && 
			                   window.process && 
			                   window.process.type === 'renderer';
			
			console.log('📊 正在打开YJV电缆数据表...');
			
			if (isElectron && window.require) {
				// Electron环境：通过IPC创建独立窗口
				const { ipcRenderer } = window.require('electron');
				ipcRenderer.send('open-child-window', {
					url: 'cable-selector-table.html',
					title: 'YJV电缆数据表',
					width: 1600,
					height: 1000,
					key: 'cable-table'
				});
				console.log('✅ 已发送打开YJV数据表窗口请求');
			} else {
				// 浏览器环境：检查HTTP协议
				const isHTTP = window.location.protocol === 'http:' || window.location.protocol === 'https:';
				
				if (!isHTTP) {
					alert('⚠️ YJV数据表需要通过HTTP服务器访问！\n\n请使用以下方式启动：\n1. 双击 "启动.bat"\n2. 或运行: cd dist-refactored && python -m http.server 8000\n3. 然后访问: http://localhost:8000/index.html');
					console.error('❌ YJV数据表需要HTTP服务器。当前协议:', window.location.protocol);
					return;
				}
				
				// 浏览器环境：在新标签页打开
				const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
				const tableUrl = baseUrl + 'cable-selector-table.html';
				window.open(tableUrl, '_blank');
			}
		});
		
		console.log('✅ YJV电缆数据表打开功能已初始化（Electron独立窗口模式）');
	}
	
	// 页面加载后初始化
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCableTable);
	} else {
		initCableTable();
	}
})();
*/

