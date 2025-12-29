# Local Waifu Live - Web Edition

A live-rendered adult anime-style 3D waifu that chats with you using a local Ollama LLM and displays real-time animations in a web browser using Three.js/WebGL.

**Runs entirely offline on localhost. No cloud services, no external APIs. Works on Ubuntu/Linux.**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Ubuntu Host                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js Web App (Port 3000)            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Three.js    │  │  WebSocket  │  │   Chat UI   │  │   │
│  │  │ Renderer    │  │   Client    │  │             │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│                   ws://localhost:8765                       │
│                            │                                │
│  ┌─────────────────────────┴───────────────────────────┐   │
│  │                   server.py                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  WebSocket  │  │   Prompt    │  │    JSON     │  │   │
│  │  │   Server    │  │   Engine    │  │   Parser    │  │   │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘  │   │
│  └──────────────────────────┼──────────────────────────┘   │
│                             │                               │
│                    ┌────────┴────────┐                      │
│                    │     Ollama      │                      │
│                    │ (qwen2.5:4b,    │                      │
│                    │  qwen3:4b, etc) │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Requirements

### Ubuntu/Linux
- Python 3.8+
- pip3
- Node.js 18+ and npm
- Ollama
- Modern web browser with WebGL support

## Quick Start

### 1. Install Ollama

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull a Model

Choose one of these models (recommended for Ubuntu):

```bash
# Qwen models (good performance, smaller size)
ollama pull qwen2.5:4b
# or
ollama pull qwen3:4b

# Alternative: Llama models
ollama pull llama3
# or
ollama pull llama3.1
```

### 3. Setup Python Server

```bash
cd local-waifu-live/wsl

# Run the setup script (creates venv, installs dependencies)
./run.sh
```

Or manually:

```bash
cd local-waifu-live/wsl

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set model (optional, defaults to qwen2.5:4b)
export OLLAMA_MODEL=qwen3:4b

# Start the WebSocket server
python server.py
```

The server will run on `ws://localhost:8765`

### 4. Setup Next.js Web App

In a new terminal:

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The web app will be available at `http://localhost:3000/waifu`

### 5. Open in Browser

Navigate to `http://localhost:3000/waifu` and start chatting!

## Changing the LLM Model

### Option 1: Environment Variable

```bash
export OLLAMA_MODEL=qwen3:4b
python server.py
```

### Option 2: Edit server.py

Edit `local-waifu-live/wsl/server.py`:

```python
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:4b")
```

Then pull the model:
```bash
ollama pull qwen3:4b
```

### Option 3: Use the UI

The web interface has a dropdown to select models (requires server restart with new model).

## Animation Commands

### Body Animations
| Name | Description |
|------|-------------|
| `idle_soft` | Gentle breathing, relaxed stance |
| `lean_forward` | Leaning toward the user intimately |
| `sway_hips` | Slow, sensual hip movement |
| `teasing_pose` | Playful, flirtatious stance |
| `close_intimate_pose` | Very close, personal space invasion |
| `slow_breathing` | Deep, heavy breathing |
| `shy_cover` | Covering self shyly |

### Facial Expressions
| Name | Description |
|------|-------------|
| `smile_seductive` | Sultry, knowing smile |
| `blush_light` | Slight pink cheeks |
| `blush_heavy` | Deep red blush |
| `half_lidded_eyes` | Bedroom eyes |
| `soft_moan` | Lips parted, pleasure |
| `look_away` | Shy avoidance |

## JSON Protocol

### Server → Web Client
```json
{
  "animation": {
    "type": "animation",
    "body": "lean_forward",
    "face": "blush_light",
    "intensity": 0.5,
    "duration": 2.0
  },
  "chat": "Mmm~ hello there..."
}
```

### Web Client → Server
```json
{
  "message": "Hey Yuki, you look beautiful"
}
```

## Customizing Yuki's Personality

Edit `waifu_system.txt` to modify:
- Character personality
- Allowed animations
- Response style
- Safety boundaries

## Troubleshooting

### "externally-managed-environment" error
On modern Debian/Ubuntu systems, you must use a virtual environment:

```bash
cd local-waifu-live/wsl
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

The `run.sh` script handles this automatically.

### "Connection refused" in browser
- Make sure the Python server is running: `python server.py`
- Check that port 8765 is not blocked: `netstat -tuln | grep 8765`
- Check browser console for WebSocket errors

### Ollama not responding
```bash
# Check if Ollama is running
pgrep ollama

# Restart Ollama
pkill ollama
ollama serve &
```

### Model not found
```bash
# List available models
ollama list

# Pull the required model
ollama pull qwen2.5:4b
```

### Web app not loading
- Make sure Node.js dependencies are installed: `npm install`
- Check if port 3000 is available: `lsof -i :3000`
- Check browser console for errors

### Slow responses
- Use a smaller model (qwen2.5:4b or qwen3:4b)
- Increase system RAM
- Consider GPU acceleration for Ollama (if you have NVIDIA GPU)

### Three.js/WebGL not working
- Check browser WebGL support: https://get.webgl.org/
- Update your browser to the latest version
- Try a different browser (Chrome, Firefox, Edge)

## File Structure

```
local-waifu-live/
├── README.md
├── wsl/
│   ├── server.py          # Python WebSocket server
│   ├── waifu_system.txt   # LLM system prompt
│   ├── requirements.txt   # Python dependencies
│   └── run.sh             # Startup script
app/
└── waifu/
    ├── page.jsx           # Main React page
    ├── hooks/
    │   └── useWebSocket.js # WebSocket client hook
    └── components/
        └── CharacterRenderer.jsx # Three.js renderer
```

## Running Both Servers

You'll need two terminal windows:

**Terminal 1 - Python WebSocket Server:**
```bash
cd local-waifu-live/wsl
./run.sh
```

**Terminal 2 - Next.js Web Server:**
```bash
npm run dev
```

Then open `http://localhost:3000/waifu` in your browser.

## Production Build

To build for production:

```bash
# Build Next.js app
npm run build

# Start production server
npm start
```

## License

For personal, adult use only. Character is explicitly 23 years old.

## Content Warning

This project is designed for adult (18+) users only. The character displays seductive, erotic behavior that is:
- Adult and consensual
- Non-graphic (no explicit sexual content)
- Implied rather than explicit

The system includes safeguards against explicit sexual content generation.
