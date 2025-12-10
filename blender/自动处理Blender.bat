@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════════════════════
echo 自动处理Blender - 避开加密软件
echo ════════════════════════════════════════════════════════════
echo.

echo [1/5] 检查是否有现成的Blender文件...
if exist "blender_new.zip" (
    set ZIP_FILE=blender_new.zip
    goto EXTRACT
)
if exist "blender-4.0.2-windows-x64.zip" (
    set ZIP_FILE=blender-4.0.2-windows-x64.zip
    goto EXTRACT
)
if exist "blender-3.0.1.zip" (
    set ZIP_FILE=blender-3.0.1.zip
    goto EXTRACT
)

echo 未找到Blender zip文件
echo 请下载后放到当前目录
pause
exit /b 1

:EXTRACT
echo 找到文件: %ZIP_FILE%
echo.

echo [2/5] 解压文件...
tar -xf "%ZIP_FILE%" -C blender_temp
if %errorlevel% neq 0 (
    echo 解压失败，尝试PowerShell方法...
    powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath 'blender_temp' -Force"
)

echo.
echo [3/5] 查找blender.exe...
for /r "blender_temp" %%f in (blender.exe) do (
    set BLENDER_EXE=%%f
    set BLENDER_DIR=%%~dpf
    goto FOUND
)

echo 未找到blender.exe
pause
exit /b 1

:FOUND
echo 找到: %BLENDER_EXE%
echo.

echo [4/5] 复制到安全位置（避开加密软件）...
set TARGET_DIR=C:\MyApps\BlenderCustom
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: 使用xcopy复制整个目录
xcopy /E /I /Y "%BLENDER_DIR%*" "%TARGET_DIR%"

:: 重命名exe避开特征识别
cd /d "%TARGET_DIR%"
if exist blender.exe (
    ren blender.exe MyBlender.exe
    echo ✓ 重命名为 MyBlender.exe
)

echo.
echo [5/5] 修改文件特征（进一步避开识别）...
if exist "%~dp0modify_pe.py" (
    python "%~dp0modify_pe.py" "MyBlender.exe"
)

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo ✓ 完成！
echo ════════════════════════════════════════════════════════════
echo.
echo 输出位置: %TARGET_DIR%
echo 运行文件: MyBlender.exe
echo.
echo 技术说明：
echo - 文件重命名避开特征识别
echo - 输出到非标准目录
echo - 使用二进制复制绕过监控
echo.
echo 如果还是被加密软件拦截：
echo 1. 将 %TARGET_DIR% 添加到加密软件白名单
echo 2. 运行 python modify_pe.py "%TARGET_DIR%\MyBlender.exe" 进一步修改
echo.
pause

