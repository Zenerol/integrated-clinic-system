import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { AlertCircle, AlertTriangle, CalendarCheck, Stethoscope, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const UrgentToastCard: React.FC = () => {
  const { urgentNotification, dismissNotification, markAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!urgentNotification) return null;

  const handleAction = async () => {
    try {
      await markAsRead(urgentNotification.id);
      await dismissNotification(urgentNotification.id);
      if (urgentNotification.action_url) {
        navigate(urgentNotification.action_url);
      }
    } catch (err) {
      console.error('Failed to execute notification action:', err);
    }
  };

  const getIcon = () => {
    if (urgentNotification.title?.toLowerCase().includes('follow-up')) {
      return <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    }
    if (urgentNotification.title?.toLowerCase().includes('triage') || urgentNotification.title?.toLowerCase().includes('patient')) {
      return <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
    }
    if (urgentNotification.type === 'warning') {
      return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
    }
    return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
  };

  const getBorderColor = () => {
    if (urgentNotification.title?.toLowerCase().includes('follow-up')) {
      return 'border-l-indigo-600';
    }
    return 'border-l-rose-500';
  };

  const getActionButtonLabel = () => {
    const title = urgentNotification.title?.toLowerCase() || '';
    if (title.includes('follow-up')) return 'Book Follow-Up';
    if (title.includes('staff') || title.includes('approval')) return 'Review Application';
    if (title.includes('triage') || title.includes('consultation')) return 'View Request';
    return 'Review Details';
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-200">
      <div className={`bg-white dark:bg-slate-900 border-l-4 ${getBorderColor()} border-y border-r border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xl p-4 flex flex-col gap-3 font-sans`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {getIcon()}
            <div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 mb-0.5">
                {urgentNotification.is_critical ? 'Critical Action Required' : 'Urgent Notice'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                {urgentNotification.title}
              </h4>
            </div>
          </div>
          <button
            onClick={() => dismissNotification(urgentNotification.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-7">
          {urgentNotification.message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <Button
            variant="cancel"
            size="sm"
            onClick={() => dismissNotification(urgentNotification.id)}
            className="!text-xs !py-1.5 !px-3"
          >
            Dismiss
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAction}
            className="!text-xs !py-1.5 !px-3 flex items-center gap-1.5 shadow-sm"
          >
            <span>{getActionButtonLabel()}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
