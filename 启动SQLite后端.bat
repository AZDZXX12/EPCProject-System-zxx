@echo off
chcp 65001 >nul
title EPC项目管理系统 - SQLite后端服务

echo ========================================
echo   EPC项目管理系统 - SQLite数据库版
echo ========================================
echo.
echo 正在启动后端服务...
echo 数据库: server\data\epc_system.db
echo API文档: http://localhost:8000/docs
echo.

cd server
python -m uvicorn sqlite-server:app --host 0.0.0.0 --port 8000 --reload

pause


