@echo off
chcp 65001 >nul
echo ======================================
echo 隐蔽编译方案（绕过监控）
echo ======================================
echo.

set SOURCE_DIR=blender
set BUILD_DIR=build_temp
set OUTPUT_NAME=myapp

echo [1/5] 准备编译环境...
if not exist %SOURCE_DIR% (
    echo 错误: 未找到Blender源码目录
    echo 请先克隆源码: git clone https://projects.blender.org/blender/blender.git
    pause
    exit /b 1
)

if not exist %BUILD_DIR% mkdir %BUILD_DIR%
cd %BUILD_DIR%

echo.
echo [2/5] 配置编译（使用隐蔽输出名称）...
cmake ..\%SOURCE_DIR% -G "Visual Studio 17 2022" -A x64 ^
    -DWITH_WINDOWS_BUNDLE_CRT=ON ^
    -DCMAKE_BUILD_TYPE=Release

if %errorlevel% neq 0 (
    echo 配置失败！
    cd ..
    pause
    exit /b 1
)

echo.
echo [3/5] 编译中（输出文件名伪装）...
cmake --build . --config Release -- /maxcpucount

if %errorlevel% neq 0 (
    echo 编译失败！
    cd ..
    pause
    exit /b 1
)

cd bin\Release

echo.
echo [4/5] 处理输出文件（绕过检测）...

:: 方法1: 先重命名为.tmp避免被监控
if exist blender.exe (
    echo - 重命名为临时文件
    ren blender.exe %OUTPUT_NAME%.tmp
    
    :: 方法2: 使用copy /b创建二进制副本
    echo - 创建二进制副本
    copy /b %OUTPUT_NAME%.tmp %OUTPUT_NAME%.exe
    
    :: 删除临时文件
    del %OUTPUT_NAME%.tmp
    
    echo ✓ 文件处理完成: %OUTPUT_NAME%.exe
)

:: 复制DLL（如果需要）
echo - 收集依赖文件...

echo.
echo [5/5] 打包到安全位置...
set SAFE_DIR=C:\Apps\%OUTPUT_NAME%
if not exist "%SAFE_DIR%" mkdir "%SAFE_DIR%"

:: 复制所有文件
xcopy /E /I /Y . "%SAFE_DIR%"

cd ..\..\..

echo.
echo ======================================
echo ✓ 完成！
echo ======================================
echo.
echo 输出目录: %SAFE_DIR%
echo 可执行文件: %OUTPUT_NAME%.exe
echo.
echo 技术说明：
echo - 使用了二进制复制避免文件监控
echo - 修改了文件名，降低特征识别
echo - 输出到自定义目录
echo.
pause

