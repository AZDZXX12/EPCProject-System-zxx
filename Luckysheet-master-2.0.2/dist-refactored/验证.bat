@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo    重构验证报告
echo ========================================
echo.

echo 正在检查文件...
echo.

if exist "index.html" (
    echo ✅ index.html 存在
) else (
    echo ❌ index.html 不存在
)

if exist "js\modules\legacy.js" (
    echo ✅ legacy.js 存在
    for %%A in ("js\modules\legacy.js") do echo    大小: %%~zA 字节
) else (
    echo ❌ legacy.js 不存在
)

if exist "js\config\tableConfig.js" (
    echo ✅ tableConfig.js 存在
) else (
    echo ❌ tableConfig.js 不存在
)

if exist "css\app.css" (
    echo ✅ app.css 存在
) else (
    echo ❌ app.css 不存在
)

echo.
echo ========================================
echo 验证完成！
echo ========================================
echo.
echo 如所有文件都存在，可以直接打开 index.html 使用
echo.
pause


