import React from 'react';
import { useBattery } from '../hooks/useBattery';
import { MetricCard } from '../components/MetricCard';
import { BatteryGauge } from '../components/BatteryGauge';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import {
  formatPercentage,
  formatCapacity,
  formatDuration,
  formatTemperature,
  getHealthColor,
  getHealthLabel
} from '../utils/format';
import {
  Battery,
  BatteryCharging,
  Clock,
  Thermometer,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCw,
  Repeat
} from 'lucide-react';

export default function BatteryPage() {
  const { data, loading } = useBattery();

  const isBatteryAvailable = data?.percentage.available ?? false;
  const batteryPct = isBatteryAvailable ? data?.percentage.value ?? null : null;
  const isCharging = data?.is_charging.available ? data.is_charging.value : null;
  const healthPercent = data?.health_percent.available ? data.health_percent.value : null;
  const healthStatus = data?.health_status.available ? data.health_status.value : null;

  return (
    <div className="space-y-6 lg:space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Battery Details</h1>
            <ConnectionIndicator />
          </div>
          <p className="text-text-secondary mt-1">
            In-depth battery health, wear telemetry, design capacities, and charge controller status
          </p>
        </div>
      </header>

      {/* Hero Visualizer Card */}
      <div className="glass-card p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 flex-1 text-center md:text-left">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
            Power Subsystem State
          </span>
          <h2 className="text-3xl font-black text-white">
            {isBatteryAvailable && batteryPct !== null ? `${batteryPct}% Charged` : 'Battery Telemetry'}
          </h2>
          <p className="text-sm text-text-secondary max-w-md">
            {isCharging
              ? 'External AC adapter is connected and actively supplying power to system components.'
              : 'Discharging on internal battery power. Optimized power plans help extend remaining battery runtime.'}
          </p>
          {data?.estimated_runtime_seconds.available && data.estimated_runtime_seconds.value && (
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2 text-sm font-semibold text-accent-amber">
              <Clock className="w-4 h-4" />
              <span>Estimated Runtime: {formatDuration(data.estimated_runtime_seconds.value)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-center">
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

      {/* Complete Metrics Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <MetricCard
          title="Current Charge Level"
          value={data?.percentage.available && data.percentage.value !== null ? formatPercentage(data.percentage.value) : ''}
          status={data?.percentage.available ? 'available' : 'unavailable'}
          icon={Battery}
          color="text-accent-blue"
          subtitle={data?.is_charging.value ? 'AC Charging' : 'Discharging'}
        />

        <MetricCard
          title="Battery Health Rating"
          value={data?.health_percent.available && data.health_percent.value !== null ? formatPercentage(data.health_percent.value) : ''}
          subtitle={data?.health_status.available && data.health_status.value ? `${getHealthLabel(data.health_status.value)} Condition` : undefined}
          status={data?.health_percent.available ? 'available' : 'unavailable'}
          icon={BatteryCharging}
          color="text-accent-green"
        />

        <MetricCard
          title="Calculated Wear Level"
          value={data?.wear_percent.available && data.wear_percent.value !== null ? formatPercentage(data.wear_percent.value) : ''}
          status={data?.wear_percent.available ? 'available' : 'unavailable'}
          icon={Activity}
          color="text-accent-red"
          subtitle="Total capacity degradation"
        />

        <MetricCard
          title="Factory Design Capacity"
          value={data?.design_capacity.available && data.design_capacity.value ? formatCapacity(data.design_capacity.value) : ''}
          status={data?.design_capacity.available ? 'available' : 'unavailable'}
          icon={Zap}
          subtitle="Original specification"
        />

        <MetricCard
          title="Full Charge Capacity"
          value={data?.full_charge_capacity.available && data.full_charge_capacity.value ? formatCapacity(data.full_charge_capacity.value) : ''}
          status={data?.full_charge_capacity.available ? 'available' : 'unavailable'}
          icon={Zap}
          color="text-accent-green"
          subtitle="Current maximum charge retention"
        />

        <MetricCard
          title="Charge Cycle Count"
          value={data?.cycle_count.available && data.cycle_count.value !== null ? `${data.cycle_count.value}` : ''}
          status={data?.cycle_count.available ? 'available' : 'unavailable'}
          icon={Repeat}
          color="text-purple-400"
          subtitle="Cumulative discharge cycles"
        />

        <MetricCard
          title="Operating Voltage"
          value={data?.voltage.available && data.voltage.value ? `${(data.voltage.value / 1000).toFixed(2)} V` : ''}
          status={data?.voltage.available ? 'available' : 'unavailable'}
          icon={Zap}
          subtitle={data?.voltage.value ? `${data.voltage.value} mV` : undefined}
        />

        <MetricCard
          title="Charge / Discharge Rate"
          value={data?.charge_rate.available && data.charge_rate.value ? `${data.charge_rate.value} mW` : ''}
          status={data?.charge_rate.available ? 'available' : 'unavailable'}
          icon={Zap}
          subtitle="Real-time power flux"
        />

        <MetricCard
          title="Battery Cell Temperature"
          value={data?.temperature.available && data.temperature.value ? formatTemperature(data.temperature.value) : ''}
          status={data?.temperature.available ? 'available' : 'unavailable'}
          icon={Thermometer}
          subtitle="ACPI thermal sensor"
        />
      </div>
    </div>
  );
}
