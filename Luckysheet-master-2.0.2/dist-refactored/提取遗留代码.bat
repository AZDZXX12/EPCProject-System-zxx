@echo off
chcp 65001 >nul
echo ========================================
echo   一键提取遗留JavaScript代码
echo ========================================
echo.
echo 正在从 dist/index.html 提取 JavaScript 代码...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$content = Get-Content '../dist/index.html' -Raw -Encoding UTF8; ^
$startTag = '<script>'; ^
$endTag = '</body>'; ^
$startIndex = $content.IndexOf($startTag, 1400); ^
$endIndex = $content.LastIndexOf($endTag); ^
if ($startIndex -gt 0 -and $endIndex -gt $startIndex) { ^
    $jsCode = $content.Substring($startIndex, $endIndex - $startIndex); ^
    $jsCode = $jsCode -replace '(?s)<script[^>]*>|</script>', ''; ^
    $template = Get-Content './js/modules/legacy.js' -Raw -Encoding UTF8; ^
    $updated = $template -replace '(?s)// ==================== 占位符 ====================.*?// ==================== 说明 ====================', $jsCode; ^
    Set-Content './js/modules/legacy.js' -Value $updated -Encoding UTF8; ^
    Write-Host '✅ 成功！JavaScript代码已提取到 js/modules/legacy.js' -ForegroundColor Green; ^
} else { ^
    Write-Host '❌ 提取失败：未找到<script>标签' -ForegroundColor Red; ^
}"

echo.
echo ========================================
echo 提取完成！请打开 js/modules/legacy.js 检查
echo ========================================
pause


