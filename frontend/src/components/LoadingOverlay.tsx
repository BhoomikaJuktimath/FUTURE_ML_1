import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  submessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Processing request...",
  submessage = "Please wait while model computes features and forecasts..."
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4 border border-brand-500/20 shadow-2xl shadow-brand-500/10">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{message}</h3>
          <p className="text-xs text-slate-400 mt-1">{submessage}</p>
        </div>
      </div>
    </div>
  );
};
