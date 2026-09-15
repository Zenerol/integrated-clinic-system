import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { NotificationRow } from '../types/clinic.types';

interface NotificationContextType {
  notifications: NotificationRow[];
  activeAlert: NotificationRow | null;
  urgentNotification: NotificationRow | null;
  announcementNotification: NotificationRow | null;
  unreadCount: number;
  dismissNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [activeAlert, setActiveAlert] = useState<NotificationRow | null>(null);
  const [urgentNotification, setUrgentNotification] = useState<NotificationRow | null>(null);
  const [announcementNotification, setAnnouncementNotification] = useState<NotificationRow | null>(null);

  const processNotificationTiers = (list: NotificationRow[]) => {
    const undismissed = list.filter((n) => !n.is_dismissed);
    
    // Tier 1: Urgent / Critical Toast
    const urgent = undismissed.find(
      (n) => n.is_critical || n.type === 'urgent' || n.title?.toLowerCase().includes('follow-up')
    );
    setUrgentNotification(urgent || null);

    // Tier 2: Announcement Banner (broadcast announcements or system warnings)
    const announcement = undismissed.find(
      (n) =>
        (n.type === 'warning' || n.type === 'info') &&
        (!n.is_critical && !n.title?.toLowerCase().includes('follow-up')) &&
        (n.target_role === null || n.title?.toLowerCase().includes('announcement') || n.title?.toLowerCase().includes('alert'))
    );
    setAnnouncementNotification(announcement || null);

    // Backward compatibility active alert
    setActiveAlert(urgent || announcement || undismissed[0] || null);
  };

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getNotifications(user?.id, profile?.role);
      setNotifications(list);
      processNotificationTiers(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time additions
    const subscription = notificationService.subscribeToNotifications((newNotification) => {
      // Check if relevant to current user/role
      const isForUser = !newNotification.recipient_id || newNotification.recipient_id === user?.id;
      const isForRole = !newNotification.target_role || newNotification.target_role === profile?.role;

      if (isForUser && isForRole) {
        setNotifications((prev) => {
          const updated = [newNotification, ...prev];
          processNotificationTiers(updated);
          return updated;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, profile?.role]);

  const dismissNotification = async (id: string) => {
    try {
      await notificationService.dismissNotification(id);
      setNotifications((prev) => {
        const remaining = prev.filter((n) => n.id !== id);
        processNotificationTiers(remaining);
        return remaining;
      });
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadItems = notifications.filter((n) => !n.is_read);
      await Promise.all(unreadItems.map((n) => notificationService.markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activeAlert,
        urgentNotification,
        announcementNotification,
        unreadCount,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
