#!/bin/bash
#
# Start script for Local Waifu Live
# Starts both the Python WebSocket server and Next.js web app
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  LOCAL WAIFU LIVE - Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if model is set
MODEL="${OLLAMA_MODEL:-qwen2.5:4b}"
echo -e "${YELLOW}[*] Using model: $MODEL${NC}"
echo ""

# Start Python server in background
echo -e "${GREEN}[*] Starting Python WebSocket server...${NC}"
cd local-waifu-live/wsl
export OLLAMA_MODEL="$MODEL"
./run.sh &
PYTHON_PID=$!
cd ../..

# Wait a bit for server to start
sleep 3

# Start Next.js dev server
echo -e "${GREEN}[*] Starting Next.js web server...${NC}"
echo -e "${YELLOW}[*] Web app will be available at: http://localhost:3000/waifu${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"
echo ""

# Trap Ctrl+C to kill both processes
trap "echo ''; echo 'Stopping servers...'; kill $PYTHON_PID 2>/dev/null; exit" INT TERM

# Start Next.js (foreground)
npm run dev
