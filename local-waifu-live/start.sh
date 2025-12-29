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
MODEL="${OLLAMA_MODEL:-qwen3:4b}"
echo -e "${YELLOW}[*] Using model: $MODEL${NC}"
echo ""

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
    echo -e "${YELLOW}[*] Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}[✓] Dependencies installed${NC}"
    echo ""
fi

# Start Python server in background
echo -e "${GREEN}[*] Starting Python WebSocket server...${NC}"
cd local-waifu-live/wsl
export OLLAMA_MODEL="$MODEL"

# Start the server (run.sh will handle killing existing processes)
./run.sh > /tmp/waifu-python.log 2>&1 &
PYTHON_PID=$!
cd ../..

# Wait a bit for server to start
sleep 4

# Check if Python server started successfully
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo -e "${RED}[!] Python server failed to start${NC}"
    echo -e "${RED}[!] Check logs: cat /tmp/waifu-python.log${NC}"
    exit 1
fi

# Check if server is listening on port 8765
sleep 2
if ! lsof -ti:8765 > /dev/null 2>&1; then
    echo -e "${RED}[!] Python server is not listening on port 8765${NC}"
    echo -e "${RED}[!] Check logs: cat /tmp/waifu-python.log${NC}"
    kill $PYTHON_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}[✓] Python WebSocket server running (PID: $PYTHON_PID)${NC}"
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
