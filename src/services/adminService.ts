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

  /**
   * Fetches all registered system profiles (Patients, Doctors, Nurses, Admins).
   */
  async getAllMembers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Profile[];
  },

  /**
   * Updates any member's account status (active, suspended, pending_approval, rejected).
   */
  async updateMemberStatus(
    memberId: string,
    accountStatus: 'active' | 'suspended' | 'pending_approval' | 'rejected',
    adminId: string,
    rejectionReason?: string
  ): Promise<Profile> {
    const updatePayload: Record<string, any> = {
      account_status: accountStatus,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    };

    if (rejectionReason !== undefined) {
      updatePayload.rejection_reason = rejectionReason;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;

    // Send notification to member
    try {
      await notificationService.createNotification({
        recipient_id: memberId,
        title: `Account Status Updated: ${accountStatus.toUpperCase().replace('_', ' ')}`,
        message: `Your clinic portal account status has been set to '${accountStatus.replace('_', ' ')}' by Clinic Administration.`,
        type: accountStatus === 'active' ? 'success' : 'warning',
      });
    } catch (err) {
      console.warn('Failed to send status update notification:', err);
    }

    return data as Profile;
  },

  /**
   * Creates a new member profile (Patient, Doctor, Nurse, Admin).
   */
  async createMember(payload: Partial<Profile>): Promise<Profile> {
    const newId = payload.id || crypto.randomUUID();
    const profileData = {
      id: newId,
      full_name: payload.full_name || 'New Member',
      role: payload.role || 'client',
      patient_type: payload.patient_type || 'external_client',
      account_status: payload.account_status || 'active',
      school_id_number: payload.school_id_number || null,
      department_or_course: payload.department_or_course || null,
      contact_number: payload.contact_number || null,
      address: payload.address || null,
      professional_license_no: payload.professional_license_no || null,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  /**
   * Updates an existing member's profile details.
   */
  async updateMember(memberId: string, payload: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: payload.full_name,
        role: payload.role,
        patient_type: payload.patient_type,
        account_status: payload.account_status,
        school_id_number: payload.school_id_number || null,
        department_or_course: payload.department_or_course || null,
        contact_number: payload.contact_number || null,
        address: payload.address || null,
        professional_license_no: payload.professional_license_no || null,
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  /**
   * Permanently deletes a member from the profiles directory.
   */
  async deleteMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  },
};
