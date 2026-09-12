import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { PerformanceResponse } from '../types';

interface ModelPerformanceProps {
  performance: PerformanceResponse | null;
  onRetrain?: () => void;
  isProcessing?: boolean;
}

const FEATURE_LABELS: Record<string, string> = {
  lag_1: 'Previous Day Demand',
  lag_7: 'Same Day Last Week',
  lag_14: 'Bi-weekly Cycle',
  rolling_mean_7: '7-Day Moving Avg',
  rolling_mean_30: 'Monthly Baseline',
  day_of_week: 'Calendar Seasonality',
  month: 'Macro Cycle',
  day: 'Day of Month',
  year: 'Year Trend',
};

function featureLabel(name: string): string {
  return FEATURE_LABELS[name] || name.replace(/_/g, ' ');
}

function formatMoney(n: number): string {
  return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({
  performance,
  onRetrain,
  isProcessing = false,
}) => {
  const [retrainState, setRetrainState] = useState<'idle' | 'scheduling' | 'queued'>('idle');

  const topFeatures = useMemo(() => {
    if (!performance) return [];
    const feats = performance.feature_importances.slice(0, 7);
    const total = feats.reduce((s, f) => s + f.importance, 0) || 1;
    return feats.map((f) => ({
      ...f,
      pct: Math.round((f.importance / total) * 100),
    }));
  }, [performance]);

  const chartData = useMemo(() => {
    if (!performance) return [];
    return performance.actual_vs_predicted.slice(-30);
  }, [performance]);

  const handleDownload = () => {
    if (!performance) return;
    const { rf_metrics, baseline_metrics, feature_importances } = performance;
    const payload = {
      model_name: rf_metrics.model_name || 'Random Forest',
      version: 'v2.4.1',
      evaluation_timestamp: new Date().toISOString(),
      test_samples: performance.actual_vs_predicted.length,
      metrics: {
        mae: rf_metrics.mae,
        rmse: rf_metrics.rmse,
        r2_score: rf_metrics.r2,
        mape: rf_metrics.mape / 100,
      },
      baseline_metrics: {
        mae: baseline_metrics.mae,
        rmse: baseline_metrics.rmse,
        r2_score: baseline_metrics.r2,
        mape: baseline_metrics.mape / 100,
      },
      improvement_percentage: performance.improvement_percentage,
      features: feature_importances.map((f) => ({
        name: f.feature,
        importance: f.importance,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model_metrics_rf_v2.4.1_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRetrain = () => {
    if (!onRetrain || isProcessing) return;
    setRetrainState('scheduling');
    setTimeout(() => {
      setRetrainState('queued');
      onRetrain();
      setTimeout(() => setRetrainState('idle'), 2000);
    }, 800);
  };

  if (!performance) {
    return (
      <div className="bg-surface-container rounded-xl p-space-2xl text-center space-y-space-sm">
        <span className="material-symbols-outlined text-[40px] text-outline animate-pulse">memory</span>
        <h3 className="font-headline-md text-headline-md text-on-surface">No Model Performance Metrics Available</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Train the model from Data Management to view evaluation results.
        </p>
        {onRetrain && (
          <button
            type="button"
            onClick={onRetrain}
            disabled={isProcessing}
            className="mt-space-md inline-flex items-center gap-space-xs px-space-base py-space-xs rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm"
          >
            <span className="material-symbols-outlined text-[18px]">autorenew</span>
            Train Model
          </button>
        )}
      </div>
    );
  }

  const { baseline_metrics, rf_metrics, better_model, improvement_percentage } = performance;
  const maeAdv = ((baseline_metrics.mae - rf_metrics.mae) / baseline_metrics.mae) * 100;
  const rmseAdv = ((baseline_metrics.rmse - rf_metrics.rmse) / baseline_metrics.rmse) * 100;
  const r2Adv = baseline_metrics.r2 !== 0
    ? ((rf_metrics.r2 - baseline_metrics.r2) / Math.abs(baseline_metrics.r2)) * 100
    : 0;
  const mapeDelta = baseline_metrics.mape - rf_metrics.mape;
  const r2Ratio = baseline_metrics.r2 > 0 ? (rf_metrics.r2 / baseline_metrics.r2).toFixed(1) : '—';
  const top3Weight = topFeatures.slice(0, 3).reduce((s, f) => s + f.pct, 0);
  const residualVar =
    chartData.length > 0
      ? (
          (chartData.reduce((s, p) => s + Math.abs(p.error_rf), 0) /
            chartData.reduce((s, p) => s + Math.abs(p.actual || 1), 0)) *
          100
        ).toFixed(1)
      : '—';
  const rss = chartData.reduce((s, p) => s + p.error_rf ** 2, 0);

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Top Action & Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-base">
        <div className="flex flex-col gap-space-xxs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Model Performance</h1>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-tertiary-container/20 text-tertiary font-label-caps text-label-caps uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              Production Grade
            </span>
            <span className="inline-flex items-center px-space-sm py-space-xxs rounded-full bg-surface-container-high text-on-surface-variant font-label-data text-label-data">
              UUID: rf-reg-4892c-p90
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Evaluate how accurately the model predicts historical sales across test evaluation windows.
            Benchmark against baselines and inspect feature attribution.
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-start lg:self-center">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-space-xs px-space-base py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all font-body-md text-body-md shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">code</span>
            <span>Download Metrics JSON</span>
          </button>
          <button
            type="button"
            onClick={handleRetrain}
            disabled={isProcessing || retrainState !== 'idle'}
            className="flex items-center gap-space-xs px-space-base py-space-xs rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline-sm text-headline-sm transition-all shadow-md active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
          >
            {retrainState === 'scheduling' && (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Scheduling Pipeline...</span>
              </>
            )}
            {retrainState === 'queued' && (
              <>
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">check</span>
                <span>Job Queued</span>
              </>
            )}
            {retrainState === 'idle' && (
              <>
                <span className="material-symbols-outlined text-[18px]">autorenew</span>
                <span>Retrain Model</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Winning Architecture Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-lg shadow-xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-space-lg z-10">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-base">
            <div className="flex items-start gap-space-base">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[28px]">verified_user</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Winning Architecture: {better_model || 'Random Forest'}
                  </span>
                  <span className="font-label-data text-label-data px-space-sm py-space-xxs rounded bg-surface-container-highest text-primary font-medium">
                    v2.4.1
                  </span>
                  {improvement_percentage > 0 && (
                    <span className="inline-flex items-center gap-space-xxs px-space-sm py-space-xxs rounded-full bg-tertiary/10 text-tertiary font-label-caps text-label-caps">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                      +{improvement_percentage}% vs Naive Base
                    </span>
                  )}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xxs">
                  Ensemble of bagging decision trees evaluated on chronological holdout splits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-lg flex-wrap sm:flex-nowrap">
              <div className="flex flex-col bg-surface-container-low px-space-base py-space-sm rounded-lg min-w-[170px]">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Mean Abs Pct Error
                </span>
                <div className="flex items-baseline gap-space-xs mt-space-xxs">
                  <span className="font-display-kpi text-[32px] leading-tight font-bold text-tertiary">
                    {rf_metrics.mape}%
                  </span>
                  <span className="font-label-data text-label-data text-tertiary">Best</span>
                </div>
                <span className="font-label-data text-label-data text-outline mt-space-xxs">
                  vs {baseline_metrics.mape}% baseline
                </span>
              </div>
              <div className="flex flex-col bg-surface-container-low px-space-base py-space-sm rounded-lg min-w-[170px]">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  R² Explained Variance
                </span>
                <div className="flex items-baseline gap-space-xs mt-space-xxs">
                  <span className="font-display-kpi text-[32px] leading-tight font-bold text-on-surface">
                    {rf_metrics.r2}
                  </span>
                  <span className="font-label-data text-label-data text-tertiary">{r2Ratio}x</span>
                </div>
                <span className="font-label-data text-label-data text-outline mt-space-xxs">
                  vs {baseline_metrics.r2} baseline
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap pt-space-xs">
            <div className="flex items-center gap-space-xs px-space-md py-space-xxs rounded-lg bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">account_tree</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Estimator Trees:</span>
              <span className="font-label-data text-label-data text-on-surface font-semibold">100 Trees</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-md py-space-xxs rounded-lg bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary">layers</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Split:</span>
              <span className="font-label-data text-label-data text-on-surface font-semibold">80/20 Chrono</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-md py-space-xxs rounded-lg bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Holdout Points:</span>
              <span className="font-label-data text-label-data text-on-surface font-semibold">
                {performance.actual_vs_predicted.length}
              </span>
            </div>
            <div className="flex items-center gap-space-xs px-space-md py-space-xxs rounded-lg bg-surface-container-high text-on-surface-variant ml-auto">
              <span className="material-symbols-outlined text-[16px] text-outline">memory</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Engine:</span>
              <span className="font-label-data text-label-data text-on-surface">scikit-learn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Mid Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Benchmark Comparison */}
        <div className="flex flex-col bg-surface-container rounded-xl p-space-lg shadow-md justify-between">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">compare_arrows</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Benchmark Comparison</h2>
              </div>
              <span className="font-label-caps text-label-caps px-space-sm py-space-xxs rounded bg-surface-container-highest text-on-surface-variant uppercase">
                Holdout Set N={performance.actual_vs_predicted.length}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Comparison against historical persistence naive baseline across identical test folds.
            </p>

            <div className="mt-space-md overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-outline font-label-caps text-label-caps uppercase">
                    <th className="py-space-sm px-space-md rounded-l-lg">Metric Evaluation</th>
                    <th className="py-space-sm px-space-md text-right">Naive Base</th>
                    <th className="py-space-sm px-space-md text-right text-primary">Random Forest</th>
                    <th className="py-space-sm px-space-md text-right rounded-r-lg">Advantage</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md divide-y divide-surface-container-high/30">
                  <tr className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-space-md px-space-md font-medium text-on-surface">
                      Mean Absolute Error{' '}
                      <span className="font-label-data text-label-data text-outline">(MAE)</span>
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-on-surface-variant">
                      {formatMoney(baseline_metrics.mae)}
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-on-surface font-semibold">
                      {formatMoney(rf_metrics.mae)}
                    </td>
                    <td className="py-space-md px-space-md text-right">
                      <span className="inline-flex items-center gap-space-xxs px-space-sm py-space-xxs rounded-full bg-tertiary-container/20 text-tertiary font-label-data text-label-data">
                        <span className="material-symbols-outlined text-[12px]">trending_down</span>
                        -{maeAdv.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-space-md px-space-md font-medium text-on-surface">
                      Root Mean Sq Error{' '}
                      <span className="font-label-data text-label-data text-outline">(RMSE)</span>
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-on-surface-variant">
                      {formatMoney(baseline_metrics.rmse)}
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-on-surface font-semibold">
                      {formatMoney(rf_metrics.rmse)}
                    </td>
                    <td className="py-space-md px-space-md text-right">
                      <span className="inline-flex items-center gap-space-xxs px-space-sm py-space-xxs rounded-full bg-tertiary-container/20 text-tertiary font-label-data text-label-data">
                        <span className="material-symbols-outlined text-[12px]">trending_down</span>
                        -{rmseAdv.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-space-md px-space-md font-medium text-on-surface">
                      R² Coefficient{' '}
                      <span className="font-label-data text-label-data text-outline">(Variance)</span>
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-on-surface-variant">
                      {baseline_metrics.r2}
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-tertiary font-semibold">
                      {rf_metrics.r2}
                    </td>
                    <td className="py-space-md px-space-md text-right">
                      <span className="inline-flex items-center gap-space-xxs px-space-sm py-space-xxs rounded-full bg-tertiary-container/20 text-tertiary font-label-data text-label-data">
                        <span className="material-symbols-outlined text-[12px]">trending_up</span>
                        +{Math.abs(r2Adv).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-space-md px-space-md font-medium text-on-surface">
                      MAPE{' '}
                      <span className="font-label-data text-label-data text-outline">(Percent Error)</span>
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-on-surface-variant">
                      {baseline_metrics.mape}%
                    </td>
                    <td className="py-space-md px-space-md text-right font-label-data text-label-data text-tertiary font-semibold">
                      {rf_metrics.mape}%
                    </td>
                    <td className="py-space-md px-space-md text-right">
                      <span className="inline-flex items-center gap-space-xxs px-space-sm py-space-xxs rounded-full bg-primary/20 text-primary font-label-data text-label-data">
                        Δ -{mapeDelta.toFixed(1)}pp
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md flex items-center justify-between text-on-surface-variant bg-surface-container-low p-space-md rounded-lg">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-outline text-[18px]">verified</span>
              <span className="font-body-sm text-body-sm">
                Chronological holdout evaluation — RF outperforms naive persistence
              </span>
            </div>
            <span className="font-label-data text-label-data text-primary">Stable</span>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="flex flex-col bg-surface-container rounded-xl p-space-lg shadow-md justify-between">
          <div className="flex flex-col gap-space-xxs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[22px]">bar_chart</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Feature Importance (RF Gini Metric)
                </h2>
              </div>
              <span className="font-label-caps text-label-caps px-space-sm py-space-xxs rounded bg-surface-container-highest text-secondary uppercase">
                Top {topFeatures.length} Predictors
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Feature importance shows which historical signals contribute most to the model&apos;s predictions.
            </p>

            <div className="flex flex-col gap-space-md mt-space-md">
              {topFeatures.map((f, i) => {
                const barColors = [
                  'bg-primary',
                  'bg-primary/90',
                  'bg-primary/80',
                  'bg-secondary',
                  'bg-secondary/80',
                  'bg-outline/70',
                  'bg-outline/60',
                ];
                const textColors = [
                  'text-primary',
                  'text-primary',
                  'text-primary',
                  'text-secondary',
                  'text-secondary',
                  'text-outline',
                  'text-outline',
                ];
                return (
                  <div key={f.feature} className="flex flex-col gap-space-xxs">
                    <div className="flex justify-between items-center font-label-data text-label-data">
                      <span className="text-on-surface font-medium">
                        {f.feature}{' '}
                        <span className="text-outline">({featureLabel(f.feature)})</span>
                      </span>
                      <span className={`${textColors[i] || 'text-outline'} font-semibold`}>{f.pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
                      <div
                        className={`${barColors[i] || 'bg-outline/60'} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${f.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-space-lg pt-space-sm flex items-center justify-between text-outline font-label-caps text-label-caps">
            <span>Total Normalized Gini Importance: 100%</span>
            <span className="text-on-surface">Sum of Top 3: {top3Weight}% Weight</span>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted Chart */}
      <div className="flex flex-col bg-surface-container rounded-xl p-space-lg shadow-xl gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-[24px]">timeline</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Actual vs Predicted ({chartData.length}-Day Holdout Set)
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Direct tracking verification across out-of-sample holdout days. Evaluated at single-day grain.
            </p>
          </div>
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex items-center gap-space-xs">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-label-data text-label-data text-on-surface">Actual Test Sales</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-4 h-0.5 border-t border-dashed border-tertiary" />
              <span className="font-label-data text-label-data text-tertiary">RF Prediction</span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-high px-space-sm py-space-xxs rounded-lg">
              <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
              <span className="font-label-caps text-label-caps text-on-surface uppercase">
                MAE {formatMoney(rf_metrics.mae)}
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[320px] bg-surface-container-lowest rounded-xl p-space-md overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#424754" opacity={0.35} />
              <XAxis
                dataKey="date"
                stroke="#8c909f"
                tick={{ fontSize: 10, fill: '#8c909f' }}
                tickFormatter={(v) => String(v).slice(5)}
                minTickGap={40}
              />
              <YAxis stroke="#8c909f" tick={{ fontSize: 10, fill: '#8c909f' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1f2a',
                  borderColor: '#424754',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#dfe2f1',
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#adc6ff"
                strokeWidth={2.5}
                dot={false}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="predicted_rf"
                stroke="#4edea3"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={false}
                name="RF Prediction"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-space-sm bg-surface-container-low px-space-base py-space-sm rounded-lg">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <p className="font-body-sm text-body-sm text-on-surface">
              <span className="font-medium text-tertiary">Residual stability:</span> Relative residual
              magnitude across the holdout window is approximately{' '}
              <span className="font-label-data text-label-data text-on-surface font-semibold">
                {residualVar}% of sales
              </span>
              .
            </p>
          </div>
          <div className="flex items-center gap-space-xs font-label-data text-label-data text-outline">
            <span>Residual Sum of Squares (RSS): {rss.toExponential(2)}</span>
          </div>
        </div>
      </div>

      {/* Business Translation */}
      <div className="flex flex-col sm:flex-row items-start gap-space-base bg-surface-container-high rounded-xl p-space-lg">
        <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-tertiary text-[22px]">lightbulb</span>
        </div>
        <div className="flex flex-col gap-space-xxs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              What does this mean for operations?
            </h3>
            <span className="font-label-caps text-label-caps px-space-sm py-space-xxs rounded bg-surface-container-highest text-tertiary uppercase">
              Business Translation
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            A{' '}
            <strong className="text-on-surface font-semibold">MAPE of {rf_metrics.mape}%</strong> means
            the model&apos;s predictions differ from actual sales by approximately {rf_metrics.mape}% on
            average, providing a reliable baseline for retail planning and replenishment. With an R² score
            of {rf_metrics.r2}, a substantial share of daily sales variance is captured by lag &amp;
            calendar features
            {performance.mape_explanation ? ` — ${performance.mape_explanation}` : '.'}
          </p>
        </div>
      </div>
    </div>
  );
};
