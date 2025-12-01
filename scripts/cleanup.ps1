# EPC Module Cleanup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EPC Module Cleanup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Administrator\Desktop\xiangmu2.0"
$clientSrc = "$projectRoot\client\src\pages"

Write-Host "WARNING: This will delete redundant module files" -ForegroundColor Yellow
Write-Host "Make sure you have created a backup branch!" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Operation cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Starting cleanup..." -ForegroundColor Green
Write-Host ""

# 1. Delete redundant Gantt components
Write-Host "Cleaning Gantt components..." -ForegroundColor Cyan
$ganttFiles = @(
    "$clientSrc\DhtmlxGanttChart.tsx",
    "$clientSrc\GanttChart.tsx",
    "$clientSrc\EnhancedGanttChart.tsx",
    "$clientSrc\InteractiveGanttChart_v3.tsx"
)

foreach ($file in $ganttFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted: $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# 2. Delete redundant Dashboard components
Write-Host ""
Write-Host "Cleaning Dashboard components..." -ForegroundColor Cyan
$dashboardFiles = @(
    "$clientSrc\Dashboard.tsx",
    "$clientSrc\EnhancedDashboard.tsx"
)

foreach ($file in $dashboardFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted: $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# 3. Backup selection components
Write-Host ""
Write-Host "Backing up selection components..." -ForegroundColor Cyan
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
        Write-Host "  Backed up: $fileName" -ForegroundColor Green
    }
}

# 4. Statistics
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cleanup Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$deletedCount = 0
$ganttFiles + $dashboardFiles | ForEach-Object {
    if (!(Test-Path $_)) {
        $deletedCount++
    }
}

Write-Host "Deleted files: $deletedCount" -ForegroundColor Green
Write-Host "Backed up files: $($selectionFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# 5. Generate report
$dateStr = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = "$projectRoot\cleanup-report-$dateStr.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$reportLines = @()
$reportLines += "EPC Project Module Cleanup Report"
$reportLines += "=================================="
$reportLines += "Cleanup Time: $timestamp"
$reportLines += ""
$reportLines += "Deleted Redundant Modules:"
$ganttFiles + $dashboardFiles | ForEach-Object { $reportLines += "- $(Split-Path $_ -Leaf)" }
$reportLines += ""
$reportLines += "Backed up Selection Modules:"
$selectionFiles | ForEach-Object { $reportLines += "- $(Split-Path $_ -Leaf)" }
$reportLines += ""
$reportLines += "Next Steps:"
$reportLines += "1. Check application functionality"
$reportLines += "2. Extract selection calculation logic"
$reportLines += "3. Integrate into LuckysheetSelection.tsx"
$reportLines += "4. Delete backed up selection modules"
$reportLines += "5. Update routing and menu configuration"

$reportLines | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "Report saved: $reportPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cleanup complete! Test the application:" -ForegroundColor Green
Write-Host "   cd client && npm start" -ForegroundColor White
Write-Host ""
