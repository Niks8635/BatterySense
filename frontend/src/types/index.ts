// ─── Capability-based metric wrapper ───
export interface MetricValue<T> {
  value: T | null;
  available: boolean;
  source: string | null;
  timestamp: string;
}

export type HealthStatus = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

// ─── Battery ───
export interface BatteryData {
  percentage: MetricValue<number>;
  is_charging: MetricValue<boolean>;
  power_plugged: MetricValue<boolean>;
  design_capacity: MetricValue<number>;
  full_charge_capacity: MetricValue<number>;
  health_percent: MetricValue<number>;
  health_status: MetricValue<HealthStatus>;
  wear_percent: MetricValue<number>;
  cycle_count: MetricValue<number>;
  voltage: MetricValue<number>;
  temperature: MetricValue<number>;
  estimated_runtime_seconds: MetricValue<number>;
  charge_rate: MetricValue<number>;
}

// ─── CPU ───
export interface CpuData {
  usage_percent: MetricValue<number>;
  per_core_usage: MetricValue<number[]>;
  physical_cores: MetricValue<number>;
  logical_processors: MetricValue<number>;
  frequency_current: MetricValue<number>;
  frequency_max: MetricValue<number>;
  temperature: MetricValue<number>;
  name: MetricValue<string>;
}

// ─── Memory ───
export interface MemoryData {
  total: MetricValue<number>;
  available: MetricValue<number>;
  used: MetricValue<number>;
  percent: MetricValue<number>;
}

// ─── GPU ───
export interface GpuData {
  name: MetricValue<string>;
  usage_percent: MetricValue<number>;
  memory_total: MetricValue<number>;
  memory_used: MetricValue<number>;
  temperature: MetricValue<number>;
}

// ─── Performance (combined) ───
export interface PerformanceData {
  cpu: CpuData;
  memory: MemoryData;
  gpu: GpuData;
}

// ─── System Info (matches backend SystemResponse exactly) ───
export interface OsInfo {
  name: string;
  version: string;
  build: string;
  architecture: string;
  hostname: string;
}

export interface ProcessorInfo {
  name: string;
  physical_cores: number;
  logical_processors: number;
  frequency_current: number;
  frequency_max: number;
}

export interface LaptopInfo {
  manufacturer: string;
  model: string;
  bios_version: string;
}

export interface MemoryInfo {
  total: number;
  available: number;
  used: number;
}

export interface SystemData {
  os: OsInfo;
  processor: ProcessorInfo;
  laptop: LaptopInfo;
  memory: MemoryInfo;
}

// ─── Storage ───
export interface DriveInfo {
  device: string;
  mountpoint: string;
  fstype: string;
  total: number;
  used: number;
  free: number;
  percent: number;
}

export interface StorageData {
  drives: DriveInfo[];
}

// ─── Analytics / Telemetry ───
export interface TelemetryRecord {
  timestamp: string;
  battery_percentage: number | null;
  cpu_usage: number | null;
  ram_usage: number | null;
  disk_usage: number | null;
  power_plugged: number | null;
}

export interface AnalyticsData {
  records: TelemetryRecord[];
  period: string;
  count: number;
}

// ─── Settings ───
export interface Settings {
  theme: 'dark' | 'light' | 'system';
  refreshRate: number;
  animations: boolean;
  threeDEffects: boolean;
  dataRetention: string;
  reducedMotion: boolean;
  units: 'metric' | 'imperial';
}
