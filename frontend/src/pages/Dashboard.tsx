import React from 'react';
import {
  IndianRupee as IndianRupeeIcon,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import { KPICard } from '../components/KPICard';
import {
  DataSummaryResponse,
  PerformanceResponse,
  ForecastResponse,
  BusinessInsightsResponse
} from '../types';

interface DashboardProps {
  dataSummary: DataSummaryResponse | null;
  performance: PerformanceResponse | null;
  forecast: ForecastResponse | null;
  insights: BusinessInsightsResponse | null;
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  dataSummary,
  performance,
  forecast,
  insights,
  onNavigate
}) => {
  const qr = dataSummary?.quality_report;
  const summary = forecast?.summary;
  const rfMetrics = performance?.rf_metrics;

  const totalHistoricalSales = qr ? qr.mean_sales * qr.total_days : 0;
  const avgDailySales = qr ? qr.mean_sales : 0;
  const totalForecastedSales = summary ? summary.total_forecasted_sales : 0;
  const mapeVal = rfMetrics ? `${rfMetrics.mape}%` : 'N/A';

  // Format chart data (Historical + Forecast sample)
  const chartData = forecast?.timeline_chart || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            Active System Overview
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Sales & Demand Forecast Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time machine learning predictions, historical trends, and automated inventory insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('forecast')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <span>View Full Forecast</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Historical Sales"
          value={`₹${totalHistoricalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`${qr?.total_days || 0} historical days logged`}
          icon={IndianRupeeIcon}
          accentColor="emerald"
        />

        <KPICard
          title="Average Daily Sales"
          value={`₹${avgDailySales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          subtitle={`Min: ₹${qr?.min_sales || 0} | Max: ₹${qr?.max_sales || 0}`}
          icon={TrendingUp}
          accentColor="brand"
        />

        <KPICard
          title={`${summary?.horizon_days || 30}-Day Forecasted Sales`}
          value={`₹${totalForecastedSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`Daily Avg: ₹${(summary?.avg_daily_sales || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          icon={Calendar}
          accentColor="purple"
          trend={
            insights
              ? {
                  value: `${insights.overall_trend} (${insights.trend_slope_pct > 0 ? '+' : ''}${insights.trend_slope_pct}%)`,
                  isPositive: insights.trend_slope_pct >= 0
                }
              : undefined
          }
        />

        <KPICard
          title="Random Forest Accuracy"
          value={mapeVal}
          subtitle={`R² Score: ${rfMetrics?.r2 ?? 'N/A'}`}
          icon={Target}
          accentColor="indigo"
          trend={
            performance
              ? {
                  value: `${performance.better_model} is Best`,
                  isPositive: true
                }
              : undefined
          }
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-white">Demand Trajectory & Forecast Horizon</h3>
              <p className="text-xs text-slate-400">Historical daily actual sales merged with future RF predictions</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-brand-500 inline-block"></span>
                Historical Actuals
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                RF Forecast
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c8de4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0c8de4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#0c8de4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#histGrad)"
                    name="Actual Sales"
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#foreGrad)"
                    name="Predicted Sales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No forecast chart data available. Please train model.
              </div>
            )}
          </div>
        </div>

        {/* Business Recommendation Quick Summary */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-brand-400">
              <Zap className="w-5 h-5" />
              <h3 className="font-semibold text-lg text-white">Strategic Demand Alert</h3>
            </div>

            {insights ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Overall Trend
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {insights.overall_trend}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Demand Shift: {insights.trend_slope_pct > 0 ? '+' : ''}{insights.trend_slope_pct}%
                  </p>
                  <p className="text-xs text-slate-400">
                    Volatility Index (CV): {insights.volatility_cv}
                  </p>
                </div>

                {insights.insights.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-1">
                    <p className="text-xs font-semibold text-brand-400">{item.title}</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                    <p className="text-[11px] text-slate-400 font-medium italic mt-1">
                      Advice: {item.actionable_advice}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Generating business intelligence...</p>
            )}
          </div>

          <button
            onClick={() => onNavigate('insights')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore All Domain Insights</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
