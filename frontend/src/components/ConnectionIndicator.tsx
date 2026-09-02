import React, { useState, useEffect } from 'react';
import { wsService } from '../services/websocketService';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionIndicator: React.FC = () => {
  const [status, setStatus] = useState<string>('disconnected');

  useEffect(() => {
    const unsub = wsService.onConnectionChange(s => setStatus(s));
    return () => unsub();
  }, []);

  const handleReconnect = () => {
    wsService.disconnect();
    setTimeout(() => wsService.connect(), 300);
  };

  const getBadge = () => {
    if (status === 'connected') {
      return {
        dot: 'bg-accent-green animate-pulse',
        text: 'Live Telemetry',
        badge: 'bg-accent-green/10 text-accent-green border-accent-green/20'
      };
    }
    if (status === 'reconnecting') {
      return {
        dot: 'bg-accent-amber animate-spin',
        text: 'Reconnecting...',
        badge: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
      };
    }
    return {
      dot: 'bg-accent-red',
      text: 'Agent Offline',
      badge: 'bg-accent-red/10 text-accent-red border-accent-red/20'
    };
  };

  const current = getBadge();

  return (
    <button
      onClick={handleReconnect}
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${current.badge}`}
      title="Click to reconnect WebSocket telemetry"
      aria-label="Connection status"
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <span>{current.text}</span>
    </button>
  );
};
