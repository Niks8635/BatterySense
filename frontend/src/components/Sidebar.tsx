import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Battery, 
  Cpu, 
  Info, 
  LineChart, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/battery', label: 'Battery', icon: Battery },
  { path: '/performance', label: 'Performance', icon: Cpu },
  { path: '/system', label: 'System', icon: Info },
  { path: '/analytics', label: 'Analytics', icon: LineChart },
  { path: '/report', label: 'Battery Report', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar content */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card border-l-0 border-t-0 border-b-0 rounded-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center">
              <Battery className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-blue to-accent-green">
              BatterySense
            </span>
          </div>
          <button 
            className="lg:hidden text-text-secondary hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${isActive 
                  ? 'bg-accent-blue/10 text-accent-blue' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <NavLink
            to="/about"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `
              block w-full text-center py-2 text-sm transition-colors rounded-lg
              ${isActive ? 'text-accent-blue bg-accent-blue/5' : 'text-text-secondary hover:text-text-primary'}
            `}
          >
            About
          </NavLink>
        </div>
      </div>
    </>
  );
};
