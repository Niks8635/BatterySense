import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Activity, X, Settings } from 'lucide-react';
import { wsService } from '../services/websocketService';
import { fetchHealth } from '../services/api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAgentOffline, setIsAgentOffline] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem('batterysense_banner_dismissed') === 'true';
  });

  // Check agent connectivity periodically
  useEffect(() => {
    let mounted = true;
    const checkAgent = async () => {
      try {
        await fetchHealth();
        if (mounted) setIsAgentOffline(false);
      } catch {
        if (mounted) setIsAgentOffline(true);
      }
    };

    checkAgent();
    const interval = setInterval(checkAgent, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    wsService.connect();
    return () => wsService.disconnect();
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem('batterysense_banner_dismissed', 'true');
  };

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Non-Intrusive Agent Status Notification Banner */}
        {isAgentOffline && !bannerDismissed && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs flex items-center justify-between gap-3 text-amber-200 z-20 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <Activity className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate">
                <strong className="text-white">Windows Agent Disconnected:</strong> Running in dashboard viewer mode. Start <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">start_backend.bat</code> on your PC or configure your agent URL in <Link to="/settings" className="underline font-semibold hover:text-white">Settings</Link> to stream live hardware telemetry.
              </span>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-amber-400/70 hover:text-white p-1 rounded transition-colors shrink-0"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 glass-card border-x-0 border-t-0 rounded-none z-30 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-text-secondary hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold">BatterySense</span>
          <div className="w-6" />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
