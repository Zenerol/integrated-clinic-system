-- ============================================================================
-- MULTI-SCHOOL CONSORTIUM & COMMUNITY CLINIC INFRASTRUCTURE MIGRATION
-- Schema Target: clinic_system (and public fallback)
-- ============================================================================

-- 1. Create institutions table in clinic_system schema
CREATE TABLE IF NOT EXISTS clinic_system.institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  has_active_contract BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default Consortium Partner Institutions if empty
INSERT INTO clinic_system.institutions (code, name, address, has_active_contract)
VALUES 
  ('TCC', 'Tanauan City College', 'Tanauan City, Batangas', true),
  ('BSU', 'Batangas State University', 'Batangas City, Batangas', true),
  ('PUP', 'Polytechnic University of the Philippines - Sto. Tomas', 'Sto. Tomas, Batangas', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Extend profiles table with institution_id
ALTER TABLE clinic_system.profiles
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES clinic_system.institutions(id) ON DELETE SET NULL;

-- 3. Extend appointments table with institution_id
ALTER TABLE clinic_system.appointments
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES clinic_system.institutions(id) ON DELETE SET NULL;

-- 4. Apply same schema extensions to public schema if public tables exist (fallback)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'institutions') THEN
    NULL;
  ELSE
    CREATE TABLE IF NOT EXISTS public.institutions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      has_active_contract BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    INSERT INTO public.institutions (code, name, address, has_active_contract)
    VALUES 
      ('TCC', 'Tanauan City College', 'Tanauan City, Batangas', true),
      ('BSU', 'Batangas State University', 'Batangas City, Batangas', true),
      ('PUP', 'Polytechnic University of the Philippines - Sto. Tomas', 'Sto. Tomas, Batangas', true)
    ON CONFLICT (code) DO NOTHING;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
    ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;
  END IF;
END $$;
