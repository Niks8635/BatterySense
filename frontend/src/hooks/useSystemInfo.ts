import { useState, useEffect } from 'react';
import { SystemData } from '../types';
import { fetchSystem } from '../services/api';

let cachedSystemData: SystemData | null = null;

export const useSystemInfo = () => {
  const [data, setData] = useState<SystemData | null>(cachedSystemData);
  const [loading, setLoading] = useState(!cachedSystemData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedSystemData) return;

    let mounted = true;
    const loadData = async () => {
      try {
        const result = await fetchSystem();
        cachedSystemData = result;
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError('Failed to load system data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
};
