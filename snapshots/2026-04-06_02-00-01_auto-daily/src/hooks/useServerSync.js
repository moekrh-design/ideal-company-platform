/**
 * ==========================================
 *  useServerSync Hook - مزامنة الخادم
 * ==========================================
 *  Hook مخصص لإدارة الاتصال بالخادم
 *  والمزامنة عبر WebSocket
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { SESSION_TOKEN_KEY } from '../constants/appConfig';

const API_BASE = '';

export function useServerSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const wsRef = useRef(null);

  // === API Call Helper ===
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY) || '';
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Session-Token': token } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setIsOnline(true);
      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        setIsOnline(false);
      }
      throw error;
    }
  }, []);

  // === Bootstrap (Load initial state) ===
  const bootstrap = useCallback(async () => {
    return apiCall('/api/bootstrap');
  }, [apiCall]);

  // === Save State ===
  const saveState = useCallback(async (state) => {
    setIsSaving(true);
    try {
      const result = await apiCall('/api/state/save', {
        method: 'POST',
        body: { state },
      });
      setLastSyncTime(new Date().toISOString());
      return result;
    } finally {
      setIsSaving(false);
    }
  }, [apiCall]);

  // === Login ===
  const login = useCallback(async (username, password) => {
    const result = await apiCall('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    if (result.ok && result.token) {
      localStorage.setItem(SESSION_TOKEN_KEY, result.token);
    }
    return result;
  }, [apiCall]);

  // === Logout ===
  const logout = useCallback(async () => {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch {} 
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }, [apiCall]);

  // === WebSocket Connection ===
  const connectWebSocket = useCallback((schoolId, kind = 'screen', token = '') => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/public?kind=${kind}&token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setIsOnline(true);
      ws.onclose = () => {
        // Auto-reconnect after 5 seconds
        setTimeout(() => connectWebSocket(schoolId, kind, token), 5000);
      };
      ws.onerror = () => setIsOnline(false);

      return ws;
    } catch {
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isOnline,
    isSaving,
    lastSyncTime,
    apiCall,
    bootstrap,
    saveState,
    login,
    logout,
    connectWebSocket,
  };
}
