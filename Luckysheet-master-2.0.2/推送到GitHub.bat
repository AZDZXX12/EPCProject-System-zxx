@echo off
chcp 65001 > nul
echo ========================================
echo 推送代码到 GitHub
echo ========================================
echo.
echo 正在推送...
echo.

git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ 推送成功！
) else (
    echo ❌ 推送失败，请检查网络连接
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub 访问受限
    echo 3. 需要配置代理
)

echo.
pause


