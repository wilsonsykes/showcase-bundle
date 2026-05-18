@echo off
REM ==============================================================
REM   Brand Hub - Local Preview Server (Windows)
REM   Double-click this file to start the local server.
REM   The page will open in your default browser.
REM ==============================================================

cd /d "%~dp0"

echo.
echo   Quadro Decor - Brand Hub
echo   Starting local server at http://localhost:8001
echo.
echo   Press Ctrl+C to stop the server.
echo.

start "" http://localhost:8001

python -m http.server 8001 2>nul
if errorlevel 1 (
  py -m http.server 8001 2>nul
)

if errorlevel 1 (
  echo.
  echo   Python not found. Please install Python from python.org
  echo   Or simply double-click index.html to open without a server.
  pause
)
