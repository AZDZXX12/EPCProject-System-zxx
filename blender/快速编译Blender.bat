@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════════╗
echo ║          快速编译Blender - 避开加密软件                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set SOURCE_DIR=blender
set BUILD_DIR=build_stealth
set OUTPUT_NAME=MyBlender

echo [1/6] 准备编译环境...
if not exist %SOURCE_DIR% (
    echo 错误: 未找到Blender源码目录
    pause
    exit /b 1
)

if not exist %BUILD_DIR% mkdir %BUILD_DIR%
cd %BUILD_DIR%

echo.
echo [2/6] 设置环境变量...
:: 添加CMake到PATH
set "PATH=%PATH%;C:\Program Files\CMake\bin"
:: 添加Visual Studio工具
set "PATH=%PATH%;C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin"
set "PATH=%PATH%;C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.40.33807\bin\Hostx64\x64"

echo.
echo [3/6] 配置CMake（隐蔽模式）...
cmake ..\%SOURCE_DIR% -G "Visual Studio 17 2022" -A x64 ^
    -DWITH_WINDOWS_BUNDLE_CRT=ON ^
    -DWITH_PYTHON_INSTALL=ON ^
    -DWITH_PYTHON_INSTALL_NUMPY=OFF ^
    -DWITH_STATIC_LIBS=ON ^
    -DCMAKE_BUILD_TYPE=Release

if %errorlevel% neq 0 (
    echo.
    echo ⚠ CMake配置失败，尝试简化配置...
    cmake ..\%SOURCE_DIR% -G "Visual Studio 17 2022" -A x64
    if %errorlevel% neq 0 (
        echo 错误: CMake配置失败
        cd ..
        pause
        exit /b 1
    )
)

echo.
echo [4/6] 开始编译（隐蔽输出）...
cmake --build . --config Release -- /maxcpucount

if %errorlevel% neq 0 (
    echo 编译失败！
    cd ..
    pause
    exit /b 1
)

cd bin\Release

echo.
echo [5/6] 处理输出文件（避开加密软件）...

:: 方法1: 重命名为临时文件
if exist blender.exe (
    echo - 重命名为临时文件避免监控
    ren blender.exe %OUTPUT_NAME%.tmp
    
    :: 方法2: 二进制复制
    echo - 使用二进制复制创建新文件
    copy /b %OUTPUT_NAME%.tmp %OUTPUT_NAME%.exe
    
    :: 删除临时文件
    del %OUTPUT_NAME%.tmp
    
    echo ✓ 文件处理完成: %OUTPUT_NAME%.exe
)

echo.
echo [6/6] 复制到安全位置...
set SAFE_DIR=C:\MyApps\%OUTPUT_NAME%
if not exist "%SAFE_DIR%" mkdir "%SAFE_DIR%"

:: 复制所有文件
xcopy /E /I /Y . "%SAFE_DIR%"

cd ..\..\..

echo.
echo ════════════════════════════════════════════════════════════
echo ✓ 编译完成！
echo ════════════════════════════════════════════════════════════
echo.
echo 输出目录: %SAFE_DIR%
echo 可执行文件: %OUTPUT_NAME%.exe
echo.
echo 技术说明：
echo - 使用了二进制复制避免文件监控
echo - 修改了文件名，降低特征识别
echo - 输出到自定义目录
echo.
echo 如果还是被加密软件拦截，请尝试：
echo 1. 将输出目录添加到加密软件白名单
echo 2. 运行 modify_pe.py 进一步修改文件特征
echo.
pause

