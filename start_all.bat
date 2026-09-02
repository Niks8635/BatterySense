@echo off
title BatterySense Launcher
echo ========================================================
echo Starting BatterySense (Backend + Frontend)
echo ========================================================
start "BatterySense Backend" cmd /k "%~dp0start_backend.bat"
timeout /t 2 /nobreak >nul
start "BatterySense Frontend" cmd /k "%~dp0start_frontend.bat"
echo Applications launched. Open http://localhost:5173 in your browser.
