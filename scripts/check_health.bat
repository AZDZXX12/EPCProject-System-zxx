@echo off
chcp 65001 >nul
echo ==========================================
echo   EPC系统健康检查
echo ==========================================
echo.

echo [1/4] 检查后端服务...
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务正常
    curl -s http://localhost:8000/health
) else (
    echo ❌ 后端服务异常
)
echo.

echo [2/4] 检查前端服务...
curl -f http://localhost:3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务正常
) else (
    echo ❌ 前端服务异常
)
echo.

echo [3/4] 检查数据库...
curl -f http://localhost:8000/api/v1/database/info >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 数据库连接正常
    curl -s http://localhost:8000/api/v1/database/info
) else (
    echo ❌ 数据库连接异常
)
echo.

echo [4/4] 检查API...
curl -f http://localhost:8000/api/v1/projects >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API正常
) else (
    echo ❌ API异常
)
echo.

echo ==========================================
echo   健康检查完成
echo ==========================================
pause
