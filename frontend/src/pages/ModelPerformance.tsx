import React from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

import { PerformanceResponse } from '../types';

interface ModelPerformanceProps {
  performance: PerformanceResponse | null;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ performance }) => {
  if (!performance) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 space-y-3">
        <Cpu className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
        <h3 className="text-lg font-semibold text-white">No Model Performance Metrics Available</h3>
        <p className="text-xs">Train the model from the Data Management tab to view evaluation results.</p>
      </div>
    );
  }

  const { baseline_metrics, rf_metrics, better_model, improvement_percentage, feature_importances, actual_vs_predicted } = performance;

  // Build Residual distribution buckets
  const residuals = actual_vs_predicted.map(p => p.error_rf);
  const minErr = Math.min(...residuals, 0);
  const maxErr = Math.max(...residuals, 1);
  const binCount = 7;
  const binWidth = (maxErr - minErr) / binCount;
  
  const errorBins = Array.from({ length: binCount }).map((_, i) => {
    const start = minErr + i * binWidth;
    const end = start + binWidth;
    const count = residuals.filter(r => r >= start && r < end).length;
    return {
      range: `${start.toFixed(0)} to ${end.toFixed(0)}`,
      count
    };
  });

  return (
    <div className="space-y-6">
      {/* Title & Winner Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Model Evaluation & Benchmark</h2>
          </div>
          <p className="text-sm text-slate-400">
            Comparing Chronological Naive Baseline (Lag-1) vs. Random Forest Regressor on 20% held-out test data.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider font-semibold">Better Performing Model</p>
            <p className="text-base font-bold text-white">{better_model}</p>
            {improvement_percentage > 0 && (
              <p className="text-xs text-emerald-300 font-medium">
                +{improvement_percentage}% MAE Improvement over Baseline
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Metrics Table & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">MAE (Mean Absolute Error)</p>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-white">₹{rf_metrics.mae}</span>
            <span className="text-xs text-slate-400">Baseline: ₹{baseline_metrics.mae}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">Average rupee magnitude of errors</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">RMSE (Root Mean Square Error)</p>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-white">₹{rf_metrics.rmse}</span>
            <span className="text-xs text-slate-400">Baseline: ₹{baseline_metrics.rmse}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">Penalizes larger outliers</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">R² Score (Goodness of Fit)</p>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-brand-400">{rf_metrics.r2}</span>
            <span className="text-xs text-slate-400">Baseline: {baseline_metrics.r2}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">Proportion of variance explained</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase">MAPE (Mean Abs % Error)</p>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-purple-400">{rf_metrics.mape}%</span>
            <span className="text-xs text-slate-400">Baseline: {baseline_metrics.mape}%</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">Relative percentage error</p>
        </div>
      </div>

      {/* Dynamic Metric Explanations */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          Automated Plain-Language Metric Interpretation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-brand-400 uppercase">MAE Explanation</span>
            <p className="text-slate-300">{performance.mae_explanation}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-emerald-400 uppercase">RMSE Explanation</span>
            <p className="text-slate-300">{performance.rmse_explanation}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-purple-400 uppercase">R² Fit Explanation</span>
            <p className="text-slate-300">{performance.r2_explanation}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-amber-400 uppercase">MAPE Relative Accuracy</span>
            <p className="text-slate-300">{performance.mape_explanation}</p>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted & Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Predicted Line Chart */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-semibold text-white text-base">Actual vs. Predicted Sales (Test Set)</h3>
          <p className="text-xs text-slate-400">Comparing true sales vs. Naive and Random Forest predictions</p>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={actual_vs_predicted}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="actual" stroke="#0c8de4" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="predicted_baseline" stroke="#64748b" strokeDasharray="3 3" dot={false} name="Naive Baseline" />
                <Line type="monotone" dataKey="predicted_rf" stroke="#a855f7" strokeWidth={2} dot={false} name="Random Forest" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-semibold text-white text-base">Engineered Feature Importances</h3>
          <p className="text-xs text-slate-400">Gini importance contribution of time and lag features</p>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feature_importances.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="importance" fill="#36a9f7" radius={[0, 8, 8, 0]} name="Gini Importance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
