@echo off
title Showcase Local Server
echo ================================================
echo   Showcase Local Server
echo ================================================
echo.
echo Starting server at http://localhost:8000
echo.
echo Open this URL in your browser to view the showcase.
echo Keep this window open while you work.
echo.
echo To stop the server: close this window or press Ctrl+C
echo ================================================
echo.

REM Try Python 3 first (preferred), then Python 2 as fallback
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python -m http.server 8000
    goto :end
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    py -m http.server 8000
    goto :end
)

echo ERROR: Python is not installed on this computer.
echo.
echo Install Python from: https://www.python.org/downloads/
echo During installation, check the box "Add Python to PATH".
echo.
pause

:end
