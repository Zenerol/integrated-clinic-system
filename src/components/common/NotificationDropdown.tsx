import React, { useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { getNotificationTypeStyle, formatDate } from '../../utils/formatters';
import { Bell, CheckCheck, Trash2, X, AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-teal-500 shrink-0" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
    >
      {/* Dropdown Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Notifications</h3>
          {unreadCount > 0 ? (
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300">
              {unreadCount} new
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              All caught up
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-500/10 transition"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
            title="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Notifications Yet</p>
            <p className="text-[11px]">Updates on your appointment status and clinic alerts will show up here.</p>
          </div>
        ) : (
          notifications.map((item) => {
            const style = getNotificationTypeStyle(item.type);

            return (
              <div
                key={item.id}
                onClick={() => !item.is_read && markAsRead(item.id)}
                className={`p-3.5 transition flex items-start gap-3 cursor-pointer ${
                  item.is_read
                    ? 'bg-white dark:bg-slate-900 opacity-75 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    : 'bg-teal-50/50 dark:bg-teal-500/5 hover:bg-teal-50 dark:hover:bg-teal-500/10'
                }`}
              >
                {getTypeIcon(item.type)}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </h4>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      {formatDate(item.created_at)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(item.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
