@echo off
chcp 65001 >nul
title EPC项目管理系统 - 桌面应用开发模式
color 0B

echo.
echo ========================================
echo   EPC项目管理系统 - 桌面应用模式
echo ========================================
echo.
echo 模式: Electron桌面窗口
echo 数据: SQLite本地数据库
echo.

REM 检查依赖
echo 正在检查依赖...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装！
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到Python，请先安装！
    pause
    exit /b 1
)

echo ✅ Node.js 已检测
echo ✅ Python 已检测
echo.

REM 检查Electron是否已安装
if not exist "node_modules\electron" (
    echo 🔧 首次运行，正在安装Electron...
    call npm install
    echo.
)

echo ========================================
echo   启动流程
echo ========================================
echo.
echo [1/3] 启动后端服务 (约2秒)
echo [2/3] 启动前端服务 (约30秒)
echo [3/3] 打开桌面应用窗口
echo.
echo 💡 说明:
echo   - 应用将在独立窗口中运行
echo   - 所有数据保存在本地SQLite数据库
echo   - 窗口大小: 1400x900
echo   - 自动打开开发者工具
echo.
echo ⏳ 请耐心等待约30秒，启动过程中请勿关闭窗口...
echo.

REM 启动Electron（使用开发主进程文件）
echo 🚀 正在启动桌面应用...
electron main-dev.js

echo.
echo 应用已关闭
pause


