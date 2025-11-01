@echo off
chcp 65001 > nul
cls

echo ========================================
echo   化工项目管理系统 - Electron 桌面版
echo ========================================
echo.

echo [Step 1/2] 检查依赖...
if not exist "node_modules\electron" (
    echo     正在安装 Electron...
    call npm install
)
echo     ✅ Electron 已安装
echo.

echo [Step 2/2] 启动桌面应用...
echo.
echo 💡 提示：
echo   - 按 F12 打开开发者工具
echo   - 按 F5 刷新页面
echo   - 应用会加载 client/public/ 下的文件
echo.
echo ========================================
echo.

npm start

pause

