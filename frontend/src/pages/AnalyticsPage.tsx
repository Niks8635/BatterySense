import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { fetchAnalytics, clearAnalytics } from '../services/api';
import { AnalyticsData, TelemetryRecord } from '../types';
import { getDemoAnalytics } from '../utils/demoData';
import {
  LineChart as ChartIcon,
  RefreshCw,
  Clock,
  Battery,
  Cpu,
  MemoryStick,
  Trash2,
  TrendingDown,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { formatPercentage } from '../utils/format';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<string>('1h');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'combined' | 'battery' | 'performance'>('combined');
  const [clearing, setClearing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const result = await fetchAnalytics(period);
      if (result && result.records && result.records.length > 0) {
        setData(result);
      } else {
        setData(getDemoAnalytics(period));
      }
      setLastUpdated(new Date());
    } catch (err) {
      setData(getDemoAnalytics(period));
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    const interval = setInterval(() => loadData(false), 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [period]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all stored telemetry history?')) return;
    setClearing(true);
    try {
      await clearAnalytics();
      await loadData(true);
    } catch (err) {
      alert('Failed to clear history: ' + err);
    } finally {
      setClearing(false);
    }
  };

  const chartData = useMemo(() => {
    if (!data?.records || data.records.length === 0) return [];
    return data.records.map((record: TelemetryRecord) => {
      const date = new Date(record.timestamp);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        timestamp: record.timestamp,
        time: timeStr,
        battery: record.battery_percentage !== null ? Math.round(record.battery_percentage * 10) / 10 : null,
        cpu: record.cpu_usage !== null ? Math.round(record.cpu_usage * 10) / 10 : null,
        ram: record.ram_usage !== null ? Math.round(record.ram_usage * 10) / 10 : null,
        disk: record.disk_usage !== null ? Math.round(record.disk_usage * 10) / 10 : null,
        plugged: record.power_plugged === 1 ? 'AC Power' : 'Battery'
      };
    });
  }, [data]);

  // Derived statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgCpu: 0,
        maxCpu: 0,
        avgRam: 0,
        latestBattery: 0,
        batteryDelta: 0,
        pluggedNow: false
      };
    }
    const cpuVals = chartData.map(d => d.cpu).filter((v): v is number => v !== null);
    const ramVals = chartData.map(d => d.ram).filter((v): v is number => v !== null);
    const battVals = chartData.map(d => d.battery).filter((v): v is number => v !== null);

    const avgCpu = cpuVals.length ? Math.round((cpuVals.reduce((a, b) => a + b, 0) / cpuVals.length) * 10) / 10 : 0;
    const maxCpu = cpuVals.length ? Math.max(...cpuVals) : 0;
    const avgRam = ramVals.length ? Math.round((ramVals.reduce((a, b) => a + b, 0) / ramVals.length) * 10) / 10 : 0;
    const latestBattery = battVals.length ? battVals[battVals.length - 1] : 0;
    const initialBattery = battVals.length ? battVals[0] : 0;
    const batteryDelta = Math.round((latestBattery - initialBattery) * 10) / 10;
    const latestRecord = data?.records[data.records.length - 1];

    return {
      avgCpu,
      maxCpu,
      avgRam,
      latestBattery,
      batteryDelta,
      pluggedNow: latestRecord?.power_plugged === 1
    };
  }, [chartData, data]);

  const periods = [
    { label: '5 Minutes', value: '5m' },
    { label: '15 Minutes', value: '15m' },
    { label: '30 Minutes', value: '30m' },
    { label: '1 Hour', value: '1h' },
    { label: '24 Hours', value: '24h' }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 pb-12">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              Live Telemetry
            </span>
          </div>
          <p className="text-text-secondary mt-1">
            Real-time historical performance and battery metrics collected from your system
          </p>
        </div>

        {/* Controls: Time filters & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 p-1 glass-card rounded-lg border border-white/10">
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p.value
                    ? 'bg-accent-blue text-white shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 glass-card hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors border border-white/10"
            title="Refresh analytics data"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-accent-blue' : ''}`} />
          </button>

          <button
            onClick={handleClearHistory}
            disabled={clearing}
            className="p-2 glass-card hover:bg-accent-red/20 text-text-secondary hover:text-accent-red rounded-lg transition-colors border border-white/10"
            title="Clear stored telemetry history"
            aria-label="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs uppercase tracking-wider font-medium">Battery Level</span>
            <Battery className="w-5 h-5 text-accent-green" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-2">
            {chartData.length > 0 ? `${stats.latestBattery}%` : 'Collecting...'}
            {stats.pluggedNow && (
              <span className="text-xs font-normal text-accent-green flex items-center gap-1">
                <Zap className="w-3 h-3" /> AC
              </span>
            )}
          </div>
          <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            {stats.batteryDelta > 0 ? (
              <span className="text-accent-green flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +{stats.batteryDelta}%
              </span>
            ) : stats.batteryDelta < 0 ? (
              <span className="text-accent-amber flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> {stats.batteryDelta}%
              </span>
            ) : (
              <span>Stable in selected range</span>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs uppercase tracking-wider font-medium">Average CPU</span>
            <Cpu className="w-5 h-5 text-accent-blue" />
          </div>
          <div className="text-2xl font-bold text-white">
            {chartData.length > 0 ? `${stats.avgCpu}%` : 'Collecting...'}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Peak: <span className="text-white font-medium">{stats.maxCpu}%</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs uppercase tracking-wider font-medium">Average RAM</span>
            <MemoryStick className="w-5 h-5 text-accent-amber" />
          </div>
          <div className="text-2xl font-bold text-white">
            {chartData.length > 0 ? `${stats.avgRam}%` : 'Collecting...'}
          </div>
          <div className="text-xs text-text-secondary mt-1">System memory utilization</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs uppercase tracking-wider font-medium">Data Points</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{chartData.length}</div>
          <div className="text-xs text-text-secondary mt-1">
            Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="glass-card p-6 space-y-6">
        {/* Chart View Switcher */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-accent-blue" />
            <h2 className="text-lg font-bold text-white">Telemetry Timeline</h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'combined' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setActiveTab('battery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'battery' ? 'bg-accent-green/20 text-accent-green' : 'text-text-secondary hover:text-white'
              }`}
            >
              Battery Only
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'performance' ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-secondary hover:text-white'
              }`}
            >
              CPU & RAM
            </button>
          </div>
        </div>

        {loading && chartData.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-text-secondary gap-3">
            <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            <p>Loading telemetry history...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-6 text-text-secondary space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-accent-blue">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-white">Collecting Real-time Telemetry</h3>
            <p className="max-w-md text-sm">
              The monitoring agent records hardware samples continuously every 5 seconds. Metrics will populate here automatically as data is recorded.
            </p>
          </div>
        ) : (
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'battery' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
                  <defs>
                    <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                  <XAxis dataKey="time" stroke="#8888a0" tick={{ fill: '#8888a0', fontSize: 11 }} tickMargin={10} />
                  <YAxis stroke="#8888a0" tick={{ fill: '#8888a0', fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 26, 46, 0.95)',
                      borderColor: '#2a2a3e',
                      borderRadius: '8px',
                      color: '#f0f0f5'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="battery"
                    name="Battery Charge"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#batteryGrad)"
                  />
                </AreaChart>
              ) : activeTab === 'performance' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                  <XAxis dataKey="time" stroke="#8888a0" tick={{ fill: '#8888a0', fontSize: 11 }} tickMargin={10} />
                  <YAxis stroke="#8888a0" tick={{ fill: '#8888a0', fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 26, 46, 0.95)',
                      borderColor: '#2a2a3e',
                      borderRadius: '8px',
                      color: '#f0f0f5'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    name="CPU Usage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ram"
                    name="RAM Usage"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="disk"
                    name="Disk Usage"
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                  <XAxis dataKey="time" stroke="#8888a0" tick={{ fill: '#8888a0', fontSize: 11 }} tickMargin={10} />
                  <YAxis stroke="#8888a0" tick={{ fill: '#8888a0', fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 26, 46, 0.95)',
                      borderColor: '#2a2a3e',
                      borderRadius: '8px',
                      color: '#f0f0f5'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="battery"
                    name="Battery %"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    name="CPU Usage %"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ram"
                    name="RAM Usage %"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
