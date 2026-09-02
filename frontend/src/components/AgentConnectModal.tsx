import React from 'react';
import { useAgentStatus } from '../hooks/useAgentStatus';
import { Terminal, RefreshCw, X, CheckCircle2, ShieldCheck, Laptop } from 'lucide-react';

interface AgentConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentConnectModal: React.FC<AgentConnectModalProps> = ({ isOpen, onClose }) => {
  const { isOnline, checking, checkNow } = useAgentStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 space-y-6 border-white/15 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-secondary hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center text-accent-blue">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Connect Windows Agent</h3>
            <p className="text-xs text-text-secondary">Stream live hardware telemetry from your PC</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          Browsers cannot directly query low-level Windows battery, thermal, and CPU registers. 
          BatterySense uses a lightweight Python agent running strictly on <code className="text-accent-blue font-mono">127.0.0.1:8000</code>.
        </p>

        {isOnline ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Agent is connected and actively streaming live telemetry!</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-white uppercase tracking-wider block">Quick Start on Windows</span>
              <div className="bg-black/60 rounded-xl p-3.5 border border-white/10 font-mono text-text-primary space-y-1 overflow-x-auto text-[11px] sm:text-xs">
                <div className="text-text-secondary"># 1. Clone repository or download folder</div>
                <div className="text-accent-blue">git clone https://github.com/Niks8635/BatterySense.git</div>
                <div className="text-text-secondary mt-1"># 2. Run local hardware agent</div>
                <div className="text-emerald-400">cd BatterySense\backend</div>
                <div className="text-emerald-400">python run.py</div>
              </div>
              <p className="text-[11px] text-text-secondary">
                Or simply double-click <strong className="text-white">start_backend.bat</strong> in the repository.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-secondary pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Agent never sends hardware telemetry to external servers.</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={async () => {
              const ok = await checkNow();
              if (ok) {
                setTimeout(onClose, 800);
              }
            }}
            disabled={checking}
            className="flex-1 bg-accent-blue text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking 127.0.0.1...' : 'Check Connection'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
