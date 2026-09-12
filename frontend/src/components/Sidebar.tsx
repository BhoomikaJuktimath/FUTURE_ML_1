import React from 'react';

export type TabType = 'dashboard' | 'data' | 'forecast' | 'performance' | 'insights' | 'quality' | 'about';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const menuItems: { id: TabType; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'data', label: 'Data Management', icon: 'database' },
  { id: 'forecast', label: 'Demand Forecast', icon: 'trending_up' },
  { id: 'performance', label: 'Model Performance', icon: 'tune' },
  { id: 'insights', label: 'Business Insights', icon: 'insights' },
  { id: 'quality', label: 'Data Quality', icon: 'verified' },
  { id: 'about', label: 'About & Guide', icon: 'menu_book' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col">
        <div className="flex items-center gap-space-sm px-gutter-desktop h-16">
          <div className="h-8 w-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">analytics</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight">
              ForecastIQ
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant truncate uppercase tracking-wider">
              Sales &amp; Demand
            </span>
          </div>
        </div>

        <div className="px-space-md py-space-sm">
          <nav className="flex flex-col gap-space-xs">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-headline-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className={`font-body-md text-body-md ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest">
        <div className="flex items-center justify-between px-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">System</span>
            <span className="font-label-data text-label-data text-outline">v2.4.1</span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">dock_to_left</span>
        </div>
      </div>
    </aside>
  );
};
