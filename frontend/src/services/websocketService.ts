import { getApiBaseUrl } from './api';

type MessageHandler = (data: any) => void;

const getWebSocketUrl = (): string => {
  if (typeof window !== 'undefined') {
    const customWs = localStorage.getItem('batterysense_ws_url');
    if (customWs && customWs.trim()) return customWs.trim();
  }
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const apiBase = getApiBaseUrl();
  const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
  const cleanHost = apiBase.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '').replace(/\/+$/, '');
  return `${wsProtocol}//${cleanHost}/ws/telemetry`;
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private connectionState: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private connectionChangeHandlers: ((state: string) => void)[] = [];
  private reconnectTimer: any = null;

  public connect() {
    if (this.connectionState === 'connected' || this.ws?.readyState === WebSocket.CONNECTING) return;
    
    this.setConnectionState('reconnecting');
    try {
      const url = getWebSocketUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setConnectionState('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type && this.handlers.has(message.type)) {
            this.handlers.get(message.type)!.forEach(handler => handler(message.data));
          }
        } catch {
          // ignore malformed frame
        }
      };

      this.ws.onclose = () => {
        this.setConnectionState('disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = () => {
        // Handled in onclose
      };
    } catch {
      this.setConnectionState('disconnected');
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const timeout = Math.min(2000 * Math.pow(1.5, this.reconnectAttempts), 15000);
      this.reconnectAttempts++;
      this.reconnectTimer = setTimeout(() => this.connect(), timeout);
    }
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.setConnectionState('disconnected');
    }
  }

  public onMessage(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
    
    return () => {
      const currentHandlers = this.handlers.get(type) || [];
      this.handlers.set(type, currentHandlers.filter(h => h !== handler));
    };
  }

  public onConnectionChange(handler: (state: string) => void) {
    this.connectionChangeHandlers.push(handler);
    handler(this.connectionState);
    return () => {
      this.connectionChangeHandlers = this.connectionChangeHandlers.filter(h => h !== handler);
    };
  }

  public getConnectionState() {
    return this.connectionState;
  }

  private setConnectionState(state: 'connected' | 'disconnected' | 'reconnecting') {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionChangeHandlers.forEach(handler => handler(state));
    }
  }
}

export const wsService = new WebSocketService();
