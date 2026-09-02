import { useState, useEffect } from 'react';
import { StorageData } from '../types';
import { fetchStorage } from '../services/api';
import { useAgentStatus } from './useAgentStatus';
import { DEMO_STORAGE } from '../utils/demoData';

export const useStorage = () => {
  const { isOnline } = useAgentStatus();
  const [data, setData] = useState<StorageData | null>(DEMO_STORAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!isOnline) {
      setData(DEMO_STORAGE);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const result = await fetchStorage();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load storage data');
          setData(DEMO_STORAGE);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isOnline]);

  return { data, loading, error };
};
