# -*- coding: utf-8 -*-
# 化工项目管理系统 - 一键启动脚本 (PowerShell)

# 设置控制台编码为UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  化工项目管理系统 - 一键启动" -ForegroundColor Yellow
Write-Host "  Chemical Project Management System" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查端口占用
Write-Host "[1/6] 检查端口占用..." -ForegroundColor Green
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "    警告: 端口 8000 已被占用，正在尝试关闭..." -ForegroundColor Yellow
    $port8000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "    警告: 端口 3000 已被占用，正在尝试关闭..." -ForegroundColor Yellow
    $port3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

Write-Host "    端口检查完成" -ForegroundColor Green
Write-Host ""

# 获取脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 启动后端
Write-Host "[2/6] 启动后端服务 (FastAPI)..." -ForegroundColor Green
$serverPath = Join-Path $scriptPath "server"
cd $serverPath

if (-not (Test-Path "venv")) {
    Write-Host "    错误: 未找到虚拟环境，请先运行: python -m venv venv" -ForegroundColor Red
    pause
    exit 1
}

$backendScript = @"
cd '$serverPath'
.\venv\Scripts\Activate.ps1
Write-Host '正在启动后端服务器...' -ForegroundColor Cyan
Write-Host '后端地址: http://localhost:8000' -ForegroundColor Green
Write-Host 'API文档: http://localhost:8000/docs' -ForegroundColor Green
Write-Host ''
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal
Write-Host "    后端服务启动中..." -ForegroundColor Green
Write-Host ""

# 等待后端启动
Write-Host "[3/6] 等待后端启动..." -ForegroundColor Green
Start-Sleep -Seconds 5
Write-Host "    后端服务已启动" -ForegroundColor Green
Write-Host ""

# 启动前端
Write-Host "[4/6] 启动前端服务 (React)..." -ForegroundColor Green
$clientPath = Join-Path $scriptPath "client"
cd $clientPath

if (-not (Test-Path "node_modules")) {
    Write-Host "    警告: 未找到 node_modules，正在安装依赖..." -ForegroundColor Yellow
    npm install
}

$frontendScript = @"
cd '$clientPath'
Write-Host '正在启动前端开发服务器...' -ForegroundColor Cyan
Write-Host '前端地址: http://localhost:3000' -ForegroundColor Green
Write-Host ''
npm start
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal
Write-Host "    前端服务启动中..." -ForegroundColor Green
Write-Host ""

# 等待前端启动
Write-Host "[5/6] 等待前端启动..." -ForegroundColor Green
Start-Sleep -Seconds 10
Write-Host "    前端服务已启动" -ForegroundColor Green
Write-Host ""

# 启动完成
Write-Host "[6/6] 系统启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  系统已成功启动！" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  前端地址: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host "  后端地址: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000" -ForegroundColor Green
Write-Host "  API文档:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "  登录信息:" -ForegroundColor Yellow
Write-Host "  用户名: " -NoNewline -ForegroundColor White
Write-Host "admin" -ForegroundColor Green
Write-Host "  密码:   " -NoNewline -ForegroundColor White
Write-Host "admin123" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  提示: 后端和前端已在新窗口中启动" -ForegroundColor Yellow
Write-Host "  关闭对应窗口即可停止服务" -ForegroundColor Yellow
Write-Host ""

# 提示打开浏览器
Write-Host "  按任意键打开浏览器..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 打开浏览器
Start-Process "http://localhost:3000/login"

Write-Host ""
Write-Host "  浏览器已打开" -ForegroundColor Green
Write-Host "  如需停止系统，请关闭后端和前端窗口" -ForegroundColor Yellow
Write-Host ""
Write-Host "按任意键退出此窗口..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

