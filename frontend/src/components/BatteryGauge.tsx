import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Battery, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface BatteryGaugeProps {
  percentage: number | null;
  available: boolean;
  isCharging: boolean | null;
  healthPercent: number | null;
  healthStatus?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  percentage,
  available,
  isCharging,
  healthPercent,
  healthStatus,
  size = 'lg'
}) => {
  const { settings } = useSettings();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const pct = available && percentage !== null ? Math.max(0, Math.min(100, percentage)) : 0;
  const isReduced = settings.reducedMotion;
  const enable3D = settings.threeDEffects && !isReduced;

  // Determine color scheme based on charge level and health
  const getColors = () => {
    if (!available || percentage === null) {
      return {
        fill: 'from-gray-600 to-gray-700',
        glow: 'rgba(107, 114, 128, 0.2)',
        border: 'border-gray-600/40',
        text: 'text-text-secondary'
      };
    }
    if (pct <= 20) {
      return {
        fill: 'from-red-600 via-rose-500 to-amber-500',
        glow: 'rgba(239, 68, 68, 0.35)',
        border: 'border-red-500/50',
        text: 'text-red-400'
      };
    }
    if (pct <= 50) {
      return {
        fill: 'from-amber-600 via-amber-500 to-yellow-400',
        glow: 'rgba(245, 158, 11, 0.35)',
        border: 'border-amber-500/50',
        text: 'text-amber-400'
      };
    }
    return {
      fill: 'from-emerald-600 via-green-500 to-teal-400',
      glow: 'rgba(34, 197, 94, 0.35)',
      border: 'border-emerald-500/50',
      text: 'text-accent-green'
    };
  };

  const colors = getColors();

  // Interactive 3D mouse tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3D) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    if (!enable3D) return;
    setTilt({ x: 0, y: 0 });
  };

  const widthClasses = size === 'lg' ? 'w-64 h-32 sm:w-80 sm:h-36' : size === 'md' ? 'w-56 h-28' : 'w-40 h-20';

  return (
    <div
      className="relative flex flex-col items-center select-none"
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Container */}
      <motion.div
        animate={{
          rotateY: enable3D ? tilt.x : 0,
          rotateX: enable3D ? tilt.y : 0
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative flex items-center"
      >
        {/* Main Battery Chassis */}
        <div
          className={`relative ${widthClasses} rounded-2xl bg-gradient-to-b from-[#161622] to-[#0c0c14] border-2 ${colors.border} p-2 shadow-2xl flex items-center overflow-hidden`}
          style={{
            boxShadow: `0 12px 36px -8px ${colors.glow}, inset 0 2px 4px rgba(255,255,255,0.08)`
          }}
        >
          {/* Internal Chamber Track */}
          <div className="relative w-full h-full rounded-xl bg-black/40 overflow-hidden flex items-center p-1 border border-white/5">
            {/* Dynamic Battery Fill Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: isReduced ? 0.01 : 1.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={`h-full rounded-lg bg-gradient-to-r ${colors.fill} relative overflow-hidden`}
              style={{
                boxShadow: `0 0 20px ${colors.glow}`
              }}
            >
              {/* Subtle Energy Wave / Shimmer Animation when charging */}
              {isCharging && !isReduced && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: 'linear'
                  }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
                />
              )}

              {/* Grid cell lines for industrial hardware aesthetic */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 16px, rgba(0,0,0,0.4) 16px, rgba(0,0,0,0.4) 18px)'
                }}
              />
            </motion.div>

            {/* Centered Telemetry Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 drop-shadow-md">
                {available ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                      {pct}%
                    </span>
                    {isCharging && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-yellow-300 text-xs font-bold border border-yellow-400/30">
                        <Zap className="w-3 h-3 fill-yellow-300 animate-bounce" />
                        Charging
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                    Unavailable
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Glass Specular Reflection Highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl pointer-events-none" />
        </div>

        {/* Battery Positive Anode Terminal (Cap on right) */}
        <div className="w-3.5 h-12 -ml-0.5 rounded-r-md bg-gradient-to-r from-[#222234] to-[#3a3a54] border-r-2 border-y-2 border-white/20 shadow-md" />
      </motion.div>

      {/* Health Assessment Status Pill below battery */}
      <div className="mt-4 flex items-center gap-3">
        {healthPercent !== null ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
            <span className="text-text-secondary">Health:</span>
            <span className="font-bold text-white">{healthPercent}%</span>
            {healthStatus && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                healthStatus === 'EXCELLENT' ? 'bg-emerald-500/20 text-emerald-400' :
                healthStatus === 'GOOD' ? 'bg-blue-500/20 text-blue-400' :
                healthStatus === 'FAIR' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {healthStatus}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary">
            <span>Battery Health: Unavailable</span>
          </div>
        )}

        <div className="text-xs text-text-secondary flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isCharging ? 'bg-yellow-400 animate-pulse' : 'bg-accent-green'}`} />
          <span>{isCharging ? 'AC Powered' : 'Discharging (Battery)'}</span>
        </div>
      </div>
    </div>
  );
};
