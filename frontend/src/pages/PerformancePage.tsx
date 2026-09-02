import React from 'react';
import { usePerformance } from '../hooks/usePerformance';
import { useStorage } from '../hooks/useStorage';
import { MetricCard } from '../components/MetricCard';
import { CircularGauge } from '../components/CircularGauge';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { formatPercentage, formatBytes, formatFrequency, formatTemperature } from '../utils/format';
import { Cpu, MemoryStick, HardDrive, Monitor, Zap, Activity, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PerformancePage() {
  const { data: perf, loading: perfLoading } = usePerformance();
  const { data: storage, loading: storageLoading } = useStorage();

  const cpuUsage = perf?.cpu.usage_percent.available ? perf.cpu.usage_percent.value : null;
  const ramUsage = perf?.memory.percent.available ? perf.memory.percent.value : null;
  const perCore = perf?.cpu.per_core_usage.available ? perf.cpu.per_core_usage.value : [];
  const gpu = perf?.gpu;

  return (
    <div className="space-y-6 lg:space-y-8 pb-12">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Performance</h1>
            <ConnectionIndicator />
          </div>
          <p className="text-text-secondary mt-1">
            Real-time multi-core processor, memory allocation, and hardware telemetry
          </p>
        </div>
      </header>

      {/* Dual Circular Gauges Spotlight */}
      <div className="glass-card p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* CPU Dial */}
          <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
            <CircularGauge
              value={cpuUsage}
              available={perf?.cpu.usage_percent.available ?? false}
              label="CPU Load"
              sublabel={perf?.cpu.name.available && perf.cpu.name.value ? perf.cpu.name.value : 'Active Processor'}
              color="blue"
              size={150}
              strokeWidth={12}
            />
            <div className="mt-4 flex gap-6 text-xs text-text-secondary">
              <div>
                <span>Clock: </span>
                <span className="font-semibold text-white">
                  {perf?.cpu.frequency_current.available && perf.cpu.frequency_current.value
                    ? formatFrequency(perf.cpu.frequency_current.value)
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span>Cores: </span>
                <span className="font-semibold text-white">
                  {perf?.cpu.physical_cores.value || 0}P / {perf?.cpu.logical_processors.value || 0}L
                </span>
              </div>
            </div>
          </div>

          {/* RAM Dial */}
          <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
            <CircularGauge
              value={ramUsage}
              available={perf?.memory.percent.available ?? false}
              label="RAM Used"
              sublabel={
                perf?.memory.used.available && perf.memory.total.available
                  ? `${formatBytes(perf.memory.used.value!)} of ${formatBytes(perf.memory.total.value!)}`
                  : 'System Memory'
              }
              color="amber"
              size={150}
              strokeWidth={12}
            />
            <div className="mt-4 flex gap-6 text-xs text-text-secondary">
              <div>
                <span>Available: </span>
                <span className="font-semibold text-white">
                  {perf?.memory.available.available && perf.memory.available.value
                    ? formatBytes(perf.memory.available.value)
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span>Total RAM: </span>
                <span className="font-semibold text-white">
                  {perf?.memory.total.available && perf.memory.total.value
                    ? formatBytes(perf.memory.total.value)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Core Breakdown (if available) */}
      {perCore && perCore.length > 0 && (
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-blue" />
              <h2 className="font-bold text-white text-base">Logical Processor Core Threads</h2>
            </div>
            <span className="text-xs text-text-secondary">{perCore.length} Threads Monitored</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {perCore.map((usage, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary font-mono">Core {idx + 1}</span>
                  <span className="font-bold text-white font-mono">{Math.round(usage)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      usage > 85 ? 'bg-accent-red' : usage > 60 ? 'bg-accent-amber' : 'bg-accent-blue'
                    }`}
                    style={{ width: `${Math.max(2, Math.min(100, usage))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GPU & Graphics Subsystem */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Monitor className="w-5 h-5 text-accent-green" />
          <h2 className="font-bold text-white text-base">Graphics Processing Unit (GPU)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-white/5 space-y-1">
            <span className="text-xs text-text-secondary block">GPU Hardware Adapter</span>
            <span className="text-base font-bold text-white">
              {gpu?.name.available && gpu.name.value ? gpu.name.value : 'Unavailable'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 space-y-1">
            <span className="text-xs text-text-secondary block">Dedicated VRAM Total</span>
            <span className="text-base font-bold text-white">
              {gpu?.memory_total.available && gpu.memory_total.value ? formatBytes(gpu.memory_total.value) : 'Dynamic / Shared'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 space-y-1">
            <span className="text-xs text-text-secondary block">Thermal Core Temperature</span>
            <span className="text-base font-bold text-white">
              {gpu?.temperature.available && gpu.temperature.value !== null
                ? formatTemperature(gpu.temperature.value)
                : 'Unavailable on this sensor'}
            </span>
          </div>
        </div>
      </section>

      {/* Storage Disk Volumes */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-white text-base">Local Physical Storage Drives</h2>
          </div>
          <span className="text-xs text-text-secondary">{storage?.drives.length || 0} Active Partitions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {storage?.drives.map((drive, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-white text-sm">{drive.device} ({drive.mountpoint})</span>
                  <span className="text-xs text-text-secondary ml-2 font-mono uppercase">[{drive.fstype}]</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{drive.percent}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    drive.percent > 90 ? 'bg-accent-red' : drive.percent > 70 ? 'bg-accent-amber' : 'bg-accent-green'
                  }`}
                  style={{ width: `${drive.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-secondary font-mono">
                <span>{formatBytes(drive.used)} in use</span>
                <span>{formatBytes(drive.free)} free of {formatBytes(drive.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
