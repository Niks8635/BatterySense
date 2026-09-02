import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { clearAnalytics, fetchHealth, getApiBaseUrl } from '../services/api';
import {
  Settings as SettingsIcon,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Clock,
  Zap,
  Gauge,
  Eye,
  Trash2,
  RotateCcw,
  CheckCircle,
  Shield,
  Layers,
  Sliders,
  Sparkles,
  Server,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSetting, resetDefaults } = useSettings();
  const [clearing, setClearing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Agent Connection state
  const [agentUrl, setAgentUrl] = useState(() => getApiBaseUrl());
  const [testingAgent, setTestingAgent] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestAgent = async () => {
    setTestingAgent(true);
    setTestResult(null);
    const start = performance.now();
    try {
      // Temporarily store in localStorage to test
      localStorage.setItem('batterysense_agent_url', agentUrl);
      await fetchHealth();
      const elapsed = Math.round(performance.now() - start);
      setTestResult({ ok: true, message: `Connected successfully (${elapsed}ms)` });
      showToast('Agent connection verified.');
    } catch (err: any) {
      setTestResult({ ok: false, message: `Failed to connect: ${err.message || 'Agent not responding'}` });
    } finally {
      setTestingAgent(false);
    }
  };

  const handleSaveAgentUrl = () => {
    localStorage.setItem('batterysense_agent_url', agentUrl);
    showToast('Agent URL saved. Reconnecting...');
    setTimeout(() => window.location.reload(), 800);
  };

  const handleResetAgentUrl = () => {
    localStorage.removeItem('batterysense_agent_url');
    setAgentUrl('http://127.0.0.1:8000');
    setTestResult(null);
    showToast('Agent URL reset to default (http://127.0.0.1:8000).');
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all historical telemetry records from the local database?')) {
      return;
    }
    setClearing(true);
    try {
      await clearAnalytics();
      showToast('Telemetry history cleared successfully.');
    } catch (err: any) {
      alert('Error clearing data: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all preferences to factory defaults?')) {
      resetDefaults();
      handleResetAgentUrl();
      showToast('Settings reset to defaults.');
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold">Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              Preferences
            </span>
          </div>
          <p className="text-text-secondary mt-1">
            Configure telemetry intervals, visual appearances, agent connection, and data retention
          </p>
        </div>

        <button
          onClick={handleResetSettings}
          className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-white glass-card border border-white/10 px-3.5 py-2 rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
        </button>
      </header>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-card px-4 py-3 rounded-2xl border border-accent-green/30 bg-accent-green/10 text-accent-green text-xs font-semibold flex items-center gap-2 shadow-2xl animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 0: Hardware Agent Connection */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.02]">
            <Server className="w-5 h-5 text-accent-blue" />
            <h2 className="font-bold text-white text-base">Windows Hardware Agent Connection</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              BatterySense retrieves real-time low-level metrics (WMI, PSUtil, battery health) from the local Windows agent.
              By default, it connects to <code className="text-accent-blue font-mono">http://127.0.0.1:8000</code>.
              You can customize this if you run the agent on another machine on your local Wi-Fi / LAN network.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white block">Agent Base API URL</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={agentUrl}
                  onChange={e => setAgentUrl(e.target.value)}
                  placeholder="http://127.0.0.1:8000"
                  className="flex-1 bg-bg-primary text-white border border-white/15 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-accent-blue transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleTestAgent}
                    disabled={testingAgent}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingAgent ? 'animate-spin' : ''}`} />
                    {testingAgent ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={handleSaveAgentUrl}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-accent-blue hover:bg-blue-600 text-white transition-colors cursor-pointer"
                  >
                    Save URL
                  </button>
                </div>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${testResult.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {testResult.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-text-secondary space-y-1">
              <span className="font-semibold text-white block">Quick Agent Launch:</span>
              <p>On your Windows machine, run <code className="text-accent-blue font-mono">start_backend.bat</code> in the BatterySense directory or execute <code className="text-accent-blue font-mono">python run.py</code> inside the <code className="text-accent-blue font-mono">backend/</code> folder.</p>
            </div>
          </div>
        </section>

        {/* Section 1: Appearance & UI Themes */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.02]">
            <Monitor className="w-5 h-5 text-accent-blue" />
            <h2 className="font-bold text-white text-base">Visual Appearance & Themes</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Theme Selector */}
            <div>
              <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold block mb-3">
                Interface Color Scheme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark Obsidian', icon: Moon, desc: 'Default high-contrast' },
                  { id: 'light', label: 'Light Studio', icon: Sun, desc: 'Clean high-clarity' },
                  { id: 'system', label: 'System Automatic', icon: Laptop, desc: 'Follow OS mode' }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = settings.theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => updateSetting('theme', item.id as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-accent-blue bg-accent-blue/10 shadow-lg shadow-accent-blue/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-accent-blue' : 'text-text-secondary'}`} />
                        {isSelected && <CheckCircle className="w-4 h-4 text-accent-blue" />}
                      </div>
                      <span className="font-semibold text-white text-sm block">{item.label}</span>
                      <span className="text-xs text-text-secondary mt-0.5 block">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Animation Toggles */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white text-sm">3D Perspective Tilt</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Enable interactive mouse-tracking hardware gauge parallax
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('threeDEffects', !settings.threeDEffects)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.threeDEffects ? 'bg-accent-blue' : 'bg-white/15'
                  }`}
                  aria-label="Toggle 3D effects"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      settings.threeDEffects ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white text-sm">Reduce Motion (Accessibility)</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Disable continuous background shimmer and charging flow animations
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.reducedMotion ? 'bg-accent-green' : 'bg-white/15'
                  }`}
                  aria-label="Toggle reduced motion"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      settings.reducedMotion ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Data & Telemetry Sampling */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.02]">
            <Sliders className="w-5 h-5 text-accent-green" />
            <h2 className="font-bold text-white text-base">Telemetry Sampling & Metrics</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Refresh Interval Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-white text-sm">Hardware Polling Frequency</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Frequency of polling battery and CPU hardware states
                </p>
              </div>
              <select
                value={settings.refreshRate}
                onChange={e => updateSetting('refreshRate', Number(e.target.value))}
                className="bg-bg-primary text-white border border-white/15 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-accent-blue transition-colors cursor-pointer"
              >
                <option value={1000}>1 Second (High Frequency)</option>
                <option value={2000}>2 Seconds (Normal)</option>
                <option value={5000}>5 Seconds (Balanced)</option>
                <option value={10000}>10 Seconds (Power Saver)</option>
              </select>
            </div>

            {/* Units Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
              <div>
                <h3 className="font-medium text-white text-sm">Measurement Units</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Temperature scale and battery energy representation
                </p>
              </div>
              <div className="flex bg-bg-primary p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => updateSetting('units', 'metric')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    settings.units === 'metric' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Metric (°C, mWh)
                </button>
                <button
                  onClick={() => updateSetting('units', 'imperial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    settings.units === 'imperial' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Imperial (°F, Wh)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Data Retention & SQLite Maintenance */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.02]">
            <Clock className="w-5 h-5 text-accent-amber" />
            <h2 className="font-bold text-white text-base">Analytics Database & Retention</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Retention Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-white text-sm">Historical Data Retention</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Automatically purge historical SQLite telemetry records older than this threshold
                </p>
              </div>
              <select
                value={settings.dataRetention}
                onChange={e => updateSetting('dataRetention', e.target.value)}
                className="bg-bg-primary text-white border border-white/15 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-accent-blue transition-colors cursor-pointer"
              >
                <option value="1d">1 Day (24 Hours)</option>
                <option value="7d">7 Days (Standard)</option>
                <option value="30d">30 Days (Extended)</option>
              </select>
            </div>

            {/* Clear Database Button */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <h3 className="font-medium text-white text-sm">Purge Stored Telemetry</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Permanently delete all stored historical telemetry entries in the local SQLite database
                </p>
              </div>
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-accent-red hover:bg-accent-red/10 border border-accent-red/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {clearing ? 'Clearing...' : 'Clear Telemetry'}
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Privacy & Security Guarantee */}
        <section className="glass-card p-6 border-l-4 border-l-accent-green flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0 text-accent-green">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm">Privacy-First Architecture Guaranteed</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              BatterySense operates directly between your browser and local Windows monitoring agent.
              Your hardware serials, battery cycles, and performance telemetry are processed entirely in memory and local SQLite.
              No cloud synchronization, external tracking, or telemetry uplink is installed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
