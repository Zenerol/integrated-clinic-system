import { User, Session } from '@supabase/supabase-js';
import { Database, UserRole, PatientCategory } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  patientType?: PatientCategory;
  institutionId?: string;
  schoolIdNumber?: string;
  departmentOrCourse?: string;
  contactNumber?: string;
  address?: string;
  professionalLicenseNo?: string;
}

export interface StaffRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: 'doctor' | 'nurse';
  professionalLicenseNo: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  signIn: (payload: SignInPayload) => Promise<{ error: Error | null; profile: Profile | null }>;
  signUp: (payload: RegisterPayload) => Promise<{ error: Error | null; profile: Profile | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}
