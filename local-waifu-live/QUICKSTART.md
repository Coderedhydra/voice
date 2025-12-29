# Quick Start Guide - Ubuntu

## Prerequisites

1. **Install Ollama:**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Pull a model (choose one):**
   ```bash
   ollama pull qwen2.5:4b
   # or
   ollama pull qwen3:4b
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Option 1: Use the start script (recommended)

```bash
# Set your preferred model (optional)
export OLLAMA_MODEL=qwen3:4b

# Start both servers
./local-waifu-live/start.sh
```

Then open `http://localhost:3000/waifu` in your browser.

### Option 2: Run servers separately

**Terminal 1 - Python WebSocket Server:**
```bash
cd local-waifu-live/wsl
export OLLAMA_MODEL=qwen3:4b  # Optional
./run.sh
```

**Terminal 2 - Next.js Web Server:**
```bash
npm run dev
```

Then open `http://localhost:3000/waifu` in your browser.

## Troubleshooting

- **Can't connect?** Make sure the Python server is running on port 8765
- **Model not found?** Run `ollama pull <model-name>`
- **WebGL not working?** Update your browser or try Chrome/Firefox
- **Port already in use?** Change ports in `server.py` (8765) or `next.config.js` (3000)

## Available Models

- `qwen2.5:4b` - Fast, good quality (recommended)
- `qwen3:4b` - Latest Qwen model
- `llama3` - Meta's Llama 3
- `llama3.1` - Updated Llama 3.1
