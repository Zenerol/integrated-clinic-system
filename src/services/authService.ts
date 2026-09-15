import { supabase } from '../lib/supabaseClient';
import { RegisterPayload, SignInPayload, Profile } from '../types/auth.types';

export const authService = {
  async signIn({ email, password }: SignInPayload) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(payload: RegisterPayload) {
    const isStaff = payload.role === 'doctor' || payload.role === 'nurse';
    const initialStatus = isStaff ? 'pending_approval' : 'active';

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          role: payload.role,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Validate UUID format for institution_id to prevent Postgres syntax errors
      const isUuid = typeof payload.institutionId === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(payload.institutionId);

      const profilePayload = {
        id: data.user.id,
        full_name: payload.fullName,
        role: payload.role,
        patient_type: payload.patientType || null,
        institution_id: isUuid ? payload.institutionId : null,
        school_id_number: payload.schoolIdNumber || null,
        department_or_course: payload.departmentOrCourse || null,
        contact_number: payload.contactNumber || null,
        address: payload.address || null,
        account_status: initialStatus,
        professional_license_no: payload.professionalLicenseNo || null,
      };

      let { error: profileError } = await supabase.from('profiles').upsert(profilePayload);

      // Foreign key constraint (23503) fallback if target institution_id is not in clinic_system.institutions
      if (profileError && (profileError.code === '23503' || profileError.message?.includes('foreign key constraint'))) {
        console.warn('Institution ID FK mismatch, saving profile with null institution_id:', profileError.message);
        profilePayload.institution_id = null;
        const retryRes = await supabase.from('profiles').upsert(profilePayload);
        profileError = retryRes.error;
      }

      if (profileError) throw profileError;
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data as Profile;
      }
    } catch (e) {
      console.warn('Profiles table fetch error:', e);
    }

    // Fallback: Check auth user metadata
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user && userData.user.id === userId) {
      const meta = userData.user.user_metadata || {};
      const fallbackProfile: Profile = {
        id: userId,
        full_name: meta.full_name || userData.user.email?.split('@')[0] || 'User',
        role: (meta.role as Profile['role']) || 'client',
        patient_type: (meta.patient_type as Profile['patient_type']) || 'student',
        school_id_number: meta.school_id_number || null,
        department_or_course: meta.department_or_course || null,
        contact_number: meta.contact_number || null,
        address: meta.address || null,
        account_status: (meta.role === 'doctor' || meta.role === 'nurse') ? 'pending_approval' : 'active',
        professional_license_no: meta.professional_license_no || null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString(),
      };

      try {
        await supabase.from('profiles').upsert(fallbackProfile);
      } catch (err) {
        console.warn('Fallback profile upsert warning:', err);
      }

      return fallbackProfile;
    }

    return null;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },
};
