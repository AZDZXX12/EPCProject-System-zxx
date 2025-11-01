@echo off
chcp 65001 >nul
echo ========================================
echo    EPC项目管理系统 - 前端启动脚本
echo ========================================
echo.
echo 正在启动前端开发服务器...
echo 端口: 3001
echo.

cd /d %~dp0
set PORT=3001
npm start

pause




