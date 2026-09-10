import React from 'react';
import {
  Lightbulb,
  Boxes,
  Coins,
  Users,
  ShieldAlert,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle
} from 'lucide-react';

import { BusinessInsightsResponse } from '../types';

interface BusinessInsightsProps {
  insights: BusinessInsightsResponse | null;
}

export const BusinessInsights: React.FC<BusinessInsightsProps> = ({ insights }) => {
  if (!insights) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 space-y-3">
        <Lightbulb className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-semibold text-white">Generating Business Intelligence</h3>
        <p className="text-xs">Train model and select forecast horizon to view actionable advice.</p>
      </div>
    );
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Inventory': return Boxes;
      case 'Cash Flow': return Coins;
      case 'Staffing': return Users;
      case 'Overstock Risk': return ShieldAlert;
      case 'Stockout Risk': return ShoppingBag;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Executive Business Intelligence</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Data-driven strategic recommendations for inventory, cash flow, staffing, and risk mitigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-850 border border-slate-800 text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Demand Velocity</span>
            <span className="text-base font-bold text-brand-400">
              {insights.trend_slope_pct > 0 ? '+' : ''}{insights.trend_slope_pct}% Shift
            </span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-850 border border-slate-800 text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Demand Pattern</span>
            <span className="text-base font-bold text-amber-400">
              {insights.overall_trend}
            </span>
          </div>
        </div>
      </div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.insights.map((item, idx) => {
          const Icon = getCategoryIcon(item.category);
          const isHigh = item.impact_level === 'High';

          return (
            <div
              key={idx}
              className="glass-panel glass-panel-hover p-6 rounded-3xl flex flex-col justify-between space-y-4 border border-slate-800"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      isHigh
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.impact_level} Priority
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{item.title}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 bg-slate-900/40 -mx-6 -mb-6 p-4 rounded-b-3xl">
                <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Actionable Strategy:
                </p>
                <p className="text-xs text-slate-200 font-medium leading-normal">
                  {item.actionable_advice}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
