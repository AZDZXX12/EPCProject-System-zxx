# EPC项目管理系统 - 模块清理脚本
# 用途：清理冗余模块，优化项目结构

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EPC项目管理系统 - 模块清理工具" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 设置基础路径
$basePath = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $basePath "client\src"

# 要删除的冗余文件列表
$redundantFiles = @(
    # 已经不存在但可能残留的文件
    "pages\TaskManagementCenter.tsx",
    "pages\TaskManagementCenter.css",
    "pages\DhtmlxGanttChart.tsx",
    "pages\DhtmlxGanttChart.css",
    
    # 重复的Dashboard组件（保留DigitalTwinDashboard）
    "pages\Dashboard.tsx",
    "pages\Dashboard.css",
    "components\Dashboard\Dashboard.tsx",
    
    # 旧版本文件
    "pages\OldGanttChart.tsx",
    "pages\SimpleGantt.tsx",
    
    # 废弃的测试文件
    "**\*.test.tsx.bak",
    "**\*.test.ts.bak"
)

# 要修改的导入语句
$importReplacements = @{
    "from './TaskManagementCenter'" = "from './GanttModulePage'"
    "from '../pages/TaskManagementCenter'" = "from '../pages/GanttModulePage'"
    "from './DhtmlxGanttChart'" = "from './OptimizedGanttChart'"
    "from '../pages/DhtmlxGanttChart'" = "from '../pages/OptimizedGanttChart'"
}

Write-Host "步骤 1: 清理冗余文件" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

$deletedCount = 0
foreach ($file in $redundantFiles) {
    $fullPath = Join-Path $srcPath $file
    
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force -Recurse -ErrorAction Stop
            Write-Host "  ✓ 已删除: $file" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "  ✗ 删除失败: $file" -ForegroundColor Red
            Write-Host "    错误: $_" -ForegroundColor DarkRed
        }
    }
}

if ($deletedCount -eq 0) {
    Write-Host "  没有找到需要删除的文件" -ForegroundColor Yellow
}
else {
    Write-Host "  共删除 $deletedCount 个文件" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "步骤 2: 修复导入语句" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

$modifiedCount = 0
$files = Get-ChildItem -Path $srcPath -Include "*.tsx","*.ts","*.jsx","*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $importReplacements.Keys) {
        if ($content -match $old) {
            $content = $content -replace $old, $importReplacements[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $relativePath = $file.FullName.Replace("$basePath\", "")
        Write-Host "  ✓ 已修复: $relativePath" -ForegroundColor Green
        $modifiedCount++
    }
}

if ($modifiedCount -eq 0) {
    Write-Host "  没有需要修复的导入语句" -ForegroundColor Yellow
}
else {
    Write-Host "  共修复 $modifiedCount 个文件" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "步骤 3: 检查未使用的组件" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

# 获取所有组件文件
$components = Get-ChildItem -Path "$srcPath\components" -Filter "*.tsx" -Recurse
$pages = Get-ChildItem -Path "$srcPath\pages" -Filter "*.tsx" -Recurse
$allComponents = $components + $pages

Write-Host "  正在分析组件引用关系..." -ForegroundColor Yellow

$unusedComponents = @()
foreach ($component in $allComponents) {
    $componentName = [System.IO.Path]::GetFileNameWithoutExtension($component.Name)
    $isUsed = $false
    
    # 排除入口文件和路由文件
    if ($componentName -in @("App", "index", "routes", "App.lazy")) {
        continue
    }
    
    # 搜索引用
    foreach ($file in $files) {
        if ($file.FullName -eq $component.FullName) {
            continue
        }
        
        $content = Get-Content $file.FullName -Raw
        if ($content -match "from.*['/]$componentName['`"\]]" -or 
            $content -match "import.*$componentName" -or
            $content -match "<$componentName") {
            $isUsed = $true
            break
        }
    }
    
    if (-not $isUsed) {
        $relativePath = $component.FullName.Replace("$basePath\", "")
        $unusedComponents += $relativePath
    }
}

if ($unusedComponents.Count -gt 0) {
    Write-Host "  发现未使用的组件:" -ForegroundColor Yellow
    foreach ($comp in $unusedComponents) {
        Write-Host "    - $comp" -ForegroundColor DarkYellow
    }
    Write-Host "  建议手动检查这些组件是否可以删除" -ForegroundColor Cyan
}
else {
    Write-Host "  ✓ 没有发现未使用的组件" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "清理完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "优化建议:" -ForegroundColor Yellow
Write-Host "  1. 运行 'npm run build' 验证构建" -ForegroundColor White
Write-Host "  2. 运行 'npm run lint' 检查代码规范" -ForegroundColor White
Write-Host "  3. 测试所有功能模块确保正常工作" -ForegroundColor White
Write-Host ""

# 询问是否立即运行构建验证
$response = Read-Host "是否立即运行构建验证? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "正在运行构建验证..." -ForegroundColor Cyan
    Set-Location (Join-Path $basePath "client")
    npm run build
}

Write-Host ""
Write-Host "脚本执行完毕" -ForegroundColor Green
