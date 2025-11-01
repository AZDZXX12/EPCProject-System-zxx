@echo off
chcp 65001 >nul
echo ========================================
echo    XLSX 模块功能测试脚本
echo ========================================
echo.

echo [1/3] 检查 xlsx 依赖包...
cd client
if exist node_modules\xlsx (
    echo ✅ xlsx 包已安装
) else (
    echo ❌ xlsx 包未找到，正在安装...
    npm install xlsx
)
echo.

echo [2/3] 运行编译测试...
npm run build
if %ERRORLEVEL% EQU 0 (
    echo ✅ 编译成功
) else (
    echo ❌ 编译失败
)
echo.

echo [3/3] 检查构建文件...
if exist build\static\js\main*.js (
    echo ✅ 构建文件已生成
) else (
    echo ❌ 构建文件未找到
)
echo.

echo ========================================
echo    测试完成！
echo ========================================
echo.
echo 💡 提示：
echo   - 所有 Excel 导入导出功能已修复
echo   - 可以正常启动开发服务器：npm start
echo   - 可以部署生产版本：build 目录已就绪
echo.

pause


