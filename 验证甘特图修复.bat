@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   🧪 验证甘特图数据持久化修复
echo ========================================
echo.
echo ✅ 已修复的功能：
echo   1. 添加任务 → 自动保存到LocalStorage
echo   2. 编辑任务 → 自动保存到LocalStorage
echo   3. 删除任务 → 自动保存到LocalStorage
echo   4. 切换项目 → 优先从LocalStorage加载
echo   5. 数据隔离 → 每个项目独立存储
echo.
echo 📋 测试步骤：
echo   1. 打开甘特图页面
echo   2. 添加一个新任务
echo   3. 切换到其他项目
echo   4. 切换回原项目
echo   5. ✅ 任务应该还在
echo.
echo 🔍 打开浏览器控制台查看日志：
echo   [Gantt] 💾 已保存 X 个任务到LocalStorage
echo   [Gantt] 📦 从LocalStorage加载 X 个任务
echo.
echo 按任意键继续启动系统...
pause > nul

cd client
echo.
echo 🚀 正在启动前端服务...
echo.
set PORT=3001
start /B npm start

timeout /t 3 > nul
start "" "http://localhost:3001"

echo.
echo ✅ 系统已启动！
echo.
echo 📝 查看详细测试说明：
echo    测试甘特图数据持久化.md
echo.
pause




chcp 65001 > nul
echo.
echo ========================================
echo   🧪 验证甘特图数据持久化修复
echo ========================================
echo.
echo ✅ 已修复的功能：
echo   1. 添加任务 → 自动保存到LocalStorage
echo   2. 编辑任务 → 自动保存到LocalStorage
echo   3. 删除任务 → 自动保存到LocalStorage
echo   4. 切换项目 → 优先从LocalStorage加载
echo   5. 数据隔离 → 每个项目独立存储
echo.
echo 📋 测试步骤：
echo   1. 打开甘特图页面
echo   2. 添加一个新任务
echo   3. 切换到其他项目
echo   4. 切换回原项目
echo   5. ✅ 任务应该还在
echo.
echo 🔍 打开浏览器控制台查看日志：
echo   [Gantt] 💾 已保存 X 个任务到LocalStorage
echo   [Gantt] 📦 从LocalStorage加载 X 个任务
echo.
echo 按任意键继续启动系统...
pause > nul

cd client
echo.
echo 🚀 正在启动前端服务...
echo.
set PORT=3001
start /B npm start

timeout /t 3 > nul
start "" "http://localhost:3001"

echo.
echo ✅ 系统已启动！
echo.
echo 📝 查看详细测试说明：
echo    测试甘特图数据持久化.md
echo.
pause




