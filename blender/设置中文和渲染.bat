@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════════════════════
echo Blender 中文化和一键渲染设置
echo ════════════════════════════════════════════════════════════
echo.

echo [1/2] 启动Blender并应用设置...
"C:\MyApps\BlenderCustom\MyBlender.exe" --python "%~dp0blender_setup.py"

echo.
echo [2/2] 设置完成！
echo.
echo ✓ 界面已改为中文
echo ✓ 按 F12 一键渲染到桌面
echo.
pause

