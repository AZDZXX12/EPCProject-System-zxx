@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   启动EPC系统后端 (快速版)
echo ========================================
echo.
echo 使用: quick-start.py (内存数据库)
echo 端口: 8000
echo.

cd server
..\server\venv\Scripts\python.exe quick-start.py

pause


