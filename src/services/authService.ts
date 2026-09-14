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
      // Upsert user profile into public.profiles table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: payload.fullName,
        role: payload.role,
        patient_type: payload.patientType,
        school_id_number: payload.schoolIdNumber || null,
        department_or_course: payload.departmentOrCourse || null,
        contact_number: payload.contactNumber || null,
        address: payload.address || null,
      });

      if (profileError) throw profileError;
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // record not found
      throw error;
    }
    return data as Profile;
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
