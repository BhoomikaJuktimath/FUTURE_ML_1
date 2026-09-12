import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  submessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Processing request...',
  submessage = 'Please wait while model computes features and forecasts...',
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4">
      <div className="bg-surface-container p-space-xl rounded-xl max-w-md w-full text-center space-y-space-base shadow-2xl border border-outline-variant/30">
        <div className="w-16 h-16 rounded-xl bg-primary-container/20 flex items-center justify-center mx-auto text-primary">
          <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{message}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xxs">{submessage}</p>
        </div>
      </div>
    </div>
  );
};
