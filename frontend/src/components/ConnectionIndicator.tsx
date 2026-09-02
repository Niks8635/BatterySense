import React, { useState } from 'react';
import { useAgentStatus } from '../hooks/useAgentStatus';
import { AgentConnectModal } from './AgentConnectModal';
import { Sparkles, Activity } from 'lucide-react';

export const ConnectionIndicator: React.FC = () => {
  const { isOnline } = useAgentStatus();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
        }`}
        title={isOnline ? 'Local agent connected on 127.0.0.1:8000' : 'Showing Demo Mode — Click to connect your PC'}
        aria-label="Connection Status"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <span>{isOnline ? 'Live Telemetry' : 'Demo Mode'}</span>
      </button>

      <AgentConnectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
