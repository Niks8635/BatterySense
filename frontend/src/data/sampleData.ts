/**
 * Sample/preview hardware data shown to visitors who don't have
 * the local Windows monitoring agent running.
 *
 * This is STATIC showcase data — clearly labeled as "Preview" in the UI —
 * so visitors can see what the dashboard looks like with real hardware connected.
 * When a user starts the local agent, all data seamlessly switches to live telemetry.
 */

import { BatteryData, PerformanceData, SystemData, StorageData, AnalyticsData, TelemetryRecord } from '../types';

const ts = () => new Date().toISOString();

const mv = <T>(value: T, source = 'preview') => ({
  value,
  available: true,
  source,
  timestamp: ts(),
});

// ─── Battery ───
export const sampleBattery: BatteryData = {
  percentage: mv(72),
  is_charging: mv(false),
  power_plugged: mv(false),
  design_capacity: mv(51300),
  full_charge_capacity: mv(43100),
  health_percent: mv(84),
  health_status: mv('GOOD' as const),
  wear_percent: mv(16),
  cycle_count: mv(287),
  voltage: mv(11400),
  temperature: { value: null, available: false, source: null, timestamp: ts() },
  estimated_runtime_seconds: mv(14520),
  charge_rate: { value: null, available: false, source: null, timestamp: ts() },
};

// ─── Performance ───
export const samplePerformance: PerformanceData = {
  cpu: {
    usage_percent: mv(34.2),
    per_core_usage: mv([28.1, 41.3, 19.7, 52.0, 30.5, 22.8, 45.1, 38.9]),
    physical_cores: mv(4),
    logical_processors: mv(8),
    frequency_current: mv(2496),
    frequency_max: mv(4200),
    temperature: { value: null, available: false, source: null, timestamp: ts() },
    name: mv('Intel Core i7-12700H'),
  },
  memory: {
    total: mv(17179869184),       // 16 GB
    available: mv(7516192768),    // ~7 GB
    used: mv(9663676416),         // ~9 GB
    percent: mv(56.3),
  },
  gpu: {
    name: mv('NVIDIA GeForce RTX 3060 Laptop GPU'),
    usage_percent: mv(12),
    memory_total: mv(6442450944),  // 6 GB
    memory_used: mv(1610612736),   // 1.5 GB
    temperature: mv(48),
  },
};

// ─── System Info ───
export const sampleSystem: SystemData = {
  os: {
    name: 'Windows',
    version: '11',
    build: '22631.4169',
    architecture: 'AMD64',
    hostname: 'DESKTOP-PREVIEW',
  },
  processor: {
    name: 'Intel Core i7-12700H',
    physical_cores: 4,
    logical_processors: 8,
    frequency_current: 2496,
    frequency_max: 4200,
  },
  laptop: {
    manufacturer: 'Dell Inc.',
    model: 'Inspiron 15 5520',
    bios_version: '1.14.0',
  },
  memory: {
    total: 17179869184,
    available: 7516192768,
    used: 9663676416,
  },
};

// ─── Storage ───
export const sampleStorage: StorageData = {
  drives: [
    {
      device: 'C:',
      mountpoint: 'C:\\',
      fstype: 'NTFS',
      total: 512110190592,      // ~477 GB
      used: 298844758016,       // ~278 GB
      free: 213265432576,       // ~198 GB
      percent: 58.4,
    },
    {
      device: 'D:',
      mountpoint: 'D:\\',
      fstype: 'NTFS',
      total: 1000204886016,     // ~931 GB
      used: 421383544832,       // ~392 GB
      free: 578821341184,       // ~539 GB
      percent: 42.1,
    },
  ],
};

// ─── Analytics (generate realistic sample time series) ───
function generateSampleRecords(): TelemetryRecord[] {
  const records: TelemetryRecord[] = [];
  const now = Date.now();
  const interval = 10000; // 10 seconds between samples
  const count = 60;       // 10 minutes of data

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * interval);
    records.push({
      timestamp: t.toISOString(),
      battery_percentage: 72 - (i * 0.05),  // slow drain
      cpu_usage: 25 + Math.sin(i * 0.3) * 15 + Math.random() * 10,
      ram_usage: 54 + Math.sin(i * 0.15) * 4 + Math.random() * 3,
      disk_usage: 58.4,
      power_plugged: 0,
    });
  }
  return records;
}

export const sampleAnalytics: AnalyticsData = {
  records: generateSampleRecords(),
  period: '15m',
  count: 60,
};
