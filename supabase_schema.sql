-- ========================================================
-- HYBRID SCHOOL & COMMUNITY CLINIC MANAGEMENT SYSTEM
-- SUPABASE DATABASE INITIALIZATION SCRIPT
-- ========================================================

-- 1. Roles, Categories, and Lifecycles
CREATE TYPE user_role AS ENUM ('doctor', 'nurse', 'client');
CREATE TYPE patient_category AS ENUM ('student', 'faculty_staff', 'external_client');
CREATE TYPE appointment_status AS ENUM (
  'pending',       -- Patient submitted request, awaiting review
  'approved',      -- Nurse or Doctor confirmed slot
  'rejected',      -- Declined with mandatory reason
  'in_triage',     -- Patient checked in on-site; nurse taking vitals
  'with_doctor',   -- Vitals recorded; doctor consulting
  'completed',     -- Visit done; records & prescriptions finalized
  'cancelled'      -- Cancelled by patient or clinic
);
CREATE TYPE consultation_mode AS ENUM ('school_free', 'external_private');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'urgent');

-- 2. Profiles (Public profile referencing auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  patient_type patient_category DEFAULT 'external_client',
  school_id_number TEXT,         -- Required if student or faculty_staff
  department_or_course TEXT,     -- e.g. "BSIT", "Faculty of Science"
  contact_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Appointments & Queue Lifecycle
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_doctor_id UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id), -- Nurse or Doctor who reviewed the request
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,                          -- Mandatory if status = 'rejected'
  check_in_time TIMESTAMP WITH TIME ZONE,
  chief_complaint TEXT NOT NULL,
  status appointment_status DEFAULT 'pending' NOT NULL,
  consultation_mode consultation_mode DEFAULT 'school_free' NOT NULL,
  consultation_fee NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Medical Records & Vitals
CREATE TABLE public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Nurse Vitals Entry
  blood_pressure TEXT,
  heart_rate INTEGER,
  temperature NUMERIC(4,1),
  weight_kg NUMERIC(5,2),
  nurse_notes TEXT,
  -- Doctor Clinical Assessment
  diagnosis TEXT,
  treatment_plan TEXT,
  doctor_notes TEXT,
  clearance_type TEXT, -- 'fit_to_study', 'fit_to_work', 'standard_cert', 'none'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Prescriptions
CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.profiles(id) NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Top-Bar Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- null = role/global broadcast
  target_role user_role, -- null = global broadcast to all roles
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info' NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  is_dismissed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Realtime Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- 8. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow full access for appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow full access for medical_records" ON public.medical_records FOR ALL USING (true);
CREATE POLICY "Allow full access for prescriptions" ON public.prescriptions FOR ALL USING (true);
CREATE POLICY "Allow full access for notifications" ON public.notifications FOR ALL USING (true);
