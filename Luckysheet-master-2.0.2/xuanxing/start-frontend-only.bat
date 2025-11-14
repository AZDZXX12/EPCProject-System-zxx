@echo off
REM 纯前端启动脚本（Windows）

echo ======================================
echo 启动电缆选型工具（纯前端版本）
echo ======================================

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未安装Node.js
    echo 请从 https://nodejs.org 下载安装
    pause
    exit /b 1
)

REM 进入前端目录
cd frontend

REM 检查是否已安装依赖
if not exist "node_modules\" (
    echo 首次运行，正在安装依赖...
    call npm install
)

REM 启动开发服务器
echo.
echo 启动开发服务器...
echo.
call npm run dev

pause

