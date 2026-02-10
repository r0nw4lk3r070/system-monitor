@echo off
echo ========================================
echo   Hardware Monitor - Starting Servers
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 9800)...
echo.
start "Hardware Monitor - Backend" cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server (Port 9801)...
echo.
start "Hardware Monitor - Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   Servers are starting!
echo ========================================
echo.

echo Backend:  http://localhost:9800
echo Frontend: http://localhost:9801
echo.
echo Press any key to open dashboard in browser...
pause > nul

start http://localhost:9801

echo.
echo Done! Dashboard is open.
echo To stop servers, close the Backend and Frontend windows.
pause
