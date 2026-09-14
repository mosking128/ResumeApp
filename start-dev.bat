@echo off
setlocal
chcp 65001 >nul
title ResumeApp Dev Server

cd /d "%~dp0"

echo ========================================
echo   ResumeApp - Start Dev Server
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install Node 18+ and add it to PATH.
  echo https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/3] First run: installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
  )
) else (
  echo [1/3] node_modules found, skip install
)

echo [2/3] Starting Vite...
echo [3/3] Browser will open http://localhost:5173/
echo.
echo Close this window to stop the server.
echo.

start "" "http://localhost:5173/"

call npm run dev

pause
