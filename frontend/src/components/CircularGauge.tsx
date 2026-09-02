import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';

interface CircularGaugeProps {
  value: number | null;
  available: boolean;
  label: string;
  sublabel?: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string; // 'blue' | 'green' | 'amber' | 'purple'
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  available,
  label,
  sublabel,
  unit = '%',
  size = 130,
  strokeWidth = 10,
  color = 'blue'
}) => {
  const { settings } = useSettings();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = available && value !== null ? Math.max(0, Math.min(100, value)) : 0;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const colorMap: Record<string, { stroke: string; glow: string; text: string }> = {
    blue: { stroke: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', text: 'text-accent-blue' },
    green: { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', text: 'text-accent-green' },
    amber: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-accent-amber' },
    purple: { stroke: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: 'text-purple-400' },
    red: { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', text: 'text-accent-red' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-white/10"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scheme.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: available ? strokeDashoffset : circumference }}
            transition={{
              duration: settings.reducedMotion ? 0.01 : 1,
              ease: 'easeOut'
            }}
            style={{
              filter: `drop-shadow(0 0 6px ${scheme.glow})`
            }}
          />
        </svg>

        {/* Center Text Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          {available && value !== null ? (
            <div className="flex items-baseline font-mono">
              <span className="text-2xl font-black text-white">{Math.round(value)}</span>
              <span className="text-xs text-text-secondary font-medium ml-0.5">{unit}</span>
            </div>
          ) : (
            <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
              N/A
            </span>
          )}
          <span className="text-[11px] text-text-secondary font-medium mt-0.5">{label}</span>
        </div>
      </div>

      {sublabel && (
        <span className="text-xs text-text-secondary mt-2 text-center">{sublabel}</span>
      )}
    </div>
  );
};
