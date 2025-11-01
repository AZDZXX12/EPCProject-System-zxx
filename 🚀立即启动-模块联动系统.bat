@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 EPC项目管理系统 - 模块联动版
echo ========================================
echo.
echo 📋 系统特性:
echo    ✅ 事件驱动架构
echo    ✅ 智能进度计算
echo    ✅ 多模块实时联动
echo    ✅ 本地数据持久化
echo.
echo ========================================
echo.

echo [1/4] 📦 检查依赖...
cd server
if not exist venv (
    echo    ❌ 未找到Python虚拟环境
    echo    💡 请先运行: python -m venv venv
    pause
    exit /b 1
)

cd ..\client
if not exist node_modules (
    echo    ❌ 未找到Node模块
    echo    💡 正在安装依赖...
    call npm install
)

cd ..

echo [2/4] 🔧 启动后端服务...
start "EPC后端服务" cmd /k "cd /d %cd%\server && venv\Scripts\activate && python sqlite-server.py"
timeout /t 3 >nul

echo [3/4] 🌐 启动前端服务...
start "EPC前端服务" cmd /k "cd /d %cd%\client && set PORT=3001 && npm start"
timeout /t 5 >nul

echo [4/4] 🌍 打开浏览器...
timeout /t 8 >nul
start "" "http://localhost:3001"

echo.
echo ========================================
echo   ✅ 系统启动完成！
echo ========================================
echo.
echo 📖 使用指南:
echo    1. 工作台 - 创建/管理项目
echo    2. 甘特图 - 查看任务进度
echo    3. 施工日志 - 记录施工情况
echo    4. 总包施工管理 - 管理EPC阶段
echo.
echo 🧪 测试模块联动:
echo    1. 更新甘特图任务进度
echo    2. 查看施工日志是否同步
echo    3. 检查工作台项目进度
echo    4. 按F12查看控制台事件日志
echo.
echo 📚 详细文档:
echo    - ✅模块联动优化完成报告.md
echo    - 🧪测试模块联动功能.md
echo    - 🚀项目整体优化方案-模块联动.md
echo.
echo 🛑 停止服务: 关闭命令行窗口即可
echo.
pause




chcp 65001 >nul
echo.
echo ========================================
echo   🚀 EPC项目管理系统 - 模块联动版
echo ========================================
echo.
echo 📋 系统特性:
echo    ✅ 事件驱动架构
echo    ✅ 智能进度计算
echo    ✅ 多模块实时联动
echo    ✅ 本地数据持久化
echo.
echo ========================================
echo.

echo [1/4] 📦 检查依赖...
cd server
if not exist venv (
    echo    ❌ 未找到Python虚拟环境
    echo    💡 请先运行: python -m venv venv
    pause
    exit /b 1
)

cd ..\client
if not exist node_modules (
    echo    ❌ 未找到Node模块
    echo    💡 正在安装依赖...
    call npm install
)

cd ..

echo [2/4] 🔧 启动后端服务...
start "EPC后端服务" cmd /k "cd /d %cd%\server && venv\Scripts\activate && python sqlite-server.py"
timeout /t 3 >nul

echo [3/4] 🌐 启动前端服务...
start "EPC前端服务" cmd /k "cd /d %cd%\client && set PORT=3001 && npm start"
timeout /t 5 >nul

echo [4/4] 🌍 打开浏览器...
timeout /t 8 >nul
start "" "http://localhost:3001"

echo.
echo ========================================
echo   ✅ 系统启动完成！
echo ========================================
echo.
echo 📖 使用指南:
echo    1. 工作台 - 创建/管理项目
echo    2. 甘特图 - 查看任务进度
echo    3. 施工日志 - 记录施工情况
echo    4. 总包施工管理 - 管理EPC阶段
echo.
echo 🧪 测试模块联动:
echo    1. 更新甘特图任务进度
echo    2. 查看施工日志是否同步
echo    3. 检查工作台项目进度
echo    4. 按F12查看控制台事件日志
echo.
echo 📚 详细文档:
echo    - ✅模块联动优化完成报告.md
echo    - 🧪测试模块联动功能.md
echo    - 🚀项目整体优化方案-模块联动.md
echo.
echo 🛑 停止服务: 关闭命令行窗口即可
echo.
pause




