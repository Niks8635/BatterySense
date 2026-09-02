@echo off
title BatterySense - Frontend Dashboard
echo ========================================================
echo Starting BatterySense Frontend on http://localhost:5173
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
