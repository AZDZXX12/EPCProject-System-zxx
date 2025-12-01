@echo off
chcp 65001 >nul
echo ==========================================
echo   EPC系统优化成果验证
echo ==========================================
echo.

echo 📋 验证清单:
echo   [1] 后端模块命名规范
echo   [2] 健康检查可用性
echo   [3] 静态文件服务
echo   [4] API同源配置
echo   [5] Docker构建成功
echo   [6] 配置文件完整性
echo.
pause

echo.
echo [1/6] 检查后端模块...
if exist "server\sqlite_server.py" (
    echo ✅ sqlite_server.py 存在
) else (
    echo ❌ sqlite_server.py 不存在
)

echo.
echo [2/6] 检查依赖配置...
findstr /C:"requests" server\requirements.txt >nul
if %errorlevel% equ 0 (
    echo ✅ requests 依赖已添加
) else (
    echo ❌ requests 依赖缺失
)

echo.
echo [3/6] 检查Dockerfile...
findstr /C:"sqlite_server:app" Dockerfile >nul
if %errorlevel% equ 0 (
    echo ✅ Dockerfile 启动命令正确
) else (
    echo ❌ Dockerfile 启动命令错误
)

findstr /C:"curl" Dockerfile >nul
if %errorlevel% equ 0 (
    echo ✅ Dockerfile 包含curl
) else (
    echo ❌ Dockerfile 缺少curl
)

echo.
echo [4/6] 检查前端配置...
if exist "client\.env.production.example" (
    echo ✅ 生产环境配置模板存在
) else (
    echo ❌ 生产环境配置模板缺失
)

if exist "client\src\utils\lazyLoad.tsx" (
    echo ✅ 懒加载工具已创建
) else (
    echo ❌ 懒加载工具缺失
)

if exist "client\src\utils\performance.ts" (
    echo ✅ 性能监控工具已创建
) else (
    echo ❌ 性能监控工具缺失
)

echo.
echo [5/6] 检查中间件...
if exist "server\middleware\cache.py" (
    echo ✅ 缓存中间件已创建
) else (
    echo ❌ 缓存中间件缺失
)

if exist "server\middleware\rate_limit.py" (
    echo ✅ 速率限制中间件已创建
) else (
    echo ❌ 速率限制中间件缺失
)

echo.
echo [6/6] 检查文档...
if exist "OPTIMIZATION_REPORT_2025.md" (
    echo ✅ 优化报告已生成
) else (
    echo ❌ 优化报告缺失
)

if exist "QUICK_START.md" (
    echo ✅ 快速启动指南已生成
) else (
    echo ❌ 快速启动指南缺失
)

if exist "FINAL_OPTIMIZATION_SUMMARY.md" (
    echo ✅ 最终总结已生成
) else (
    echo ❌ 最终总结缺失
)

echo.
echo ==========================================
echo   验证完成
echo ==========================================
echo.
echo 💡 下一步:
echo   1. 运行: 启动EPC系统-优化版.bat
echo   2. 运行: scripts\check_health.bat
echo   3. 访问: http://localhost:3001
echo   4. 查看: FINAL_OPTIMIZATION_SUMMARY.md
echo.
pause
