'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', data);
          // Create a new object with timestamp to force re-render
          setLastMessage({ ...data, _timestamp: Date.now() });
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        console.error('WebSocket URL:', url);
        console.error('WebSocket readyState:', ws.readyState);
        setError(`Connection error: ${err.message || 'Failed to connect'}`);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
        
        // Provide helpful error messages
        let errorMessage = null;
        if (event.code === 1006) {
          errorMessage = 'Connection refused. Is the Python server running on port 8765?';
        } else if (event.code === 1002) {
          errorMessage = 'Protocol error. Check server configuration.';
        } else if (event.reason) {
          errorMessage = `Connection closed: ${event.reason}`;
        }
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... (attempt ${reconnectAttempts.current})`);
            connect();
          }, delay);
          if (errorMessage) {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage || 'Failed to connect after multiple attempts. Make sure the Python server is running.');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to create connection');
    }
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message }));
      return true;
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
}
