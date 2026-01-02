#!/bin/bash

echo "========================================"
echo "  OLLAMA DIAGNOSTIC CHECK"
echo "========================================"
echo ""

# Check if Ollama is installed
echo "[1] Checking if Ollama is installed..."
if command -v ollama &> /dev/null; then
    echo "    ✅ Ollama is installed"
    ollama --version
else
    echo "    ❌ Ollama is NOT installed"
    echo "    Install with: curl -fsSL https://ollama.ai/install.sh | sh"
    exit 1
fi

echo ""

# Check if Ollama service is running
echo "[2] Checking if Ollama service is running..."
if pgrep -f "ollama" > /dev/null; then
    echo "    ✅ Ollama is running (PID: $(pgrep -f ollama))"
else
    echo "    ❌ Ollama is NOT running"
    echo "    Start with: ollama serve &"
    echo "    Or in another terminal: ollama serve"
fi

echo ""

# Check if Ollama API is responding
echo "[3] Checking if Ollama API is responding..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "    ✅ Ollama API is responding on port 11434"
else
    echo "    ❌ Ollama API is not responding"
    echo "    Make sure to run: ollama serve"
fi

echo ""

# Check available models
echo "[4] Checking available models..."
MODELS=$(curl -s http://localhost:11434/api/tags 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$MODELS" | python3 -m json.tool 2>/dev/null || echo "    Could not parse models"
    
    # Check for recommended models
    echo ""
    echo "    Checking for recommended models..."
    
    if echo "$MODELS" | grep -q "dolphin-phi"; then
        echo "    ✅ dolphin-phi model found"
    else
        echo "    ❌ dolphin-phi model not found"
        echo "       Install with: ollama pull dolphin-phi:2.7b"
    fi
    
    if echo "$MODELS" | grep -q "qwen"; then
        echo "    ✅ qwen model found"
    else
        echo "    ⚠️  qwen model not found (optional)"
        echo "       Install with: ollama pull qwen2.5:4b"
    fi
else
    echo "    ❌ Could not check models (API not responding)"
fi

echo ""

# Test a simple query
echo "[5] Testing Ollama with a simple query..."
MODEL="${OLLAMA_MODEL:-dolphin-phi:2.7b}"
echo "    Using model: $MODEL"

TEST_RESPONSE=$(curl -s http://localhost:11434/api/generate \
    -d '{
        "model": "'$MODEL'",
        "prompt": "Say hello in 5 words",
        "stream": false,
        "options": {"num_predict": 10}
    }' 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$TEST_RESPONSE" ]; then
    echo "    ✅ Ollama responded successfully!"
    echo "    Response preview:"
    echo "$TEST_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print('   ', data.get('response', 'No response')[:100])" 2>/dev/null || echo "    (Could not parse response)"
else
    echo "    ❌ Ollama did not respond to test query"
    echo "    This is why you're seeing fallback messages!"
fi

echo ""

# Final recommendations
echo "========================================"
echo "  RECOMMENDATIONS"
echo "========================================"
echo ""

if ! pgrep -f "ollama" > /dev/null; then
    echo "⚠️  START OLLAMA:"
    echo "   Run in a separate terminal: ollama serve"
    echo "   Or in background: ollama serve &"
    echo ""
fi

if ! echo "$MODELS" | grep -q "dolphin-phi"; then
    echo "⚠️  INSTALL MODEL:"
    echo "   ollama pull dolphin-phi:2.7b"
    echo "   OR"
    echo "   ollama pull qwen2.5:4b"
    echo ""
fi

echo "✅ After fixing, restart the WebSocket server:"
echo "   cd ~/voice/local-waifu-live"
echo "   bash start.sh"
echo ""
