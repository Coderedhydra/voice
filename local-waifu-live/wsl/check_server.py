#!/usr/bin/env python3
"""
Quick check script to verify WebSocket server setup
"""

import sys
import subprocess
import os

def check_python():
    print("Checking Python...")
    try:
        result = subprocess.run(["python3", "--version"], capture_output=True, text=True)
        print(f"  ✓ {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("  ✗ Python 3 not found")
        return False

def check_websockets():
    print("Checking websockets library...")
    try:
        import websockets
        print(f"  ✓ websockets {websockets.__version__}")
        return True
    except ImportError:
        print("  ✗ websockets not installed")
        print("    Install with: pip install websockets")
        return False

def check_ollama():
    print("Checking Ollama...")
    try:
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("  ✓ Ollama is installed and running")
            models = result.stdout.strip().split('\n')[1:]  # Skip header
            if models:
                print(f"  ✓ Available models: {len([m for m in models if m.strip()])}")
                for model in models[:5]:  # Show first 5
                    if model.strip():
                        print(f"    - {model.split()[0]}")
            else:
                print("  ! No models installed")
            return True
        else:
            print("  ✗ Ollama not responding")
            return False
    except FileNotFoundError:
        print("  ✗ Ollama not installed")
        print("    Install with: curl -fsSL https://ollama.ai/install.sh | sh")
        return False
    except subprocess.TimeoutExpired:
        print("  ✗ Ollama not responding (timeout)")
        return False

def check_model(model_name):
    print(f"Checking model '{model_name}'...")
    try:
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True, timeout=5)
        if model_name in result.stdout:
            print(f"  ✓ Model '{model_name}' is available")
            return True
        else:
            print(f"  ✗ Model '{model_name}' not found")
            print(f"    Pull with: ollama pull {model_name}")
            return False
    except Exception as e:
        print(f"  ✗ Error checking model: {e}")
        return False

def check_port(port):
    print(f"Checking port {port}...")
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        if result == 0:
            print(f"  ! Port {port} is already in use")
            return False
        else:
            print(f"  ✓ Port {port} is available")
            return True
    except Exception as e:
        print(f"  ✗ Error checking port: {e}")
        return False

def main():
    print("=" * 60)
    print("  WebSocket Server Setup Check")
    print("=" * 60)
    print()
    
    checks = []
    checks.append(("Python", check_python()))
    checks.append(("WebSockets", check_websockets()))
    checks.append(("Ollama", check_ollama()))
    
    model = os.environ.get("OLLAMA_MODEL", "qwen2.5:4b")
    checks.append(("Model", check_model(model)))
    checks.append(("Port", check_port(8765)))
    
    print()
    print("=" * 60)
    print("  Summary")
    print("=" * 60)
    
    all_ok = True
    for name, result in checks:
        status = "✓" if result else "✗"
        print(f"{status} {name}")
        if not result:
            all_ok = False
    
    print()
    if all_ok:
        print("✓ All checks passed! You can start the server with:")
        print(f"  export OLLAMA_MODEL={model}")
        print("  python server.py")
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
