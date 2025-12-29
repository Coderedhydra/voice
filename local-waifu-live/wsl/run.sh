#!/bin/bash
#
# Local Waifu Live - Run Script
# Starts Ollama and the WebSocket server
# Uses Python virtual environment for dependencies
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR="$SCRIPT_DIR/venv"

echo "========================================"
echo "  LOCAL WAIFU LIVE - Startup Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python 3 not found. Install with: sudo apt install python3${NC}"
    exit 1
fi
echo -e "${GREEN}[✓] Python 3 found${NC}"

# Check for python3-venv
if ! python3 -m venv --help &> /dev/null 2>&1; then
    echo -e "${YELLOW}[!] python3-venv not found. Installing...${NC}"
    sudo apt update && sudo apt install -y python3-venv python3-full
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}[*] Creating Python virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}[✓] Virtual environment created${NC}"
else
    echo -e "${GREEN}[✓] Virtual environment exists${NC}"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"
echo -e "${GREEN}[✓] Virtual environment activated${NC}"

# Upgrade pip in venv
echo -e "${YELLOW}[*] Upgrading pip...${NC}"
pip install --upgrade pip -q

# Install Python dependencies in virtual environment
echo -e "${YELLOW}[*] Installing Python dependencies...${NC}"
pip install -q --upgrade pip
pip install -q -r requirements.txt
# Ensure requests is installed
pip install -q requests>=2.31.0
echo -e "${GREEN}[✓] Dependencies installed${NC}"

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}[!] Ollama not found. Installing...${NC}"
    curl -fsSL https://ollama.ai/install.sh | sh
fi
echo -e "${GREEN}[✓] Ollama installed${NC}"

# Start Ollama server in background if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo -e "${YELLOW}[*] Starting Ollama server...${NC}"
    ollama serve > /dev/null 2>&1 &
    sleep 3
fi
echo -e "${GREEN}[✓] Ollama server running${NC}"

# Check for model (use environment variable or default)
MODEL="${OLLAMA_MODEL:-dolphin-phi:2.7b}"
if ! ollama list | grep -q "$MODEL"; then
    echo -e "${YELLOW}[!] Model '$MODEL' not found. Pulling...${NC}"
    ollama pull "$MODEL"
fi
echo -e "${GREEN}[✓] Model '$MODEL' ready${NC}"

echo ""
echo "========================================"
echo "  Starting WebSocket Server"
echo "  Connect Web Client to: ws://localhost:8765"
echo "  Model: $MODEL"
echo "========================================"
echo ""

# Kill any existing server on port 8765
if command -v lsof > /dev/null; then
    PID=$(lsof -ti:8765 2>/dev/null || true)
    if [ ! -z "$PID" ]; then
        echo -e "${YELLOW}[*] Killing existing process on port 8765 (PID: $PID)...${NC}"
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
elif command -v fuser > /dev/null; then
    echo -e "${YELLOW}[*] Killing existing process on port 8765...${NC}"
    fuser -k 8765/tcp 2>/dev/null || true
    sleep 2
fi

# Also kill any Python server processes
pkill -f "python.*server.py" 2>/dev/null || true
sleep 1

# Run the server using the virtual environment's Python
python server.py
