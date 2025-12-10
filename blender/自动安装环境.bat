@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════════╗
echo ║          自动安装编译环境工具                              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [提示] 正在准备安装编译所需工具...
echo.

:: 检查是否有winget（Windows包管理器）
where winget >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 检测到 winget，将使用自动安装
    echo.
    goto USE_WINGET
) else (
    echo ⚠ 未检测到 winget
    goto MANUAL_INSTALL
)

:USE_WINGET
echo [1/2] 安装 CMake...
winget install -e --id Kitware.CMake --accept-package-agreements --accept-source-agreements

echo.
echo [2/2] 安装 Visual Studio Build Tools...
echo （这可能需要较长时间，请耐心等待）
winget install -e --id Microsoft.VisualStudio.2022.BuildTools --accept-package-agreements --accept-source-agreements --override "--quiet --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"

echo.
echo ════════════════════════════════════════════════════════════
echo ✓ 安装完成！
echo.
echo 请关闭当前命令行窗口，重新打开后运行编译脚本
pause
exit /b 0

:MANUAL_INSTALL
echo.
echo ════════════════════════════════════════════════════════════
echo 手动安装指南：
echo ════════════════════════════════════════════════════════════
echo.
echo 请依次安装以下工具：
echo.
echo 1. CMake
echo    下载地址: https://cmake.org/download/
echo    选择: Windows x64 Installer
echo.
echo 2. Visual Studio 2022 Community
echo    下载地址: https://visualstudio.microsoft.com/zh-hans/downloads/
echo    安装时选择: "使用C++的桌面开发" 工作负载
echo.
echo 或者使用更轻量的 Build Tools:
echo    下载地址: https://visualstudio.microsoft.com/zh-hans/downloads/
echo    搜索: Build Tools for Visual Studio 2022
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause

