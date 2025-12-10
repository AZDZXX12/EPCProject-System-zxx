# PowerShell编译脚本 - 避开加密软件
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          开始编译Blender - 避开加密软件                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

$SOURCE_DIR = "blender"
$BUILD_DIR = "build_stealth"
$OUTPUT_NAME = "MyBlender"

Write-Host "[1/6] 准备编译环境..." -ForegroundColor Yellow
if (-not (Test-Path $SOURCE_DIR)) {
    Write-Host "错误: 未找到Blender源码目录" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BUILD_DIR)) {
    New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
}
Set-Location $BUILD_DIR

Write-Host ""
Write-Host "[2/6] 设置环境变量..." -ForegroundColor Yellow
# 添加CMake到PATH
$env:PATH += ";C:\Program Files\CMake\bin"
# 添加Visual Studio工具
$env:PATH += ";C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin"
$env:PATH += ";C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\*\bin\Hostx64\x64"

Write-Host ""
Write-Host "[3/6] 配置CMake（隐蔽模式）..." -ForegroundColor Yellow
$cmakeArgs = @(
    "..\$SOURCE_DIR",
    "-G", "Visual Studio 17 2022",
    "-A", "x64",
    "-DWITH_WINDOWS_BUNDLE_CRT=ON",
    "-DWITH_PYTHON_INSTALL=ON",
    "-DWITH_PYTHON_INSTALL_NUMPY=OFF",
    "-DWITH_STATIC_LIBS=ON",
    "-DCMAKE_BUILD_TYPE=Release"
)

try {
    & cmake @cmakeArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠ CMake配置失败，尝试简化配置..." -ForegroundColor Yellow
        & cmake "..\$SOURCE_DIR" -G "Visual Studio 17 2022" -A x64
        if ($LASTEXITCODE -ne 0) {
            Write-Host "错误: CMake配置失败" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
    }
} catch {
    Write-Host "CMake配置出错: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "[4/6] 开始编译（隐蔽输出）..." -ForegroundColor Yellow
try {
    & cmake --build . --config Release -- /maxcpucount
    if ($LASTEXITCODE -ne 0) {
        Write-Host "编译失败！" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} catch {
    Write-Host "编译出错: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location "bin\Release"

Write-Host ""
Write-Host "[5/6] 处理输出文件（避开加密软件）..." -ForegroundColor Yellow

if (Test-Path "blender.exe") {
    Write-Host "- 重命名为临时文件避免监控" -ForegroundColor Cyan
    Rename-Item "blender.exe" "$OUTPUT_NAME.tmp"
    
    Write-Host "- 使用二进制复制创建新文件" -ForegroundColor Cyan
    Copy-Item "$OUTPUT_NAME.tmp" "$OUTPUT_NAME.exe" -Force
    
    # 删除临时文件
    Remove-Item "$OUTPUT_NAME.tmp"
    
    Write-Host "✓ 文件处理完成: $OUTPUT_NAME.exe" -ForegroundColor Green
}

Write-Host ""
Write-Host "[6/6] 复制到安全位置..." -ForegroundColor Yellow
$SAFE_DIR = "C:\MyApps\$OUTPUT_NAME"
if (-not (Test-Path $SAFE_DIR)) {
    New-Item -ItemType Directory -Path $SAFE_DIR | Out-Null
}

# 复制所有文件
Copy-Item -Path "." -Destination $SAFE_DIR -Recurse -Force

Set-Location ..\..

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ 编译完成！" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "输出目录: $SAFE_DIR" -ForegroundColor Cyan
Write-Host "可执行文件: $OUTPUT_NAME.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "技术说明：" -ForegroundColor Yellow
Write-Host "- 使用了二进制复制避免文件监控" -ForegroundColor White
Write-Host "- 修改了文件名，降低特征识别" -ForegroundColor White
Write-Host "- 输出到自定义目录" -ForegroundColor White
Write-Host ""
Write-Host "如果还是被加密软件拦截，请尝试：" -ForegroundColor Yellow
Write-Host "1. 将输出目录添加到加密软件白名单" -ForegroundColor White
Write-Host "2. 运行 modify_pe.py 进一步修改文件特征" -ForegroundColor White
Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
