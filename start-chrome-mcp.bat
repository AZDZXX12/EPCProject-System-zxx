@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 Chrome DevTools MCP 启动器
echo ========================================
echo.
echo 选择要启动的MCP服务器:
echo.
echo [1] Puppeteer MCP - 浏览器自动化
echo     - 页面导航和交互
echo     - 截图和PDF生成
echo     - JavaScript执行
echo     - 网络请求监控
echo.
echo [2] Chrome Inspector MCP - CSS检查
echo     - CSS样式检查
echo     - DOM元素分析
echo     - 实时调试
echo.
echo [3] 查看MCP配置
echo.
echo [4] 测试Chrome连接
echo.
echo [0] 退出
echo.
echo ========================================
set /p choice="请输入选项 (0-4): "

if "%choice%"=="1" goto puppeteer
if "%choice%"=="2" goto inspector
if "%choice%"=="3" goto config
if "%choice%"=="4" goto test
if "%choice%"=="0" goto end
goto invalid

:puppeteer
echo.
echo ========================================
echo   ✅ 启动Puppeteer MCP服务器...
echo ========================================
echo.
echo 功能: 浏览器自动化、截图、网络监控
echo 端口: 自动分配
echo.
echo 按 Ctrl+C 停止服务器
echo.
npx -y @modelcontextprotocol/server-puppeteer
goto end

:inspector
echo.
echo ========================================
echo   ✅ 启动Chrome Inspector MCP服务器...
echo ========================================
echo.
echo 功能: CSS检查、DOM分析、样式调试
echo 端口: 自动分配
echo.
echo 按 Ctrl+C 停止服务器
echo.
npx -y chrome-inspector-mcp
goto end

:config
echo.
echo ========================================
echo   📋 MCP配置信息
echo ========================================
echo.
echo 配置文件: mcp-config.json
echo.
type mcp-config.json
echo.
echo ========================================
pause
goto end

:test
echo.
echo ========================================
echo   🧪 测试Chrome连接
echo ========================================
echo.
echo 检查Chrome安装...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo ✅ Chrome已安装: C:\Program Files\Google\Chrome\Application\chrome.exe
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo ✅ Chrome已安装: C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
) else (
    echo ❌ Chrome未找到，请安装Chrome浏览器
)
echo.
echo 检查Node.js...
node --version >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Node.js已安装
    node --version
) else (
    echo ❌ Node.js未安装
)
echo.
echo 检查npm...
npm --version >nul 2>&1
if %errorlevel%==0 (
    echo ✅ npm已安装
    npm --version
) else (
    echo ❌ npm未安装
)
echo.
echo ========================================
pause
goto end

:invalid
echo.
echo ❌ 无效选项，请重新运行脚本
pause
goto end

:end
echo.
echo 感谢使用Chrome DevTools MCP！
echo.
