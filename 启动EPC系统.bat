@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    EPC项目管理系统 - 一键启动
echo ========================================
echo.

echo [1/3] 启动后端服务 (端口 8000)...
cd server
start "EPC后端服务" cmd /k "python quick-start.py"
timeout /t 3 /nobreak >nul

echo [2/3] 启动前端服务 (端口 3001)...
cd ..\client
start "EPC前端服务" cmd /k "set PORT=3001 && npm start"

echo [3/3] 等待服务启动...
timeout /t 10 /nobreak >nul

echo.
echo ✅ 系统启动完成！
echo.
echo 📌 访问地址: http://localhost:3001
echo 📌 后端API: http://localhost:8000
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:3001

echo.
echo 提示: 关闭此窗口不会停止服务
echo 要停止服务，请关闭"EPC后端服务"和"EPC前端服务"窗口
echo.
pause

