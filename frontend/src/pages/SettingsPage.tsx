import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { clearAnalytics } from '../services/api';
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
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSetting, resetDefaults } = useSettings();
  const [clearing, setClearing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
            Configure telemetry intervals, visual appearances, data retention, and system behavior
          </p>
        </div>

        <button
          onClick={handleResetSettings}
          className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-white glass-card border border-white/10 px-3.5 py-2 rounded-xl transition-colors hover:bg-white/5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
        </button>
      </header>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-accent-blue text-white px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Appearance & Theme */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.02]">
            <Monitor className="w-5 h-5 text-accent-blue" />
            <h2 className="font-bold text-white text-base">Appearance & Interface Theme</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Theme Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-white text-sm">Theme Mode</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Choose between high-contrast dark mode, clean light mode, or system automatic
                </p>
              </div>
              <div className="flex gap-1.5 p-1 glass-card border border-white/10 rounded-xl">
                <button
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
                <button
                  onClick={() => updateSetting('theme', 'light')}
                  className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                    settings.theme === 'light'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button
                  onClick={() => updateSetting('theme', 'system')}
                  className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                    settings.theme === 'system'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" /> System
                </button>
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <h3 className="font-medium text-white text-sm">Reduced Motion</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Disable spring physics, floating particles, and transitions for enhanced accessibility
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.reducedMotion}
                  onChange={e => updateSetting('reducedMotion', e.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
              </label>
            </div>

            {/* Animations Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <h3 className="font-medium text-white text-sm">UI Animation Effects</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Animate progress bars, metric gauges, and battery level transitions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.animations}
                  onChange={e => updateSetting('animations', e.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Section 2: Monitoring & Refresh Rates */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.02]">
            <Gauge className="w-5 h-5 text-accent-green" />
            <h2 className="font-bold text-white text-base">Telemetry & Refresh Frequency</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Refresh Rate Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-white text-sm">Hardware Polling Interval</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Controls how frequently CPU, Memory, and Battery sensors query system drivers
                </p>
              </div>
              <div className="flex gap-1.5 p-1 glass-card border border-white/10 rounded-xl">
                {[
                  { label: '1s (Fast)', value: 1000 },
                  { label: '2s (Normal)', value: 2000 },
                  { label: '5s (Balanced)', value: 5000 },
                  { label: '10s (Eco)', value: 10000 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting('refreshRate', opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      settings.refreshRate === opt.value
                        ? 'bg-accent-green text-white shadow-sm'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Units Selection */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <h3 className="font-medium text-white text-sm">Measurement Units</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Display energy in milliwatt-hours (mWh) or watt-hours (Wh), temperatures in °C or °F
                </p>
              </div>
              <div className="flex gap-1.5 p-1 glass-card border border-white/10 rounded-xl">
                <button
                  onClick={() => updateSetting('units', 'metric')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    settings.units === 'metric'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  Metric (°C, mWh)
                </button>
                <button
                  onClick={() => updateSetting('units', 'imperial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    settings.units === 'imperial'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  Imperial (°F, Wh)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Data Retention & Storage */}
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-accent-red hover:bg-accent-red/10 border border-accent-red/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {clearing ? 'Clearing...' : 'Clear Telemetry'}
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Privacy & Security Badge */}
        <section className="glass-card p-6 border-l-4 border-l-accent-green flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0 text-accent-green">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm">Privacy-First Architecture Guaranteed</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              BatterySense operates exclusively on loopback address <code className="text-accent-blue font-mono">127.0.0.1</code>.
              Your hardware serials, battery cycles, and performance telemetry are processed entirely in memory and local SQLite.
              No cloud synchronization, external tracking, or telemetry uplink is installed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
