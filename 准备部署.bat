@echo off
chcp 65001 > nul
cls

echo ========================================
echo   Cloud Deployment Preparation
echo ========================================
echo.

echo [Step 1/5] Checking Git installation...
git --version > nul 2>&1
if %errorlevel% neq 0 (
    echo     Error: Git is not installed!
    echo     Please download from: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo     Git is installed
echo.

echo [Step 2/5] Initializing Git repository...
if not exist .git (
    git init
    echo     Git repository initialized
) else (
    echo     Git repository already exists
)
echo.

echo [Step 3/5] Configuring Git user...
echo     Please enter your GitHub username:
set /p git_user=Username: 
echo     Please enter your email:
set /p git_email=Email: 

git config user.name "%git_user%"
git config user.email "%git_email%"
echo     Git user configured
echo.

echo [Step 4/5] Adding files to Git...
git add .
echo     Files added
echo.

echo [Step 5/5] Creating initial commit...
git commit -m "Initial commit: Chemical Project Management System"
if %errorlevel% equ 0 (
    echo     Commit created successfully
) else (
    echo     Commit skipped (no changes or already committed)
)
echo.

echo ========================================
echo   Preparation Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Create GitHub repository:
echo    - Visit: https://github.com/new
echo    - Name: chemical-project-management
echo    - Click: Create repository
echo.
echo 2. Push code to GitHub:
echo    - Copy the commands shown on GitHub
echo    - Or run:
echo      git remote add origin https://github.com/YOUR_USERNAME/chemical-project-management.git
echo      git branch -M main
echo      git push -u origin main
echo.
echo 3. Deploy to cloud:
echo    - Backend: https://render.com
echo    - Frontend: https://vercel.com
echo    - Follow: 免费云部署指南.md
echo.
echo ========================================
echo.
pause

