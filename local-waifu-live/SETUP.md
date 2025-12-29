# Setup Guide - Complete Environment Setup

## Quick Setup (Automated)

Run the setup script:
```bash
cd local-waifu-live
bash start.sh
```

This will automatically:
1. Create Python virtual environment
2. Install all dependencies (including requests)
3. Check/install Ollama
4. Pull the model (dolphin-phi:2.7b)
5. Start both servers

## Manual Setup

### 1. Install Ollama
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull Model
```bash
ollama pull dolphin-phi:2.7b
```

### 3. Setup Python Environment
```bash
cd local-waifu-live/wsl

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Verify requests is installed
python -c "import requests; print('Requests version:', requests.__version__)"
```

### 4. Start Ollama Server
```bash
ollama serve &
```

### 5. Start Python WebSocket Server
```bash
cd local-waifu-live/wsl
source venv/bin/activate
export OLLAMA_MODEL=dolphin-phi:2.7b
python server.py
```

### 6. Start Next.js Web Server (in another terminal)
```bash
npm install --legacy-peer-deps
npm run dev
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'requests'"

**Solution:**
```bash
cd local-waifu-live/wsl
source venv/bin/activate
pip install requests>=2.31.0
```

### "externally-managed-environment" error

**Solution:** Always use the virtual environment:
```bash
cd local-waifu-live/wsl
source venv/bin/activate
pip install requests
```

### Virtual environment not found

**Solution:** Run the setup script:
```bash
cd local-waifu-live/wsl
./run.sh
```

### Ollama API not responding

**Check:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve &
```

### Model not found

**Solution:**
```bash
# List available models
ollama list

# Pull the model
ollama pull dolphin-phi:2.7b
```

## Verification

After setup, verify everything works:

1. **Check Python dependencies:**
   ```bash
   cd local-waifu-live/wsl
   source venv/bin/activate
   python -c "import websockets, requests; print('All dependencies OK')"
   ```

2. **Check Ollama:**
   ```bash
   ollama list
   curl http://localhost:11434/api/tags
   ```

3. **Test WebSocket server:**
   ```bash
   cd local-waifu-live/wsl
   source venv/bin/activate
   python server.py
   # Should see: "[✓] WebSocket server running on ws://localhost:8765"
   ```

4. **Test Web app:**
   ```bash
   npm run dev
   # Open http://localhost:3000/waifu
   ```

## Complete Setup Script

For a complete fresh setup:

```bash
#!/bin/bash
# Complete setup script

cd local-waifu-live/wsl

# Create venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install requests>=2.31.0

# Verify
python -c "import websockets, requests; print('✓ Dependencies OK')"

# Start Ollama if not running
if ! pgrep -x ollama > /dev/null; then
    ollama serve &
    sleep 3
fi

# Pull model if needed
if ! ollama list | grep -q "dolphin-phi:2.7b"; then
    ollama pull dolphin-phi:2.7b
fi

echo "✓ Setup complete!"
```
