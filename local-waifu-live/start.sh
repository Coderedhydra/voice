#!/bin/bash
#
# Start script for Local Waifu Live
# Starts both the Python WebSocket server and Next.js web app
# Kills any existing processes on ports 8765 and 3000 before starting
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  LOCAL WAIFU LIVE - Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to kill process on port
kill_port() {
    local port=$1
    if command -v lsof > /dev/null; then
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}[*] Killing existing process on port $port (PID: $pid)...${NC}"
            kill -9 $pid 2>/dev/null || true
            sleep 1
        fi
    elif command -v fuser > /dev/null; then
        fuser -k $port/tcp 2>/dev/null || true
    fi
}

# Function to kill processes by name pattern
kill_process() {
    local pattern=$1
    pkill -f "$pattern" 2>/dev/null || true
    sleep 1
}

# Kill any existing processes
echo -e "${YELLOW}[*] Cleaning up existing processes...${NC}"
kill_port 8765
kill_port 3000
kill_process "python.*server.py"
kill_process "next dev"
echo -e "${GREEN}[✓] Cleanup complete${NC}"
echo ""

# Check if model is set
MODEL="${OLLAMA_MODEL:-dolphin-phi:2.7b}"
echo -e "${YELLOW}[*] Using model: $MODEL${NC}"
echo ""

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
    echo -e "${YELLOW}[*] Installing Node.js dependencies...${NC}"
    npm install --legacy-peer-deps
    echo -e "${GREEN}[✓] Dependencies installed${NC}"
    echo ""
fi

# Start Python server in background
echo -e "${GREEN}[*] Starting Python WebSocket server...${NC}"
cd local-waifu-live/wsl
export OLLAMA_MODEL="$MODEL"

# Check if venv exists, if not set it up first
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[*] Virtual environment not found. Setting up...${NC}"
    # Run setup synchronously first
    ./run.sh > /tmp/waifu-setup.log 2>&1 &
    SETUP_PID=$!
    # Wait for setup to complete (but don't wait for server to start)
    wait $SETUP_PID 2>/dev/null || true
    echo -e "${GREEN}[✓] Setup complete${NC}"
fi

# Activate venv and start server directly
source venv/bin/activate

# Verify and install requests if missing
if ! python -c "import requests" 2>/dev/null; then
    echo -e "${YELLOW}[*] Installing requests in virtual environment...${NC}"
    pip install -q --upgrade pip
    pip install -q requests>=2.31.0
    # Also reinstall all requirements to ensure everything is there
    pip install -q -r requirements.txt
    echo -e "${GREEN}[✓] Requests installed${NC}"
fi

# Verify all dependencies
if ! python -c "import websockets, requests" 2>/dev/null; then
    echo -e "${YELLOW}[*] Reinstalling all dependencies...${NC}"
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    pip install -q requests>=2.31.0
    echo -e "${GREEN}[✓] Dependencies reinstalled${NC}"
fi

# Ensure Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo -e "${YELLOW}[*] Starting Ollama server...${NC}"
    ollama serve > /dev/null 2>&1 &
    sleep 2
fi

# Check model exists
if ! ollama list 2>/dev/null | grep -q "$MODEL"; then
    echo -e "${YELLOW}[!] Model '$MODEL' not found. Pulling...${NC}"
    ollama pull "$MODEL" || echo -e "${RED}[!] Failed to pull model${NC}"
fi

# Start the server directly
echo -e "${YELLOW}[*] Starting WebSocket server on port 8765...${NC}"
python server.py > /tmp/waifu-python.log 2>&1 &
PYTHON_PID=$!
cd ../..

# Wait for server to start and check multiple times
echo -e "${YELLOW}[*] Waiting for Python server to start...${NC}"
for i in {1..15}; do
    sleep 1
    if lsof -ti:8765 > /dev/null 2>&1; then
        echo -e "${GREEN}[✓] Python WebSocket server running on port 8765 (PID: $PYTHON_PID)${NC}"
        break
    fi
    # Check if process died
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo -e "${RED}[!] Python server process died${NC}"
        echo -e "${RED}[!] Last 20 lines of log:${NC}"
        echo -e "${RED}----------------------------------------${NC}"
        tail -20 /tmp/waifu-python.log 2>/dev/null || echo "No log file found"
        echo -e "${RED}----------------------------------------${NC}"
        exit 1
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}[!] Python server failed to start on port 8765 after 15 seconds${NC}"
        echo -e "${RED}[!] Last 30 lines of log:${NC}"
        echo -e "${RED}----------------------------------------${NC}"
        tail -30 /tmp/waifu-python.log 2>/dev/null || echo "No log file found"
        echo -e "${RED}----------------------------------------${NC}"
        kill $PYTHON_PID 2>/dev/null || true
        exit 1
    fi
done

echo ""

# Start Next.js dev server
echo -e "${GREEN}[*] Starting Next.js web server...${NC}"
echo -e "${YELLOW}[*] Web app will be available at: http://localhost:3000/waifu${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"
echo ""

# Trap Ctrl+C to kill both processes
cleanup() {
    echo ""
    echo -e "${YELLOW}[*] Stopping servers...${NC}"
    kill $PYTHON_PID 2>/dev/null || true
    kill_process "python.*server.py"
    kill_process "next dev"
    kill_port 8765
    kill_port 3000
    echo -e "${GREEN}[✓] Servers stopped${NC}"
    exit 0
}

trap cleanup INT TERM

# Start Next.js (foreground)
npm run dev
