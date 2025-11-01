@echo off
chcp 65001 >nul
title EPC项目管理系统 - 桌面预览
color 0B

echo.
echo ========================================
echo   EPC项目管理系统 - 桌面应用预览
echo ========================================
echo.

REM 设置工作目录
cd /d "%~dp0"

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js
    pause
    exit /b 1
)

REM 检查Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python
    pause
    exit /b 1
)

echo [OK] 依赖检查通过
echo.
echo 启动流程:
echo   [1/3] 后端服务 (2秒)
echo   [2/3] 前端服务 (30秒)
echo   [3/3] 桌面窗口
echo.
echo 请等待约30秒...
echo.

REM 使用npx运行Electron
npx electron main-dev.js

echo.
echo 应用已关闭
pause


