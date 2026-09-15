-- ============================================================================
-- HYBRID SCHOOL & COMMUNITY CLINIC MANAGEMENT SYSTEM
-- CUSTOM SCHEMA MIGRATION: clinic_system
-- ============================================================================

-- 1. CREATE SCHEMA
CREATE SCHEMA IF NOT EXISTS clinic_system;

-- Grant permissions to Supabase roles
GRANT USAGE ON SCHEMA clinic_system TO anon, authenticated, service_role, postgres;

-- 2. CREATE ENUM TYPES IN clinic_system SCHEMA
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'user_role' AND n.nspname = 'clinic_system') THEN
    CREATE TYPE clinic_system.user_role AS ENUM ('admin', 'doctor', 'nurse', 'client');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'patient_category' AND n.nspname = 'clinic_system') THEN
    CREATE TYPE clinic_system.patient_category AS ENUM ('student', 'faculty_staff', 'external_client');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'appointment_status' AND n.nspname = 'clinic_system') THEN
    CREATE TYPE clinic_system.appointment_status AS ENUM (
      'pending', 'approved', 'rejected', 'in_triage', 'with_doctor', 'completed', 'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'consultation_mode' AND n.nspname = 'clinic_system') THEN
    CREATE TYPE clinic_system.consultation_mode AS ENUM ('school_free', 'external_private');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'notification_type' AND n.nspname = 'clinic_system') THEN
    CREATE TYPE clinic_system.notification_type AS ENUM ('info', 'warning', 'success', 'urgent');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'account_status' AND n.nspname = 'clinic_system') THEN
    CREATE TYPE clinic_system.account_status AS ENUM ('pending_approval', 'active', 'suspended', 'rejected');
  END IF;
END $$;

-- 3. PROFILES TABLE IN clinic_system
CREATE TABLE IF NOT EXISTS clinic_system.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role clinic_system.user_role NOT NULL DEFAULT 'client',
  patient_type clinic_system.patient_category DEFAULT 'external_client',
  account_status clinic_system.account_status DEFAULT 'active',
  school_id_number TEXT,
  department_or_course TEXT,
  contact_number TEXT,
  address TEXT,
  professional_license_no TEXT,
  rejection_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. APPOINTMENTS TABLE IN clinic_system
CREATE TABLE IF NOT EXISTS clinic_system.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES clinic_system.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_doctor_id UUID REFERENCES clinic_system.profiles(id),
  approved_by UUID REFERENCES clinic_system.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  check_in_time TIMESTAMP WITH TIME ZONE,
  chief_complaint TEXT NOT NULL,
  status clinic_system.appointment_status DEFAULT 'pending' NOT NULL,
  consultation_mode clinic_system.consultation_mode DEFAULT 'school_free' NOT NULL,
  consultation_fee NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MEDICAL RECORDS TABLE IN clinic_system
CREATE TABLE IF NOT EXISTS clinic_system.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES clinic_system.appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES clinic_system.profiles(id) ON DELETE CASCADE NOT NULL,
  blood_pressure TEXT,
  heart_rate INTEGER,
  temperature NUMERIC(4,1),
  weight_kg NUMERIC(5,2),
  nurse_notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  doctor_notes TEXT,
  clearance_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRESCRIPTIONS TABLE IN clinic_system
CREATE TABLE IF NOT EXISTS clinic_system.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID REFERENCES clinic_system.medical_records(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES clinic_system.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES clinic_system.profiles(id) NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. NOTIFICATIONS TABLE IN clinic_system
CREATE TABLE IF NOT EXISTS clinic_system.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES clinic_system.profiles(id) ON DELETE CASCADE,
  target_role clinic_system.user_role,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type clinic_system.notification_type DEFAULT 'info' NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  is_dismissed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. MIGRATE DATA FROM public SCHEMA IF EXISTS (DYNAMICALLY BULLETPROOF)
DO $$
DECLARE
  has_account_status BOOLEAN;
  has_license BOOLEAN;
  has_rejection BOOLEAN;
  has_approved_by BOOLEAN;
  has_approved_at BOOLEAN;
BEGIN
  -- Copy profiles safely
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
      SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'account_status') INTO has_account_status;
      SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'professional_license_no') INTO has_license;
      SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'rejection_reason') INTO has_rejection;
      SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'approved_by') INTO has_approved_by;
      SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'approved_at') INTO has_approved_at;

      EXECUTE format('
        INSERT INTO clinic_system.profiles (
          id, full_name, role, patient_type, account_status, school_id_number,
          department_or_course, contact_number, address, professional_license_no,
          rejection_reason, approved_by, approved_at, created_at
        )
        SELECT
          id,
          full_name,
          role::text::clinic_system.user_role,
          patient_type::text::clinic_system.patient_category,
          %s,
          school_id_number,
          department_or_course,
          contact_number,
          address,
          %s,
          %s,
          %s,
          %s,
          created_at
        FROM public.profiles
        ON CONFLICT (id) DO NOTHING;
      ',
      CASE WHEN has_account_status THEN 'COALESCE(account_status::text::clinic_system.account_status, ''active''::clinic_system.account_status)' ELSE '''active''::clinic_system.account_status' END,
      CASE WHEN has_license THEN 'professional_license_no' ELSE 'NULL' END,
      CASE WHEN has_rejection THEN 'rejection_reason' ELSE 'NULL' END,
      CASE WHEN has_approved_by THEN 'approved_by' ELSE 'NULL' END,
      CASE WHEN has_approved_at THEN 'approved_at' ELSE 'NULL' END
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profiles migration notice: %', SQLERRM;
  END;

  -- Copy appointments safely
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
      INSERT INTO clinic_system.appointments (
        id, patient_id, assigned_doctor_id, approved_by, approved_at, rejection_reason,
        check_in_time, chief_complaint, status, consultation_mode, consultation_fee, scheduled_at, created_at
      )
      SELECT
        id, patient_id, assigned_doctor_id, approved_by, approved_at, rejection_reason,
        check_in_time, chief_complaint, status::text::clinic_system.appointment_status,
        consultation_mode::text::clinic_system.consultation_mode, consultation_fee, scheduled_at, created_at
      FROM public.appointments
      ON CONFLICT (id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Appointments migration notice: %', SQLERRM;
  END;

  -- Copy medical records safely
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_records') THEN
      INSERT INTO clinic_system.medical_records (
        id, appointment_id, patient_id, blood_pressure, heart_rate, temperature, weight_kg,
        nurse_notes, diagnosis, treatment_plan, doctor_notes, clearance_type, created_at
      )
      SELECT
        id, appointment_id, patient_id, blood_pressure, heart_rate, temperature, weight_kg,
        nurse_notes, diagnosis, treatment_plan, doctor_notes, clearance_type, created_at
      FROM public.medical_records
      ON CONFLICT (id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Medical records migration notice: %', SQLERRM;
  END;

  -- Copy prescriptions safely
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prescriptions') THEN
      INSERT INTO clinic_system.prescriptions (
        id, record_id, patient_id, doctor_id, medication_name, dosage, frequency, instructions, created_at
      )
      SELECT
        id, record_id, patient_id, doctor_id, medication_name, dosage, frequency, instructions, created_at
      FROM public.prescriptions
      ON CONFLICT (id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Prescriptions migration notice: %', SQLERRM;
  END;

  -- Copy notifications safely
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
      INSERT INTO clinic_system.notifications (
        id, recipient_id, target_role, title, message, type, action_url, is_read, is_dismissed, created_at
      )
      SELECT
        id, recipient_id, target_role::text::clinic_system.user_role, title, message,
        type::text::clinic_system.notification_type, action_url, is_read, is_dismissed, created_at
      FROM public.notifications
      ON CONFLICT (id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notifications migration notice: %', SQLERRM;
  END;
END $$;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES FOR clinic_system SCHEMA
ALTER TABLE clinic_system.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_system.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_system.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_system.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_system.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION clinic_system.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = clinic_system
AS $$
  SELECT role::text FROM clinic_system.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Permissive RLS Policies for clinic_system tables
DROP POLICY IF EXISTS "Allow full access for profiles" ON clinic_system.profiles;
CREATE POLICY "Allow full access for profiles" ON clinic_system.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full access for appointments" ON clinic_system.appointments;
CREATE POLICY "Allow full access for appointments" ON clinic_system.appointments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full access for medical_records" ON clinic_system.medical_records;
CREATE POLICY "Allow full access for medical_records" ON clinic_system.medical_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full access for prescriptions" ON clinic_system.prescriptions;
CREATE POLICY "Allow full access for prescriptions" ON clinic_system.prescriptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full access for notifications" ON clinic_system.notifications;
CREATE POLICY "Allow full access for notifications" ON clinic_system.notifications FOR ALL USING (true);

-- 10. GRANT FULL ACCESS TO ROLES
GRANT ALL ON ALL TABLES IN SCHEMA clinic_system TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA clinic_system TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA clinic_system TO anon, authenticated, service_role, postgres;

-- 11. REALTIME ENABLEMENT FOR clinic_system
ALTER PUBLICATION supabase_realtime ADD TABLE clinic_system.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE clinic_system.appointments;
