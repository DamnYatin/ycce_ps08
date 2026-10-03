@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo Starting KrishiMitra Market Estimator...
echo ====================================================

REM Navigate to script directory
cd /d "%~dp0"

REM Find Python executable (check python, then py)
set "PYTHON_EXE="
where python >nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_EXE=python"
) else (
    where py >nul 2>&1
    if %errorlevel% equ 0 (
        set "PYTHON_EXE=py"
    )
)

if "%PYTHON_EXE%"=="" (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python from https://www.python.org/ and check "Add python.exe to PATH".
    echo.
    pause
    exit /b 1
)

echo Using Python: %PYTHON_EXE%

REM Setup virtual environment if not already present
if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    %PYTHON_EXE% -m venv venv
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to create venv. Running directly with system Python...
        set "PY_CMD=%PYTHON_EXE%"
    ) else (
        set "PY_CMD=venv\Scripts\python.exe"
    )
) else (
    set "PY_CMD=venv\Scripts\python.exe"
)

REM Install/verify dependencies
echo Installing/verifying dependencies...
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m pip install -r requirements.txt
) else (
    %PYTHON_EXE% -m pip install -r requirements.txt
)

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Dependency installation encountered an issue, attempting to start app anyway...
)

REM Launch application
echo.
echo ====================================================
echo  KrishiMitra is running!
echo  - Farmer Interface: http://127.0.0.1:5000
echo  - Admin Panel:      http://127.0.0.1:5000/admin
echo ====================================================
echo.

if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe backend/app.py
) else (
    %PYTHON_EXE% backend/app.py
)

pause
