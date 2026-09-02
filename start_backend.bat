@echo off
title BatterySense - Backend Server
echo ========================================================
echo Starting BatterySense Backend on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0backend"
python run.py
pause
