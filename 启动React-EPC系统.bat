@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 启动EPC React系统...
echo.

cd client
start "EPC前端" cmd /k "set PORT=3001 && npx react-scripts start"

cd ..\server
start "EPC后端" cmd /k "python quick-start.py"

echo.
echo 等待30秒后自动打开浏览器...
timeout /t 30 /nobreak
start http://localhost:3001

echo.
echo 系统已启动
pause



