import React from 'react';
import { useSystemInfo } from '../hooks/useSystemInfo';
import { useStorage } from '../hooks/useStorage';
import { Server, Cpu, Monitor, HardDrive, Copy, Check } from 'lucide-react';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { formatBytes, formatFrequency } from '../utils/format';
import { useState } from 'react';

function CopyableRow({ label, value }: { label: string; value: string | undefined }) {
  const [copied, setCopied] = useState(false);
  const displayValue = value || 'Unknown';

  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 group">
      <span className="text-text-secondary text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-white">{displayValue}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
          aria-label={`Copy ${label}`}
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
        </button>
      </div>
    </div>
  );
}

export default function SystemPage() {
  const { data, loading } = useSystemInfo();
  const { data: storage } = useStorage();

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <header>
          <h1 className="text-3xl font-bold">System Information</h1>
          <p className="text-text-secondary mt-1">Hardware and OS specifications</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">System Information</h1>
            <ConnectionIndicator />
          </div>
          <p className="text-text-secondary mt-1">
            {data ? 'Hardware and OS specifications' : 'Connect the Windows monitoring agent to inspect CPU, motherboard, BIOS, and OS details.'}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operating System */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.03]">
            <Server className="w-5 h-5 text-accent-blue" />
            <h2 className="font-bold">Operating System</h2>
          </div>
          <div className="p-4 space-y-1">
            <CopyableRow label="Name" value={data?.os.name} />
            <CopyableRow label="Version" value={data?.os.version} />
            <CopyableRow label="Build" value={data?.os.build} />
            <CopyableRow label="Architecture" value={data?.os.architecture} />
            <CopyableRow label="Hostname" value={data?.os.hostname} />
          </div>
        </div>

        {/* Processor */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.03]">
            <Cpu className="w-5 h-5 text-accent-amber" />
            <h2 className="font-bold">Processor</h2>
          </div>
          <div className="p-4 space-y-1">
            <CopyableRow label="Model" value={data?.processor.name} />
            <CopyableRow label="Physical Cores" value={data?.processor.physical_cores?.toString()} />
            <CopyableRow label="Logical Processors" value={data?.processor.logical_processors?.toString()} />
            <CopyableRow label="Current Frequency" value={data?.processor.frequency_current ? formatFrequency(data.processor.frequency_current) : undefined} />
            <CopyableRow label="Max Frequency" value={data?.processor.frequency_max ? formatFrequency(data.processor.frequency_max) : undefined} />
          </div>
        </div>

        {/* Device */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.03]">
            <Monitor className="w-5 h-5 text-accent-green" />
            <h2 className="font-bold">Device</h2>
          </div>
          <div className="p-4 space-y-1">
            <CopyableRow label="Manufacturer" value={data?.laptop.manufacturer} />
            <CopyableRow label="Model" value={data?.laptop.model} />
            <CopyableRow label="BIOS Version" value={data?.laptop.bios_version} />
          </div>
        </div>

        {/* Memory */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.03]">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold">Memory</h2>
          </div>
          <div className="p-4 space-y-1">
            <CopyableRow label="Total RAM" value={data?.memory.total ? formatBytes(data.memory.total) : undefined} />
            <CopyableRow label="Available" value={data?.memory.available ? formatBytes(data.memory.available) : undefined} />
            <CopyableRow label="Used" value={data?.memory.used ? formatBytes(data.memory.used) : undefined} />
          </div>
        </div>

        {/* Storage */}
        {storage && storage.drives.length > 0 && (
          <div className="glass-card overflow-hidden md:col-span-2">
            <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.03]">
              <HardDrive className="w-5 h-5 text-accent-green" />
              <h2 className="font-bold">Storage</h2>
            </div>
            <div className="p-4 space-y-4">
              {storage.drives.map((drive, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{drive.device} ({drive.mountpoint})</span>
                    <span className="text-text-secondary text-sm">{drive.fstype}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${drive.percent > 90 ? 'bg-accent-red' : drive.percent > 70 ? 'bg-accent-amber' : 'bg-accent-green'}`}
                      style={{ width: `${drive.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{formatBytes(drive.used)} used</span>
                    <span>{formatBytes(drive.free)} free of {formatBytes(drive.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
