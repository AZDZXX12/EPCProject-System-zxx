@echo off
cls
echo.
echo ========================================================
echo         Blender Chinese Interface Setup
echo ========================================================
echo.
echo Please close all Blender windows first!
echo.
pause

echo.
echo Setting Chinese interface...
"C:\MyApps\BlenderCustom\MyBlender.exe" --background --python set_chinese.py

echo.
echo ========================================================
echo Setup Complete!
echo ========================================================
echo.
echo Now please:
echo 1. Open Blender from desktop icon
echo 2. Menu should be in Chinese!
echo.
echo If still English, manually set:
echo Edit - Preferences - Interface - Language - Simplified Chinese
echo.
pause

echo.
echo Open Blender now? (Y/N)
set /p answer=
if /i "%answer%"=="Y" (
    echo Starting Blender...
    start "" "C:\MyApps\BlenderCustom\MyBlender.exe"
)

pause

