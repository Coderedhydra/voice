# Fixing WebSocket Connection Issues

## The Error

If you're seeing:
```
Failed to open a WebSocket connection: invalid Connection header: keep-alive
```

This means the browser is trying to connect to the WebSocket server, but the server isn't properly handling the WebSocket upgrade request.

## Solution Steps

### 1. Make sure the server is running with the correct model

```bash
cd local-waifu-live/wsl

# Set your model (if different from default)
export OLLAMA_MODEL=qwen3:4b

# Make sure venv is activated
source venv/bin/activate

# Start the server
python server.py
```

You should see:
```
[✓] WebSocket server running on ws://localhost:8765
[*] Waiting for WebSocket client connection...
```

### 2. Verify the WebSocket server is accessible

Open a new terminal and test the connection:

```bash
# Install wscat if needed
npm install -g wscat

# Test connection
wscat -c ws://localhost:8765
```

If this works, you should see a welcome message. If it doesn't, the server isn't running correctly.

### 3. Check browser console

Open your browser's Developer Tools (F12) and check the Console tab. Look for WebSocket connection errors.

### 4. Make sure Next.js is running

In a separate terminal:
```bash
npm run dev
```

Then navigate to `http://localhost:3000/waifu`

### 5. Common fixes

**If port 8765 is already in use:**
```bash
# Find what's using the port
lsof -i :8765
# Kill the process or change the port in server.py
```

**If websockets library has issues:**
```bash
cd local-waifu-live/wsl
source venv/bin/activate
pip install --upgrade websockets
```

**If model mismatch:**
```bash
# Check what models you have
ollama list

# Set the correct model
export OLLAMA_MODEL=qwen3:4b  # or whatever model you have
```

### 6. Test WebSocket from browser console

Open browser console (F12) and try:
```javascript
const ws = new WebSocket('ws://localhost:8765');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onerror = (e) => console.error('Error:', e);
ws.onclose = () => console.log('Closed');
```

If this works, the server is fine and the issue is in the React app.
If this fails, the server has a problem.

## Still Having Issues?

1. Check server logs for errors
2. Verify Ollama is running: `ollama list`
3. Make sure you're using the correct model name
4. Try restarting both servers
5. Clear browser cache and try incognito mode
