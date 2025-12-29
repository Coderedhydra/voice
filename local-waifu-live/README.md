# Local Waifu Live

A live-rendered adult anime-style 3D waifu that chats with you using a local Ollama LLM and displays real-time animations in Unity.

**Runs entirely offline on localhost. No cloud services, no external APIs.**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Windows Host                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Unity 3D                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  Animator   │  │ Blendshapes │  │   Chat UI   │  │   │
│  │  │  (Body)     │  │   (Face)    │  │             │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │                         ▲                            │   │
│  │                         │                            │   │
│  │              ┌──────────┴──────────┐                 │   │
│  │              │  WebSocketClient.cs │                 │   │
│  │              └──────────┬──────────┘                 │   │
│  └─────────────────────────┼───────────────────────────┘   │
│                            │                                │
│                   ws://localhost:8765                       │
│                            │                                │
├────────────────────────────┼────────────────────────────────┤
│                            │                                │
│                      Ubuntu WSL                             │
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
│                    │   (llama3)      │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Requirements

### Ubuntu WSL
- Python 3.8+
- pip3
- Ollama

### Windows Host
- Unity 2021.3+ (LTS recommended)
- NativeWebSocket package
- 3D anime character with Animator + blendshapes

## Quick Start

### 1. Setup WSL (Ubuntu)

```bash
# Navigate to the wsl folder
cd local-waifu-live/wsl

# Run the setup and server script
./run.sh
```

Or manually:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama server
ollama serve &

# Pull the LLM model
ollama pull llama3

# Install Python dependencies
pip3 install -r requirements.txt

# Start the WebSocket server
python3 server.py
```

### 2. Setup Unity (Windows)

1. **Install NativeWebSocket**:
   - Open Unity Package Manager (Window > Package Manager)
   - Click `+` > "Add package from git URL"
   - Enter: `https://github.com/endel/NativeWebSocket.git#upm`

2. **Import WebSocketClient.cs**:
   - Copy `unity/WebSocketClient.cs` to your Unity project's Scripts folder

3. **Setup your character**:
   - Add an Animator component with the required animation states
   - Add a SkinnedMeshRenderer with blendshapes for facial expressions
   - Attach the `WebSocketClient` script to your character

4. **Configure the Inspector**:
   - Assign the Animator reference
   - Assign the SkinnedMeshRenderer (face mesh)
   - Setup your Chat UI (TextMeshPro)
   - Setup your Input Field (TMP_InputField)

5. **Press Play**!

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

### Server → Unity
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

### Unity → Server
```json
{
  "message": "Hey Yuki, you look beautiful"
}
```

## Unity Animator Setup

Create an Animator Controller with these states:

```
Entry → idle_soft (default)
         ↓ (trigger)
    ┌────┴────┐
    │         │
lean_forward  sway_hips
    │         │
    └────┬────┘
         ↓
   teasing_pose
         ↓
close_intimate_pose
         ↓
  slow_breathing
         ↓
    shy_cover
```

Add trigger parameters for each animation:
- `idle_soft`
- `lean_forward`
- `sway_hips`
- `teasing_pose`
- `close_intimate_pose`
- `slow_breathing`
- `shy_cover`

Add float parameter:
- `Intensity` (0.0 - 1.0)

## Blendshape Setup

Your character mesh should have these blendshapes (or map your existing ones in the script):

- `Mouth_Smile`
- `Eyes_Happy`
- `Cheek_Blush`
- `Face_Embarrassed`
- `Eyes_HalfClosed`
- `Eyes_Bedroom`
- `Mouth_Open`
- `Eyes_Pleasure`
- `Eyes_LookAway`
- `Head_TurnAway`

Edit the `expressionBlendShapes` dictionary in `WebSocketClient.cs` to match your character's blendshape names.

## Changing the LLM Model

Edit `server.py` and change the `OLLAMA_MODEL` variable:

```python
OLLAMA_MODEL = "llama3"     # Default
# OLLAMA_MODEL = "llama3.1"   # Alternative
# OLLAMA_MODEL = "deepseek-r1" # Alternative
```

Then pull the model:
```bash
ollama pull <model_name>
```

## Customizing Yuki's Personality

Edit `waifu_system.txt` to modify:
- Character personality
- Allowed animations
- Response style
- Safety boundaries

## Troubleshooting

### "Connection refused" in Unity
- Make sure the Python server is running in WSL
- Check that port 8765 is not blocked by firewall
- Try using `127.0.0.1` instead of `localhost` in Unity

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
ollama pull llama3
```

### Slow responses
- Use a smaller model (llama3 8B vs 70B)
- Increase system RAM
- Consider GPU acceleration for Ollama

## File Structure

```
local-waifu-live/
├── README.md
├── wsl/
│   ├── server.py          # Python WebSocket server
│   ├── waifu_system.txt   # LLM system prompt
│   ├── requirements.txt   # Python dependencies
│   └── run.sh             # Startup script
└── unity/
    └── WebSocketClient.cs # Unity C# client
```

## License

For personal, adult use only. Character is explicitly 23 years old.

## Content Warning

This project is designed for adult (18+) users only. The character displays seductive, erotic behavior that is:
- Adult and consensual
- Non-graphic (no explicit sexual content)
- Implied rather than explicit

The system includes safeguards against explicit sexual content generation.
