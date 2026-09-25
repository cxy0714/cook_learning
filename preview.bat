@echo off
cd /d "%~dp0"
echo.
echo   Local preview: http://127.0.0.1:8765/
echo   Press Ctrl+C to stop.
echo.
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8765/'"
python -m http.server 8765 --bind 127.0.0.1