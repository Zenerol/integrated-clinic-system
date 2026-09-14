import { z } from 'zod';
import { sanitizeInput } from './security';

/**
 * OWASP A07: Identification and Authentication Failures
 * Strong Password Complexity Validator:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)');

/**
 * Helper to assess password strength score (0-4) and return feedback
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  checks: { minLength: boolean; uppercase: boolean; number: boolean; special: boolean };
} {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let color = 'bg-rose-500';

  if (score === 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-amber-500';
  } else if (score === 2) {
    label = 'Fair';
    color = 'bg-yellow-500';
  }

  return { score, label, color, checks };
}

/**
 * Staff Intake Registration Schema
 */
export const staffRegistrationSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Full name is required')
      .transform(sanitizeInput),
    email: z
      .string()
      .email('Invalid email address')
      .transform((val) => val.trim().toLowerCase()),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(['doctor', 'nurse'], { required_error: 'Role (Doctor or Nurse) selection is required' }),
    professional_license_no: z
      .string()
      .min(4, 'Professional License / PRC ID Number is required (min 4 characters)')
      .transform(sanitizeInput),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export const registrationSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Full name is required')
      .transform(sanitizeInput),
    email: z
      .string()
      .email('Invalid email address')
      .transform((val) => val.trim().toLowerCase()),
    password: passwordSchema,
    confirmPassword: z.string(),
    patient_category: z.enum(['student', 'employee', 'dependent', 'community_member']),
    id_number: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
    campus: z.string().min(1, 'Campus selection is required').transform(sanitizeInput),
    department: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
    course_year: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
    contact_number: z
      .string()
      .min(7, 'Contact number must be at least 7 digits')
      .regex(/^[0-9+\-\s()]+$/, 'Invalid contact number format')
      .transform(sanitizeInput),
    emergency_contact: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
    medical_history: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * OWASP A03: Input Sanitization Schema for Booking Appointments
 */
export const bookAppointmentSchema = z.object({
  appointment_date: z
    .string()
    .min(1, 'Appointment date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid appointment date'),
  time_slot: z.string().min(1, 'Time slot is required'),
  consultation_mode: z.enum(['in_person', 'teleconsultation']),
  chief_complaint: z
    .string()
    .min(3, 'Chief complaint must be at least 3 characters')
    .max(500, 'Chief complaint cannot exceed 500 characters')
    .transform(sanitizeInput),
});

/**
 * OWASP A03: Strict Schema Validator for Vital Signs
 */
export const vitalsSchema = z.object({
  blood_pressure: z
    .string()
    .regex(/^\d{2,3}\/\d{2,3}$/, 'Blood pressure must be in format Systolic/Diastolic (e.g. 120/80)'),
  heart_rate: z
    .number({ invalid_type_error: 'Heart rate must be a valid number' })
    .min(30, 'Heart rate must be at least 30 bpm')
    .max(220, 'Heart rate cannot exceed 220 bpm'),
  body_temperature: z
    .number({ invalid_type_error: 'Body temperature must be a valid number' })
    .min(32.0, 'Body temperature must be at least 32°C')
    .max(43.0, 'Body temperature cannot exceed 43°C'),
  respiratory_rate: z
    .number({ invalid_type_error: 'Respiratory rate must be a valid number' })
    .min(8, 'Respiratory rate must be at least 8 bpm')
    .max(60, 'Respiratory rate cannot exceed 60 bpm'),
  oxygen_saturation: z
    .number({ invalid_type_error: 'Oxygen saturation must be a valid number' })
    .min(50, 'Oxygen saturation must be at least 50%')
    .max(100, 'Oxygen saturation cannot exceed 100%'),
  weight: z
    .number({ invalid_type_error: 'Weight must be a valid number' })
    .min(1, 'Weight must be at least 1 kg')
    .max(300, 'Weight cannot exceed 300 kg')
    .optional(),
  height: z
    .number({ invalid_type_error: 'Height must be a valid number' })
    .min(30, 'Height must be at least 30 cm')
    .max(250, 'Height cannot exceed 250 cm')
    .optional(),
  nurse_triage_notes: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : '')),
});

/**
 * Rejection Note Schema
 */
export const rejectionNoteSchema = z.object({
  rejection_reason: z
    .string()
    .min(5, 'Rejection reason must be at least 5 characters')
    .max(300, 'Rejection reason cannot exceed 300 characters')
    .transform(sanitizeInput),
});

/**
 * Clinical Encounter Schema for Doctor Diagnoses and Prescriptions
 */
export const clinicalEncounterSchema = z.object({
  diagnosis: z
    .string()
    .min(3, 'Diagnosis must be at least 3 characters')
    .max(500, 'Diagnosis cannot exceed 500 characters')
    .transform(sanitizeInput),
  treatment_notes: z
    .string()
    .min(3, 'Treatment notes must be at least 3 characters')
    .max(1000, 'Treatment notes cannot exceed 1000 characters')
    .transform(sanitizeInput),
  prescriptions: z
    .array(
      z.object({
        medication_name: z.string().min(1, 'Medication name required').transform(sanitizeInput),
        dosage: z.string().min(1, 'Dosage required').transform(sanitizeInput),
        frequency: z.string().min(1, 'Frequency required').transform(sanitizeInput),
        duration: z.string().min(1, 'Duration required').transform(sanitizeInput),
        instructions: z.string().optional().transform((val) => (val ? sanitizeInput(val) : '')),
      })
    )
    .optional(),
});
