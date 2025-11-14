@echo off
echo ========================================
echo  Juicy Delights Delivery App Launcher
echo ========================================
echo.
echo Starting Backend Server...
start cmd /k "cd backend && npm install && npm run dev"
echo.
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul
echo.
echo Starting Frontend Server...
start cmd /k "npm install && npm run dev"
echo.
echo ========================================
echo  App is launching!
echo ========================================
echo  Backend: http://localhost:3000
echo  Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul

