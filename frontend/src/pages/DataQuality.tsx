import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

import { DataSummaryResponse } from '../types';

interface DataQualityProps {
  dataSummary: DataSummaryResponse | null;
}

export const DataQuality: React.FC<DataQualityProps> = ({ dataSummary }) => {
  if (!dataSummary) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
        No dataset summary available. Upload data in Data Management.
      </div>
    );
  }

  const qr = dataSummary.quality_report;
  const isGood = qr.health_status === 'Good';

  return (
    <div className="space-y-6">
      {/* Quality Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Data Quality Audit & Integrity Report</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated verification of missing fields, duplicates, invalid dates, and sales statistical distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center shrink-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Health Score</p>
            <p className="text-2xl font-bold text-emerald-400">{qr.health_score}/100</p>
            <p className="text-[10px] font-semibold text-emerald-300 uppercase">{qr.health_status}</p>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Rows Inspected</p>
          <p className="text-2xl font-bold text-white">{qr.total_rows.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">{qr.total_days} daily aggregated records</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">Missing Values Handled</p>
          <p className="text-2xl font-bold text-emerald-400">{qr.missing_values_count}</p>
          <p className="text-[11px] text-slate-500">Filled via forward fill / interpolation</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">Duplicates Removed</p>
          <p className="text-2xl font-bold text-emerald-400">{qr.duplicate_count}</p>
          <p className="text-[11px] text-slate-500">Identical rows deduplicated</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">Invalid Entries Fixed</p>
          <p className="text-2xl font-bold text-brand-400">{qr.invalid_records_handled}</p>
          <p className="text-[11px] text-slate-500">Invalid dates / negative sales clipped</p>
        </div>
      </div>

      {/* Descriptive Statistics Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            Descriptive Target Sales Statistics
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-400 uppercase">Minimum Daily Sales</td>
                  <td className="px-4 py-3 font-bold text-white">₹{qr.min_sales.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-400 uppercase">Maximum Daily Sales</td>
                  <td className="px-4 py-3 font-bold text-white">₹{qr.max_sales.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-400 uppercase">Mean (Average) Sales</td>
                  <td className="px-4 py-3 font-bold text-brand-400">₹{qr.mean_sales.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-400 uppercase">Median Sales</td>
                  <td className="px-4 py-3 font-bold text-white">₹{qr.median_sales.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-400 uppercase">Standard Deviation</td>
                  <td className="px-4 py-3 font-bold text-purple-400">₹{qr.std_sales.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cleaning Action Log */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Preprocessing & Cleaning Action Log
          </h3>

          <div className="space-y-2.5">
            {qr.details.map((detail, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
