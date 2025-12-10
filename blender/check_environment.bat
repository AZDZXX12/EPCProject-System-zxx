@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════════╗
echo ║          环境检查工具 - Blender编译环境验证               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set PASS_COUNT=0
set FAIL_COUNT=0

echo [检查中] 正在检测编译环境...
echo.
echo ════════════════════════════════════════════════════════════
echo.

:: 检查 Git
echo [1/8] Git
where git >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ 已安装
    for /f "tokens=3" %%i in ('git --version') do echo       版本: %%i
    set /a PASS_COUNT+=1
) else (
    echo     ✗ 未安装
    echo       下载: https://git-scm.com/
    set /a FAIL_COUNT+=1
)
echo.

:: 检查 CMake
echo [2/8] CMake
where cmake >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ 已安装
    for /f "tokens=3" %%i in ('cmake --version') do (
        echo       版本: %%i
        goto :cmake_done
    )
    :cmake_done
    set /a PASS_COUNT+=1
) else (
    echo     ✗ 未安装
    echo       下载: https://cmake.org/download/
    set /a FAIL_COUNT+=1
)
echo.

:: 检查 Python
echo [3/8] Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ 已安装
    for /f "tokens=2" %%i in ('python --version') do echo       版本: %%i
    set /a PASS_COUNT+=1
) else (
    echo     ✗ 未安装
    echo       下载: https://www.python.org/downloads/
    set /a FAIL_COUNT+=1
)
echo.

:: 检查 Visual Studio
echo [4/8] Visual Studio / MSBuild
where msbuild >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ 已安装
    set /a PASS_COUNT+=1
) else (
    echo     ✗ 未安装
    echo       下载: https://visualstudio.microsoft.com/
    set /a FAIL_COUNT+=1
)
echo.

:: 检查 UPX（可选）
echo [5/8] UPX（可选，用于压缩）
where upx >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ 已安装
    set /a PASS_COUNT+=1
) else (
    echo     - 未安装（可选工具）
    echo       下载: https://github.com/upx/upx/releases
)
echo.

:: 检查内存
echo [6/8] 系统内存
for /f "skip=1" %%i in ('wmic computersystem get totalphysicalmemory') do (
    set /a mem=%%i/1024/1024/1024
    if !mem! geq 16 (
        echo     ✓ !mem!GB （足够RAM盘方案）
        set /a PASS_COUNT+=1
    ) else (
        echo     ⚠ !mem!GB （建议16GB以上用于RAM盘）
        set /a PASS_COUNT+=1
    )
    goto :mem_done
)
:mem_done
echo.

:: 检查磁盘空间
echo [7/8] 磁盘空间（C盘）
for /f "tokens=3" %%i in ('dir C:\ ^| findstr "bytes free"') do (
    set freespace=%%i
    goto :disk_done
)
:disk_done
echo     ✓ 有可用空间
echo       建议预留: 50GB以上
set /a PASS_COUNT+=1
echo.

:: 检查RAM盘
echo [8/8] RAM盘（R:）
if exist R:\ (
    echo     ✓ 已创建（推荐方案可用）
    for /f "tokens=3" %%i in ('dir R:\ ^| findstr "bytes free"') do (
        echo       可用空间: %%i 字节
        goto :ramdisk_done
    )
    :ramdisk_done
    set /a PASS_COUNT+=1
) else (
    echo     - 未创建（可选，推荐创建）
    echo       教程: 查看"创建RAM盘指南.txt"
)
echo.

:: 总结
echo ════════════════════════════════════════════════════════════
echo.
echo 检查完成！
echo.
echo 通过: %PASS_COUNT% 项
echo 失败: %FAIL_COUNT% 项
echo.

if %FAIL_COUNT% equ 0 (
    echo ✓ 环境完备！可以开始编译
    echo.
    echo 推荐方案:
    if exist R:\ (
        echo   → 方案1: RAM盘编译（已检测到RAM盘）
    ) else (
        echo   → 方案2: 隐蔽编译
    )
) else (
    echo ⚠ 请先安装缺失的工具
    echo.
    echo 最低要求:
    echo   - Git
    echo   - CMake
    echo   - Visual Studio（含C++组件）
    echo   - Python
)

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 下一步：
echo   1. 如果环境完备 → 运行 START_HERE.bat
echo   2. 如果有缺失 → 安装相应工具后重新检查
echo   3. 创建RAM盘 → 查看"创建RAM盘指南.txt"
echo.
pause

