import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

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
  onClose
}) => {
  const styles = {
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    info: {
      bg: 'bg-brand-500/10 border-brand-500/30 text-brand-300',
      icon: Info,
      iconColor: 'text-brand-400',
    },
  };

  const current = styles[type];
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-xl border ${current.bg} flex items-start justify-between space-x-3 my-4`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
        <div className="text-xs space-y-0.5">
          {title && <p className="font-semibold text-sm">{title}</p>}
          <p>{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
