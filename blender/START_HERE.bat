@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║       Blender 二次开发 - 避开加密软件编译工具集           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 适用场景：自己电脑上有 winrdlv3 或 sdhelper2 等加密软件
echo 目标：编译出不被加密/拦截的Blender自定义版本
echo.
echo ════════════════════════════════════════════════════════════
echo.

echo 请选择编译方案：
echo.
echo [1] RAM盘编译（最推荐 ⭐⭐⭐⭐⭐）
echo     - 在内存中编译，加密软件无法监控
echo     - 速度快，完全绕过文件监控
echo     - 需要：10GB以上RAM + ImDisk工具
echo.
echo [2] 隐蔽编译（推荐 ⭐⭐⭐⭐）
echo     - 使用特殊技巧避免被识别
echo     - 修改输出文件名和特征
echo     - 适合普通环境
echo.
echo [3] 标准编译 + 后处理（推荐 ⭐⭐⭐）
echo     - 正常编译后修改PE文件特征
echo     - 改变时间戳和文件哈希
echo     - 降低被识别概率
echo.
echo [4] 查看完整方案文档
echo     - 包括虚拟机、WSL2、网络路径等方案
echo     - 加密软件配置指南
echo.
echo [0] 退出
echo.
echo ════════════════════════════════════════════════════════════
echo.

set /p choice="请输入选项 (0-4): "

if "%choice%"=="1" goto RAMDISK
if "%choice%"=="2" goto STEALTHY
if "%choice%"=="3" goto STANDARD
if "%choice%"=="4" goto DOCS
if "%choice%"=="0" goto END
goto INVALID

:RAMDISK
cls
echo.
echo [方案1] RAM盘编译
echo ════════════════════════════════════════════════════════════
echo.
call build_on_ramdisk.bat
goto END

:STEALTHY
cls
echo.
echo [方案2] 隐蔽编译
echo ════════════════════════════════════════════════════════════
echo.
call build_stealthy.bat
goto END

:STANDARD
cls
echo.
echo [方案3] 标准编译 + 后处理
echo ════════════════════════════════════════════════════════════
echo.
echo 步骤1: 先执行标准编译...
call build_blender.bat

if %errorlevel% neq 0 (
    echo.
    echo 编译失败！
    pause
    goto END
)

echo.
echo 步骤2: 修改PE文件特征...
set EXE_PATH=build\bin\Release\blender.exe

if exist "%EXE_PATH%" (
    python modify_pe.py "%EXE_PATH%" "%EXE_PATH%.safe"
    if exist "%EXE_PATH%.safe" (
        del "%EXE_PATH%"
        ren "%EXE_PATH%.safe" blender.exe
        echo.
        echo ✓ PE特征修改完成！
    )
) else (
    echo 未找到编译输出文件
)

echo.
pause
goto END

:DOCS
cls
echo.
echo [方案文档]
echo ════════════════════════════════════════════════════════════
echo.
echo 正在打开文档...
start "" "避开加密软件方案.md"
echo.
echo 文档已打开，请查看详细方案说明
echo.
pause
goto END

:INVALID
echo.
echo [!] 无效选择，请重新运行
pause
goto END

:END
echo.
echo 感谢使用！
timeout /t 2 >nul
exit /b 0

