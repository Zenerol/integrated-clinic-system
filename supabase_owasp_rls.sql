-- ============================================================================
-- OWASP Top 10 Web Application Security - Supabase RLS Policies & Hardening
-- Hybrid School & Community Clinic Management System
-- ============================================================================

-- 1. SECURITY HELPER FUNCTION (Prevents Infinite Recursion in RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, anon;


-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES (A05: Default Deny)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- 3. DROP EXISTING POLICIES TO AVOID CONFLICTS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can create own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can cancel own pending appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointment status" ON public.appointments;

DROP POLICY IF EXISTS "Patients can view own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Staff can view all medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Staff can insert medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Staff can update medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can update clinical diagnosis" ON public.medical_records;

DROP POLICY IF EXISTS "Patients can view own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Staff can view all prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can insert prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can update prescriptions" ON public.prescriptions;

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users create notifications" ON public.notifications;


-- 4. TABLE: PROFILES (A01: Broken Access Control & IDOR Mitigation)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('doctor', 'nurse'));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- 5. TABLE: APPOINTMENTS (IDOR Protection)
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Staff can view all appointments"
  ON public.appointments FOR SELECT
  USING (public.get_user_role() IN ('doctor', 'nurse'));

CREATE POLICY "Patients can create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can cancel own pending appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = patient_id AND status = 'pending');

CREATE POLICY "Staff can update appointment status"
  ON public.appointments FOR UPDATE
  USING (public.get_user_role() IN ('doctor', 'nurse'));


-- 6. TABLE: MEDICAL_RECORDS (Strict Clinical Data RLS)
CREATE POLICY "Patients can view own medical records"
  ON public.medical_records FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Staff can view all medical records"
  ON public.medical_records FOR SELECT
  USING (public.get_user_role() IN ('doctor', 'nurse'));

CREATE POLICY "Staff can insert medical records"
  ON public.medical_records FOR INSERT
  WITH CHECK (public.get_user_role() IN ('doctor', 'nurse'));

CREATE POLICY "Staff can update medical records"
  ON public.medical_records FOR UPDATE
  USING (public.get_user_role() IN ('doctor', 'nurse'));


-- 7. TABLE: PRESCRIPTIONS (Doctor-Only Write Control)
CREATE POLICY "Patients can view own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_records mr
      WHERE mr.id = medical_record_id AND mr.patient_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all prescriptions"
  ON public.prescriptions FOR SELECT
  USING (public.get_user_role() IN ('doctor', 'nurse'));

CREATE POLICY "Doctors can insert prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (public.get_user_role() = 'doctor');

CREATE POLICY "Doctors can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (public.get_user_role() = 'doctor');


-- 8. TABLE: NOTIFICATIONS (User Scoped Access)
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
