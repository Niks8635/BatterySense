import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  status?: 'available' | 'unavailable';
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  status = 'available',
  color = 'text-accent-blue'
}) => {
  const isAvailable = status === 'available';
  const displayValue = isAvailable ? value : 'Unavailable';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 flex flex-col relative overflow-hidden group ${!isAvailable ? 'opacity-70' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-text-secondary font-medium text-sm">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg bg-white/5 ${isAvailable ? color : 'text-text-secondary'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <div className={`text-2xl lg:text-3xl font-bold tracking-tight ${!isAvailable ? 'text-text-secondary' : 'text-white'}`}>
          {displayValue}
        </div>
        {subtitle && isAvailable && (
          <div className="text-xs text-text-secondary mt-1">{subtitle}</div>
        )}
      </div>
      
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};
