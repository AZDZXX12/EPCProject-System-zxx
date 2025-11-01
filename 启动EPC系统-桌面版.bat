@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   EPC项目管理系统 - 桌面版启动
echo ========================================
echo.
echo 正在启动...
echo.

npx electron main-dev.js

echo.
echo 如窗口未弹出，请检查上方错误信息
pause


