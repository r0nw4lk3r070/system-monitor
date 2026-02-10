@echo off
echo ========================================
echo   Stopping Hardware Monitor Servers
echo ========================================
echo.

echo Stopping Node.js processes on ports 9800 and 9801...
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9800') do (
    echo Killing process on port 9800 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9801') do (
    echo Killing process on port 9801 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
echo.
pause
