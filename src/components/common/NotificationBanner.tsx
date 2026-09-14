import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { getNotificationTypeStyle } from '../../utils/formatters';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { activeAlert, dismissNotification } = useNotifications();

  if (!activeAlert) return null;

  const style = getNotificationTypeStyle(activeAlert.type);

  const getIcon = () => {
    switch (activeAlert.type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div
      className={`w-full ${style.bg} ${style.text} border-b ${style.border} px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium transition-all duration-300 z-50`}
    >
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
        {getIcon()}
        <div className="flex-1 overflow-hidden">
          <span className="font-bold mr-2">{activeAlert.title}:</span>
          <span className="opacity-90">{activeAlert.message}</span>
        </div>
        <button
          onClick={() => dismissNotification(activeAlert.id)}
          className="p-1 rounded-md hover:bg-white/10 transition shrink-0"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
