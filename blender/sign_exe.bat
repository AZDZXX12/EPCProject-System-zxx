@echo off
chcp 65001 >nul
echo ======================================
echo 为自编译程序添加数字签名
echo ======================================
echo.
echo 此脚本将帮助您的自编译EXE通过安全软件检查
echo.

set EXE_PATH=build\bin\Release\blender.exe

if not exist "%EXE_PATH%" (
    echo 错误: 未找到 %EXE_PATH%
    echo 请先运行 build_blender.bat 完成编译
    pause
    exit /b 1
)

echo 选择签名方式:
echo 1. 创建自签名证书（开发测试用）
echo 2. 使用已有证书签名
echo 3. 跳过签名，显示其他解决方案
echo.
set /p choice="请选择 (1-3): "

if "%choice%"=="1" goto CREATE_CERT
if "%choice%"=="2" goto SIGN_EXIST
if "%choice%"=="3" goto SHOW_SOLUTIONS
goto END

:CREATE_CERT
echo.
echo [1/2] 创建自签名证书...
makecert -r -pe -n "CN=Blender开发证书" -ss My -sr CurrentUser -sky signature -eku 1.3.6.1.5.5.7.3.3 -a sha256 -len 2048 -cy end -sv BlenderDev.pvk BlenderDev.cer

if %errorlevel% neq 0 (
    echo.
    echo 注意: makecert 可能未安装
    echo 请安装 Windows SDK 或使用 PowerShell 方式
    goto POWERSHELL_CERT
)

echo.
echo [2/2] 签名EXE...
signtool sign /v /n "Blender开发证书" /t http://timestamp.digicert.com "%EXE_PATH%"

if %errorlevel% neq 0 (
    echo 签名失败，尝试不带时间戳...
    signtool sign /v /n "Blender开发证书" "%EXE_PATH%"
)

echo.
echo 签名完成！
goto END

:POWERSHELL_CERT
echo.
echo 使用PowerShell创建证书...
powershell -ExecutionPolicy Bypass -File create_cert.ps1 "%EXE_PATH%"
goto END

:SIGN_EXIST
echo.
set /p cert_name="请输入证书名称: "
signtool sign /n "%cert_name%" /t http://timestamp.digicert.com "%EXE_PATH%"
goto END

:SHOW_SOLUTIONS
echo.
echo ======================================
echo 其他解决方案：
echo ======================================
echo.
echo 1. 添加白名单：
echo    - 在winrdlv3/sdhelper2中添加例外规则
echo    - 将开发目录标记为可信区域
echo.
echo 2. 开发环境隔离：
echo    - 在开发时临时关闭加密软件
echo    - 使用虚拟机进行开发
echo.
echo 3. 修改编译选项：
echo    - 使用静态链接减少DLL依赖
echo    - 使用Debug模式（较少被拦截）
echo.
echo 4. 联系软件厂商：
echo    - 申请开发者豁免
echo    - 获取白名单配置指导
echo.
goto END

:END
echo.
pause

