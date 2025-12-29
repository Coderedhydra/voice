#!/usr/bin/env python3
"""
Local Waifu Live - WebSocket Server
Connects Ollama LLM to Unity 3D renderer via WebSocket
Runs on Ubuntu WSL, communicates with Unity on Windows host
"""

import asyncio
import json
import os
import subprocess
import re
import signal
import sys
from pathlib import Path
from typing import Optional, Tuple

try:
    import websockets
    from websockets.server import serve
except ImportError:
    print("ERROR: websockets not installed. Run: pip install websockets")
    sys.exit(1)

# Configuration
WEBSOCKET_HOST = "localhost"  # Bind to localhost only
WEBSOCKET_PORT = 8765
# Default model - can be overridden via environment variable
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:4b")  # Options: qwen2.5:4b, qwen3:4b, llama3, llama3.1
SYSTEM_PROMPT_FILE = Path(__file__).parent / "waifu_system.txt"

# Global state
connected_clients = set()
conversation_history = []
system_prompt = ""


def load_system_prompt() -> str:
    """Load the waifu system prompt from file."""
    if SYSTEM_PROMPT_FILE.exists():
        return SYSTEM_PROMPT_FILE.read_text(encoding="utf-8")
    else:
        print(f"WARNING: System prompt file not found: {SYSTEM_PROMPT_FILE}")
        return "You are Yuki, a seductive 23-year-old anime waifu."


def check_ollama_available() -> bool:
    """Check if Ollama is installed and running."""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def check_model_available(model: str) -> bool:
    """Check if the specified model is available in Ollama."""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return model in result.stdout
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def query_ollama(user_message: str, history: list) -> str:
    """Query Ollama with the user message and conversation history."""
    global system_prompt
    
    # Build the full prompt with history
    full_prompt = f"System: {system_prompt}\n\n"
    
    # Add conversation history (last 10 exchanges)
    for exchange in history[-10:]:
        full_prompt += f"User: {exchange['user']}\nYuki: {exchange['assistant']}\n\n"
    
    # Add current user message
    full_prompt += f"User: {user_message}\nYuki:"
    
    try:
        # Run Ollama with the prompt
        result = subprocess.run(
            ["ollama", "run", OLLAMA_MODEL, full_prompt],
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout for slow models
        )
        
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            print(f"Ollama error: {result.stderr}")
            return generate_fallback_response()
            
    except subprocess.TimeoutExpired:
        print("Ollama query timed out")
        return generate_fallback_response()
    except Exception as e:
        print(f"Ollama query failed: {e}")
        return generate_fallback_response()


def generate_fallback_response() -> str:
    """Generate a fallback response when Ollama fails."""
    return '''```json
{
  "type": "animation",
  "body": "idle_soft",
  "face": "smile_seductive",
  "intensity": 0.3,
  "duration": 2.0
}
```
Mmm~ sorry, I got a little distracted there... What were you saying, darling?'''


def extract_animation_json(response: str) -> Optional[dict]:
    """Extract animation JSON from the model response."""
    # Try to find JSON in code blocks first
    json_block_pattern = r'```(?:json)?\s*(\{[^`]*?"type"\s*:\s*"animation"[^`]*?\})\s*```'
    match = re.search(json_block_pattern, response, re.DOTALL | re.IGNORECASE)
    
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    
    # Try to find raw JSON object
    json_pattern = r'\{[^{}]*"type"\s*:\s*"animation"[^{}]*\}'
    match = re.search(json_pattern, response, re.DOTALL)
    
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    
    # Return default animation if extraction fails
    return {
        "type": "animation",
        "body": "idle_soft",
        "face": "smile_seductive",
        "intensity": 0.3,
        "duration": 2.0
    }


def extract_chat_text(response: str) -> str:
    """Extract chat text from the model response (everything after JSON)."""
    # Remove JSON code blocks
    text = re.sub(r'```(?:json)?\s*\{[^`]*?\}\s*```', '', response, flags=re.DOTALL)
    
    # Remove raw JSON objects that look like animation commands
    text = re.sub(r'\{[^{}]*"type"\s*:\s*"animation"[^{}]*\}', '', text, flags=re.DOTALL)
    
    # Clean up whitespace
    text = text.strip()
    
    # If nothing left, return a default
    if not text:
        text = "Mmm~ *smiles softly*"
    
    return text


def validate_animation(animation: dict) -> dict:
    """Validate and sanitize animation data."""
    valid_body = [
        "idle_soft", "lean_forward", "sway_hips", 
        "teasing_pose", "close_intimate_pose", 
        "slow_breathing", "shy_cover"
    ]
    valid_face = [
        "smile_seductive", "blush_light", "blush_heavy",
        "half_lidded_eyes", "soft_moan", "look_away"
    ]
    
    # Validate and fix body animation
    if animation.get("body") not in valid_body:
        animation["body"] = "idle_soft"
    
    # Validate and fix facial expression
    if animation.get("face") not in valid_face:
        animation["face"] = "smile_seductive"
    
    # Validate and fix intensity
    try:
        intensity = float(animation.get("intensity", 0.5))
        animation["intensity"] = max(0.0, min(1.0, intensity))
    except (ValueError, TypeError):
        animation["intensity"] = 0.5
    
    # Validate and fix duration
    try:
        duration = float(animation.get("duration", 2.0))
        animation["duration"] = max(0.5, min(10.0, duration))
    except (ValueError, TypeError):
        animation["duration"] = 2.0
    
    # Ensure type is set
    animation["type"] = "animation"
    
    return animation


def process_response(response: str) -> Tuple[dict, str]:
    """Process model response into animation and chat text."""
    animation = extract_animation_json(response)
    animation = validate_animation(animation)
    chat_text = extract_chat_text(response)
    return animation, chat_text


async def handle_client(websocket):
    """Handle a connected Unity client."""
    global conversation_history
    
    client_address = websocket.remote_address
    print(f"[+] Unity client connected: {client_address}")
    connected_clients.add(websocket)
    
    # Send welcome message
    welcome_animation = {
        "type": "animation",
        "body": "lean_forward",
        "face": "smile_seductive",
        "intensity": 0.4,
        "duration": 2.5
    }
    welcome_text = "Hello there~ *leans forward with a warm smile* I'm Yuki... I've been waiting for you. What would you like to talk about?"
    
    try:
        await websocket.send(json.dumps({
            "animation": welcome_animation,
            "chat": welcome_text
        }))
    except Exception as e:
        print(f"Failed to send welcome: {e}")
    
    try:
        async for message in websocket:
            print(f"[<] Received: {message[:100]}...")
            
            try:
                data = json.loads(message)
                user_input = data.get("message", "").strip()
            except json.JSONDecodeError:
                user_input = message.strip()
            
            if not user_input:
                continue
            
            print(f"[?] Querying Ollama: {user_input[:50]}...")
            
            # Query Ollama
            response = query_ollama(user_input, conversation_history)
            
            # Process response
            animation, chat_text = process_response(response)
            
            # Store in history
            conversation_history.append({
                "user": user_input,
                "assistant": chat_text
            })
            
            # Keep history manageable
            if len(conversation_history) > 50:
                conversation_history = conversation_history[-30:]
            
            # Build response payload
            payload = {
                "animation": animation,
                "chat": chat_text
            }
            
            print(f"[>] Sending animation: {animation['body']}/{animation['face']} @ {animation['intensity']}")
            print(f"[>] Chat: {chat_text[:80]}...")
            
            # Send to client
            await websocket.send(json.dumps(payload))
            
    except websockets.exceptions.ConnectionClosed:
        print(f"[-] Client disconnected: {client_address}")
    except Exception as e:
        print(f"[!] Error handling client: {e}")
    finally:
        connected_clients.discard(websocket)


async def broadcast(message: str):
    """Broadcast a message to all connected clients."""
    if connected_clients:
        await asyncio.gather(
            *[client.send(message) for client in connected_clients],
            return_exceptions=True
        )


async def main():
    """Main server entry point."""
    global system_prompt
    
    print("=" * 60)
    print("  LOCAL WAIFU LIVE - WebSocket Server")
    print("=" * 60)
    
    # Load system prompt
    system_prompt = load_system_prompt()
    print(f"[✓] Loaded system prompt ({len(system_prompt)} chars)")
    
    # Check Ollama
    if not check_ollama_available():
        print("[!] WARNING: Ollama not available. Install with: curl -fsSL https://ollama.ai/install.sh | sh")
        print("[!] Continuing anyway - will use fallback responses")
    else:
        print(f"[✓] Ollama available")
        
        if not check_model_available(OLLAMA_MODEL):
            print(f"[!] Model '{OLLAMA_MODEL}' not found. Pull with: ollama pull {OLLAMA_MODEL}")
        else:
            print(f"[✓] Model '{OLLAMA_MODEL}' ready")
    
    print(f"[*] Starting WebSocket server on ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")
    print("[*] Waiting for Unity client connection...")
    print("-" * 60)
    
    # Handle graceful shutdown
    stop = asyncio.Event()
    
    def signal_handler():
        print("\n[*] Shutting down...")
        stop.set()
    
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, signal_handler)
    
    async with serve(handle_client, WEBSOCKET_HOST, WEBSOCKET_PORT):
        await stop.wait()
    
    print("[*] Server stopped")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[*] Interrupted")
    except Exception as e:
        print(f"[!] Fatal error: {e}")
        sys.exit(1)
