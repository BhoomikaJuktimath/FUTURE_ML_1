import React from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

import { ForecastResponse } from '../types';

interface ForecastPageProps {
  forecast: ForecastResponse | null;
  selectedHorizon: number;
  onHorizonChange: (horizon: number) => void;
  isProcessing: boolean;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  forecast,
  selectedHorizon,
  onHorizonChange,
  isProcessing
}) => {
  const horizons = [7, 14, 30, 60, 90];
  const summary = forecast?.summary;
  const records = forecast?.forecast_records || [];
  const chartData = forecast?.timeline_chart || [];

  const handleExportCSV = () => {
    if (!records.length) return;
    const headers = ['Date', 'Predicted_Sales', 'Lower_Bound_Uncertainty', 'Upper_Bound_Uncertainty'];
    const rows = records.map(r => [r.date, r.predicted_sales, r.lower_bound, r.upper_bound].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ForecastIQ_${selectedHorizon}d_forecast.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Horizon Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Future Demand Horizon
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
              Recursive Autoregressive ML
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            Multi-step forward prediction using historical lags and rolling statistical windows.
          </p>
        </div>

        {/* Horizon Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {horizons.map((h) => (
            <button
              key={h}
              onClick={() => onHorizonChange(h)}
              disabled={isProcessing}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedHorizon === h
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Projected Sales</p>
            <p className="text-2xl font-bold text-white">
              ₹{summary.total_forecasted_sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500">{selectedHorizon}-day cumulative forecast</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-brand-500/20 space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase">Avg Daily Demand</p>
            <p className="text-2xl font-bold text-brand-400">
              ₹{summary.avg_daily_sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500">Expected daily sales rate</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase flex items-center justify-between">
              <span>Peak Demand Day</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              ₹{summary.max_sales_day.sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">On {summary.max_sales_day.date}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase flex items-center justify-between">
              <span>Lowest Demand Day</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
            </p>
            <p className="text-2xl font-bold text-amber-400">
              ₹{summary.min_sales_day.sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">On {summary.min_sales_day.date}</p>
          </div>
        </div>
      )}

      {/* Recharts Continuous Timeline Chart */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Integrated Timeline (Historical Actuals + Test Predictions + {selectedHorizon}-Day Forecast)
            </h3>
            <p className="text-xs text-slate-400">Shaded upper/lower bounds denote residual prediction intervals</p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={!records.length}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Export Forecast CSV</span>
          </button>
        </div>

        <div className="h-80 w-full pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#0c8de4"
                  fill="#0c8de4"
                  fillOpacity={0.15}
                  name="Historical Actual Sales"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#a855f7' }}
                  name={`RF ${selectedHorizon}-Day Forecast`}
                />
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="transparent"
                  fill="#a855f7"
                  fillOpacity={0.08}
                  name="Confidence Upper Bound"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Loading forecast timeline chart...
            </div>
          )}
        </div>
      </div>

      {/* Forecast Data Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-semibold text-white text-base">Detailed Forecast Table</h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Forecast Date</th>
                <th className="px-4 py-3 text-purple-400 font-bold">Predicted Sales (₹)</th>
                <th className="px-4 py-3 text-slate-400">Lower Bound (-95%)</th>
                <th className="px-4 py-3 text-slate-400">Upper Bound (+95%)</th>
                <th className="px-4 py-3 text-slate-400">Demand Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map((r, idx) => {
                const avg = summary?.avg_daily_sales || 1;
                const isHigh = r.predicted_sales > avg * 1.15;
                const isLow = r.predicted_sales < avg * 0.85;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-200">{r.date}</td>
                    <td className="px-4 py-2.5 font-bold text-white">₹{r.predicted_sales.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-400">₹{r.lower_bound.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-400">₹{r.upper_bound.toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      {isHigh ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          High Demand
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Low Demand
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
