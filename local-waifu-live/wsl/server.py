#!/usr/bin/env python3
"""
Local Waifu Live - WebSocket Server
Connects Ollama LLM to Web renderer via WebSocket
Uses Ollama HTTP API for faster responses
"""

import asyncio
import json
import os
import re
import signal
import sys
import requests
from pathlib import Path
from typing import Optional, Tuple

try:
    import websockets
    from websockets.server import serve
    from websockets.exceptions import ConnectionClosed, ConnectionClosedError, InvalidHandshake
except ImportError:
    print("ERROR: websockets not installed. Run: pip install websockets")
    sys.exit(1)

# Configuration
WEBSOCKET_HOST = "localhost"
WEBSOCKET_PORT = 8765
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "dolphin-phi:2.7b")
OLLAMA_API_URL = "http://localhost:11434/api/generate"
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
    """Check if Ollama API is available."""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        return response.status_code == 200
    except Exception:
        return False


def check_model_available(model: str) -> bool:
    """Check if the specified model is available in Ollama."""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            return any(m.get("name", "").startswith(model) for m in models)
        return False
    except Exception:
        return False


def query_ollama_fast(user_message: str, history: list) -> str:
    """Query Ollama using HTTP API for faster responses - optimized for speed."""
    global system_prompt
    
    # Build messages array for API - shorter for speed
    messages = []
    
    # Add system prompt (shortened version for speed)
    system_msg = system_prompt[:500] if len(system_prompt) > 500 else system_prompt
    messages.append({
        "role": "system",
        "content": system_msg
    })
    
    # Add conversation history (last 5 exchanges for maximum speed)
    for exchange in history[-5:]:
        # Truncate long messages
        user_msg = exchange['user'][:100] if len(exchange['user']) > 100 else exchange['user']
        assistant_msg = exchange['assistant'][:150] if len(exchange['assistant']) > 150 else exchange['assistant']
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": assistant_msg})
    
    # Add current user message (truncated)
    user_msg = user_message[:150] if len(user_message) > 150 else user_message
    messages.append({"role": "user", "content": user_msg})
    
    try:
        # Optimized for speed - shorter responses, faster generation
        payload = {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,  # Lower for faster, more consistent
                "top_p": 0.85,
                "top_k": 20,  # Limit choices for speed
                "num_predict": 100,  # Shorter responses = faster
                "repeat_penalty": 1.1,
                "num_ctx": 1024,  # Smaller context = faster
            }
        }
        
        response = requests.post(
            OLLAMA_API_URL,
            json=payload,
            timeout=15  # Shorter timeout for faster failure detection
        )
        
        if response.status_code == 200:
            result = response.json()
            response_text = result.get("response", "").strip()
            # Quick response if empty
            if not response_text:
                return generate_fallback_response()
            return response_text
        else:
            print(f"Ollama API error: {response.status_code} - {response.text[:100]}")
            return generate_fallback_response()
            
    except requests.exceptions.Timeout:
        print("Ollama API request timed out - using fallback")
        return generate_fallback_response()
    except Exception as e:
        print(f"Ollama API request failed: {e}")
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
        "slow_breathing", "shy_cover", "seductive_dance", "bounce_chest"
    ]
    valid_face = [
        "smile_seductive", "blush_light", "blush_heavy",
        "half_lidded_eyes", "soft_moan", "look_away", "wink_seductive"
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


async def handle_client(websocket, path):
    """Handle a connected WebSocket client."""
    global conversation_history
    
    client_address = websocket.remote_address
    print(f"[+] WebSocket client connected: {client_address} (path: {path})")
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
            # Handle both string and bytes messages
            if isinstance(message, bytes):
                message = message.decode('utf-8')
            
            print(f"[<] Received: {message[:100]}...")
            
            try:
                data = json.loads(message)
                user_input = data.get("message", "").strip()
            except json.JSONDecodeError:
                user_input = message.strip()
            
            if not user_input:
                continue
            
            print(f"[?] Querying Ollama API with model '{OLLAMA_MODEL}': {user_input[:50]}...")
            
            # Query Ollama using fast API
            response = query_ollama_fast(user_input, conversation_history)
            print(f"[+] Ollama response received: {response[:100]}...")
            
            # Process response
            animation, chat_text = process_response(response)
            print(f"[+] Processed - Animation: {animation['body']}/{animation['face']}, Chat: {chat_text[:50]}...")
            
            # Store in history
            conversation_history.append({
                "user": user_input,
                "assistant": chat_text
            })
            
            # Keep history manageable (shorter for speed)
            if len(conversation_history) > 30:
                conversation_history = conversation_history[-20:]
            
            # Build response payload
            payload = {
                "animation": animation,
                "chat": chat_text
            }
            
            print(f"[>] Sending animation: {animation['body']}/{animation['face']} @ {animation['intensity']}")
            print(f"[>] Chat: {chat_text[:80]}...")
            
            # Send to client
            await websocket.send(json.dumps(payload))
            
    except ConnectionClosed:
        print(f"[-] Client disconnected: {client_address}")
    except ConnectionClosedError:
        print(f"[-] Client connection closed: {client_address}")
    except Exception as e:
        print(f"[!] Error handling client: {e}")
        import traceback
        traceback.print_exc()
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
    print("  LOCAL WAIFU LIVE - WebSocket Server (Fast API Mode)")
    print("=" * 60)
    
    # Load system prompt
    system_prompt = load_system_prompt()
    print(f"[✓] Loaded system prompt ({len(system_prompt)} chars)")
    
    # Check Ollama API
    if not check_ollama_available():
        print("[!] WARNING: Ollama API not available at http://localhost:11434")
        print("[!] Make sure Ollama is running: ollama serve")
        print("[!] Continuing anyway - will use fallback responses")
    else:
        print(f"[✓] Ollama API available")
        
        if not check_model_available(OLLAMA_MODEL):
            print(f"[!] Model '{OLLAMA_MODEL}' not found. Pull with: ollama pull {OLLAMA_MODEL}")
        else:
            print(f"[✓] Model '{OLLAMA_MODEL}' ready")
    
    print(f"[*] Starting WebSocket server on ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")
    print("[*] Waiting for WebSocket client connection...")
    print("-" * 60)
    
    # Handle graceful shutdown
    stop = asyncio.Event()
    
    def signal_handler():
        print("\n[*] Shutting down...")
        stop.set()
    
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, signal_handler)
    
    # Create WebSocket server
    async with serve(
        handle_client,
        WEBSOCKET_HOST,
        WEBSOCKET_PORT,
        ping_interval=20,
        ping_timeout=10,
        close_timeout=10,
        max_size=2**20,
        origins=None,
    ):
        print(f"[✓] WebSocket server running on ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")
        await stop.wait()
    
    print("[*] Server stopped")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[*] Interrupted")
    except Exception as e:
        print(f"[!] Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
