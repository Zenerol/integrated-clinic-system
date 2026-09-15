import { supabase } from '../lib/supabaseClient';
import { InstitutionRow } from '../types/clinic.types';
import { PatientCategory } from '../types/database.types';

export const DEFAULT_PARTNER_INSTITUTIONS: InstitutionRow[] = [
  {
    id: 'tcc-partner-001',
    code: 'TCC',
    name: 'Tanauan City College',
    address: 'Tanauan City, Batangas',
    has_active_contract: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bsu-partner-002',
    code: 'BSU',
    name: 'Batangas State University',
    address: 'Batangas City, Batangas',
    has_active_contract: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pup-partner-003',
    code: 'PUP',
    name: 'Polytechnic University of the Philippines - Sto. Tomas',
    address: 'Sto. Tomas, Batangas',
    has_active_contract: true,
    created_at: new Date().toISOString(),
  },
];

let cachedInstitutions: InstitutionRow[] | null = null;

export const institutionService = {
  async getPartnerInstitutions(): Promise<InstitutionRow[]> {
    if (cachedInstitutions && cachedInstitutions.length > 0) {
      return cachedInstitutions;
    }

    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('has_active_contract', true)
        .order('code', { ascending: true });

      if (error || !data || data.length === 0) {
        cachedInstitutions = DEFAULT_PARTNER_INSTITUTIONS;
        return DEFAULT_PARTNER_INSTITUTIONS;
      }

      cachedInstitutions = data as InstitutionRow[];
      return cachedInstitutions;
    } catch (err) {
      console.warn('Failed to fetch institutions from DB, using fallback partners:', err);
      cachedInstitutions = DEFAULT_PARTNER_INSTITUTIONS;
      return DEFAULT_PARTNER_INSTITUTIONS;
    }
  },

  /**
   * Automated pricing calculator utility:
   * Returns 0.00 for verified partner institution members (student or faculty/staff);
   * standard rate (₱500.00) applies for non-affiliated community outpatients.
   */
  calculateConsultationFee(patientType?: PatientCategory | null, institutionId?: string | null): number {
    if (patientType === 'external_client' || !institutionId) {
      return 500.0;
    }
    if (patientType === 'student' || patientType === 'faculty_staff') {
      return 0.0;
    }
    return 500.0;
  },
};
