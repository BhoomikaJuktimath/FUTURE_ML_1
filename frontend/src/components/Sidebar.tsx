import React from 'react';
import {
  LayoutDashboard,
  Database,
  LineChart,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  Info
} from 'lucide-react';

export type TabType = 'dashboard' | 'data' | 'forecast' | 'performance' | 'insights' | 'quality' | 'about';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'forecast', label: 'Forecast View', icon: LineChart },
    { id: 'performance', label: 'Model Performance', icon: BarChart3 },
    { id: 'insights', label: 'Business Insights', icon: Lightbulb },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
    { id: 'about', label: 'About & Guide', icon: Info },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Navigation
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-md shadow-brand-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">Model Engine</p>
        <p className="text-slate-400">Random Forest Regressor</p>
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800">
          <span>Split: 80/20 Chrono</span>
          <span>Trees: 100</span>
        </div>
      </div>
    </aside>
  );
};
