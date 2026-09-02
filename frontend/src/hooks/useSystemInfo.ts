import { useState, useEffect } from 'react';
import { SystemData } from '../types';
import { fetchSystem } from '../services/api';
import { useAgentStatus } from './useAgentStatus';
import { DEMO_SYSTEM } from '../utils/demoData';

export const useSystemInfo = () => {
  const { isOnline } = useAgentStatus();
  const [data, setData] = useState<SystemData | null>(DEMO_SYSTEM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!isOnline) {
      setData(DEMO_SYSTEM);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const result = await fetchSystem();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load system data');
          setData(DEMO_SYSTEM);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isOnline]);

  return { data, loading, error };
};
