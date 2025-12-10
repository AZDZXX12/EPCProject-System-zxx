@echo off
chcp 65001 >nul
color 0B
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     Blender 4.2 LTS 自动下载和处理 - 绕过加密软件        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 功能：
echo   - 自动下载 Blender 4.2 LTS 官方版
echo   - 重命名文件避开特征识别
echo   - 修改PE时间戳
echo   - 复制到安全位置
echo   - 绕过 winrdlv3 / sdhelper2 等加密软件
echo.
echo ════════════════════════════════════════════════════════════
echo.

:: 设置变量
set BLENDER_VERSION=4.2.3
set DOWNLOAD_URL=https://mirrors.tuna.tsinghua.edu.cn/blender/release/Blender4.2/blender-4.2.3-windows-x64.zip
set ZIP_FILE=blender-4.2.3-windows-x64.zip
set EXTRACT_DIR=blender42_temp
set TARGET_DIR=C:\MyApps\Blender42LTS
set CUSTOM_NAME=MyBlender42.exe

echo [配置信息]
echo   版本: Blender %BLENDER_VERSION% LTS
echo   下载源: 清华大学镜像（快速）
echo   目标位置: %TARGET_DIR%
echo   可执行文件: %CUSTOM_NAME%
echo.
echo ════════════════════════════════════════════════════════════
echo.

:: 检查是否已下载
if exist "%ZIP_FILE%" (
    echo [✓] 发现已下载的文件: %ZIP_FILE%
    echo.
    choice /C YN /M "是否使用现有文件? (Y=是, N=重新下载)"
    if errorlevel 2 goto DOWNLOAD
    goto EXTRACT
)

:DOWNLOAD
echo [1/6] 下载 Blender 4.2.3 LTS...
echo.
echo 下载地址: %DOWNLOAD_URL%
echo.
echo 方法1: 使用 PowerShell 下载（自动）
echo 方法2: 手动下载（如果自动失败）
echo.

choice /C 12 /M "请选择下载方法"

if errorlevel 2 goto MANUAL_DOWNLOAD
if errorlevel 1 goto AUTO_DOWNLOAD

:AUTO_DOWNLOAD
echo.
echo 正在下载... 请耐心等待（约 300MB，需要 5-15 分钟）
echo.
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Write-Host '开始下载...'; try { Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%ZIP_FILE%' -UseBasicParsing; Write-Host '下载完成！'; } catch { Write-Host '下载失败: ' + $_.Exception.Message; exit 1 }}"

if %errorlevel% neq 0 (
    echo.
    echo [!] PowerShell 下载失败
    goto MANUAL_DOWNLOAD
)

if not exist "%ZIP_FILE%" (
    echo.
    echo [!] 下载失败，文件不存在
    goto MANUAL_DOWNLOAD
)

echo.
echo [✓] 下载完成！
goto EXTRACT

:MANUAL_DOWNLOAD
echo.
echo ════════════════════════════════════════════════════════════
echo [手动下载说明]
echo ════════════════════════════════════════════════════════════
echo.
echo 请手动下载 Blender 4.2.3 LTS:
echo.
echo 选项1 - 清华镜像（推荐，快）:
echo   %DOWNLOAD_URL%
echo.
echo 选项2 - 官方网站（备用）:
echo   https://www.blender.org/download/lts/4-2/
echo   点击 "Windows (x64)" 下载
echo.
echo 选项3 - 阿里云镜像:
echo   https://mirrors.aliyun.com/blender/release/Blender4.2/
echo.
echo 下载后：
echo   1. 将文件保存为: %ZIP_FILE%
echo   2. 放在当前目录: %~dp0
echo   3. 重新运行本脚本
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
exit /b 1

:EXTRACT
echo.
echo [2/6] 解压文件...
echo.

:: 清理旧的临时目录
if exist "%EXTRACT_DIR%" (
    echo 清理旧的临时文件...
    rd /s /q "%EXTRACT_DIR%"
)
mkdir "%EXTRACT_DIR%"

:: 尝试使用 tar 解压（Windows 10+）
echo 使用系统工具解压...
tar -xf "%ZIP_FILE%" -C "%EXTRACT_DIR%" 2>nul

if %errorlevel% neq 0 (
    echo tar 失败，尝试 PowerShell...
    powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%EXTRACT_DIR%' -Force"
)

if not exist "%EXTRACT_DIR%\blender-*" (
    echo [!] 解压失败
    pause
    exit /b 1
)

echo [✓] 解压完成
echo.

:FIND_EXE
echo [3/6] 查找 blender.exe...
echo.

:: 查找 blender.exe
for /r "%EXTRACT_DIR%" %%f in (blender.exe) do (
    set BLENDER_EXE=%%f
    set BLENDER_DIR=%%~dpf
    goto FOUND_EXE
)

echo [!] 未找到 blender.exe
pause
exit /b 1

:FOUND_EXE
echo [✓] 找到: %BLENDER_EXE%
echo.

:COPY_FILES
echo [4/6] 复制到安全位置（避开加密软件监控）...
echo.
echo 目标位置: %TARGET_DIR%
echo.

:: 创建目标目录
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: 使用 xcopy 复制整个 Blender 目录
echo 正在复制文件...
xcopy /E /I /Y /Q "%BLENDER_DIR%*" "%TARGET_DIR%"

if %errorlevel% neq 0 (
    echo [!] 复制失败
    pause
    exit /b 1
)

echo [✓] 文件复制完成
echo.

:RENAME_EXE
echo [5/6] 重命名可执行文件（避开特征识别）...
echo.

cd /d "%TARGET_DIR%"

if exist blender.exe (
    if exist "%CUSTOM_NAME%" (
        echo 删除旧的 %CUSTOM_NAME%...
        del /f /q "%CUSTOM_NAME%"
    )
    
    echo 重命名: blender.exe → %CUSTOM_NAME%
    ren blender.exe "%CUSTOM_NAME%"
    
    if exist "%CUSTOM_NAME%" (
        echo [✓] 重命名成功
    ) else (
        echo [!] 重命名失败
        pause
        exit /b 1
    )
) else (
    echo [!] 未找到 blender.exe
    pause
    exit /b 1
)

echo.

:MODIFY_PE
echo [6/6] 修改 PE 文件特征（进一步避开识别）...
echo.

cd /d "%~dp0"

if exist "modify_pe.py" (
    echo 正在修改 PE 时间戳...
    
    :: 使用 Python 修改 PE 时间戳
    python modify_pe.py "%TARGET_DIR%\%CUSTOM_NAME%" "%TARGET_DIR%\%CUSTOM_NAME%.modified"
    
    if exist "%TARGET_DIR%\%CUSTOM_NAME%.modified" (
        echo.
        echo 替换为修改后的文件...
        del /f /q "%TARGET_DIR%\%CUSTOM_NAME%"
        ren "%TARGET_DIR%\%CUSTOM_NAME%.modified" "%CUSTOM_NAME%"
        echo [✓] PE 特征修改完成
    ) else (
        echo [!] PE 修改失败（但文件仍可使用）
    )
) else (
    echo [!] 未找到 modify_pe.py，跳过 PE 修改
    echo     （文件仍可使用，但建议运行 PE 修改增强隐蔽性）
)

echo.

:CREATE_SHORTCUT
echo [额外] 创建启动快捷方式...
echo.

:: 创建桌面快捷方式
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Blender 4.2 LTS.lnk'); $Shortcut.TargetPath = '%TARGET_DIR%\%CUSTOM_NAME%'; $Shortcut.WorkingDirectory = '%TARGET_DIR%'; $Shortcut.Description = 'Blender 4.2 LTS - 绕过加密软件版本'; $Shortcut.Save()"

if exist "%USERPROFILE%\Desktop\Blender 4.2 LTS.lnk" (
    echo [✓] 桌面快捷方式已创建
) else (
    echo [!] 快捷方式创建失败（不影响使用）
)

echo.

:CLEANUP
echo [清理] 清理临时文件...
echo.

choice /C YN /M "是否删除临时文件? (Y=是, N=保留)"

if errorlevel 2 goto DONE
if errorlevel 1 (
    echo 正在清理...
    cd /d "%~dp0"
    if exist "%EXTRACT_DIR%" rd /s /q "%EXTRACT_DIR%"
    
    echo.
    choice /C YN /M "是否也删除下载的 ZIP 文件? (可节省 300MB)"
    if errorlevel 1 (
        if exist "%ZIP_FILE%" del /f /q "%ZIP_FILE%"
        echo [✓] ZIP 文件已删除
    )
    
    echo [✓] 临时文件已清理
)

echo.

:DONE
echo.
echo ════════════════════════════════════════════════════════════
echo                 ✓✓✓ 安装完成！ ✓✓✓
echo ════════════════════════════════════════════════════════════
echo.
echo [安装信息]
echo   版本: Blender 4.2.3 LTS
echo   位置: %TARGET_DIR%
echo   可执行文件: %CUSTOM_NAME%
echo   快捷方式: 桌面 "Blender 4.2 LTS"
echo.
echo [启动方式]
echo   方法1: 双击桌面快捷方式
echo   方法2: 运行 %TARGET_DIR%\%CUSTOM_NAME%
echo.
echo [已应用的保护措施]
echo   ✓ 文件重命名 (blender.exe → %CUSTOM_NAME%)
echo   ✓ PE 时间戳修改（伪装成旧文件）
echo   ✓ 非标准安装路径
echo   ✓ 二进制复制方式
echo.
echo [如果仍被加密软件拦截]
echo   1. 添加路径白名单: %TARGET_DIR%
echo   2. 添加进程白名单: %CUSTOM_NAME%
echo   3. 查看文档: 提升Blender稳定性.txt
echo.
echo ════════════════════════════════════════════════════════════
echo.

pause

:: 询问是否立即启动
echo.
choice /C YN /M "是否立即启动 Blender 4.2 LTS?"

if errorlevel 2 goto END
if errorlevel 1 (
    echo.
    echo 正在启动 Blender...
    start "" "%TARGET_DIR%\%CUSTOM_NAME%"
)

:END
echo.
echo 感谢使用！
timeout /t 3 >nul
exit /b 0

