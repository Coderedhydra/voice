#!/bin/bash
#
# Local Waifu Live - Run Script
# Starts Ollama and the WebSocket server
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo -e "${YELLOW}[!] pip3 not found. Installing...${NC}"
    sudo apt update && sudo apt install -y python3-pip
fi
echo -e "${GREEN}[✓] pip3 available${NC}"

# Install Python dependencies
echo -e "${YELLOW}[*] Installing Python dependencies...${NC}"
pip3 install -q -r requirements.txt
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
    ollama serve &
    sleep 3
fi
echo -e "${GREEN}[✓] Ollama server running${NC}"

# Check for model
MODEL="llama3"
if ! ollama list | grep -q "$MODEL"; then
    echo -e "${YELLOW}[!] Model '$MODEL' not found. Pulling...${NC}"
    ollama pull "$MODEL"
fi
echo -e "${GREEN}[✓] Model '$MODEL' ready${NC}"

echo ""
echo "========================================"
echo "  Starting WebSocket Server"
echo "  Connect Unity to: ws://localhost:8765"
echo "========================================"
echo ""

# Run the server
python3 server.py
