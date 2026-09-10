import React from 'react';
import { BookOpen, Cpu, ShieldCheck, Zap, Layers, BarChart2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/30">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">About ForecastIQ & Machine Learning Methodology</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              An educational guide to end-to-end time-series sales forecasting for academic and professional applications.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-brand-400 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            <h3>1. Data Preprocessing & Column Detection</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ForecastIQ automatically scans uploaded CSV files to infer datetime columns and target sales columns. It sorts records chronologically, handles missing values via linear interpolation, and aggregates daily sales totals.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
            <Cpu className="w-4 h-4" />
            <h3>2. Time-Series Feature Engineering</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Engineers calendar features (year, month, day, day of week, quarter, weekend indicator, sine/cosine cyclical encodings) and historical features (lags 1, 7, 14, 30 days and rolling 7, 14, 30 day means & standard deviations).
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <h3>3. Strict Data Leakage Prevention</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All rolling statistics and lag variables use strictly historical information available prior to the forecast timestamp (via <code className="text-brand-300 bg-slate-900 px-1 py-0.5 rounded">shift(1)</code>). Splitting is strictly chronological (80% historical training, 20% test evaluation).
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <BarChart2 className="w-4 h-4" />
            <h3>4. Naive Baseline vs. Random Forest</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A Naive Baseline model (predicting lag-1 sales) is trained as a standard benchmark against the Random Forest Regressor (100 decision trees). Evaluation metrics include MAE, RMSE, R², and safe zero-clipped MAPE.
          </p>
        </div>
      </div>
    </div>
  );
};
