@echo off
setlocal
title ResumeApp Desktop
cd /d "%~dp0"
echo Building and launching desktop app...
call npm run electron:start
pause
