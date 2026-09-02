import { BatteryData, PerformanceData, SystemData, StorageData, AnalyticsData } from '../types';

// Base API URL configuration from localStorage or environment (defaults to local Windows agent on 127.0.0.1:8000)
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('batterysense_agent_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').trim();
  return envUrl.replace(/\/+$/, '');
};

const getEndpointUrl = (path: string): string => {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/api') && cleanPath.startsWith('/api')) {
    return `${base}${cleanPath.substring(4)}`;
  }
  return cleanPath.startsWith('/api') ? `${base}${cleanPath}` : `${base}/api${cleanPath}`;
};

async function fetchWithTimeout(path: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const fullUrl = getEndpointUrl(path);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export const fetchHealth = async (): Promise<{ status: string }> => {
  const res = await fetchWithTimeout('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
};

export const fetchBattery = async (): Promise<BatteryData> => {
  const res = await fetchWithTimeout('/api/battery');
  if (!res.ok) throw new Error('Failed to fetch battery data');
  return res.json();
};

export const fetchPerformance = async (): Promise<PerformanceData> => {
  const res = await fetchWithTimeout('/api/performance');
  if (!res.ok) throw new Error('Failed to fetch performance data');
  return res.json();
};

export const fetchSystem = async (): Promise<SystemData> => {
  const res = await fetchWithTimeout('/api/system');
  if (!res.ok) throw new Error('Failed to fetch system data');
  return res.json();
};

export const fetchStorage = async (): Promise<StorageData> => {
  const res = await fetchWithTimeout('/api/storage');
  if (!res.ok) throw new Error('Failed to fetch storage data');
  return res.json();
};

export const fetchAnalytics = async (period: string = '1h'): Promise<AnalyticsData> => {
  const res = await fetchWithTimeout(`/api/analytics?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch analytics data');
  return res.json();
};

export const clearAnalytics = async (): Promise<{ status: string; message: string }> => {
  const res = await fetchWithTimeout('/api/analytics', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear analytics');
  return res.json();
};

export const setAnalyticsRetention = async (hours: number): Promise<{ status: string; message: string }> => {
  const res = await fetchWithTimeout(`/api/analytics/retention?hours=${hours}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to set retention');
  return res.json();
};

export const generateBatteryReport = async (): Promise<{ status: string; message: string; path?: string }> => {
  const res = await fetchWithTimeout('/api/battery/report');
  if (!res.ok) throw new Error('Failed to generate battery report');
  return res.json();
};
