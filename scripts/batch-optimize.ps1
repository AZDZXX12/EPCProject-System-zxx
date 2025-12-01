# EPC项目管理系统 - 批量优化脚本
# 自动化日志标准化和CSS规范化

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EPC项目管理系统 - 批量优化工具" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$basePath = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $basePath "client\src"

# 步骤1: 批量替换console.log
Write-Host "步骤 1: 批量替换console.log" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

$filesToFix = @(
    "components\AIAssistant\AIAssistantPanel.tsx",
    "components\CalendarView.tsx",
    "components\ErrorBoundary.tsx",
    "components\GlobalSearch\GlobalSearch.tsx",
    "components\KanbanView.tsx",
    "components\KnowledgeBase.tsx",
    "components\NotificationService.tsx",
    "components\Procurement\ProcurementPlanList.tsx",
    "components\Procurement\SupplierRecommendation.tsx",
    "components\ReportingSystem.tsx",
    "contexts\ProjectContext.tsx",
    "core\ApiClient.ts",
    "hooks\useDebounce.ts",
    "pages\EnhancedSettings.tsx",
    "pages\EnhancedSystemManagement.tsx",
    "pages\LuckysheetTable.tsx",
    "pages\ProcurementManagement.tsx",
    "pages\SystemManagement.tsx",
    "pages\UnifiedEquipmentSelection.tsx",
    "pages\Workspace.tsx",
    "services\AIAssistant.ts",
    "services\api.ts",
    "store\projectStore.ts",
    "utils\autoScheduler.ts",
    "utils\cacheManager.ts",
    "utils\EventBus.ts",
    "utils\analytics.ts",
    "utils\baselineManager.ts",
    "utils\errorHandler.ts"
)

$replacedCount = 0
foreach ($file in $filesToFix) {
    $fullPath = Join-Path $srcPath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $original = $content
        
        # 检查是否已经导入logger
        if ($content -notmatch "import.*logger.*from") {
            # 添加logger导入
            if ($content -match "^import") {
                $content = $content -replace "(import.*?from.*?;[\r\n]+)", "`$1import { logger } from '../utils/logger';`n"
            }
        }
        
        # 替换console调用
        $content = $content -replace "console\.log\(", "logger.info("
        $content = $content -replace "console\.error\(", "logger.error("
        $content = $content -replace "console\.warn\(", "logger.warn("
        $content = $content -replace "console\.debug\(", "logger.debug("
        
        if ($content -ne $original) {
            Set-Content -Path $fullPath -Value $content -NoNewline
            Write-Host "  ✓ 已优化: $file" -ForegroundColor Green
            $replacedCount++
        }
    }
}

Write-Host "  共优化 $replacedCount 个文件" -ForegroundColor Cyan

# 步骤2: CSS规范化
Write-Host ""
Write-Host "步骤 2: CSS规范化 - 移除inline styles" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

# 创建组件专用CSS文件
$cssFiles = @{
    "GanttModulePage" = @"
.gantt-module-page {
  padding: 24px;
}

.gantt-module-card-icon {
  margin-right: 8px;
}

.gantt-module-tab-content {
  margin-top: 16px;
}
"@
    "OptimizedGanttChart" = @"
.gantt-save-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(0, 128, 0, 0.1);
  border-radius: 4px;
}

.gantt-float-time-badge {
  margin-left: 8px;
  font-size: 12px;
}

.gantt-filter-dropdown {
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
}

.gantt-customizer-modal {
  top: 20px;
}

.gantt-timeline-container {
  width: 100%;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 16px;
}
"@
    "EnhancedSettings" = @"
.enhanced-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.settings-form-item {
  margin-bottom: 24px;
}

.settings-button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
"@
}

foreach ($component in $cssFiles.Keys) {
    $cssPath = Join-Path $srcPath "pages\$component.css"
    if (-not (Test-Path $cssPath)) {
        Set-Content -Path $cssPath -Value $cssFiles[$component]
        Write-Host "  ✓ 创建CSS: $component.css" -ForegroundColor Green
    }
}

Write-Host "  CSS文件创建完成" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "批量优化完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 运行 'npm run lint:fix' 自动修复格式" -ForegroundColor White
Write-Host "  2. 运行 'npm run build' 验证构建" -ForegroundColor White
Write-Host "  3. 手动检查并应用新的CSS类" -ForegroundColor White
Write-Host ""
