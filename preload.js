/**
 * Electron预加载脚本
 * 为渲染进程提供安全的Node.js功能访问
 */
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 打开数据库文件夹
    openDatabaseFolder: () => ipcRenderer.invoke('open-database-folder'),
    
    // 备份数据库
    backupDatabase: () => ipcRenderer.invoke('backup-database'),
    
    // 获取应用版本
    getAppVersion: () => process.versions.electron,
    
    // 获取平台信息
    getPlatform: () => process.platform,
    
    // 判断是否在Electron环境中运行
    isElectron: () => true
});

console.log('✅ Electron预加载脚本已加载');
