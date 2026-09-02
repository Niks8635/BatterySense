import { BatteryData, PerformanceData, SystemData, StorageData, AnalyticsData } from '../types';

export const DEMO_BATTERY: BatteryData = {
  percentage: { value: 84, available: true, source: 'demo', timestamp: new Date().toISOString() },
  is_charging: { value: true, available: true, source: 'demo', timestamp: new Date().toISOString() },
  power_plugged: { value: true, available: true, source: 'demo', timestamp: new Date().toISOString() },
  design_capacity: { value: 42067, available: true, source: 'demo', timestamp: new Date().toISOString() },
  full_charge_capacity: { value: 39922, available: true, source: 'demo', timestamp: new Date().toISOString() },
  health_percent: { value: 94.9, available: true, source: 'demo', timestamp: new Date().toISOString() },
  health_status: { value: 'EXCELLENT', available: true, source: 'demo', timestamp: new Date().toISOString() },
  wear_percent: { value: 5.1, available: true, source: 'demo', timestamp: new Date().toISOString() },
  cycle_count: { value: 285, available: true, source: 'demo', timestamp: new Date().toISOString() },
  voltage: { value: 11760, available: true, source: 'demo', timestamp: new Date().toISOString() },
  temperature: { value: 31.5, available: true, source: 'demo', timestamp: new Date().toISOString() },
  estimated_runtime_seconds: { value: 11200, available: true, source: 'demo', timestamp: new Date().toISOString() },
  charge_rate: { value: 18500, available: true, source: 'demo', timestamp: new Date().toISOString() }
};

export const DEMO_PERFORMANCE: PerformanceData = {
  cpu: {
    usage_percent: { value: 22, available: true, source: 'demo', timestamp: new Date().toISOString() },
    per_core_usage: {
      value: [18, 25, 12, 40, 15, 20, 8, 32, 14, 19, 10, 24],
      available: true,
      source: 'demo',
      timestamp: new Date().toISOString()
    },
    physical_cores: { value: 10, available: true, source: 'demo', timestamp: new Date().toISOString() },
    logical_processors: { value: 12, available: true, source: 'demo', timestamp: new Date().toISOString() },
    frequency_current: { value: 2400, available: true, source: 'demo', timestamp: new Date().toISOString() },
    frequency_max: { value: 4600, available: true, source: 'demo', timestamp: new Date().toISOString() },
    temperature: { value: 48, available: true, source: 'demo', timestamp: new Date().toISOString() },
    name: { value: '13th Gen Intel(R) Core(TM) i5-1335U', available: true, source: 'demo', timestamp: new Date().toISOString() }
  },
  memory: {
    total: { value: 16869400000, available: true, source: 'demo', timestamp: new Date().toISOString() },
    available: { value: 9240000000, available: true, source: 'demo', timestamp: new Date().toISOString() },
    used: { value: 7629400000, available: true, source: 'demo', timestamp: new Date().toISOString() },
    percent: { value: 45.2, available: true, source: 'demo', timestamp: new Date().toISOString() }
  },
  gpu: {
    name: { value: 'Intel(R) Iris(R) Xe Graphics', available: true, source: 'demo', timestamp: new Date().toISOString() },
    usage_percent: { value: 14, available: true, source: 'demo', timestamp: new Date().toISOString() },
    memory_total: { value: 8434700000, available: true, source: 'demo', timestamp: new Date().toISOString() },
    memory_used: { value: 1200000000, available: true, source: 'demo', timestamp: new Date().toISOString() },
    temperature: { value: 45, available: true, source: 'demo', timestamp: new Date().toISOString() }
  }
};

export const DEMO_SYSTEM: SystemData = {
  os: {
    name: 'Windows',
    version: '11 Home',
    build: '10.0.26200',
    architecture: 'AMD64',
    hostname: 'VIVOBOOK-PC'
  },
  processor: {
    name: '13th Gen Intel(R) Core(TM) i5-1335U',
    physical_cores: 10,
    logical_processors: 12,
    frequency_current: 2400,
    frequency_max: 4600
  },
  laptop: {
    manufacturer: 'ASUSTeK COMPUTER INC.',
    model: 'Vivobook_ASUSLaptop X1605VA_X1605VA',
    bios_version: 'X1605VA.306'
  },
  memory: {
    total: 16869400000,
    available: 9240000000,
    used: 7629400000
  }
};

export const DEMO_STORAGE: StorageData = {
  drives: [
    {
      device: 'C:',
      mountpoint: 'C:\\',
      fstype: 'NTFS',
      total: 510900000000,
      used: 215400000000,
      free: 295500000000,
      percent: 42.2
    }
  ]
};

export const getDemoAnalytics = (period: string): AnalyticsData => {
  const count = period === '5m' ? 10 : period === '15m' ? 25 : period === '30m' ? 40 : 60;
  const now = Date.now();
  const stepMs = (60 * 60 * 1000) / count;
  const records = [];

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();
    records.push({
      timestamp: time,
      battery_percentage: Math.min(100, Math.max(70, Math.round(80 + Math.sin(i / 5) * 6))),
      cpu_usage: Math.round(15 + Math.random() * 25),
      ram_usage: Math.round(44 + Math.random() * 3),
      disk_usage: 42.2,
      power_plugged: 1
    });
  }

  return {
    records,
    period,
    count: records.length
  };
};
