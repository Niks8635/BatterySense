import React from 'react';
import { Battery } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-6 lg:space-y-8 pb-10 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">About BatterySense</h1>
      </header>

      <div className="glass-card p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center mx-auto shadow-lg shadow-accent-blue/20">
          <Battery className="w-10 h-10 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">BatterySense</h2>
          <p className="text-text-secondary mt-1">Version 1.0.0</p>
        </div>

        <p className="text-text-secondary max-w-lg mx-auto">
          A modern, high-performance dashboard for monitoring Windows hardware, battery health, and system telemetry in real-time.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4 border-t border-white/10">
          <div className="text-left">
            <h3 className="font-medium text-sm text-text-secondary mb-2">Technology Stack</h3>
            <ul className="space-y-1 text-sm">
              <li>React 18</li>
              <li>TypeScript</li>
              <li>Vite</li>
              <li>Tailwind CSS</li>
              <li>Framer Motion</li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-sm text-text-secondary mb-2">Privacy</h3>
            <ul className="space-y-1 text-sm text-accent-green">
              <li>No cloud syncing</li>
              <li>100% local processing</li>
              <li>No external trackers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
