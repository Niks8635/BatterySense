import React from 'react';
import { useBattery } from '../hooks/useBattery';
import { usePerformance } from '../hooks/usePerformance';
import { useSystemInfo } from '../hooks/useSystemInfo';
import { MetricCard } from '../components/MetricCard';
import { BatteryGauge } from '../components/BatteryGauge';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { formatPercentage, getHealthLabel, getHealthColor, formatDuration, formatCapacity } from '../utils/format';
import { Battery, Zap, Cpu, MemoryStick, Clock, ShieldCheck, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: batteryData, loading: batteryLoading } = useBattery();
  const { data: perfData, loading: perfLoading } = usePerformance();
  const { data: sysData, loading: sysLoading } = useSystemInfo();

  const isBatteryAvailable = batteryData?.percentage.available ?? false;
  const batteryPct = isBatteryAvailable ? batteryData?.percentage.value ?? null : null;
  const isCharging = batteryData?.is_charging.available ? batteryData.is_charging.value : null;
  const healthPercent = batteryData?.health_percent.available ? batteryData.health_percent.value : null;
  const healthStatus = batteryData?.health_status.available ? batteryData.health_status.value : null;
  const runtimeSecs = batteryData?.estimated_runtime_seconds.available ? batteryData.estimated_runtime_seconds.value : null;

  return (
    <div className="space-y-6 lg:space-y-8 pb-12">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <ConnectionIndicator />
          </div>
          {!sysLoading && sysData ? (
            <p className="text-text-secondary text-sm mt-1 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-accent-blue" />
              <span>
                {sysData.laptop.manufacturer} {sysData.laptop.model} • {sysData.os.name} {sysData.os.version} • {sysData.processor.name}
              </span>
            </p>
          ) : (
            <p className="text-text-secondary text-sm mt-1">Windows Battery & Performance Analyzer</p>
          )}
        </div>
      </header>

      {/* Hero Battery Centerpiece */}
      <div className="glass-card p-6 lg:p-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-accent-green/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Column: Health Overview & Context */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-semibold">
              Power Subsystem Overview
            </span>

            {batteryLoading ? (
              <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row items-center lg:items-baseline gap-3">
                  <span className="text-5xl lg:text-6xl font-black tracking-tight text-white font-mono">
                    {healthPercent !== null ? `${healthPercent}%` : 'N/A'}
                  </span>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                      Battery Health
                    </span>
                    {healthStatus && (
                      <span className={`text-xs font-bold uppercase tracking-wider ${getHealthColor(healthStatus)}`}>
                        {getHealthLabel(healthStatus)} Condition
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-text-secondary text-sm mt-3 max-w-md">
                  {isCharging
                    ? 'Connected to AC power adapter. Supplying charge to internal cells.'
                    : runtimeSecs
                    ? `Running on internal cells. Estimated ${formatDuration(runtimeSecs)} remaining.`
                    : 'Running on internal battery power.'}
                </p>

                {/* Capacity Ratio Quick Stat */}
                {batteryData?.full_charge_capacity.available && batteryData?.design_capacity.available && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-text-secondary">
                    <div>
                      <span>Retention: </span>
                      <span className="font-semibold text-white">
                        {formatCapacity(batteryData.full_charge_capacity.value!)}
                      </span>
                    </div>
                    <div>
                      <span>Design: </span>
                      <span className="font-semibold text-white">
                        {formatCapacity(batteryData.design_capacity.value!)}
                      </span>
                    </div>
                    {batteryData.cycle_count.available && batteryData.cycle_count.value !== null && (
                      <div>
                        <span>Cycles: </span>
                        <span className="font-semibold text-white">
                          {batteryData.cycle_count.value}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Hero 3D Battery Visualization */}
          <div className="flex-1 flex justify-center py-2">
            <BatteryGauge
              percentage={batteryPct}
              available={isBatteryAvailable}
              isCharging={isCharging}
              healthPercent={healthPercent}
              healthStatus={healthStatus}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          title="Current Charge"
          value={batteryData?.percentage.available && batteryData.percentage.value !== null ? formatPercentage(batteryData.percentage.value) : ''}
          status={batteryData?.percentage.available ? 'available' : 'unavailable'}
          icon={Battery}
          color="text-accent-green"
          subtitle={batteryData?.is_charging.value ? 'Charging via AC' : 'Discharging'}
        />

        <MetricCard
          title="CPU Utilization"
          value={perfData?.cpu.usage_percent.available && perfData.cpu.usage_percent.value !== null ? formatPercentage(perfData.cpu.usage_percent.value) : ''}
          status={perfData?.cpu.usage_percent.available ? 'available' : 'unavailable'}
          icon={Cpu}
          color="text-accent-blue"
          subtitle={perfData?.cpu.physical_cores.available ? `${perfData.cpu.physical_cores.value} Cores Active` : undefined}
        />

        <MetricCard
          title="Memory (RAM) In Use"
          value={perfData?.memory.percent.available && perfData.memory.percent.value !== null ? formatPercentage(perfData.memory.percent.value) : ''}
          status={perfData?.memory.percent.available ? 'available' : 'unavailable'}
          icon={MemoryStick}
          color="text-accent-amber"
          subtitle="System RAM"
        />

        <MetricCard
          title="Estimated Runtime"
          value={batteryData?.estimated_runtime_seconds.available && batteryData.estimated_runtime_seconds.value ? formatDuration(batteryData.estimated_runtime_seconds.value) : ''}
          status={batteryData?.estimated_runtime_seconds.available && batteryData.estimated_runtime_seconds.value ? 'available' : 'unavailable'}
          icon={Clock}
          color="text-purple-400"
          subtitle={batteryData?.power_plugged.value ? 'On AC Power' : 'Discharging'}
        />
      </div>
    </div>
  );
}
