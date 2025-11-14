@echo off
title 电缆选型工具 - 开发服务器
cd /d "%~dp0frontend"
cls
echo ========================================
echo     电缆选型工具 - 启动中
echo ========================================
echo.
echo 正在启动 Vite 开发服务器...
echo 请稍候 10-20 秒...
echo.
npm run dev
pause

