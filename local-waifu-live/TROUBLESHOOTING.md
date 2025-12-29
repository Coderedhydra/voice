# Troubleshooting Guide

## WebSocket Connection Issues

### Error: "Failed to open a WebSocket connection: invalid Connection header: keep-alive"

This error typically occurs when:

1. **The server isn't running** - Make sure `python server.py` is running in the `local-waifu-live/wsl` directory
2. **Port conflict** - Another application might be using port 8765
3. **Browser cache** - Try clearing browser cache or using incognito mode
4. **WebSocket library version** - Make sure you have the correct version installed

**Solutions:**

1. **Check if server is running:**
   ```bash
   # Check if port 8765 is in use
   netstat -tuln | grep 8765
   # or
   lsof -i :8765
   ```

2. **Restart the server:**
   ```bash
   cd local-waifu-live/wsl
   source venv/bin/activate
   python server.py
   ```

3. **Reinstall websockets library:**
   ```bash
   cd local-waifu-live/wsl
   source venv/bin/activate
   pip install --upgrade websockets
   ```

4. **Check browser console** - Open browser DevTools (F12) and check the Console tab for detailed error messages

5. **Test WebSocket connection directly:**
   ```bash
   # Install wscat if needed
   npm install -g wscat
   
   # Test connection
   wscat -c ws://localhost:8765
   ```

### Error: "Model 'qwen2.5:4b' not found"

The server defaults to `qwen2.5:4b` but you might have a different model installed.

**Solution:**

Set the model via environment variable:
```bash
export OLLAMA_MODEL=qwen3:4b
cd local-waifu-live/wsl
source venv/bin/activate
python server.py
```

Or edit `server.py` and change the default:
```python
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:4b")
```

### Connection works but no response

1. **Check Ollama is running:**
   ```bash
   pgrep ollama
   ollama list
   ```

2. **Check server logs** - Look for error messages in the Python server output

3. **Test Ollama directly:**
   ```bash
   ollama run qwen3:4b "Hello"
   ```

### Browser shows "Connecting..." but never connects

1. **Check firewall** - Make sure port 8765 isn't blocked
2. **Check Next.js dev server** - Make sure `npm run dev` is running
3. **Check WebSocket URL** - Should be `ws://localhost:8765` (not `http://`)
4. **Try different browser** - Some browsers have stricter WebSocket policies

### Three.js/WebGL not rendering

1. **Check browser WebGL support:**
   - Visit https://get.webgl.org/
   - Update your browser if WebGL isn't supported

2. **Check browser console** - Look for WebGL errors

3. **Try different browser** - Chrome, Firefox, or Edge usually work best

4. **Update graphics drivers** - Make sure your GPU drivers are up to date

## Common Issues

### "externally-managed-environment" error

Use a virtual environment (the `run.sh` script does this automatically):
```bash
cd local-waifu-live/wsl
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Port already in use

Change the port in `server.py`:
```python
WEBSOCKET_PORT = 8766  # Use a different port
```

And update the WebSocket URL in `app/waifu/page.jsx`:
```javascript
const { isConnected, ... } = useWebSocket('ws://localhost:8766');
```

### Slow responses

1. Use a smaller model (qwen2.5:4b or qwen3:4b)
2. Increase system RAM
3. Enable GPU acceleration for Ollama (if you have NVIDIA GPU)

### Next.js build errors

1. Make sure all dependencies are installed: `npm install`
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

## Getting Help

If you're still having issues:

1. Check server logs for error messages
2. Check browser console (F12) for JavaScript errors
3. Verify all services are running:
   - Ollama: `ollama list`
   - Python server: Check terminal output
   - Next.js: Check terminal output
4. Test WebSocket connection with `wscat` or browser console:
   ```javascript
   const ws = new WebSocket('ws://localhost:8765');
   ws.onopen = () => console.log('Connected!');
   ws.onerror = (e) => console.error('Error:', e);
   ```
