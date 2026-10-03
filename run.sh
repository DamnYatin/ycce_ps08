


#!/usr/bin/env bash
# ==============================================================================
# KrishiMitra - Sell vs. Hold AI Advisory & Mandi Estimator
# Linux / Arch Linux Startup Script
# ==============================================================================

set -e

# Change directory to the repository root
cd "$(dirname "$0")"

echo "=============================================================================="
echo "          🌾 KrishiMitra - Sell vs. Hold AI Advisory & Mandi Estimator"
echo "=============================================================================="
echo ""

# 1. Check Python 3 installation
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ [ERROR] Python 3 is not installed or not in PATH."
    echo "On Arch Linux, install it via: sudo pacman -S python python-pip"
    exit 1
fi

echo "✔ Detected Python: $($PYTHON_CMD --version)"

# 2. Setup / Activate Virtual Environment (Arch Linux PEP 668 compliance)
if [ ! -d ".venv" ]; then
    echo "📦 [1/3] Creating virtual environment (.venv)..."
    $PYTHON_CMD -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# 3. Install / Verify dependencies
echo "📦 [2/3] Verifying and installing dependencies from requirements.txt..."
pip install -r requirements.txt --quiet

# Detect available port (defaults to 5000, falls back to 5001 if macOS AirPlay/another service occupies 5000)
SERVER_PORT=${PORT:-5000}
if command -v lsof &>/dev/null; then
    if lsof -i :"$SERVER_PORT" &>/dev/null; then
        echo "ℹ️  Port $SERVER_PORT is currently in use (e.g., macOS AirPlay Receiver). Switching to 5001..."
        SERVER_PORT=5001
    fi
fi
export PORT="$SERVER_PORT"

# 4. Launch Default Web Browser (macOS 'open' or Linux 'xdg-open')
if command -v open &>/dev/null; then
    (sleep 2 && open "http://127.0.0.1:$SERVER_PORT" >/dev/null 2>&1 || true) &
elif command -v xdg-open &>/dev/null; then
    (sleep 2 && xdg-open "http://127.0.0.1:$SERVER_PORT" >/dev/null 2>&1 || true) &
fi

# 5. Start KrishiMitra Server
echo "🚀 [3/3] Starting KrishiMitra Server on port $SERVER_PORT..."
echo ""
echo "=============================================================================="
echo "  🌾 Farmer Estimator:    http://127.0.0.1:$SERVER_PORT/"
echo "  📊 Mandi Compare:       http://127.0.0.1:$SERVER_PORT/dashboard"
echo "  🏪 Marketplace Hub:     http://127.0.0.1:$SERVER_PORT/marketplace"
echo "  👨‍🌾 Seller Dashboard:    http://127.0.0.1:$SERVER_PORT/marketplace/seller"
echo "  🛒 Buyer Marketplace:   http://127.0.0.1:$SERVER_PORT/marketplace/buyer"
echo "  ⚙️ System Settings:     http://127.0.0.1:$SERVER_PORT/settings"
echo "=============================================================================="
echo "Press Ctrl+C anytime to stop the server."
echo ""

python backend/app.py

