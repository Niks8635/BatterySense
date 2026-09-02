import React, { useState } from 'react';
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
import { useAgentStatus } from './hooks/useAgentStatus';
import { AgentConnectModal } from './components/AgentConnectModal';
import { Sparkles, Laptop, X } from 'lucide-react';

function App() {
  const { isOnline } = useAgentStatus();
  const [showBanner, setShowBanner] = useState(true);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  return (
    <>
      {/* Non-blocking informational banner for external visitors or offline agent */}
      {!isOnline && showBanner && (
        <div className="bg-gradient-to-r from-accent-blue/15 via-purple-500/15 to-accent-blue/15 border-b border-accent-blue/25 text-text-primary px-4 py-2.5 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span>
              <strong className="text-white">Interactive Demo Mode</strong> — Showing simulated hardware telemetry. Run the local Windows agent on your PC to stream live metrics.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConnectModalOpen(true)}
              className="bg-accent-blue hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Connect Your PC</span>
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-text-secondary hover:text-white p-1 transition-colors"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

      <AgentConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </>
  );
}

export default App;
