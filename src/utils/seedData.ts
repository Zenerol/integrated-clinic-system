import { authService } from '../services/authService';

export const seedAccounts = [
  {
    email: 'doctor@clinic.test',
    password: 'Password123!',
    fullName: 'Dr. Alex Mercer, MD',
    role: 'doctor' as const,
    patientType: 'faculty_staff' as const,
  },
  {
    email: 'nurse@clinic.test',
    password: 'Password123!',
    fullName: 'Nurse Sarah Jenkins, RN',
    role: 'nurse' as const,
    patientType: 'faculty_staff' as const,
  },
  {
    email: 'student@clinic.test',
    password: 'Password123!',
    fullName: 'David Miller',
    role: 'client' as const,
    patientType: 'student' as const,
    schoolIdNumber: '2024-0012',
    departmentOrCourse: 'BS Information Technology',
  },
  {
    email: 'external@clinic.test',
    password: 'Password123!',
    fullName: 'Maria Santos',
    role: 'client' as const,
    patientType: 'external_client' as const,
    contactNumber: '+63 917 555 0192',
    address: '123 Rizal St, Barangay San Jose',
  },
];

export const seedDemoUsers = async (): Promise<{ success: boolean; message: string }> => {
  try {
    for (const user of seedAccounts) {
      try {
        await authService.signUp(user);
      } catch (err) {
        // User may already exist in Supabase auth instance
        console.warn(`User ${user.email} registration notice:`, err);
      }
    }
    return { success: true, message: 'QA Seed accounts processed successfully.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'QA Seeding failed';
    return { success: false, message: errorMsg };
  }
};
