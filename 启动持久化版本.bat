@echo off
chcp 65001 >nul
echo ========================================
echo   EPC项目管理系统 - SQLite持久化版本
echo ========================================
echo.
echo 正在启动后端服务器（SQLite数据库）...
start "后端服务器-SQLite" cmd /k "cd server && python quick-start-sqlite.py"
timeout /t 3 /nobreak >nul

echo 正在启动前端服务器...
start "前端服务器" cmd /k "cd client && npm start"

echo.
echo ========================================
echo 系统启动中，请稍候...
echo ========================================
echo.
echo 前端地址: http://localhost:3001
echo 后端地址: http://localhost:8000
echo 后端文档: http://localhost:8000/docs
echo.
echo 数据库: server/data/epc_system.db (持久化存储)
echo 备份目录: server/data/backup
echo.
echo 按任意键关闭此窗口...
pause >nul

chcp 65001 >nul
echo ========================================
echo   EPC项目管理系统 - SQLite持久化版本
echo ========================================
echo.
echo 正在启动后端服务器（SQLite数据库）...
start "后端服务器-SQLite" cmd /k "cd server && python quick-start-sqlite.py"
timeout /t 3 /nobreak >nul

echo 正在启动前端服务器...
start "前端服务器" cmd /k "cd client && npm start"

echo.
echo ========================================
echo 系统启动中，请稍候...
echo ========================================
echo.
echo 前端地址: http://localhost:3001
echo 后端地址: http://localhost:8000
echo 后端文档: http://localhost:8000/docs
echo.
echo 数据库: server/data/epc_system.db (持久化存储)
echo 备份目录: server/data/backup
echo.
echo 按任意键关闭此窗口...
pause >nul

