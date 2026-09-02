import React from 'react';

interface StatusBadgeProps {
  status: string | null | undefined;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = ''
}) => {
  if (!status) {
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-text-secondary border border-white/10 ${className}`}>
        {label || 'Unavailable'}
      </span>
    );
  }

  const s = status.toUpperCase();
  let badgeStyle = 'bg-white/5 text-text-secondary border-white/10';

  if (s === 'EXCELLENT' || s === 'GOOD' || s === 'HEALTHY' || s === 'ONLINE') {
    badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (s === 'FAIR' || s === 'MODERATE' || s === 'WARNING') {
    badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (s === 'POOR' || s === 'CRITICAL' || s === 'ERROR') {
    badgeStyle = 'bg-red-500/15 text-red-400 border-red-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeStyle} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {label || status}
    </span>
  );
};
