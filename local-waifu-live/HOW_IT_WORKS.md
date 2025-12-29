# How the WebSocket Connection Works

## Understanding WebSocket URLs

**Important:** You CANNOT open `ws://localhost:8765` directly in your browser address bar. WebSocket servers are not HTTP servers - they require a WebSocket client to connect.

## The Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Your Browser (http://localhost:3000/waifu)            │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Next.js React App                                │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  JavaScript WebSocket Client                 │ │ │
│  │  │  (useWebSocket hook)                         │ │ │
│  │  │  Connects to: ws://localhost:8765           │ │ │
│  │  └─────────────────────────────────────────────┘ │ │ │
│  └───────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                         │ WebSocket Connection
                         │ (ws:// protocol)
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Python WebSocket Server (localhost:8765)               │
│  ┌───────────────────────────────────────────────────┐ │
│  │  server.py                                         │ │
│  │  Handles WebSocket connections                     │ │
│  │  Communicates with Ollama                         │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Step-by-Step Process

1. **Start Python Server:**
   ```bash
   cd local-waifu-live/wsl
   source venv/bin/activate
   export OLLAMA_MODEL=qwen3:4b
   python server.py
   ```
   This starts the WebSocket server on `ws://localhost:8765`

2. **Start Next.js App:**
   ```bash
   npm run dev
   ```
   This starts the web server on `http://localhost:3000`

3. **Open Browser:**
   Navigate to: `http://localhost:3000/waifu`
   
   **NOT** `ws://localhost:8765` (this won't work!)

4. **React App Connects:**
   - The React app loads in your browser
   - JavaScript code automatically creates a WebSocket connection
   - The connection goes from browser → Python server
   - Messages flow both ways

## What Happens When You Open the Page

1. Browser loads `http://localhost:3000/waifu`
2. React app renders
3. `useWebSocket` hook runs
4. JavaScript creates: `new WebSocket('ws://localhost:8765')`
5. Browser connects to Python server
6. Server sends welcome message
7. You can now chat!

## Common Mistakes

### ❌ Wrong: Opening WebSocket URL directly
```
Browser address bar: ws://localhost:8765
Result: Error - browsers can't display WebSocket servers
```

### ✅ Correct: Opening the React app
```
Browser address bar: http://localhost:3000/waifu
Result: React app loads, then connects to WebSocket automatically
```

## Troubleshooting

### "Connection refused" or "Failed to connect"

1. **Check Python server is running:**
   ```bash
   # Should see: "[✓] WebSocket server running on ws://localhost:8765"
   ```

2. **Check port 8765 is listening:**
   ```bash
   netstat -tuln | grep 8765
   # or
   lsof -i :8765
   ```

3. **Check browser console (F12):**
   - Look for WebSocket connection errors
   - Check if URL is correct: `ws://localhost:8765`

### "Invalid Connection header: keep-alive"

This error means:
- The browser is trying to connect via HTTP instead of WebSocket
- OR the server isn't properly handling the WebSocket upgrade

**Fix:**
- Make sure you're accessing `http://localhost:3000/waifu` (not `ws://localhost:8765`)
- Check server logs for errors
- Restart the Python server

## Testing the Connection

### Test 1: Check server is running
```bash
curl http://localhost:8765
# Should fail (WebSocket servers don't respond to HTTP)
```

### Test 2: Use wscat (WebSocket client)
```bash
npm install -g wscat
wscat -c ws://localhost:8765
# Should connect and show welcome message
```

### Test 3: Browser console
Open browser console (F12) and run:
```javascript
const ws = new WebSocket('ws://localhost:8765');
ws.onopen = () => console.log('✓ Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onerror = (e) => console.error('✗ Error:', e);
```

## Summary

- **WebSocket URL (`ws://localhost:8765`):** Used by JavaScript code, NOT typed in browser
- **HTTP URL (`http://localhost:3000/waifu`):** What you type in browser
- **React App:** Acts as WebSocket client, connects automatically
- **Python Server:** WebSocket server, handles connections

The React app is your WebSocket client - it runs in the browser and connects to the server automatically when you load the page!
