import { useState, useEffect } from 'react';
import { BatteryData } from '../types';
import { fetchBattery } from '../services/api';
import { wsService } from '../services/websocketService';
import { useSettings } from './useSettings';
import { useAgentStatus } from './useAgentStatus';
import { DEMO_BATTERY } from '../utils/demoData';

export const useBattery = () => {
  const { settings } = useSettings();
  const { isOnline } = useAgentStatus();
  const [data, setData] = useState<BatteryData | null>(DEMO_BATTERY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!isOnline) {
      setData(DEMO_BATTERY);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const result = await fetchBattery();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load battery data');
          setData(DEMO_BATTERY);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const rate = Math.max(1000, settings.refreshRate || 5000);
    const interval = setInterval(loadData, rate);

    const unsubscribe = wsService.onMessage('battery', (wsData: BatteryData) => {
      if (mounted && isOnline) {
        setData(wsData);
      }
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      unsubscribe();
    };
  }, [settings.refreshRate, isOnline]);

  return { data, loading, error };
};
