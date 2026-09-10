import React from 'react';
import { TrendingUp, Server, Cpu, RefreshCw } from 'lucide-react';

interface NavbarProps {
  apiStatus: boolean;
  modelStatus: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiStatus,
  modelStatus,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
            ForecastIQ
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
              v1.0 ML System
            </span>
          </h1>
          <p className="text-xs text-slate-400">Sales & Demand Forecasting System</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status Indicators */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Server className={`w-3.5 h-3.5 ${apiStatus ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-slate-300">Backend:</span>
            <span className={apiStatus ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {apiStatus ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Cpu className={`w-3.5 h-3.5 ${modelStatus ? 'text-brand-400' : 'text-amber-400'}`} />
            <span className="text-slate-300">Model:</span>
            <span className={modelStatus ? 'text-brand-400 font-medium' : 'text-amber-400 font-medium'}>
              {modelStatus ? 'Trained & Saved' : 'Untrained'}
            </span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center justify-center disabled:opacity-50"
          title="Refresh All Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
