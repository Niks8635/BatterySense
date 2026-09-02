import { useState, useEffect } from 'react';
import { PerformanceData, CpuData, MemoryData } from '../types';
import { fetchPerformance } from '../services/api';
import { wsService } from '../services/websocketService';
import { useSettings } from './useSettings';
import { samplePerformance } from '../data/sampleData';

export const usePerformance = () => {
  const { settings } = useSettings();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const result = await fetchPerformance();
        if (mounted) {
          setData(result);
          setError(null);
          setIsPreview(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load performance data');
          if (!data || isPreview) {
            setData(samplePerformance);
            setIsPreview(true);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const rate = Math.max(1000, Math.floor((settings.refreshRate || 5000) / 2));
    const interval = setInterval(loadData, rate);

    // WebSocket sends full model_dump() for each metric type
    const unsubscribeCpu = wsService.onMessage('cpu', (wsData: CpuData) => {
      if (mounted) {
        setData(prev => prev ? { ...prev, cpu: wsData } : null);
        setIsPreview(false);
      }
    });

    const unsubscribeMem = wsService.onMessage('memory', (wsData: MemoryData) => {
      if (mounted) {
        setData(prev => prev ? { ...prev, memory: wsData } : null);
        setIsPreview(false);
      }
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      unsubscribeCpu();
      unsubscribeMem();
    };
  }, [settings.refreshRate]);

  return { data, loading, error, isPreview };
};
