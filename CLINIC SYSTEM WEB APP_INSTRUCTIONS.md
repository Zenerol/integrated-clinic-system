# ARCHITECTURAL SPECIFICATION & DEVELOPER IMPLEMENTATION INSTRUCTION
## Project: Hybrid School & Community Clinic Management System
**Target Platform:** Cloudflare Pages | **Stack:** React + TypeScript (Vite), Supabase (PostgreSQL, Auth, RLS, Realtime), Tailwind CSS, Lucide Icons

---

### 1. Architectural Guidelines & Principles
To maintain clean code and prevent spaghetti code, adhere strictly to these principles:
- **Feature-Based Modular Architecture:** Group files by clinical domain rather than generic technical types.
- **Separation of Concerns:** 
  - Components render UI and handle local interactions only.
  - Business logic, Supabase queries, and mutations live in dedicated custom hooks (`hooks/`) or service modules (`services/`).
  - Shared UI elements (buttons, inputs, modals, badges) live in `components/ui/`.
- **Type Safety First:** Every database entity, form submission, and role enumeration must have an explicit TypeScript definition in `types/`.
- **Strict Role-Based Access Control (RBAC):** All protected routes are guarded via `<RoleRoute allowedRoles={[...]} />`.
- **Audit-Ready Clinical State Transitions:** Appointments must follow an explicit lifecycle sequence with actor attribution (`approved_by`, `nurse_notes`, `doctor_notes`).

---

### 2. Standardized File & Directory Structure

```text
clinic-web-app/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Cloudflare Pages CI/CD configuration
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── assets/                     # Static images, logos
│   ├── components/                 # Shared / Reusable components
│   │   ├── common/
│   │   │   ├── Navbar.tsx          # Navigation bar with role-based links
│   │   │   ├── NotificationBanner.tsx # Top-bar alert component pinned above Navbar
│   │   │   └── Footer.tsx
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx # Main authenticated layout shell
│   │   │   └── AuthLayout.tsx      # Login/registration layout wrapper
│   │   └── ui/                     # Primitives (Button, Modal, Card, Badge, FormInput)
│   ├── context/                    # Global contexts (AuthContext, NotificationContext)
│   ├── features/                   # Domain-driven feature modules
│   │   ├── auth/                   # Sign-in, sign-up, password reset
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── authService.ts
│   │   ├── doctor/                 # Doctor-specific dashboard & features
│   │   │   ├── components/         # Clinical assessment, prescription generator, medical certs
│   │   │   └── DoctorDashboard.tsx
│   │   ├── nurse/                  # Nurse-specific triage, intake & review panel
│   │   │   ├── components/         # Appointment approval modal, vitals logging form, queue management
│   │   │   └── NurseDashboard.tsx
│   │   ├── patient/                # Student / External Client portal
│   │   │   ├── components/         # Appointment booking, record & prescription history
│   │   │   └── PatientDashboard.tsx
│   │   ├── queue/                  # Cross-cutting queue tracker & status components
│   │   └── notifications/          # Real-time alert listeners & dispatchers
│   ├── hooks/                      # Shared custom hooks (e.g., useDebounce, useMediaQuery)
│   ├── lib/                        # Third-party integrations
│   │   └── supabaseClient.ts       # Supabase client initialization & types
│   ├── routes/                     # Router setup & guards
│   │   ├── AppRoutes.tsx           # Route mapping
│   │   ├── ProtectedRoute.tsx      # Authentication guard
│   │   └── RoleRoute.tsx           # Role-based authorization guard
│   ├── services/                   # Supabase data services (appointments, records, profiles)
│   ├── types/                      # TypeScript definitions & Supabase DB types
│   │   ├── database.types.ts       # Generated or manual database schema types
│   │   ├── auth.types.ts
│   │   └── clinic.types.ts
│   ├── utils/                      # Helper utilities (date formatting, vitals validation, badge color helpers)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

### 3. Database Schema & Supabase Setup (SQL)

Execute the following in the Supabase SQL Editor:

```sql
-- 1. Roles, Categories, and Lifecycles
create type user_role as enum ('doctor', 'nurse', 'client');
create type patient_category as enum ('student', 'faculty_staff', 'external_client');
create type appointment_status as enum (
  'pending',       -- Patient submitted request, awaiting review
  'approved',      -- Nurse or Doctor confirmed slot
  'rejected',      -- Declined with mandatory reason
  'in_triage',     -- Patient checked in on-site; nurse taking vitals
  'with_doctor',   -- Vitals recorded; doctor consulting
  'completed',     -- Visit done; records & prescriptions finalized
  'cancelled'      -- Cancelled by patient or clinic
);
create type consultation_mode as enum ('school_free', 'external_private');
create type notification_type as enum ('info', 'warning', 'success', 'urgent');

-- 2. Profiles (Public profile referencing auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role user_role not null default 'client',
  patient_type patient_category default 'external_client',
  school_id_number text,         -- Required if student or faculty_staff
  department_or_course text,     -- e.g. "BSIT", "Faculty of Science"
  contact_number text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Appointments & Queue Lifecycle
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  assigned_doctor_id uuid references public.profiles(id),
  approved_by uuid references public.profiles(id), -- Nurse or Doctor who reviewed the request
  approved_at timestamp with time zone,
  rejection_reason text,                          -- Mandatory if status = 'rejected'
  check_in_time timestamp with time zone,
  chief_complaint text not null,
  status appointment_status default 'pending' not null,
  consultation_mode consultation_mode default 'school_free' not null,
  consultation_fee numeric(10,2) default 0.00 not null,
  scheduled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Medical Records & Vitals
create table public.medical_records (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  -- Nurse Vitals Entry
  blood_pressure text,
  heart_rate integer,
  temperature numeric(4,1),
  weight_kg numeric(5,2),
  nurse_notes text,
  -- Doctor Clinical Assessment
  diagnosis text,
  treatment_plan text,
  doctor_notes text,
  clearance_type text, -- 'fit_to_study', 'fit_to_work', 'standard_cert', 'none'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Prescriptions
create table public.prescriptions (
  id uuid default gen_random_uuid() primary key,
  record_id uuid references public.medical_records(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.profiles(id) not null,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Top-Bar Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references public.profiles(id) on delete cascade, -- null = role/global broadcast
  target_role user_role, -- null = global broadcast to all roles
  title text not null,
  message text not null,
  type notification_type default 'info' not null,
  action_url text,
  is_read boolean default false not null,
  is_dismissed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Realtime Enablement
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.appointments;
```

---

### 4. Step-by-Step Implementation Flow for Developer Agent (Antigravity)

#### Step 1: Base Setup & Routing Infrastructure
- Initialize Vite React TypeScript application with Tailwind CSS and `lucide-react`.
- Configure `src/lib/supabaseClient.ts` reading from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Build `AuthContext` to expose `user`, `profile`, `isLoading`, and authentication methods.
- Set up React Router DOM with:
  - `/login` & `/register` (Public)
  - `/doctor/*` (Guarded: `doctor`)
  - `/nurse/*` (Guarded: `nurse`)
  - `/portal/*` (Guarded: `client`)

#### Step 2: Global Layout & Dynamic Top-Bar Banner
- Construct `DashboardLayout.tsx` housing `NotificationBanner` directly above `Navbar`.
- The banner must subscribe via Supabase Realtime (`postgres_changes` on `notifications`).
- Support immediate dismissal (`is_dismissed: true` update) and role-targeted alerts.

#### Step 3: Registration with Dual Campus/Outpatient Support
- Dynamic form switching on `/register`:
  - Segmented selector: "Campus Member (Student/Staff)" vs. "Community / External Patient".
  - If Campus: validate and require `school_id_number` and `department_or_course` (`patient_type = 'student' | 'faculty_staff'`).
  - If External: hide school fields, capture contact phone and address (`patient_type = 'external_client'`).

#### Step 4: Nurse Dashboard (Intake Desk, Approval & Triage Queue)
- Structure into two primary tabs:
  1. **Appointment Requests Tab (`status = 'pending'`):**
     - Review incoming bookings with badges: `Student` (Blue badge + ID), `Faculty/Staff` (Emerald badge), `External Client` (Amber badge).
     - **Approve Action:** Updates `status = 'approved'`, sets `approved_by` to the current user's profile ID, and sets `approved_at = now()`. Automatically dispatches an alert notification to the patient.
     - **Reject Action:** Modal requiring a `rejection_reason`. Updates `status = 'rejected'` and notifies the patient.
  2. **Active Clinic Queue Tab (`status IN ('approved', 'in_triage', 'with_doctor')`):**
     - "Check In & Record Vitals" button transitions status to `in_triage`.
     - Vitals Form: Blood Pressure (format: `120/80`), Heart Rate, Temperature, Weight, Nurse Notes.
     - "Submit & Pass to Doctor" updates status to `with_doctor` and sends an urgent notification to the `doctor` role.

#### Step 5: Doctor Dashboard (Clinical Evaluation & Outputs)
- Ability to view incoming appointment requests as fallback approver.
- Filterable queue of patients with status `with_doctor`.
- Clinical encounter form:
  - Review vitals and triage notes recorded by the Nurse.
  - Enter Diagnosis, Doctor Notes, and Treatment Plan.
  - Multi-item prescription builder.
  - Document Generator: Toggle between **Fit-to-Study/Work Slip** (for students/faculty) or **Standard Outpatient Medical Certificate** (for external patients).
- Completing the visit changes status to `completed` and sends a completion notification to the patient.

#### Step 6: Patient / Client Portal
- View current appointment status (`pending`, `approved`, `rejected`, `in_triage`, `completed`).
- "Book Consultation" form (chief complaint, preferred date/time).
- Read-only history of completed visits, vital history, and active prescriptions with printable slip/certificate preview.

#### Step 7: QA Seed Data Script
Provide a seed utility (`src/utils/seedData.ts`) generating:
- `doctor@clinic.test` / `Password123!` (Role: Doctor)
- `nurse@clinic.test` / `Password123!` (Role: Nurse)
- `student@clinic.test` / `Password123!` (Role: Client, Student: 2024-0012)
- `external@clinic.test` / `Password123!` (Role: Client, External Outpatient)

---

### 5. Strict Coding Guardrails & Anti-Patterns to Avoid

- **Zero Credential Leaks:**
  - NEVER hardcode Supabase URLs, anon keys, or secrets into source files.
  - Always consume configuration via `import.meta.env.VITE_*`.
  - Ensure `.env*` files are strictly included in `.gitignore`, and supply a safe `.env.example` with blank placeholder values.
- **No Emojis as UI Icons:**
  - NEVER use raw emojis (e.g., 🩺, 💊, 🔔, ❌) as user interface icons or status indicators.
  - Use exclusively the official SVG icons imported from `lucide-react` (e.g., `<Stethoscope/>`, `<Pill/>`, `<Bell/>`, `<CheckCircle2/>`, `<AlertTriangle/>`).
- **No Direct Inline Database Queries:**
  - Do not call `supabase.from(...)` directly inside React presentation components.
  - Encapsulate all database queries, mutations, and Realtime listeners inside dedicated functions in `src/services/` or custom hooks in `src/hooks/`.
- **No Spaghetti Components (Single Responsibility):**
  - Keep components under 150–200 lines where practical.
  - Complex elements like vitals intake modals, prescription item builders, and triage queue tables must be broken out into dedicated sub-components under their respective `features/*/components/` directories.
- **No TypeScript `any` Escapes:**
  - Prohibit the use of `any` or `as any`.
  - All forms, Supabase payloads, and role definitions must strictly type against `src/types/`.
- **No Native Browser Popups:**
  - Do not use native `alert()`, `confirm()`, or `prompt()` dialogs.
  - Build clean, accessible Tailwind CSS modal dialogs or toast components for actions like rejection notes, prescription generation, and sign-outs.
- **No Unhandled Async / State Desync:**
  - Every async database call must implement robust `try/catch/finally` handling, loading states (`isLoading`), and clean UI error states.

