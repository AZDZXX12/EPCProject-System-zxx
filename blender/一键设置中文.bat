@echo off
chcp 65001 >nul
cls
echo.
echo ════════════════════════════════════════════════════════════
echo         一键设置Blender为中文界面
echo ════════════════════════════════════════════════════════════
echo.
echo 请先关闭所有Blender窗口！
echo.
pause

echo.
echo 正在设置中文界面...
"C:\MyApps\BlenderCustom\MyBlender.exe" --background --python set_chinese.py

echo.
echo ════════════════════════════════════════════════════════════
echo ✓ 设置完成！
echo ════════════════════════════════════════════════════════════
echo.
echo 现在请：
echo 1. 双击桌面的 "Blender 3.0.1" 图标打开Blender
echo 2. 菜单栏应该显示为中文了！
echo.
echo 如果还是英文，请手动设置：
echo 1. Edit → Preferences → Interface
echo 2. Language → 简体中文 (Simplified Chinese)
echo 3. 勾选 Interface 和 Tooltips
echo 4. 保存并重启Blender
echo.
echo 详细步骤请查看：手动设置中文指南.txt
echo.
pause

echo.
echo 要现在打开Blender吗？(Y/N)
set /p answer=
if /i "%answer%"=="Y" (
    echo 正在启动Blender...
    start "" "C:\MyApps\BlenderCustom\MyBlender.exe"
    echo Blender已启动！
)

echo.
echo 按任意键退出...
pause >nul

