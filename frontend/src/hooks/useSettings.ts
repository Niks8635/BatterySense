import { useState, useEffect } from 'react';
import { Settings } from '../types';
import { setAnalyticsRetention } from '../services/api';

const defaultSettings: Settings = {
  theme: 'dark',
  refreshRate: 5000,
  animations: true,
  threeDEffects: true,
  dataRetention: '7d',
  reducedMotion: false,
  units: 'metric'
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('batterysense_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('batterysense_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings to localStorage', e);
      }
      return updated;
    });

    // If retention changed, sync with backend
    if (key === 'dataRetention') {
      const hoursMap: Record<string, number> = {
        '1d': 24,
        '7d': 168,
        '30d': 720
      };
      const hours = hoursMap[value as string] || 168;
      setAnalyticsRetention(hours).catch(err => console.warn('Could not sync retention with backend', err));
    }
  };

  const resetDefaults = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem('batterysense_settings', JSON.stringify(defaultSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = true;
      if (settings.theme === 'light') {
        isDark = false;
      } else if (settings.theme === 'dark') {
        isDark = true;
      } else if (settings.theme === 'system') {
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  // Reduced motion application
  useEffect(() => {
    const root = document.documentElement;
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings.reducedMotion]);

  return { settings, updateSetting, resetDefaults };
};
