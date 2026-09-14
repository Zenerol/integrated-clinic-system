import { Database, AppointmentStatus, ClearanceType } from './database.types';

export type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type MedicalRecordRow = Database['public']['Tables']['medical_records']['Row'];
export type PrescriptionRow = Database['public']['Tables']['prescriptions']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface AppointmentWithPatient extends AppointmentRow {
  patient: ProfileRow;
  assigned_doctor?: ProfileRow | null;
  approved_by_profile?: ProfileRow | null;
  medical_record?: MedicalRecordRow | null;
}

export interface MedicalRecordWithDetails extends MedicalRecordRow {
  patient: ProfileRow;
  prescriptions: PrescriptionRow[];
  appointment?: AppointmentRow | null;
}

export interface VitalsFormPayload {
  blood_pressure: string;
  heart_rate: number | null;
  temperature: number | null;
  weight_kg: number | null;
  nurse_notes: string;
}

export interface ClinicalAssessmentPayload {
  diagnosis: string;
  treatment_plan: string;
  doctor_notes: string;
  clearance_type: ClearanceType;
  prescriptions: Array<{
    medication_name: string;
    dosage: string;
    frequency: string;
    instructions: string;
  }>;
}

export interface CreateAppointmentPayload {
  chief_complaint: string;
  scheduled_at: string;
  consultation_mode?: 'school_free' | 'external_private';
  consultation_fee?: number;
}
