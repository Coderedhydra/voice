# Quick Fix: WebSocket Connection Error

## The Error Message Explained

If you see:
```
Failed to open a WebSocket connection: invalid Connection header: keep-alive.
You cannot access a WebSocket server directly with a browser.
```

**This means:** You're trying to access `ws://localhost:8765` directly in your browser address bar. **Don't do this!**

## ✅ Correct Way to Use the App

### Step 1: Start Python WebSocket Server
```bash
cd local-waifu-live/wsl
source venv/bin/activate
export OLLAMA_MODEL=qwen3:4b
python server.py
```

You should see:
```
[✓] WebSocket server running on ws://localhost:8765
[*] Waiting for WebSocket client connection...
```

### Step 2: Start Next.js Web Server
In a **NEW terminal**:
```bash
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
```

### Step 3: Open in Browser
**Type this in your browser address bar:**
```
http://localhost:3000/waifu
```

**NOT** `ws://localhost:8765` ← This won't work!

### Step 4: The Magic Happens
- The React app loads
- JavaScript automatically connects to `ws://localhost:8765`
- You see the 3D character and chat interface
- Start chatting!

## Key Points

1. **`ws://localhost:8765`** = WebSocket server (Python)
   - Started with: `python server.py`
   - Used by JavaScript code, NOT typed in browser

2. **`http://localhost:3000/waifu`** = Web app (Next.js)
   - Started with: `npm run dev`
   - This is what you type in browser

3. **The React app connects automatically**
   - When you load `http://localhost:3000/waifu`
   - JavaScript creates WebSocket connection
   - No need to type WebSocket URL manually

## Still Not Working?

### Check 1: Is Python server running?
```bash
# Should see the server waiting for connections
ps aux | grep "python server.py"
```

### Check 2: Is Next.js running?
```bash
# Should see Next.js dev server
ps aux | grep "next dev"
```

### Check 3: Open browser console (F12)
Look for WebSocket connection errors. The error message will tell you what's wrong.

### Check 4: Test WebSocket directly
```bash
# Install wscat
npm install -g wscat

# Test connection
wscat -c ws://localhost:8765
```

If `wscat` connects, the server is fine and the issue is in the React app.
If `wscat` fails, the server has a problem.

## Summary

- ✅ Open: `http://localhost:3000/waifu` in browser
- ❌ Don't open: `ws://localhost:8765` in browser
- ✅ The React app handles WebSocket connection automatically
- ✅ You just need both servers running and open the HTTP URL
