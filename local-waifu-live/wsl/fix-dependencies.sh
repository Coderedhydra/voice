#!/bin/bash
#
# Fix dependencies - ensures requests is installed in venv
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR="$SCRIPT_DIR/venv"

echo "========================================"
echo "  Fixing Dependencies"
echo "========================================"

# Check if venv exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"
echo "[✓] Virtual environment activated"

# Upgrade pip
echo "[*] Upgrading pip..."
pip install --upgrade pip -q

# Install all dependencies
echo "[*] Installing dependencies..."
pip install -q -r requirements.txt
pip install -q requests>=2.31.0

# Verify installation
echo "[*] Verifying installation..."
python -c "import websockets, requests; print('[✓] All dependencies OK')"

echo ""
echo "========================================"
echo "  Dependencies Fixed!"
echo "========================================"
echo ""
echo "You can now run:"
echo "  source venv/bin/activate"
echo "  python server.py"
echo ""
