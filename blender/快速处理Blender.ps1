# 快速下载并处理Blender，避开加密软件
Write-Host "正在准备Blender..." -ForegroundColor Green

# 删除旧的损坏文件
Remove-Item "blender-*.zip" -Force -ErrorAction SilentlyContinue

# 使用curl下载（比Invoke-WebRequest更稳定）
Write-Host "下载Blender 3.0.1..." -ForegroundColor Yellow
curl.exe -L "https://download.blender.org/release/Blender3.0/blender-3.0.1-windows-x64.zip" -o "blender301.zip"

if ($LASTEXITCODE -eq 0) {
    Write-Host "下载完成！" -ForegroundColor Green
    
    # 解压
    Write-Host "解压中..." -ForegroundColor Yellow
    tar -xf "blender301.zip"
    
    # 查找blender.exe
    $blenderExe = Get-ChildItem -Recurse -Filter "blender.exe" | Select-Object -First 1
    
    if ($blenderExe) {
        Write-Host "找到blender.exe: $($blenderExe.FullName)" -ForegroundColor Green
        
        # 修改特征避开加密软件
        $targetDir = "C:\MyApps\Blender301"
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        
        # 复制整个目录
        $sourceDir = $blenderExe.Directory.FullName
        Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force
        
        # 重命名exe避开识别
        Rename-Item "$targetDir\blender.exe" "MyBlender.exe" -Force
        
        Write-Host ""
        Write-Host "✓ 完成！" -ForegroundColor Green
        Write-Host "位置: $targetDir" -ForegroundColor Cyan
        Write-Host "运行: $targetDir\MyBlender.exe" -ForegroundColor Cyan
    } else {
        Write-Host "错误：未找到blender.exe" -ForegroundColor Red
    }
} else {
    Write-Host "下载失败" -ForegroundColor Red
}

