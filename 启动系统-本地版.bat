@echo off
chcp 65001 >nul
title EPC项目管理系统 - 本地版启动
color 0A

echo.
echo ========================================
echo   EPC项目管理系统 - 本地版
echo ========================================
echo.
echo 正在启动系统...
echo.

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装！
    pause
    exit /b 1
)

REM 检查Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到Python，请先安装！
    pause
    exit /b 1
)

echo ✅ Node.js 已检测
echo ✅ Python 已检测
echo.

REM 启动后端（SQLite本地数据库）
echo [1/2] 启动后端服务 (端口8000)...
cd server
start "EPC后端服务" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
cd ..
timeout /t 3 /nobreak >nul

REM 启动前端
echo [2/2] 启动前端服务 (端口3001)...
cd client
start "EPC前端服务" cmd /k "set PORT=3001 && npm start"
cd ..

echo.
echo ========================================
echo   系统启动完成！
echo ========================================
echo.
echo 📊 前端地址: http://localhost:3001
echo 🔧 后端API: http://localhost:8000/docs
echo 💾 数据库: SQLite本地文件
echo    位置: %%APPDATA%%\EPC项目管理系统\database\epc_data.db
echo.
echo 💡 说明:
echo    - 所有数据保存在本地SQLite数据库
echo    - 可通过"数据库管理"页面查看/备份
echo    - 支持随时切换为在线部署模式
echo.
echo 按任意键等待5秒后自动打开浏览器...
timeout /t 5 /nobreak >nul

REM 打开浏览器
start http://localhost:3001

echo.
echo 🎉 浏览器已打开，请登录系统
echo.
echo 关闭此窗口将保持服务运行
echo 如需停止服务，请关闭两个命令行窗口
pause


