@echo off
chcp 65001 > nul
cls

echo ========================================
echo   EPC Project Management System
echo   Engineering · Procurement · Construction
echo ========================================
echo.

:: Check port usage
echo [1/6] Checking ports...
netstat -ano | findstr ":8000" > nul
if %errorlevel% equ 0 (
    echo     Warning: Port 8000 is occupied, trying to close...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do taskkill /F /PID %%a > nul 2>&1
    timeout /t 2 /nobreak > nul
)

netstat -ano | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo     Warning: Port 3000 is occupied, trying to close...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a > nul 2>&1
    timeout /t 2 /nobreak > nul
)

echo     Port check completed
echo.

:: Start backend
echo [2/6] Starting backend service (FastAPI)...
cd /d "%~dp0server"
if not exist venv (
    echo     Error: Virtual environment not found
    echo     Please run: python -m venv venv
    pause
    exit /b 1
)

start "Backend-Server" cmd /k "call venv\Scripts\activate.bat && echo Starting backend server... && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo     Backend service starting...
echo.

:: Wait for backend
echo [3/6] Waiting for backend to start...
timeout /t 5 /nobreak > nul
echo     Backend service started
echo.

:: Start frontend
echo [4/6] Starting frontend service (React)...
cd /d "%~dp0client"
if not exist node_modules (
    echo     Warning: node_modules not found, installing dependencies...
    call npm install
)

start "Frontend-Server" cmd /k "echo Starting frontend development server... && npm start"
echo     Frontend service starting...
echo.

:: Wait for frontend
echo [5/6] Waiting for frontend to start...
timeout /t 10 /nobreak > nul
echo     Frontend service started
echo.

:: Startup complete
echo [6/6] EPC System startup completed!
echo.
echo ========================================
echo   EPC System Successfully Started!
echo ========================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo ========================================
echo.
echo   Note: Do not close this window
echo   Closing will stop the system
echo.
echo   Press any key to open browser...
pause > nul

:: Open browser
start http://localhost:3000/login

echo.
echo   Browser opened
echo   To stop the system, close backend and frontend windows
echo.
pause
