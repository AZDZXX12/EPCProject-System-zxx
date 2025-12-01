@echo off
chcp 65001 >nul
echo ========================================
echo 🤖 Aider + Gemini 启动器
echo ========================================
echo.

REM 激活Python 3.11虚拟环境
call aider_env\Scripts\activate

echo ✅ Python环境已激活
python --version

echo.
echo 📋 请输入你的Gemini API Key:
echo 💡 获取地址: https://makersuite.google.com/app/apikey
set /p GEMINI_API_KEY="API Key: "

if "%GEMINI_API_KEY%"=="" (
    echo ❌ API Key不能为空
    pause
    exit /b 1
)

REM 设置环境变量
set GEMINI_API_KEY=%GEMINI_API_KEY%

echo.
echo ========================================
echo 🚀 启动Aider + Gemini
echo ========================================
echo.
echo 💡 使用提示:
echo   /add client/src/pages/Workspace.tsx  - 添加文件
echo   给AI窗口添加最小化功能             - 自然语言指令
echo   /diff                              - 查看修改
echo   /commit                            - 提交修改
echo   /exit                              - 退出
echo.

REM 启动Aider
aider --model gemini/gemini-pro

echo.
echo 👋 Aider已退出
pause
