import React, { useState } from 'react';
import { useBattery } from '../hooks/useBattery';
import { useSystemInfo } from '../hooks/useSystemInfo';
import { generateBatteryReport } from '../services/api';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Battery,
  Clock,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  formatPercentage,
  formatCapacity,
  formatDuration,
  getHealthColor,
  getHealthLabel
} from '../utils/format';

export default function BatteryReportPage() {
  const { data: battery, loading: batteryLoading } = useBattery();
  const { data: system, loading: sysLoading } = useSystemInfo();
  const [generating, setGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<{ status: string; message: string; path?: string } | null>(null);

  const reportDate = new Date().toLocaleString([], {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const handleDownloadPdf = () => {
    // Native browser print dialog renders print-specific stylesheet formatted for PDF/A4
    window.print();
  };

  const handleGenerateWindowsReport = async () => {
    setGenerating(true);
    setReportResult(null);
    try {
      const res = await generateBatteryReport();
      setReportResult(res);
    } catch (err: any) {
      setReportResult({
        status: 'error',
        message: err.message || 'Failed to generate Windows report. Administrator privileges may be required.'
      });
    } finally {
      setGenerating(false);
    }
  };

  const healthPercent = battery?.health_percent.available ? battery.health_percent.value : null;
  const designCap = battery?.design_capacity.available ? battery.design_capacity.value : null;
  const fullCap = battery?.full_charge_capacity.available ? battery.full_charge_capacity.value : null;
  const wearPercent = battery?.wear_percent.available ? battery.wear_percent.value : null;
  const cycleCount = battery?.cycle_count.available ? battery.cycle_count.value : null;
  const voltage = battery?.voltage.available && battery.voltage.value ? (battery.voltage.value / 1000).toFixed(2) : null;
  const runtime = battery?.estimated_runtime_seconds.available ? battery.estimated_runtime_seconds.value : null;

  // Capacity loss calculation
  const capacityLoss = designCap && fullCap ? designCap - fullCap : null;

  // Advisory logic based on real health metrics
  const getRecommendation = () => {
    if (healthPercent === null) {
      return {
        title: 'Health Data Pending',
        description: 'Unable to calculate health metrics due to limited ACPI/WMI controller feedback on this device.',
        type: 'info'
      };
    }
    if (healthPercent >= 90) {
      return {
        title: 'Battery Condition: Excellent',
        description:
          'Your battery maintains over 90% of its factory design capacity. Chemical degradation is minimal. Standard charging practices are recommended.',
        tips: [
          'For extended lifespan, avoid keeping the device plugged in at 100% in high ambient temperatures.',
          'Consider enabling 80% maximum charging limit in BIOS or manufacturer software if plugged in most of the day.',
          'Store battery around 50% state of charge if putting the laptop into long-term storage.'
        ],
        type: 'excellent'
      };
    }
    if (healthPercent >= 80) {
      return {
        title: 'Battery Condition: Good',
        description:
          'Your battery shows normal, expected wear. It continues to deliver solid runtime under typical productivity workloads.',
        tips: [
          'Avoid deep discharges down to 0% where possible; recharge around 15-20%.',
          'Keep vents clear to prevent high charging temperatures which accelerate cell aging.'
        ],
        type: 'good'
      };
    }
    if (healthPercent >= 60) {
      return {
        title: 'Battery Condition: Fair (Degraded)',
        description:
          'Noticeable reduction in original factory runtime. Battery wear is moderate. You may experience shorter unplugged operational hours.',
        tips: [
          'Enable Windows Battery Saver mode at 30% to conserve remaining capacity on the road.',
          'Avoid heavy sustained gaming or video rendering while running on battery power alone.'
        ],
        type: 'fair'
      };
    }
    return {
      title: 'Battery Condition: Poor (Service Recommended)',
      description:
        'Significant capacity loss detected (>40% wear). The battery may exhibit abrupt percentage drops or reduced system peak performance.',
      tips: [
        'Consider contacting your laptop manufacturer (e.g. ASUS / Dell / HP) for official battery replacement.',
        'Back up critical work frequently when running unplugged to guard against sudden shutdown.'
      ],
      type: 'poor'
    };
  };

  const advice = getRecommendation();

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Top Action Header (Hidden during PDF print) */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold">Battery Report</h1>
          <p className="text-text-secondary mt-1">
            Comprehensive diagnostic report with export to PDF and Windows PowerCfg integration
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-accent-blue text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
            title="Download or print this diagnostic report as a PDF"
          >
            <Printer className="w-4 h-4" /> Download as PDF
          </button>

          <button
            onClick={handleGenerateWindowsReport}
            disabled={generating}
            className="flex items-center gap-2 glass-card border border-white/15 px-4 py-2.5 rounded-xl font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Run Windows powercfg /batteryreport"
          >
            {generating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <FileText className="w-4 h-4 text-accent-green" />
            )}
            Windows PowerCfg
          </button>
        </div>
      </header>

      {/* Windows Powercfg Result Banner (No-print) */}
      {reportResult && (
        <div
          className={`p-4 rounded-xl no-print flex items-center justify-between gap-4 ${
            reportResult.status === 'success'
              ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
              : 'bg-accent-red/10 text-accent-red border border-accent-red/20'
          }`}
        >
          <div className="flex items-center gap-3">
            {reportResult.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold">{reportResult.message}</p>
              {reportResult.path && (
                <p className="text-xs text-text-secondary mt-0.5 font-mono">{reportResult.path}</p>
              )}
            </div>
          </div>
          {reportResult.status === 'success' && (
            <a
              href="/api/battery/report/content"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-accent-green/20 hover:bg-accent-green/30 text-accent-green rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              View HTML <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* =========================================================================
          THE PRINTABLE / EXPORTABLE REPORT DOCUMENT (Styled for screen & print)
         ========================================================================= */}
      <div id="printable-battery-report" className="space-y-6">
        {/* Document Header */}
        <div className="glass-card p-6 lg:p-8 border-t-4 border-t-accent-blue">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center text-white font-bold">
                  <Battery className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">BatterySense Diagnostic Report</h2>
                  <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                    Hardware Telemetry & Battery Health Assessment
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right text-xs text-text-secondary space-y-0.5">
              <div><span className="font-medium text-white">Generated:</span> {reportDate}</div>
              <div><span className="font-medium text-white">Host:</span> {system?.os.hostname || 'Windows PC'}</div>
              <div><span className="font-medium text-white">Report ID:</span> BS-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* System Specs Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-2 text-sm">
            <div>
              <span className="text-xs text-text-secondary block">Computer System</span>
              <span className="font-semibold text-white">
                {system ? `${system.laptop.manufacturer} ${system.laptop.model}` : 'Loading...'}
              </span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">Operating System</span>
              <span className="font-semibold text-white">
                {system ? `${system.os.name} (Build ${system.os.version})` : 'Loading...'}
              </span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">Processor</span>
              <span className="font-semibold text-white">
                {system ? `${system.processor.name} (${system.processor.physical_cores} Cores)` : 'Loading...'}
              </span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">BIOS Revision</span>
              <span className="font-semibold text-white">
                {system?.laptop.bios_version || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Health Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Gauge Box */}
          <div className="glass-card p-6 md:col-span-1 flex flex-col justify-center items-center text-center space-y-3">
            <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
              Overall Health Rating
            </span>
            <div className="text-5xl font-black text-white">
              {healthPercent !== null ? formatPercentage(healthPercent) : 'Unavailable'}
            </div>
            {battery?.health_status.available && battery.health_status.value && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getHealthColor(
                  battery.health_status.value
                )} bg-white/5 border border-white/10`}
              >
                {getHealthLabel(battery.health_status.value)}
              </span>
            )}
            <p className="text-xs text-text-secondary pt-1">
              Calculated from official full charge vs design capacity ratio
            </p>
          </div>

          {/* Capacity Degradation Overview */}
          <div className="glass-card p-6 md:col-span-2 space-y-4 flex flex-col justify-center">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-amber" /> Capacity Retention Breakdown
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Full Charge Capacity</span>
                <span className="font-bold text-white">
                  {fullCap ? formatCapacity(fullCap) : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-accent-green h-3.5 rounded-full transition-all duration-500"
                  style={{ width: `${healthPercent || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Current max retention</span>
                <span>Design factory: {designCap ? formatCapacity(designCap) : 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-white/10">
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-[11px] text-text-secondary block">Wear Level</span>
                <span className="text-base font-bold text-accent-red">
                  {wearPercent !== null ? formatPercentage(wearPercent) : 'N/A'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-[11px] text-text-secondary block">Capacity Lost</span>
                <span className="text-base font-bold text-white">
                  {capacityLoss ? formatCapacity(capacityLoss) : '0 mWh'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-[11px] text-text-secondary block">Total Cycles</span>
                <span className="text-base font-bold text-accent-blue">
                  {cycleCount !== null ? cycleCount : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Hardware Metrics Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" /> Battery Hardware Telemetry Metrics
            </h3>
          </div>
          <div className="divide-y divide-white/5 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 p-3.5 hover:bg-white/[0.02]">
              <span className="text-text-secondary">Current Charge Level</span>
              <span className="font-semibold text-white">
                {battery?.percentage.available && battery.percentage.value !== null
                  ? `${battery.percentage.value}%`
                  : 'Unavailable'}
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">Live state of charge</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 p-3.5 hover:bg-white/[0.02]">
              <span className="text-text-secondary">Power Source & State</span>
              <span className="font-semibold text-white">
                {battery?.power_plugged.available
                  ? battery.power_plugged.value
                    ? 'AC Power Connected (Charging/Charged)'
                    : 'Running on Battery (Discharging)'
                  : 'Unavailable'}
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">Hardware ACPI power state</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 p-3.5 hover:bg-white/[0.02]">
              <span className="text-text-secondary">Factory Design Capacity</span>
              <span className="font-semibold text-white">
                {designCap ? formatCapacity(designCap) : 'Unavailable'}
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">Original design rating</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 p-3.5 hover:bg-white/[0.02]">
              <span className="text-text-secondary">Full Charge Capacity</span>
              <span className="font-semibold text-white">
                {fullCap ? formatCapacity(fullCap) : 'Unavailable'}
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">Current maximum storage</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 p-3.5 hover:bg-white/[0.02]">
              <span className="text-text-secondary">Estimated Remaining Runtime</span>
              <span className="font-semibold text-white">
                {runtime !== null ? formatDuration(runtime) : 'Estimating / On AC power'}
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">Based on measured discharge rate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 p-3.5 hover:bg-white/[0.02]">
              <span className="text-text-secondary">Operating Voltage</span>
              <span className="font-semibold text-white">
                {voltage ? `${voltage} V (${battery?.voltage.value} mV)` : 'Unavailable'}
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">Direct terminal voltage</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 p-3.5 hover:bg-white/[0.02]">
              <span className="text-text-secondary">Charge Cycle Count</span>
              <span className="font-semibold text-white">
                {cycleCount !== null ? `${cycleCount} completed cycles` : 'Unavailable on this controller'}
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">Cumulative discharge cycles</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Assessment & Recommendations */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <ShieldCheck className="w-5 h-5 text-accent-green" />
            <h3 className="font-bold text-white text-base">Diagnostic Evaluation & Advisory</h3>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-white text-sm">{advice.title}</h4>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">{advice.description}</p>
            </div>

            {advice.tips && (
              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block mb-2">
                  Optimization Tips for Longevity:
                </span>
                <ul className="space-y-1.5">
                  {advice.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-accent-blue font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Official Certification Footer */}
        <div className="p-4 text-center text-xs text-text-secondary border-t border-white/10 space-y-1">
          <p>BatterySense Windows Diagnostic Engine • Powered by WMI & PSUtil Telemetry</p>
          <p>
            This report represents low-level ACPI battery status collected from local hardware without remote transmission.
          </p>
        </div>
      </div>
    </div>
  );
}
