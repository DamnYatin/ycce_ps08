#!/usr/bin/env bash

# Exit on error
set -e

# Navigate to script directory
cd "$(dirname "$0")"

echo "===================================================="
echo " Starting KrishiMitra Market Estimator..."
echo "===================================================="

# Check for Python 3
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python is not installed or not found in PATH."
    exit 1
fi

# Setup virtual environment if not present
if [ ! -d "venv" ]; then
    echo "Creating virtual environment (venv)..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/verify dependencies
echo "Installing/verifying dependencies..."
pip install -r requirements.txt

# Launch application
echo ""
echo "===================================================="
echo " KrishiMitra is running!"
echo " - Farmer Interface: http://127.0.0.1:5000"
echo " - Admin Panel:      http://127.0.0.1:5000/admin"
echo "===================================================="
echo ""

python backend/app.py
