# EPC项目管理系统 - 冗余模块清理脚本
# 执行前请确保已备份代码！

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EPC 模块优化清理脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Administrator\Desktop\xiangmu2.0"
$clientSrc = "$projectRoot\client\src\pages"

# 备份确认
Write-Host "⚠️  警告：此脚本将删除冗余模块文件" -ForegroundColor Yellow
Write-Host "请确保已创建备份分支！" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "是否继续？(yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ 操作已取消" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "开始清理..." -ForegroundColor Green
Write-Host ""

# 1. 删除冗余甘特图组件
Write-Host "📊 清理甘特图组件..." -ForegroundColor Cyan
$ganttFiles = @(
    "$clientSrc\DhtmlxGanttChart.tsx",
    "$clientSrc\GanttChart.tsx",
    "$clientSrc\EnhancedGanttChart.tsx",
    "$clientSrc\InteractiveGanttChart_v3.tsx"
)

foreach ($file in $ganttFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 已删除: $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  文件不存在: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# 2. 删除冗余仪表板组件
Write-Host ""
Write-Host "📈 清理仪表板组件..." -ForegroundColor Cyan
$dashboardFiles = @(
    "$clientSrc\Dashboard.tsx",
    "$clientSrc\EnhancedDashboard.tsx"
)

foreach ($file in $dashboardFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 已删除: $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  文件不存在: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# 3. 备份设备选型组件（暂不删除，先提取逻辑）
Write-Host ""
Write-Host "🔧 备份设备选型组件..." -ForegroundColor Cyan
$selectionFiles = @(
    "$clientSrc\EquipmentSelection.tsx",
    "$clientSrc\FanSelection.tsx",
    "$clientSrc\CableSelection.tsx"
)

$backupDir = "$projectRoot\backup\selection-modules"
if (!(Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
}

foreach ($file in $selectionFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item $file "$backupDir\$fileName" -Force
        Write-Host "  ✅ 已备份: $fileName" -ForegroundColor Green
    }
}

# 4. 统计清理结果
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  清理完成统计" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$deletedCount = 0
$ganttFiles + $dashboardFiles | ForEach-Object {
    if (!(Test-Path $_)) {
        $deletedCount++
    }
}

Write-Host "✅ 已删除文件: $deletedCount 个" -ForegroundColor Green
Write-Host "📦 已备份文件: $($selectionFiles.Count) 个" -ForegroundColor Yellow
Write-Host ""

# 5. 生成清理报告
$dateStr = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = "$projectRoot\cleanup-report-$dateStr.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$deletedList = ($ganttFiles + $dashboardFiles | ForEach-Object { "- $(Split-Path $_ -Leaf)" }) -join "`n"
$backedupList = ($selectionFiles | ForEach-Object { "- $(Split-Path $_ -Leaf)" }) -join "`n"

$reportContent = @"
EPC Project Module Cleanup Report
==================
Cleanup Time: $timestamp

Deleted Redundant Modules:
$deletedList

Backed up Selection Modules:
$backedupList

Next Steps:
1. Check application functionality
2. Extract selection calculation logic
3. Integrate into LuckysheetSelection.tsx
4. Delete backed up selection modules
5. Update routing and menu configuration
"@

$reportContent | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "📄 清理报告已保存: $reportPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 清理完成！请运行以下命令测试应用:" -ForegroundColor Green
Write-Host "   cd client && npm start" -ForegroundColor White
Write-Host ""
