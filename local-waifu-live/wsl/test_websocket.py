#!/usr/bin/env python3
"""
Simple test script to verify WebSocket server is working
"""

import asyncio
import websockets
import json

async def test_connection():
    uri = "ws://localhost:8765"
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Waiting for welcome message...")
            
            # Receive welcome message
            welcome = await websocket.recv()
            print(f"Received: {welcome}")
            
            # Send a test message
            test_message = json.dumps({"message": "Hello Yuki!"})
            print(f"Sending: {test_message}")
            await websocket.send(test_message)
            
            # Wait for response
            response = await websocket.recv()
            print(f"Response: {response}")
            
            print("\n✓ WebSocket server is working correctly!")
            
    except Exception as e:
        print(f"\n✗ Error: {e}")
        print("\nMake sure the server is running:")
        print("  cd local-waifu-live/wsl")
        print("  python server.py")

if __name__ == "__main__":
    asyncio.run(test_connection())
