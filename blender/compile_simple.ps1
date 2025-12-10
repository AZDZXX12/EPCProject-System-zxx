# 简化版PowerShell编译脚本
Write-Host "开始编译Blender..." -ForegroundColor Green

$SOURCE_DIR = "blender"
$BUILD_DIR = "build_stealth"

Write-Host "[1/4] 准备编译环境..." -ForegroundColor Yellow
if (-not (Test-Path $SOURCE_DIR)) {
    Write-Host "错误: 未找到Blender源码目录" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BUILD_DIR)) {
    New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
}
Set-Location $BUILD_DIR

Write-Host "[2/4] 配置CMake..." -ForegroundColor Yellow
$env:PATH += ";C:\Program Files\CMake\bin"

# 简化CMake配置
& cmake "..\$SOURCE_DIR" -G "Visual Studio 17 2022" -A x64
if ($LASTEXITCODE -ne 0) {
    Write-Host "CMake配置失败" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "[3/4] 开始编译..." -ForegroundColor Yellow
& cmake --build . --config Release -- /maxcpucount
if ($LASTEXITCODE -ne 0) {
    Write-Host "编译失败" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "[4/4] 处理输出文件..." -ForegroundColor Yellow
Set-Location "bin\Release"

if (Test-Path "blender.exe") {
    # 重命名避免被识别
    Rename-Item "blender.exe" "MyBlender.exe"
    Write-Host "✓ 重命名为 MyBlender.exe" -ForegroundColor Green
}

# 复制到安全位置
$SAFE_DIR = "C:\MyApps\MyBlender"
if (-not (Test-Path $SAFE_DIR)) {
    New-Item -ItemType Directory -Path $SAFE_DIR | Out-Null
}
Copy-Item -Path "." -Destination $SAFE_DIR -Recurse -Force

Write-Host ""
Write-Host "✓ 编译完成！" -ForegroundColor Green
Write-Host "输出位置: $SAFE_DIR" -ForegroundColor Cyan
Write-Host "可执行文件: MyBlender.exe" -ForegroundColor Cyan

Set-Location ..\..\..
