import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types/auth.types';
import { notificationService } from './notificationService';

export const adminService = {
  /**
   * Fetches all staff applications with pending_approval status.
   */
  async getPendingStaffApplications(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['doctor', 'nurse'])
      .eq('account_status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Profile[];
  },

  /**
   * Fetches all staff members regardless of status for administration view.
   */
  async getAllStaffProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['doctor', 'nurse', 'admin'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Profile[];
  },

  /**
   * Approves a doctor or nurse staff application.
   * Sets account_status = 'active' and stamps approved_by and approved_at.
   */
  async approveStaffApplication(staffId: string, adminId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        account_status: 'active',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', staffId)
      .select()
      .single();

    if (error) throw error;

    // Send in-app notification to approved staff member
    try {
      await notificationService.createNotification({
        recipient_id: staffId,
        title: 'Staff Verification Approved! 🎉',
        message: 'Your medical credentials have been verified by Clinic Administration. You now have full clinical access.',
        type: 'success',
      });
    } catch (err) {
      console.warn('Failed to send approval notification:', err);
    }

    return data as Profile;
  },

  /**
   * Rejects a doctor or nurse staff application.
   * Sets account_status = 'rejected' and records the rejection_reason.
   */
  async rejectStaffApplication(staffId: string, adminId: string, reason: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        account_status: 'rejected',
        rejection_reason: reason,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', staffId)
      .select()
      .single();

    if (error) throw error;

    // Send in-app notification to rejected applicant
    try {
      await notificationService.createNotification({
        recipient_id: staffId,
        title: 'Staff Application Status Update',
        message: `Your staff application was declined: ${reason}`,
        type: 'urgent',
      });
    } catch (err) {
      console.warn('Failed to send rejection notification:', err);
    }

    return data as Profile;
  },
};
