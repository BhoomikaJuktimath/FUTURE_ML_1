import React from 'react';

interface AlertMessageProps {
  type?: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type = 'error',
  title,
  message,
  onClose,
}) => {
  const styles = {
    error: {
      bg: 'bg-error-container/30 border-error/30 text-on-error-container',
      icon: 'error',
      iconColor: 'text-error',
    },
    success: {
      bg: 'bg-tertiary-container/20 border-tertiary/30 text-tertiary',
      icon: 'check_circle',
      iconColor: 'text-tertiary',
    },
    info: {
      bg: 'bg-primary/10 border-primary/30 text-primary',
      icon: 'info',
      iconColor: 'text-primary',
    },
  };

  const current = styles[type];

  return (
    <div className={`p-space-base rounded-xl border ${current.bg} flex items-start justify-between gap-space-sm`}>
      <div className="flex items-start gap-space-sm">
        <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${current.iconColor}`}>
          {current.icon}
        </span>
        <div className="font-body-sm text-body-sm space-y-space-xxs">
          {title && <p className="font-headline-sm text-headline-sm text-on-surface">{title}</p>}
          <p className="text-on-surface-variant">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-outline hover:text-on-surface transition-colors"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );
};
