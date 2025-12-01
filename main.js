const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

// 禁用开发模式下的安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;
let httpServer;
const HTTP_PORT = 8765;
const childWindows = {}; // 存储子窗口引用

// 创建简单的HTTP服务器
function startHttpServer() {
    const distPath = path.join(__dirname, 'Luckysheet-master-2.0.2', 'dist-refactored');
    
    httpServer = http.createServer((req, res) => {
        let pathname = url.parse(req.url).pathname;
        
        // 默认页面
        if (pathname === '/') {
            pathname = '/index.html';
        }
        
        const filePath = path.join(distPath, pathname);
        
        // 安全检查：确保请求的文件在selection-tools目录内
        const resolvedPath = path.resolve(filePath);
        const resolvedBase = path.resolve(distPath);
        if (!resolvedPath.startsWith(resolvedBase)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        // 读取并返回文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            
            // 获取MIME类型
            const ext = path.extname(filePath);
            const mimeType = getMimeType(ext);
            
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        });
    });
    
    httpServer.listen(HTTP_PORT, 'localhost', () => {
        console.log(`✅ HTTP服务器已启动: http://localhost:${HTTP_PORT}`);
    });
}

// 简单的MIME类型映射
function getMimeType(ext) {
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// 创建子窗口（电缆选型、风机选型等工具）
function createChildWindow(options) {
    const { url, title, width = 1600, height = 1000, key } = options;
    
    // 如果窗口已存在，聚焦显示
    if (childWindows[key] && !childWindows[key].isDestroyed()) {
        childWindows[key].focus();
        return childWindows[key];
    }
    
    const childWindow = new BrowserWindow({
        width,
        height,
        title,
        icon: path.join(__dirname, 'client/public/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false
        },
        frame: true,
        backgroundColor: '#ffffff',
        show: false,
        parent: mainWindow, // 设置父窗口，关闭主窗口时子窗口也会关闭
        modal: false
    });
    
    // 加载URL
    childWindow.loadURL(`http://localhost:${HTTP_PORT}/${url}`);
    
    // 窗口准备就绪后显示
    childWindow.once('ready-to-show', () => {
        childWindow.show();
        childWindow.setTitle(title);
    });
    
    // 窗口关闭时清理引用
    childWindow.on('closed', () => {
        delete childWindows[key];
    });
    
    // 开发模式下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
        childWindow.webContents.openDevTools();
    }
    
    // 存储窗口引用
    childWindows[key] = childWindow;
    
    return childWindow;
}

// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        icon: path.join(__dirname, 'client/public/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false // 允许加载本地文件
        },
        frame: true,
        backgroundColor: '#ffffff',
        show: false, // 先不显示，等加载完成后再显示
        autoHideMenuBar: true // 隐藏菜单栏
    });

    // 开发模式：加载React开发服务器
    // 生产模式：使用内置HTTP服务器
    if (process.env.ELECTRON_MODE === 'react') {
        // 加载完整的React化工项目管理系统
        console.log('🔧 开发模式：连接React开发服务器 http://localhost:3000');
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // 加载选型系统
        console.log('📦 独立模式：加载选型系统');
        mainWindow.loadURL(`http://localhost:${HTTP_PORT}/index.html`);
    }

    // 窗口加载完成后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // 开发模式下打开开发者工具
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools();
        }
    });

    // 创建菜单（已禁用 - 用户不需要菜单栏）
    // createMenu();

    // 窗口关闭事件
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 处理外部链接
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

// 创建应用菜单
function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '打开Excel文件',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        openExcelFile();
                    }
                },
                {
                    label: '打开数据库文件',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => {
                        openDatabaseFile();
                    }
                },
                { type: 'separator' },
                {
                    label: '导出Excel',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('export-excel');
                    }
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: '视图',
            submenu: [
                {
                    label: '刷新',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.webContents.send('refresh-sheet');
                    }
                },
                {
                    label: '重新加载',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: '实际大小',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow.webContents.setZoomLevel(0);
                    }
                },
                {
                    label: '放大',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomLevel();
                        mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
                    }
                },
                {
                    label: '缩小',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomLevel();
                        mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
                    }
                },
                { type: 'separator' },
                {
                    label: '全屏',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                {
                    label: '开发者工具',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于',
                            message: 'Luckysheet 选型系统',
                            detail: '版本: 1.0.0\n基于 Luckysheet 和 Electron 构建\n\n一个功能强大的设备选型与报价系统',
                            buttons: ['确定']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 打开Excel文件对话框
function openExcelFile() {
    dialog.showOpenDialog(mainWindow, {
        title: '选择Excel文件',
        filters: [
            { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
            { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            // 读取文件并发送到渲染进程
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    dialog.showErrorBox('错误', '读取文件失败: ' + err.message);
                    return;
                }
                mainWindow.webContents.send('open-excel-file', {
                    name: path.basename(filePath),
                    data: data.toString('base64')
                });
            });
        }
    }).catch(err => {
        console.error('打开文件对话框失败:', err);
    });
}

// 打开数据库文件对话框
function openDatabaseFile() {
    dialog.showOpenDialog(mainWindow, {
        title: '选择数据库Excel文件',
        filters: [
            { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
            { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            // 读取文件并发送到渲染进程
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    dialog.showErrorBox('错误', '读取文件失败: ' + err.message);
                    return;
                }
                mainWindow.webContents.send('open-database-file', {
                    name: path.basename(filePath),
                    data: data.toString('base64')
                });
            });
        }
    }).catch(err => {
        console.error('打开数据库文件对话框失败:', err);
    });
}

// 打开子窗口（通过IPC）
ipcMain.on('open-child-window', (event, options) => {
    console.log('📝 收到打开子窗口请求:', options.title);
    createChildWindow(options);
});

// 保存文件对话框
ipcMain.on('save-file', (event, { name, data }) => {
    dialog.showSaveDialog(mainWindow, {
        title: '保存文件',
        defaultPath: name,
        filters: [
            { name: 'Excel文件', extensions: ['xlsx'] },
            { name: '所有文件', extensions: ['*'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePath) {
            const buffer = Buffer.from(data, 'base64');
            fs.writeFile(result.filePath, buffer, (err) => {
                if (err) {
                    dialog.showErrorBox('错误', '保存文件失败: ' + err.message);
                    event.reply('save-file-result', { success: false, error: err.message });
                } else {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: '成功',
                        message: '文件保存成功！',
                        buttons: ['确定']
                    });
                    event.reply('save-file-result', { success: true });
                }
            });
        }
    }).catch(err => {
        console.error('保存文件对话框失败:', err);
        event.reply('save-file-result', { success: false, error: err.message });
    });
});

// 应用准备就绪
app.whenReady().then(() => {
    // 先启动HTTP服务器
    startHttpServer();
    
    // 等待服务器启动后再创建窗口
    setTimeout(() => {
        createWindow();
    }, 500);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 所有窗口关闭时退出
app.on('window-all-closed', () => {
    // 关闭HTTP服务器
    if (httpServer) {
        httpServer.close(() => {
            console.log('✅ HTTP服务器已关闭');
        });
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    dialog.showErrorBox('错误', '应用程序发生错误: ' + error.message);
});
