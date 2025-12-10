@echo off
chcp 65001 >nul
echo ======================================
echo Blender 自动编译脚本
echo ======================================

set BUILD_DIR=build
set SOURCE_DIR=blender

echo [1/5] 检查环境...
where cmake >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到CMake，请先安装
    exit /b 1
)

echo [2/5] 创建构建目录...
if not exist %BUILD_DIR% (
    mkdir %BUILD_DIR%
)

cd %BUILD_DIR%

echo [3/5] 生成项目文件...
cmake ..\%SOURCE_DIR% -G "Visual Studio 17 2022" -A x64 ^
    -DWITH_WINDOWS_BUNDLE_CRT=ON ^
    -DWITH_PYTHON_INSTALL=ON

if %errorlevel% neq 0 (
    echo 错误: CMake配置失败
    cd ..
    exit /b 1
)

echo [4/5] 开始编译（Release模式）...
cmake --build . --config Release -- /maxcpucount

if %errorlevel% neq 0 (
    echo 错误: 编译失败
    cd ..
    exit /b 1
)

echo [5/5] 打包...
cmake --install . --config Release

cd ..

echo.
echo ======================================
echo 编译完成！
echo 输出位置: %BUILD_DIR%\bin\Release\
echo ======================================
echo.
echo 提示：如果杀毒软件或加密软件拦截，请：
echo 1. 将输出目录添加到白名单
echo 2. 或运行 sign_exe.bat 进行代码签名
echo.
pause

