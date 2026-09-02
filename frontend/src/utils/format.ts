export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return 'Unknown';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const formatFrequency = (mhz: number): string => {
  if (mhz > 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
  return `${mhz.toFixed(0)} MHz`;
};

export const formatTemperature = (celsius: number): string => {
  return `${celsius.toFixed(1)}°C`;
};

export const formatCapacity = (mwh: number): string => {
  return `${mwh.toLocaleString()} mWh`;
};

export const getHealthColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'EXCELLENT': return 'text-accent-green';
    case 'GOOD': return 'text-accent-blue';
    case 'FAIR': return 'text-accent-amber';
    case 'POOR': return 'text-accent-red';
    default: return 'text-text-secondary';
  }
};

export const getHealthLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};
