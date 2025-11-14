@echo off
chcp 65001 >nul
echo ========================================
echo   后端白名单API - 推送到GitHub
echo ========================================
echo.
echo 正在推送代码...
echo.

cd /d "%~dp0"
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ 推送成功！
    echo ========================================
    echo.
    echo Render会在5-10分钟内自动部署
    echo 部署完成后访问：
    echo https://luckysheet-backend.onrender.com/api/selections/whitelist/
    echo.
    echo 应该返回：{"whitelist": ["18968563368"]}
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ 推送失败 - 网络连接问题
    echo ========================================
    echo.
    echo 请尝试以下方案：
    echo.
    echo 1. 使用GitHub Desktop（推荐）
    echo    下载地址：https://desktop.github.com/
    echo.
    echo 2. 使用VPN/代理后重试
    echo.
    echo 3. 稍后网络稳定时再次运行此文件
    echo.
    echo 详细说明请查看：🚨紧急-404错误解决方案.md
    echo.
)

pause

