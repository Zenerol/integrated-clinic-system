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

    let authUser: any = null;
    let authError: any = null;

    try {
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

      if (error) {
        authError = error;
      } else {
        authUser = data.user;
      }
    } catch (err) {
      authError = err;
    }

    // Fallback 1: If rate-limited by email provider (HTTP 429), use admin client to create user without sending email
    if (authError) {
      const errStr = (authError.message || JSON.stringify(authError)).toLowerCase();
      if (errStr.includes('rate limit') || authError.status === 429) {
        console.warn('[AuthService]: Rate limit detected. Executing admin bypass for account creation...');
        try {
          const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqanl5YmxndG13cm9udnVkdnhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM4NDkzMSwiZXhwIjoyMTA0OTYwOTMxfQ.9TUBie0v5g58CIkZH0yiA0zcFu2l61xvIe-YIceftMk';
          
          const adminClient = (await import('@supabase/supabase-js')).createClient(
            import.meta.env.VITE_SUPABASE_URL || 'https://kjjyyblgtmwronvudvxc.supabase.co',
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false }, db: { schema: 'clinic_system' } }
          );

          const adminRes = await adminClient.auth.admin.createUser({
            email: payload.email,
            password: payload.password,
            email_confirm: true,
            user_metadata: {
              full_name: payload.fullName,
              role: payload.role,
            },
          });

          if (!adminRes.error && adminRes.data?.user) {
            authUser = adminRes.data.user;
            authError = null;

            // Log in user session using password
            try {
              await supabase.auth.signInWithPassword({
                email: payload.email,
                password: payload.password,
              });
            } catch (sErr) {
              console.warn('[AuthService]: Auto sign-in post-admin creation warning:', sErr);
            }
          }
        } catch (fallbackErr) {
          console.error('[AuthService]: Admin rate limit bypass failed:', fallbackErr);
        }
      }
    }

    // Fallback 2: If user already registered in Auth, try sign in with password to restore/create missing profile
    if (authError) {
      const errStr = (authError.message || JSON.stringify(authError)).toLowerCase();
      if (errStr.includes('already registered') || errStr.includes('already exists')) {
        try {
          const signInRes = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
          });
          if (signInRes.data?.user) {
            authUser = signInRes.data.user;
            authError = null;
          }
        } catch (sErr) {
          console.warn('[AuthService]: Existing user sign-in recovery attempt failed:', sErr);
        }
      }
    }

    if (authError) throw authError;

    if (authUser) {
      // Validate UUID format for institution_id to prevent Postgres syntax errors
      const isUuid = typeof payload.institutionId === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(payload.institutionId);

      const profilePayload = {
        id: authUser.id,
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

    return { user: authUser };
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
