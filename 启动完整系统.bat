@echo off
chcp 65001 > nul
cls

echo ========================================
echo   化工项目管理系统 - 完整桌面版
echo   包含: 数字孪生+甘特图+设备选型
echo ========================================
echo.

:: 检查Node.js
echo [1/4] 检查环境...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ Node.js 未安装！
    pause
    exit /b 1
)
echo     ✅ Node.js 已安装
echo.

:: 检查依赖
echo [2/4] 检查依赖...
if not exist "node_modules\electron" (
    echo     正在安装根目录依赖...
    call npm install
)
if not exist "client\node_modules" (
    echo     正在安装前端依赖...
    cd client
    call npm install
    cd ..
)
echo     ✅ 依赖已安装
echo.

:: 启动React前端开发服务器
echo [3/4] 启动React前端服务器...
start "React前端" cmd /k "cd client && npm start"
echo     ✅ React服务器启动中...
echo     等待15秒让服务器就绪...
timeout /t 15 /nobreak > nul
echo.

:: 启动Electron（连接React）
echo [4/4] 启动Electron桌面应用...
echo.
echo ========================================
echo   桌面应用启动中...
echo ========================================
echo.
echo 💡 提示：
echo   - 会打开完整的化工项目管理系统
echo   - 包含：数字孪生、甘特图、设备管理
echo   - 设备选型已集成在菜单中
echo   - 按 F12 打开开发者工具
echo   - 按 F5 刷新页面
echo.
echo   登录信息：
echo   用户名：admin
echo   密码：admin123
echo.
echo ========================================
echo.

set ELECTRON_MODE=react
npm start

echo.
echo 桌面应用已关闭
pause

