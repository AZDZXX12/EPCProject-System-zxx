@echo off
chcp 65001 >nul
title 设备参数选型系统
cls

echo.
echo ========================================
echo    设备参数选型系统 - 启动中
echo ========================================
echo.

:: 显示当前目录
echo 当前目录: %CD%
echo.

:: 进入dist-refactored目录
if exist "dist-refactored" (
    cd dist-refactored
    echo [OK] 已进入 dist-refactored 目录
) else (
    echo [错误] 找不到 dist-refactored 目录
    pause
    exit /b 1
)

echo.
echo [1/3] 检查环境...

:: 检查Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python 已安装
    goto start_python
)

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Node.js 已安装
    goto start_node
)

:: 都没有安装
echo [错误] 未检测到 Python 或 Node.js
echo.
echo 请先安装以下任意一个：
echo   Python: https://www.python.org/downloads/
echo   Node.js: https://nodejs.org/
echo.
pause
exit /b 1

:start_python
echo.
echo [2/3] 启动 Python HTTP 服务器...
echo.
echo 服务器地址: http://localhost:8000/index.html
echo.
echo [提示] 
echo   - 浏览器将在 2 秒后自动打开
echo   - 按 Ctrl+C 可以停止服务器
echo   - 关闭此窗口也会停止服务器
echo.
echo ========================================
echo.

:: 等待2秒
timeout /t 2 /nobreak >nul

echo [3/3] 打开浏览器...
start http://localhost:8000/index.html

echo.
echo [服务器运行中...] 请勿关闭此窗口
echo.

:: 启动服务器
python -m http.server 8000
goto end

:start_node
echo.
echo [2/3] 启动 Node.js HTTP 服务器...
echo.
echo 服务器地址: http://localhost:8000/index.html
echo.
echo [提示] 
echo   - 浏览器将在 2 秒后自动打开
echo   - 按 Ctrl+C 可以停止服务器
echo   - 关闭此窗口也会停止服务器
echo.
echo ========================================
echo.

:: 等待2秒
timeout /t 2 /nobreak >nul

echo [3/3] 打开浏览器...
start http://localhost:8000/index.html

echo.
echo [服务器运行中...] 请勿关闭此窗口
echo.

:: 启动服务器
npx -y http-server -p 8000
goto end

:end
pause


