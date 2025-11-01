@echo off
chcp 65001 >nul
cls
echo ========================================
echo   设备参数选型系统 - 本地服务器
echo ========================================
echo.
echo 正在启动本地服务器...
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] 使用Python启动服务器
    echo.
    echo 服务器地址: http://localhost:8000
    echo.
    echo 提示：
    echo  • 启动后会自动打开浏览器
    echo  • 关闭此窗口即可停止服务器
    echo  • 所有功能（主页面+Word编辑器+风机选型+电缆选型）均可正常使用
    echo.
    echo ========================================
    echo.
    
    :: 等待2秒后打开浏览器
    timeout /t 2 /nobreak >nul
    start http://localhost:8000/index.html
    
    :: 启动Python服务器
    python -m http.server 8000
    
) else (
    :: 如果没有Python，尝试使用Node.js
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo [√] 使用Node.js启动服务器
        echo.
        echo 服务器地址: http://localhost:8000
        echo.
        echo 提示：
        echo  • 启动后会自动打开浏览器
        echo  • 关闭此窗口即可停止服务器
        echo.
        echo ========================================
        echo.
        
        :: 等待2秒后打开浏览器
        timeout /t 2 /nobreak >nul
        start http://localhost:8000/index.html
        
        :: 使用npx http-server
        npx -y http-server -p 8000
        
    ) else (
        echo.
        echo [X] 错误：未找到Python或Node.js
        echo.
        echo 请安装以下任意一个：
        echo  • Python: https://www.python.org/downloads/
        echo  • Node.js: https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
)


