import React from 'react';

interface NavbarProps {
  apiStatus: boolean;
  modelStatus: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedHorizon?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiStatus,
  modelStatus,
  onRefresh,
  isRefreshing,
  selectedHorizon = 30,
}) => {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl z-40 px-gutter-desktop flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-space-md">
        <span className="material-symbols-outlined text-outline text-[18px]">home</span>
        <span className="font-body-sm text-body-sm text-outline">/</span>
        <span className="font-body-md text-body-md text-on-surface font-headline-sm">Enterprise Workspace</span>
      </div>

      <div className="flex items-center gap-space-md">
        <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-surface-container">
          <span className={`w-2 h-2 rounded-full ${apiStatus ? 'bg-tertiary-container' : 'bg-error'}`} />
          <span className="font-label-data text-label-data text-on-surface">
            Backend: {apiStatus ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-surface-container">
          <span className={`w-2 h-2 rounded-full ${modelStatus ? 'bg-secondary' : 'bg-outline'}`} />
          <span className="font-label-data text-label-data text-on-surface">
            Model: {modelStatus ? 'Trained & Saved' : 'Untrained'}
          </span>
        </div>

        <div className="flex items-center px-space-sm py-space-xxs rounded-full bg-secondary-container">
          <span className="font-label-caps text-label-caps text-on-secondary-container tracking-wide">
            P{selectedHorizon} HORIZON
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg transition-colors disabled:opacity-50"
          title="Quick Refresh"
          type="button"
        >
          <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="font-label-caps text-label-caps hidden md:inline uppercase">Sync</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
};
