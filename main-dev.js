/**
 * Electron主进程 - 开发模式
 * 用于本地预览桌面应用效果
 */
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;
let frontendProcess;

// 启动Python后端
function startBackend() {
    console.log('🚀 启动后端服务...');
    
    const pythonPath = process.platform === 'win32' 
        ? path.join(__dirname, 'server', 'venv', 'Scripts', 'python.exe')
        : path.join(__dirname, 'server', 'venv', 'bin', 'python');
    
    backendProcess = spawn(pythonPath, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'], {
        cwd: path.join(__dirname, 'server'),
        stdio: 'inherit'
    });
    
    backendProcess.on('error', (err) => {
        console.error('❌ 后端启动失败:', err);
        dialog.showErrorBox('后端启动失败', '请确保已安装Python环境和依赖');
    });
    
    console.log('✅ 后端服务已启动 (http://localhost:8000)');
}

// 启动React前端
function startFrontend() {
    console.log('🚀 启动前端服务...');
    
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    
    frontendProcess = spawn(npmCmd, ['start'], {
        cwd: path.join(__dirname, 'client'),
        env: { ...process.env, PORT: '3001', BROWSER: 'none' }, // 禁止自动打开浏览器
        stdio: 'inherit'
    });
    
    frontendProcess.on('error', (err) => {
        console.error('❌ 前端启动失败:', err);
        dialog.showErrorBox('前端启动失败', '请确保已安装Node.js和依赖');
    });
    
    console.log('✅ 前端服务已启动 (http://localhost:3001)');
}

// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        title: 'EPC项目管理系统',
        icon: path.join(__dirname, 'icon.ico'),
        backgroundColor: '#f0f2f5',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            // 开发模式下允许eval（生产环境会自动禁用）
            devTools: true
        },
        show: true // 立即显示窗口
    });

    // 加载前端页面
    // 先显示窗口（显示加载中）
    mainWindow.show();
    console.log('✅ 应用窗口已打开，正在加载...');
    
    // 加载前端页面
    mainWindow.loadURL('http://localhost:3001');
    
    // 页面加载完成后的处理
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ 页面加载完成');
    });

    // 开发模式下打开控制台
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
    // 禁止外部链接在窗口中打开
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

// 应用就绪
app.whenReady().then(() => {
    console.log('');
    console.log('========================================');
    console.log('  EPC项目管理系统 - 桌面应用模式');
    console.log('========================================');
    console.log('');
    
    // 启动后端
    startBackend();
    
    // 等待2秒后启动前端
    setTimeout(() => {
        startFrontend();
    }, 2000);
    
    // 等待前端启动完成后创建窗口（约35秒，确保完全启动）
    setTimeout(() => {
        console.log('🎨 正在创建应用窗口...');
        createWindow();
    }, 35000);
    
    console.log('⏳ 正在启动服务，请等待30秒...');
});

// 所有窗口关闭
app.on('window-all-closed', () => {
    console.log('🛑 关闭所有服务...');
    
    // 停止后端
    if (backendProcess) {
        backendProcess.kill();
        console.log('✅ 后端服务已停止');
    }
    
    // 停止前端
    if (frontendProcess) {
        frontendProcess.kill();
        console.log('✅ 前端服务已停止');
    }
    
    app.quit();
});

// macOS特定行为
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC: 打开数据库文件夹
ipcMain.handle('open-database-folder', async () => {
    const appData = app.getPath('appData');
    const dbFolder = path.join(appData, 'EPC项目管理系统', 'database');
    
    // 确保目录存在
    const fs = require('fs');
    if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder, { recursive: true });
    }
    
    // 打开文件夹
    require('electron').shell.openPath(dbFolder);
});

// IPC: 备份数据库
ipcMain.handle('backup-database', async () => {
    try {
        const appData = app.getPath('appData');
        const dbPath = path.join(appData, 'EPC项目管理系统', 'database', 'epc_data.db');
        const backupFolder = path.join(appData, 'EPC项目管理系统', 'backup');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupFolder, `epc_data_${timestamp}.db`);
        
        const fs = require('fs');
        
        // 确保备份目录存在
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder, { recursive: true });
        }
        
        // 复制数据库文件
        fs.copyFileSync(dbPath, backupPath);
        
        return { success: true, path: backupPath };
    } catch (error) {
        console.error('备份失败:', error);
        return { success: false, error: error.message };
    }
});

console.log('📱 Electron应用启动脚本已加载');

