@echo off
chcp 65001 >nul
echo ========================================
echo 🤖 AI代码助手 - 快速配置
echo ========================================
echo.

echo 📋 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Python，请先安装Python 3.7+
    echo 📥 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python已安装

echo.
echo 📦 安装依赖包...
pip install requests
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装成功

echo.
echo ========================================
echo ✅ 配置完成！
echo ========================================
echo.
echo 📝 下一步:
echo 1. 获取Gemini API Key: https://makersuite.google.com/app/apikey
echo 2. 编辑 ai_code_helper.py，填入你的API Key
echo 3. 运行: python ai_code_helper.py
echo.
echo 📖 详细说明请查看: AI_CODE_HELPER_README.md
echo.
pause
