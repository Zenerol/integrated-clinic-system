-- ============================================================================
-- STAFF SELF-REGISTRATION & ADMIN APPROVAL SYSTEM MIGRATION
-- Hybrid School & Community Clinic Management System
-- ============================================================================

-- 1. ADD 'admin' TO user_role ENUM (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'doctor', 'nurse', 'client');
  ELSE
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
  END IF;
END $$;

-- 2. CREATE account_status ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE public.account_status AS ENUM ('pending_approval', 'active', 'suspended', 'rejected');
  END IF;
END $$;

-- 3. ADD NEW COLUMNS TO public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status public.account_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS professional_license_no TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Ensure default account_status for doctors and nurses is 'pending_approval' if unset
UPDATE public.profiles
SET account_status = 'pending_approval'
WHERE role IN ('doctor', 'nurse') AND account_status IS NULL;

-- 4. UPDATE get_user_role FUNCTION TO HANDLE ADMIN
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 5. UPDATE RLS POLICIES FOR ADMIN ACCESS TO PROFILES
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
CREATE POLICY "Admin can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- 6. GRANT ALL PERMISSIONS
GRANT ALL ON TABLE public.profiles TO authenticated, service_role;
