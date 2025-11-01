const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'client/public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    title: '化工项目管理系统',
    backgroundColor: '#f0f2f5',
    show: false, // 先隐藏，加载完成后显示
  });

  // 创建自定义菜单
  const menuTemplate = [
    {
      label: '文件',
      submenu: [
        {
          label: '刷新',
          accelerator: 'F5',
          click: () => mainWindow.reload(),
        },
        {
          label: '强制刷新',
          accelerator: 'Ctrl+Shift+R',
          click: () => mainWindow.webContents.reloadIgnoringCache(),
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: '查看',
      submenu: [
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        {
          label: '实际大小',
          accelerator: 'Ctrl+0',
          click: () => mainWindow.webContents.setZoomLevel(0),
        },
        {
          label: '放大',
          accelerator: 'Ctrl+=',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
          },
        },
        {
          label: '缩小',
          accelerator: 'Ctrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
          },
        },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: '化工项目管理系统',
              detail: 'Version: 1.0.0\n\n一个功能完善的化工设备安装项目管理系统\n\n© 2024 All Rights Reserved',
              buttons: ['确定'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // 加载应用
  // 开发模式：连接到React开发服务器
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 开发模式：连接到 http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    // 自动打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的文件
    console.log('📦 生产模式：加载本地文件');
    mainWindow.loadFile(path.join(__dirname, 'client/build/index.html'));
  }

  // 窗口加载完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ 窗口已显示');
  });

  // 窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 监听页面加载错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ 页面加载失败:', errorCode, errorDescription);
    if (process.env.NODE_ENV === 'development') {
      console.log('💡 提示：请确保前端开发服务器已启动 (npm start)');
    }
  });

  // 监听控制台消息
  mainWindow.webContents.on('console-message', (event, level, message) => {
    if (level === 3) { // 错误级别
      console.error('前端错误:', message);
    }
  });
}

// 启动后端服务（可选）
function startBackend() {
  console.log('🚀 正在启动后端服务...');
  
  const backendPath = path.join(__dirname, 'server');
  const pythonPath = path.join(backendPath, 'venv', 'Scripts', 'python.exe');
  const mainPy = path.join(backendPath, 'main.py');

  // 检查Python虚拟环境是否存在
  const fs = require('fs');
  if (!fs.existsSync(pythonPath)) {
    console.warn('⚠️ Python虚拟环境未找到，跳过后端启动');
    console.log('💡 提示：如需后端功能，请手动运行后端');
    return;
  }

  backendProcess = spawn(pythonPath, [
    '-m',
    'uvicorn',
    'main:app',
    '--host',
    '0.0.0.0',
    '--port',
    '8000',
  ], {
    cwd: backendPath,
    stdio: 'pipe',
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[后端] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[后端错误] ${data.toString().trim()}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`[后端] 进程退出，代码: ${code}`);
  });

  console.log('✅ 后端服务启动命令已执行');
}

// 当 Electron 完成初始化时
app.whenReady().then(() => {
  console.log('🎉 Electron 已就绪');
  
  // 启动后端（可选）
  // startBackend();
  
  // 创建窗口
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时
app.on('window-all-closed', () => {
  // 关闭后端进程
  if (backendProcess) {
    console.log('🛑 正在关闭后端服务...');
    backendProcess.kill();
  }
  
  // 在 macOS 上，通常应用不会完全退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出前
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

console.log('🚀 Electron 主进程已启动');
console.log('📁 工作目录:', __dirname);
console.log('🔧 环境:', process.env.NODE_ENV || 'development');

