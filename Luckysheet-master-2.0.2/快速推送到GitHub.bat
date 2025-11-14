@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo   Luckysheet 选型系统 - GitHub 推送助手
echo ═══════════════════════════════════════════════════════
echo.

echo 📋 本脚本将帮助你把代码推送到 GitHub
echo.

REM 检查是否已安装 Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Git，请先安装 Git
    echo 下载地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git 已安装
echo.

REM 检查是否已经初始化
if exist ".git" (
    echo 📂 Git 仓库已存在
) else (
    echo 🔧 初始化 Git 仓库...
    git init
    git branch -M main
)

echo.
echo ══════════════════════════════════════════════════════
echo   请输入你的 GitHub 仓库地址
echo ══════════════════════════════════════════════════════
echo.
echo 示例：https://github.com/用户名/仓库名.git
echo.

set /p REPO_URL="请输入 GitHub 仓库地址: "

if "%REPO_URL%"=="" (
    echo ❌ 错误：仓库地址不能为空
    pause
    exit /b 1
)

echo.
echo 🔗 设置远程仓库...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo 📦 添加所有文件...
git add .

echo.
set /p COMMIT_MSG="请输入提交信息（默认：初始提交）: "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=初始提交 - Luckysheet选型系统

echo.
echo 💾 提交更改...
git commit -m "%COMMIT_MSG%"

echo.
echo 🚀 推送到 GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════
    echo   ✅ 成功推送到 GitHub！
    echo ═══════════════════════════════════════════════════════
    echo.
    echo 📋 下一步：
    echo    1. 访问 https://render.com 部署后端
    echo    2. 访问 https://vercel.com 部署前端
    echo.
    echo 📖 详细步骤请查看：部署指南.md
    echo.
) else (
    echo.
    echo ❌ 推送失败！请检查：
    echo    1. GitHub 仓库是否已创建
    echo    2. 仓库地址是否正确
    echo    3. 是否已登录 GitHub（可能需要输入用户名密码）
    echo.
)

pause

