import { supabase } from '../lib/supabaseClient';
import { UserRole, NotificationType } from '../types/database.types';
import { NotificationRow } from '../types/clinic.types';

export const notificationService = {
  async getNotifications(userId?: string, userRole?: UserRole): Promise<NotificationRow[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false });

    if (userId && userRole) {
      query = query.or(`recipient_id.eq.${userId},target_role.eq.${userRole},and(recipient_id.is.null,target_role.is.null)`);
    } else if (userId) {
      query = query.or(`recipient_id.eq.${userId},recipient_id.is.null`);
    } else if (userRole) {
      query = query.or(`target_role.eq.${userRole},target_role.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as NotificationRow[];
  },

  async dismissNotification(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_dismissed: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sendNotification(payload: {
    recipient_id?: string | null;
    target_role?: UserRole | null;
    title: string;
    message: string;
    type?: NotificationType;
    is_critical?: boolean;
    action_url?: string | null;
  }) {
    const isCritical = payload.is_critical ?? (payload.type === 'urgent');

    const insertPayload: Record<string, unknown> = {
      recipient_id: payload.recipient_id || null,
      target_role: payload.target_role || null,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'info',
      action_url: payload.action_url || null,
      is_critical: isCritical,
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(insertPayload as any)
      .select()
      .single();

    if (error) {
      // Fallback if is_critical column is missing on DB
      delete insertPayload.is_critical;
      const { data: retryData, error: retryError } = await supabase
        .from('notifications')
        .insert(insertPayload as any)
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }
    return data;
  },

  subscribeToNotifications(onNotificationReceived: (notification: NotificationRow) => void) {
    return supabase
      .channel('clinic_notifications_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', table: 'notifications' },
        (payload) => {
          onNotificationReceived(payload.new as NotificationRow);
        }
      )
      .subscribe();
  },
};
