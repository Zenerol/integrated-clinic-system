import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Megaphone, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { announcementNotification, dismissNotification } = useNotifications();

  if (!announcementNotification) return null;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border-b border-teal-500/30 px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium z-40 relative">
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full">
        <span className="p-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30 shrink-0">
          <Megaphone className="w-4 h-4" />
        </span>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <span className="font-extrabold text-teal-200 tracking-wider uppercase text-[10px] bg-teal-500/25 px-2 py-0.5 rounded border border-teal-400/30 shrink-0">
            {announcementNotification.title}
          </span>
          <span className="text-slate-200 text-xs leading-snug">
            {announcementNotification.message}
          </span>
        </div>
        <button
          onClick={() => dismissNotification(announcementNotification.id)}
          className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer shrink-0 ml-2"
          title="Dismiss Announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
