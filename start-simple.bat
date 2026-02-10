@echo off
echo ========================================
echo   Hardware Monitor - Quick Start
echo ========================================
echo.
echo Starting servers in sequence...
echo.

cd backend
echo [1/2] Starting Backend...
start /B node server.js

timeout /t 3 /nobreak > nul

cd ..\frontend
echo [2/2] Starting Frontend...
start /B npm run dev

timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo   Servers Running!
echo ========================================
echo.
echo Backend:  http://localhost:9800
echo Frontend: http://localhost:9801
echo.
echo Opening dashboard...
timeout /t 2 /nobreak > nul
start http://localhost:9801

echo.
echo Press Ctrl+C to stop all servers...
echo.
pause
