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
    action_url?: string | null;
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: payload.recipient_id || null,
        target_role: payload.target_role || null,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'info',
        action_url: payload.action_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToNotifications(onNotificationReceived: (notification: NotificationRow) => void) {
    return supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          onNotificationReceived(payload.new as NotificationRow);
        }
      )
      .subscribe();
  },
};
