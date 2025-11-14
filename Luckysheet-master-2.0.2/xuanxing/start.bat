@echo off
REM 快速启动脚本（Windows）

echo ======================================
echo 启动电缆选型工具
echo ======================================

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未安装Docker
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未安装Docker Compose
    pause
    exit /b 1
)

REM 启动服务
echo 启动Docker容器...
docker-compose up -d

echo.
echo ======================================
echo 服务启动成功！
echo ======================================
echo 前端: http://localhost:3000
echo 后端API: http://localhost:8000/api
echo 管理后台: http://localhost:8000/admin
echo.
echo 查看日志: docker-compose logs -f
echo 停止服务: docker-compose down
echo ======================================
pause

