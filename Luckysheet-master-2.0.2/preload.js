// Preload脚本（可选）
// 在这里可以暴露特定的Node.js API给渲染进程

const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 打开文件
    openFile: () => ipcRenderer.send('open-file'),
    
    // 保存文件
    saveFile: (name, data) => ipcRenderer.send('save-file', { name, data }),
    
    // 监听文件打开
    onOpenFile: (callback) => ipcRenderer.on('open-excel-file', (event, data) => callback(data)),
    
    // 监听数据库文件打开
    onOpenDatabaseFile: (callback) => ipcRenderer.on('open-database-file', (event, data) => callback(data)),
    
    // 监听导出Excel
    onExportExcel: (callback) => ipcRenderer.on('export-excel', callback),
    
    // 监听刷新
    onRefreshSheet: (callback) => ipcRenderer.on('refresh-sheet', callback),
    
    // 监听保存结果
    onSaveResult: (callback) => ipcRenderer.on('save-file-result', (event, result) => callback(result))
});

