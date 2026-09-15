-- ============================================================================
-- CLINICAL FOLLOW-UP ENGINE & MULTI-TIERED NOTIFICATION SYSTEM MIGRATION
-- Schema Target: clinic_system (and public fallback)
-- ============================================================================

-- 1. Extend medical_records table in clinic_system schema
ALTER TABLE clinic_system.medical_records
  ADD COLUMN IF NOT EXISTS requires_follow_up BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS follow_up_date DATE,
  ADD COLUMN IF NOT EXISTS follow_up_instructions TEXT;

-- 2. Extend appointments table in clinic_system schema
ALTER TABLE clinic_system.appointments
  ADD COLUMN IF NOT EXISTS parent_appointment_id UUID REFERENCES clinic_system.appointments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_follow_up BOOLEAN DEFAULT false NOT NULL;

-- 3. Extend notifications table in clinic_system schema
ALTER TABLE clinic_system.notifications
  ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false NOT NULL;

-- 4. Apply same schema extensions to public schema if public tables exist (fallback)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_records') THEN
    ALTER TABLE public.medical_records
      ADD COLUMN IF NOT EXISTS requires_follow_up BOOLEAN DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS follow_up_date DATE,
      ADD COLUMN IF NOT EXISTS follow_up_instructions TEXT;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
    ALTER TABLE public.appointments
      ADD COLUMN IF NOT EXISTS parent_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS is_follow_up BOOLEAN DEFAULT false NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications
      ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- 5. Ensure Realtime Publication includes clinic_system tables (Safe & Idempotent)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE clinic_system.notifications;
EXCEPTION WHEN OTHERS THEN
  -- Table already in publication or already active
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE clinic_system.appointments;
EXCEPTION WHEN OTHERS THEN
  -- Table already in publication or already active
  NULL;
END $$;
