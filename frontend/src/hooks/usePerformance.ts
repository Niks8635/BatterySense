import { useState, useEffect } from 'react';
import { PerformanceData, CpuData, MemoryData } from '../types';
import { fetchPerformance } from '../services/api';
import { wsService } from '../services/websocketService';
import { useSettings } from './useSettings';
import { useAgentStatus } from './useAgentStatus';
import { DEMO_PERFORMANCE } from '../utils/demoData';

export const usePerformance = () => {
  const { settings } = useSettings();
  const { isOnline } = useAgentStatus();
  const [data, setData] = useState<PerformanceData | null>(DEMO_PERFORMANCE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!isOnline) {
      setData(DEMO_PERFORMANCE);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const result = await fetchPerformance();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load performance data');
          setData(DEMO_PERFORMANCE);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const rate = Math.max(1000, Math.floor((settings.refreshRate || 5000) / 2));
    const interval = setInterval(loadData, rate);

    const unsubscribeCpu = wsService.onMessage('cpu', (wsData: CpuData) => {
      if (mounted && isOnline) {
        setData(prev => prev ? { ...prev, cpu: wsData } : null);
      }
    });

    const unsubscribeMem = wsService.onMessage('memory', (wsData: MemoryData) => {
      if (mounted && isOnline) {
        setData(prev => prev ? { ...prev, memory: wsData } : null);
      }
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      unsubscribeCpu();
      unsubscribeMem();
    };
  }, [settings.refreshRate, isOnline]);

  return { data, loading, error };
};
