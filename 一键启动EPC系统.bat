@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo    EPC项目管理系统 - 一键启动
echo ========================================
echo.

echo [1/3] 停止旧进程...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] 启动后端 (SQLite数据库)...
cd server
start "EPC后端" cmd /k "python -m uvicorn sqlite-server:app --host 127.0.0.1 --port 8000 --reload"
cd ..
timeout /t 3 /nobreak >nul

echo [3/3] 启动前端 (React应用)...
cd client
start "EPC前端" cmd /k "npm start"
cd ..

echo.
echo ✅ 系统启动中...
echo.
echo 📌 后端: http://localhost:8000
echo 📌 前端: http://localhost:3001 (编译需要30-60秒)
echo 📌 API文档: http://localhost:8000/docs
echo.
echo 💡 提示: 前端编译完成后会自动打开浏览器
echo.
echo 等待40秒后自动打开浏览器...
timeout /t 40 /nobreak

start http://localhost:3001

echo.
echo ✅ 浏览器已打开
echo.
pause



