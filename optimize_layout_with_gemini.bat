@echo off
chcp 65001 >nul
echo ========================================
echo 🤖 使用Gemini 2.5 Pro优化项目布局
echo ========================================
echo.

REM 激活虚拟环境
call aider_env\Scripts\activate

echo ✅ 环境已激活
echo 🤖 使用模型: Gemini 2.5 Pro
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
echo 🎯 开始布局优化分析
echo ========================================
echo.

REM 使用Aider分析项目结构
echo 📊 分析项目结构...
aider --model gemini/gemini-2.5-pro --show-repo-map

echo.
echo 🔍 开始交互式布局优化...
echo.
echo 💡 建议的优化指令:
echo   1. 分析当前布局问题
echo   2. 优化响应式设计
echo   3. 改进用户体验
echo   4. 统一设计语言
echo.

REM 启动交互式Aider
aider --model gemini/gemini-2.5-pro ^
  --config aider_config.yml ^
  client/src/pages/Workspace.tsx ^
  client/src/components/AIAssistant/AIAssistantPanel.tsx ^
  client/src/App.tsx ^
  client/src/index.css

echo.
echo 👋 布局优化完成
pause
