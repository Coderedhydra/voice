'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { CharacterRenderer } from './components/CharacterRenderer';

export default function WaifuPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [model, setModel] = useState('dolphin-phi:2.7b');
  const messagesEndRef = useRef(null);
  
  const { isConnected, lastMessage, error, sendMessage, reconnect } = useWebSocket(
    'ws://localhost:8765'
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('[Page] Received WebSocket message:', lastMessage);
      if (lastMessage.animation) {
        console.log('[Page] Setting animation:', lastMessage.animation);
        setCurrentAnimation(lastMessage.animation);
      }
      if (lastMessage.chat) {
        console.log('[Page] Adding chat message:', lastMessage.chat);
        setMessages((prev) => {
          // Avoid duplicate messages by checking the last message
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.type === 'assistant' && lastMsg.content === lastMessage.chat) {
            console.log('[Page] Duplicate message, skipping');
            return prev;
          }
          return [
            ...prev,
            { type: 'assistant', content: lastMessage.chat, timestamp: lastMessage._timestamp || Date.now() },
          ];
        });
      }
    }
  }, [lastMessage]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) {
      if (!isConnected) {
        alert('Not connected to server. Please wait for connection.');
      }
      return;
    }

    const userMessage = { type: 'user', content: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    
    const messageToSend = input.trim();
    setInput(''); // Clear input immediately for better UX
    
    if (!sendMessage(messageToSend)) {
      alert('Failed to send message. Please check connection.');
      setInput(messageToSend); // Restore input if send failed
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-pink-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-pink-200">Yuki - Live Waifu</h1>
            <p className="text-sm text-pink-300/80">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  {error || 'Connecting...'}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-black/50 text-white px-3 py-2 rounded-lg border border-pink-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={!isConnected}
            >
              <option value="dolphin-phi:2.7b">Dolphin-Phi:2.7b</option>
              <option value="qwen2.5:4b">Qwen2.5:4b</option>
              <option value="qwen3:4b">Qwen3:4b</option>
              <option value="llama3">Llama3</option>
            </select>
            {!isConnected && (
              <button
                onClick={reconnect}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Renderer */}
        <div className="flex-1 relative">
          <CharacterRenderer
            animation={currentAnimation}
            expression={currentAnimation?.face}
            intensity={currentAnimation?.intensity}
          />
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
              <div className="text-center text-white max-w-md px-4">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-xl mb-2 font-bold">Not Connected to WebSocket Server</div>
                <div className="text-sm text-gray-300 mb-4 space-y-2">
                  <p>Make sure the Python WebSocket server is running:</p>
                  <div className="bg-black/50 p-3 rounded text-left font-mono text-xs">
                    <div>cd local-waifu-live/wsl</div>
                    <div>source venv/bin/activate</div>
                    <div>export OLLAMA_MODEL=qwen3:4b</div>
                    <div>python server.py</div>
                  </div>
                  {error && (
                    <p className="text-red-300 mt-2">Error: {error}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-4">
                    Note: You're accessing this page correctly at http://localhost:3000/waifu
                    <br />
                    The WebSocket connection (ws://localhost:8765) is made automatically by JavaScript.
                  </p>
                </div>
                <button
                  onClick={reconnect}
                  className="mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="w-96 bg-black/40 backdrop-blur-sm border-l border-pink-500/30 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <div className="text-2xl mb-2">💬</div>
                <div>Start chatting with Yuki...</div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.type === 'user'
                      ? 'bg-pink-600/80 text-white'
                      : 'bg-white/10 text-pink-100 backdrop-blur-sm'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-pink-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-pink-500/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1 bg-black/50 text-white px-4 py-2 rounded-lg border border-pink-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isConnected || !input.trim()}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
            {currentAnimation && (
              <div className="mt-2 text-xs text-gray-400">
                Animation: {currentAnimation.body} / {currentAnimation.face} 
                (Intensity: {(currentAnimation.intensity * 100).toFixed(0)}%)
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
