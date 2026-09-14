import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/Button';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { activeAlert, dismissNotification } = useNotifications();

  if (!activeAlert) return null;

  const getIcon = () => {
    switch (activeAlert.type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9990] max-w-sm w-full animate-slide-in p-4 sm:p-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-4 flex flex-col gap-3 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {activeAlert.title}
            </h4>
          </div>
          <button
            onClick={() => dismissNotification(activeAlert.id)}
            className="flex items-center gap-1 text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 transition duration-150 cursor-pointer border border-rose-200 dark:border-rose-500/30 text-[11px] font-bold"
            title="Dismiss Alert"
          >
            <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Close</span>
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          {activeAlert.message}
        </p>

        {/* Footer Action */}
        <div className="flex justify-end pt-1">
          <Button
            variant="cancel"
            size="sm"
            onClick={() => dismissNotification(activeAlert.id)}
            className="!text-[11px] !min-h-[32px] !py-1 !px-3"
          >
            Dismiss Alert
          </Button>
        </div>
      </div>
    </div>
  );
};
