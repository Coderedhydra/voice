#!/bin/bash
#
# Start the WebSocket server with proper model configuration
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Use model from environment or default to qwen3:4b
MODEL="${OLLAMA_MODEL:-qwen3:4b}"

echo "========================================"
echo "  Starting WebSocket Server"
echo "  Model: $MODEL"
echo "========================================"
echo ""

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "ERROR: Virtual environment not found. Run ./run.sh first to set it up."
    exit 1
fi

# Set the model environment variable
export OLLAMA_MODEL="$MODEL"

# Start the server
python server.py
