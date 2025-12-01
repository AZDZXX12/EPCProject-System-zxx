@echo off
chcp 65001 >nul
echo ========================================
echo    EPC项目管理系统 - 优化版启动脚本
echo ========================================
echo.

:: 检查Python环境
echo [1/4] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请先安装Python 3.9+
    pause
    exit /b 1
)
echo ✅ Python环境正常

:: 检查Node.js环境
echo.
echo [2/4] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js 16+
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

:: 启动后端服务器
echo.
echo [3/4] 启动后端服务器...
cd server
if not exist venv (
    echo 首次运行，创建虚拟环境...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echo 启动SQLite后端服务器（端口8000）...
start "EPC后端服务器" cmd /k "python sqlite_server.py"
timeout /t 3 /nobreak >nul
cd ..

:: 启动前端开发服务器
echo.
echo [4/4] 启动前端开发服务器...
cd client
if not exist node_modules (
    echo 首次运行，安装依赖...
    npm install
)

echo 启动React前端（端口3001）...
start "EPC前端服务器" cmd /k "npm start"

echo.
echo ========================================
echo ✅ 系统启动完成！
echo ========================================
echo.
echo 📌 访问地址:
echo    前端: http://localhost:3001
echo    后端: http://localhost:8000
echo    API文档: http://localhost:8000/docs
echo    健康检查: http://localhost:8000/health
echo.
echo 💡 提示:
echo    - 前端会自动打开浏览器
echo    - 默认账号: admin / admin123
echo    - 按Ctrl+C可停止服务
echo.
echo ========================================
pause
