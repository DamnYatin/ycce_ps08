@echo off
title KrishiMitra - Direct Marketplace and Mandi Price Estimator
color 0A
cd /d "%~dp0"

echo ==============================================================================
echo           KrishiMitra - Direct Marketplace and Mandi Price Estimator
echo ==============================================================================
echo.

REM 1. Detect Python
set "PYTHON_CMD=python"
python --version >nul 2>&1
if errorlevel 1 (
    set "PYTHON_CMD=py"
    py --version >nul 2>&1
    if errorlevel 1 (
        set "PYTHON_CMD=python3"
        python3 --version >nul 2>&1
        if errorlevel 1 (
            color 0C
            echo [ERROR] Python is not installed or not added to PATH.
            echo Please download and install Python from https://www.python.org/
            echo Make sure to check Add Python to PATH during installation.
            echo.
            pause
            exit /b 1
        )
    )
)

REM 2. Activate or Create Virtual Environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
) else (
    echo [1/3] Creating virtual environment .venv...
    %PYTHON_CMD% -m venv .venv
    call .venv\Scripts\activate.bat
)

REM 3. Fast Dependency Check
echo [2/3] Checking dependencies...
python -c "import flask, flask_cors, gtts, requests, statsmodels, pandas, numpy" >nul 2>&1
if errorlevel 1 (
    echo [*] Installing required packages from requirements.txt...
    pip install -r requirements.txt --quiet
    if errorlevel 1 (
        echo [WARNING] Retrying dependency installation with full output:
        pip install -r requirements.txt
    )
) else (
    echo [OK] Dependencies verified.
)

REM 4. Launch Browser in Background
echo [3/3] Opening KrishiMitra in web browser...
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 1500; Start-Process 'http://127.0.0.1:5000/marketplace'"

REM 5. Server URL Directory
echo.
echo ==============================================================================
echo   * Farmer Estimator:    http://127.0.0.1:5000/
echo   * Mandi Compare:       http://127.0.0.1:5000/dashboard
echo   * Marketplace Hub:     http://127.0.0.1:5000/marketplace
echo   * Seller Dashboard:    http://127.0.0.1:5000/marketplace/seller
echo   * Buyer Marketplace:   http://127.0.0.1:5000/marketplace/buyer
echo   * System Settings:     http://127.0.0.1:5000/settings
echo ==============================================================================
echo Press Ctrl+C in this window anytime to stop the server.
echo.

REM 6. Launch Flask App
python backend/app.py

if errorlevel 1 (
    echo.
    echo [!] Server exited with an error.
    pause
)
