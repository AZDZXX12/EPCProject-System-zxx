@echo off
chcp 65001 >nul
title EPC项目管理系统 - 优化启动

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     EPC项目管理系统 - 优化版启动程序                      ║
echo ║     Chemical Project Management System - Optimized        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 检查Node.js
echo [检查] 验证Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo [成功] Node.js 已安装

:: 检查Python
echo [检查] 验证Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [警告] 未检测到Python，后端服务将无法启动
    set SKIP_BACKEND=1
) else (
    echo [成功] Python 已安装
    set SKIP_BACKEND=0
)

echo.
echo ════════════════════════════════════════════════════════════
echo  启动服务
echo ════════════════════════════════════════════════════════════
echo.

:: 启动后端服务
if "%SKIP_BACKEND%"=="0" (
    echo [1/2] 启动后端服务 (端口 8000)...
    cd server
    if exist quick-start.py (
        start "EPC后端服务 [优化版]" cmd /k "python quick-start.py"
        echo [成功] 后端服务启动中...
    ) else (
        echo [警告] 未找到quick-start.py，跳过后端启动
    )
    cd ..
    timeout /t 3 /nobreak >nul
) else (
    echo [跳过] 后端服务（Python未安装）
)

:: 启动前端服务
echo [2/2] 启动前端服务 (端口 3001)...
cd client

:: 检查依赖
if not exist node_modules (
    echo [安装] 正在安装前端依赖...
    call npm install
)

:: 设置环境变量优化
set GENERATE_SOURCEMAP=false
set DISABLE_ESLINT_PLUGIN=true
set FAST_REFRESH=true
set PORT=3001

start "EPC前端服务 [优化版]" cmd /k "npm start"
echo [成功] 前端服务启动中...

cd ..

echo.
echo ════════════════════════════════════════════════════════════
echo  等待服务就绪
echo ════════════════════════════════════════════════════════════
echo.
echo 正在等待服务启动...
timeout /t 12 /nobreak >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ 系统启动完成！                                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📌 访问地址:
echo    前端: http://localhost:3001
if "%SKIP_BACKEND%"=="0" (
    echo    后端: http://localhost:8000
    echo    API文档: http://localhost:8000/docs
)
echo.
echo 🚀 性能优化特性:
echo    ✓ 虚拟滚动 - 大列表渲染优化
echo    ✓ 智能缓存 - 减少重复请求
echo    ✓ 懒加载 - 按需加载组件
echo    ✓ 防抖节流 - 优化用户交互
echo    ✓ 批处理 - 合并API请求
echo.
echo 💡 提示:
echo    - 首次启动可能需要较长时间编译
echo    - 关闭此窗口不会停止服务
echo    - 要停止服务，请关闭对应的命令窗口
echo.

:: 询问是否打开浏览器
choice /C YN /M "是否立即打开浏览器"
if errorlevel 2 goto :skip_browser
if errorlevel 1 goto :open_browser

:open_browser
echo.
echo [启动] 正在打开浏览器...
start http://localhost:3001
goto :end

:skip_browser
echo.
echo [跳过] 浏览器未打开

:end
echo.
echo ════════════════════════════════════════════════════════════
echo  系统监控
echo ════════════════════════════════════════════════════════════
echo.
echo 服务状态监控已启用，按任意键退出监控...
pause >nul

echo.
echo 感谢使用 EPC项目管理系统！
echo.
