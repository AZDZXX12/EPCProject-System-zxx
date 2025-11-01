# 云部署准备脚本
# Cloud Deployment Preparation Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  云部署准备向导" -ForegroundColor Yellow
Write-Host "  Cloud Deployment Preparation" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: 检查 Git
Write-Host "[步骤 1/5] 检查 Git 安装..." -ForegroundColor Green
try {
    $gitVersion = git --version
    Write-Host "    ✓ Git 已安装: $gitVersion" -ForegroundColor White
} catch {
    Write-Host "    ✗ Git 未安装！" -ForegroundColor Red
    Write-Host "    请从以下地址下载: https://git-scm.com/download/win" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host ""

# Step 2: 初始化 Git 仓库
Write-Host "[步骤 2/5] 初始化 Git 仓库..." -ForegroundColor Green
if (-not (Test-Path ".git")) {
    git init
    Write-Host "    ✓ Git 仓库已初始化" -ForegroundColor White
} else {
    Write-Host "    ✓ Git 仓库已存在" -ForegroundColor White
}
Write-Host ""

# Step 3: 配置 Git 用户
Write-Host "[步骤 3/5] 配置 Git 用户信息..." -ForegroundColor Green
$gitUser = Read-Host "    请输入您的 GitHub 用户名"
$gitEmail = Read-Host "    请输入您的邮箱地址"

git config user.name "$gitUser"
git config user.email "$gitEmail"
Write-Host "    ✓ Git 用户已配置" -ForegroundColor White
Write-Host ""

# Step 4: 添加文件
Write-Host "[步骤 4/5] 添加文件到 Git..." -ForegroundColor Green
git add .
Write-Host "    ✓ 文件已添加" -ForegroundColor White
Write-Host ""

# Step 5: 创建提交
Write-Host "[步骤 5/5] 创建初始提交..." -ForegroundColor Green
try {
    git commit -m "Initial commit: Chemical Project Management System"
    Write-Host "    ✓ 提交创建成功" -ForegroundColor White
} catch {
    Write-Host "    ○ 提交已跳过（无更改或已提交）" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  准备完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "下一步操作：" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣  创建 GitHub 仓库:" -ForegroundColor Cyan
Write-Host "    访问: " -NoNewline -ForegroundColor White
Write-Host "https://github.com/new" -ForegroundColor Green
Write-Host "    仓库名: " -NoNewline -ForegroundColor White
Write-Host "chemical-project-management" -ForegroundColor Green
Write-Host "    点击: " -NoNewline -ForegroundColor White
Write-Host "Create repository" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  推送代码到 GitHub:" -ForegroundColor Cyan
Write-Host "    运行以下命令（替换 YOUR_USERNAME）:" -ForegroundColor White
Write-Host ""
Write-Host "    git remote add origin https://github.com/$gitUser/chemical-project-management.git" -ForegroundColor Yellow
Write-Host "    git branch -M main" -ForegroundColor Yellow
Write-Host "    git push -u origin main" -ForegroundColor Yellow
Write-Host ""

Write-Host "3️⃣  部署到云端:" -ForegroundColor Cyan
Write-Host "    后端部署: " -NoNewline -ForegroundColor White
Write-Host "https://render.com" -ForegroundColor Green
Write-Host "    前端部署: " -NoNewline -ForegroundColor White
Write-Host "https://vercel.com" -ForegroundColor Green
Write-Host "    详细步骤: 参考 " -NoNewline -ForegroundColor White
Write-Host "免费云部署指南.md" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "提示: 按任意键复制推送命令到剪贴板..." -ForegroundColor Yellow
pause > $null

$pushCommands = @"
git remote add origin https://github.com/$gitUser/chemical-project-management.git
git branch -M main
git push -u origin main
"@

Set-Clipboard -Value $pushCommands
Write-Host ""
Write-Host "✓ 命令已复制到剪贴板！" -ForegroundColor Green
Write-Host "  在 GitHub 创建仓库后，粘贴运行即可。" -ForegroundColor White
Write-Host ""

pause

