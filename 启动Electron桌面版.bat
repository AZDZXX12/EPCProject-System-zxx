@echo off
chcp 65001 > nul
cls

echo ========================================
echo   化工项目管理系统 - 桌面版
echo   Chemical Project Management - Desktop
echo ========================================
echo.

:: 检查Node.js
echo [1/5] 检查环境...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ Node.js 未安装！
    echo     请从 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)
echo     ✅ Node.js 已安装
echo.

:: 检查Electron是否安装
echo [2/5] 检查Electron...
if not exist "node_modules\electron" (
    echo     ⚠️ Electron 未安装，正在安装...
    call npm install
    if %errorlevel% neq 0 (
        echo     ❌ 安装失败！
        pause
        exit /b 1
    )
    echo     ✅ Electron 安装完成
) else (
    echo     ✅ Electron 已安装
)
echo.

:: 启动前端开发服务器
echo [3/5] 启动前端开发服务器...
start "前端服务器" cmd /k "cd client && npm start"
echo     ✅ 前端服务器启动中...
echo.

:: 等待前端启动
echo [4/5] 等待前端服务器就绪（15秒）...
timeout /t 15 /nobreak > nul
echo     ✅ 前端应该已就绪
echo.

:: 启动Electron
echo [5/5] 启动Electron桌面应用...
echo.
echo ========================================
echo   桌面应用启动中...
echo ========================================
echo.
echo 💡 提示：
echo   - 前端服务器窗口会保持运行
echo   - 关闭桌面应用后可关闭前端窗口
echo   - 按 F12 打开开发者工具
echo   - 按 F5 刷新页面
echo.

set NODE_ENV=development
electron .

echo.
echo 桌面应用已关闭
pause

