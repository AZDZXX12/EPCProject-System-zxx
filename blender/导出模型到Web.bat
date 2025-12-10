@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🎨 Blender模型导出工具
echo ========================================
echo.
echo 📝 使用说明:
echo 1. 在Blender中打开或创建模型
echo 2. 运行此脚本
echo 3. 模型将自动导出到 public/models/
echo.
echo ========================================
echo.

set BLENDER_EXE=blender.exe
set SCRIPT_PATH=%~dp0快速导出模型到Web.py

echo 🔍 检查Blender...
where %BLENDER_EXE% >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Blender，请先安装或添加到PATH
    echo.
    echo 💡 提示: 运行 启动Blender.bat 来启动Blender
    pause
    exit /b 1
)

echo ✅ 找到Blender
echo.
echo 🚀 开始导出...
echo.

%BLENDER_EXE% --background --python "%SCRIPT_PATH%"

echo.
echo ========================================
echo   ✨ 导出完成！
echo ========================================
echo.
echo 📁 模型位置: public\models\
echo    ├─ industrial\    工业设备
echo    ├─ mechanical\    机械部件
echo    └─ environment\   环境元素
echo.
echo 🎯 下一步:
echo 1. 在数字孪生系统中使用这些模型
echo 2. 刷新浏览器查看效果
echo.
pause
