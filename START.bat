@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo   AMAN CINEMATIC PORTFOLIO - START
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not available in PATH.
  echo Install Node.js LTS, reopen this folder, then run START.bat again.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo ERROR: package.json is missing.
  echo Make sure you extracted the COMPLETE ZIP and are running this file inside the project folder.
  pause
  exit /b 1
)

if not exist "app\page.tsx" (
  echo ERROR: app\page.tsx is missing. The root route cannot work without it.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies for the first run...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Read the error above.
    pause
    exit /b 1
  )
)

echo.
echo Starting portfolio...
echo Open the Local URL shown below in your browser.
echo.
call npm run dev

pause
endlocal
