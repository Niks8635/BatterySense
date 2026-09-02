import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import BatteryPage from './pages/BatteryPage';
import PerformancePage from './pages/PerformancePage';
import SystemPage from './pages/SystemPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BatteryReportPage from './pages/BatteryReportPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { fetchHealth } from './services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

function App() {
  const [offline, setOffline] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const checkConnection = async () => {
    try {
      await fetchHealth();
      setOffline(false);
      setFailCount(0);
    } catch (err) {
      setFailCount(prev => {
        const next = prev + 1;
        // Require 3 consecutive failed checks before showing blocking overlay
        if (next >= 3) {
          setOffline(true);
        }
        return next;
      });
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRetry = async () => {
    setRetrying(true);
    try {
      await fetchHealth();
      setOffline(false);
      setFailCount(0);
    } catch {
      // still offline
    } finally {
      setRetrying(false);
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="battery" element={<BatteryPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="report" element={<BatteryReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
      
      {offline && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 text-center border-red-500/30 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Monitoring Agent Offline</h2>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              Cannot connect to the local Windows monitoring agent on <code className="text-accent-blue font-mono">127.0.0.1:8000</code>.
              Ensure the Python backend process is running.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleManualRetry}
                disabled={retrying}
                className="bg-accent-blue text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Connecting...' : 'Reconnect Now'}
              </button>
              <button 
                onClick={() => setOffline(false)} 
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors border border-white/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
