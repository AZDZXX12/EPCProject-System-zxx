@echo off
chcp 65001 >nul
echo ========================================
echo 🤖 Aider + Gemini 快速启动
echo ========================================
echo.

REM 检查Docker是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Docker，请先安装Docker Desktop
    echo 📥 下载地址: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo ✅ Docker已安装

echo.
echo 📋 请输入你的Gemini API Key:
echo 💡 获取地址: https://makersuite.google.com/app/apikey
set /p GEMINI_API_KEY="API Key: "

if "%GEMINI_API_KEY%"=="" (
    echo ❌ API Key不能为空
    pause
    exit /b 1
)

echo.
echo 🔨 构建Aider Docker镜像...
docker build -f Dockerfile.aider -t aider-gemini .
if %errorlevel% neq 0 (
    echo ❌ Docker镜像构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🚀 启动Aider + Gemini
echo ========================================
echo.
echo 💡 使用提示:
echo   /add client/src/pages/Workspace.tsx  - 添加文件
echo   修改AI窗口，添加最小化功能          - 自然语言指令
echo   /diff                              - 查看修改
echo   /commit                            - 提交修改
echo   /exit                              - 退出
echo.

REM 启动Aider容器
docker run -it --rm ^
    -v "%cd%":/workspace ^
    -e GEMINI_API_KEY=%GEMINI_API_KEY% ^
    aider-gemini

echo.
echo 👋 Aider已退出
pause
