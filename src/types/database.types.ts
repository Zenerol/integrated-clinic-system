export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'client';
export type AccountStatus = 'pending_approval' | 'active' | 'suspended' | 'rejected';
export type PatientCategory = 'student' | 'faculty_staff' | 'external_client';
export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_triage'
  | 'with_doctor'
  | 'completed'
  | 'cancelled';
export type ConsultationMode = 'school_free' | 'external_private';
export type NotificationType = 'info' | 'warning' | 'success' | 'urgent';
export type ClearanceType = 'fit_to_study' | 'fit_to_work' | 'standard_cert' | 'none';

export interface Database {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string;
          code: string;
          name: string;
          address: string | null;
          has_active_contract: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          address?: string | null;
          has_active_contract?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          address?: string | null;
          has_active_contract?: boolean;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          patient_type: PatientCategory | null;
          institution_id: string | null;
          school_id_number: string | null;
          department_or_course: string | null;
          contact_number: string | null;
          address: string | null;
          account_status: AccountStatus;
          professional_license_no: string | null;
          rejection_reason: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          patient_type?: PatientCategory | null;
          institution_id?: string | null;
          school_id_number?: string | null;
          department_or_course?: string | null;
          contact_number?: string | null;
          address?: string | null;
          account_status?: AccountStatus;
          professional_license_no?: string | null;
          rejection_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          patient_type?: PatientCategory | null;
          institution_id?: string | null;
          school_id_number?: string | null;
          department_or_course?: string | null;
          contact_number?: string | null;
          address?: string | null;
          account_status?: AccountStatus;
          professional_license_no?: string | null;
          rejection_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          assigned_doctor_id: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          check_in_time: string | null;
          chief_complaint: string;
          status: AppointmentStatus;
          consultation_mode: ConsultationMode;
          consultation_fee: number;
          scheduled_at: string;
          created_at: string;
          parent_appointment_id: string | null;
          is_follow_up: boolean;
          institution_id: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          assigned_doctor_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          check_in_time?: string | null;
          chief_complaint: string;
          status?: AppointmentStatus;
          consultation_mode?: ConsultationMode;
          consultation_fee?: number;
          scheduled_at?: string;
          created_at?: string;
          parent_appointment_id?: string | null;
          is_follow_up?: boolean;
        };
        Update: {
          id?: string;
          patient_id?: string;
          assigned_doctor_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          check_in_time?: string | null;
          chief_complaint?: string;
          status?: AppointmentStatus;
          consultation_mode?: ConsultationMode;
          consultation_fee?: number;
          scheduled_at?: string;
          created_at?: string;
          parent_appointment_id?: string | null;
          is_follow_up?: boolean;
        };
      };
      medical_records: {
        Row: {
          id: string;
          appointment_id: string;
          patient_id: string;
          blood_pressure: string | null;
          heart_rate: number | null;
          temperature: number | null;
          weight_kg: number | null;
          nurse_notes: string | null;
          diagnosis: string | null;
          treatment_plan: string | null;
          doctor_notes: string | null;
          clearance_type: ClearanceType | null;
          created_at: string;
          requires_follow_up: boolean;
          follow_up_date: string | null;
          follow_up_instructions: string | null;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          patient_id: string;
          blood_pressure?: string | null;
          heart_rate?: number | null;
          temperature?: number | null;
          weight_kg?: number | null;
          nurse_notes?: string | null;
          diagnosis?: string | null;
          treatment_plan?: string | null;
          doctor_notes?: string | null;
          clearance_type?: ClearanceType | null;
          created_at?: string;
          requires_follow_up?: boolean;
          follow_up_date?: string | null;
          follow_up_instructions?: string | null;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          patient_id?: string;
          blood_pressure?: string | null;
          heart_rate?: number | null;
          temperature?: number | null;
          weight_kg?: number | null;
          nurse_notes?: string | null;
          diagnosis?: string | null;
          treatment_plan?: string | null;
          doctor_notes?: string | null;
          clearance_type?: ClearanceType | null;
          created_at?: string;
          requires_follow_up?: boolean;
          follow_up_date?: string | null;
          follow_up_instructions?: string | null;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          record_id: string;
          patient_id: string;
          doctor_id: string;
          medication_name: string;
          dosage: string;
          frequency: string;
          instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          record_id: string;
          patient_id: string;
          doctor_id: string;
          medication_name: string;
          dosage: string;
          frequency: string;
          instructions?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          record_id?: string;
          patient_id?: string;
          doctor_id?: string;
          medication_name?: string;
          dosage?: string;
          frequency?: string;
          instructions?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string | null;
          target_role: UserRole | null;
          title: string;
          message: string;
          type: NotificationType;
          action_url: string | null;
          is_read: boolean;
          is_dismissed: boolean;
          is_critical: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id?: string | null;
          target_role?: UserRole | null;
          title: string;
          message: string;
          type?: NotificationType;
          action_url?: string | null;
          is_read?: boolean;
          is_dismissed?: boolean;
          is_critical?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string | null;
          target_role?: UserRole | null;
          title?: string;
          message?: string;
          type?: NotificationType;
          action_url?: string | null;
          is_read?: boolean;
          is_dismissed?: boolean;
          is_critical?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
