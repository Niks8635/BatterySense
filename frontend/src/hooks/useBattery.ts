import { useState, useEffect } from 'react';
import { BatteryData } from '../types';
import { fetchBattery } from '../services/api';
import { wsService } from '../services/websocketService';
import { useSettings } from './useSettings';
import { sampleBattery } from '../data/sampleData';

export const useBattery = () => {
  const { settings } = useSettings();
  const [data, setData] = useState<BatteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const result = await fetchBattery();
        if (mounted) {
          setData(result);
          setError(null);
          setIsPreview(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load battery data');
          // Fall back to sample preview data so visitors see a populated dashboard
          if (!data || isPreview) {
            setData(sampleBattery);
            setIsPreview(true);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const rate = Math.max(1000, settings.refreshRate || 5000);
    const interval = setInterval(loadData, rate);

    // WebSocket sends full BatteryResponse model_dump
    const unsubscribe = wsService.onMessage('battery', (wsData: BatteryData) => {
      if (mounted) {
        setData(wsData);
        setIsPreview(false);
      }
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      unsubscribe();
    };
  }, [settings.refreshRate]);

  return { data, loading, error, isPreview };
};
