import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { NotificationRow } from '../types/clinic.types';

interface NotificationContextType {
  notifications: NotificationRow[];
  activeAlert: NotificationRow | null;
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

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getNotifications(user?.id, profile?.role);
      setNotifications(list);
      
      // Set top undismissed alert
      const topAlert = list.find((n) => !n.is_dismissed);
      setActiveAlert(topAlert || null);
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
        setNotifications((prev) => [newNotification, ...prev]);
        setActiveAlert(newNotification);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, profile?.role]);

  const dismissNotification = async (id: string) => {
    try {
      await notificationService.dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (activeAlert?.id === id) {
        const remaining = notifications.filter((n) => n.id !== id && !n.is_dismissed);
        setActiveAlert(remaining[0] || null);
      }
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
