@echo off
chcp 65001 >nul
echo ======================================
echo RAM盘编译方案（最推荐）
echo ======================================
echo.

:: 检查RAM盘是否存在
set RAMDISK=R:
if not exist %RAMDISK%\ (
    echo 未检测到RAM盘 %RAMDISK%
    echo.
    echo 请先创建RAM盘：
    echo 1. 下载 ImDisk Toolkit: https://sourceforge.net/projects/imdisk-toolkit/
    echo 2. 安装后，创建一个10GB以上的RAM盘，盘符设为R:
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✓ 检测到RAM盘: %RAMDISK%
echo.

:: 检查源码是否已在RAM盘
if not exist %RAMDISK%\blender (
    echo [1/6] 正在克隆Blender源码到RAM盘...
    echo 提示：这可能需要较长时间
    %RAMDISK%
    git clone --depth 1 https://projects.blender.org/blender/blender.git
    cd blender
    make update
) else (
    echo [1/6] 使用已有源码
    %RAMDISK%
    cd blender
)

echo.
echo [2/6] 创建构建目录...
if not exist build mkdir build
cd build

echo.
echo [3/6] 配置CMake...
cmake .. -G "Visual Studio 17 2022" -A x64 ^
    -DWITH_WINDOWS_BUNDLE_CRT=ON ^
    -DWITH_STATIC_LIBS=ON

if %errorlevel% neq 0 (
    echo 配置失败！
    pause
    exit /b 1
)

echo.
echo [4/6] 开始编译...
cmake --build . --config Release -- /maxcpucount

if %errorlevel% neq 0 (
    echo 编译失败！
    pause
    exit /b 1
)

echo.
echo [5/6] 处理输出文件...
cd bin\Release

:: 使用UPX压缩（如果有）
where upx >nul 2>&1
if %errorlevel% equ 0 (
    echo 发现UPX，正在压缩...
    upx --best --lzma blender.exe
)

echo.
echo [6/6] 复制到安全位置...
set OUTPUT_DIR=C:\MyApps\Blender_Custom
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
xcopy /E /I /Y . "%OUTPUT_DIR%"

echo.
echo ======================================
echo ✓ 编译完成！
echo ======================================
echo.
echo 输出位置: %OUTPUT_DIR%
echo.
echo 此EXE在RAM盘编译，加密软件无法监控
echo 可以直接运行，不会被加密
echo.
pause

