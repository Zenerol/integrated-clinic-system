import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PatientCategory } from '../../types/database.types';
import { InstitutionRow } from '../../types/clinic.types';
import { DEFAULT_PARTNER_INSTITUTIONS, institutionService } from '../../services/institutionService';
import { getPasswordStrength, passwordSchema } from '../../utils/validationSchemas';
import { sanitizeInput } from '../../utils/security';
import { Mail, Lock, User, IdCard, Building2, Phone, MapPin, UserPlus, AlertCircle, GraduationCap, UserCheck, Stethoscope, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [categoryMode, setCategoryMode] = useState<'campus' | 'external'>('campus');
  const [patientType, setPatientType] = useState<PatientCategory>('student');

  const [institutions, setInstitutions] = useState<InstitutionRow[]>(DEFAULT_PARTNER_INSTITUTIONS);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(DEFAULT_PARTNER_INSTITUTIONS[0]?.id || '');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolIdNumber, setSchoolIdNumber] = useState('');
  const [departmentOrCourse, setDepartmentOrCourse] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    institutionService.getPartnerInstitutions().then((list) => {
      if (list && list.length > 0) {
        setInstitutions(list);
        setSelectedInstitutionId((prev) => prev || list[0].id);
      }
    });
  }, []);

  const passwordStrength = getPasswordStrength(password);

  const handleModeToggle = (mode: 'campus' | 'external') => {
    setCategoryMode(mode);
    if (mode === 'campus') {
      setPatientType('student');
      if (institutions.length > 0 && !selectedInstitutionId) {
        setSelectedInstitutionId(institutions[0].id);
      }
    } else {
      setPatientType('external_client');
      setSelectedInstitutionId('');
    }
  };

  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSubmittingRef.current) return;

    setErrorMessage(null);

    // OWASP A07: Validate Password Complexity
    const passResult = passwordSchema.safeParse(password);
    if (!passResult.success) {
      setErrorMessage(passResult.error.errors[0].message);
      return;
    }

    // Validation
    if (categoryMode === 'campus' && !schoolIdNumber.trim()) {
      setErrorMessage('School ID Number is required for campus members.');
      return;
    }

    if (categoryMode === 'external' && !address.trim()) {
      setErrorMessage('Residential Address is required for Community Outpatient registration.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await signUp({
        email: email.trim().toLowerCase(),
        password,
        fullName: sanitizeInput(fullName),
        role: 'client', // Strictly hardcoded to 'client' for security
        patientType: categoryMode === 'campus' ? patientType : 'external_client',
        institutionId: categoryMode === 'campus' ? selectedInstitutionId : undefined,
        schoolIdNumber: categoryMode === 'campus' ? sanitizeInput(schoolIdNumber) : undefined,
        departmentOrCourse: categoryMode === 'campus' ? sanitizeInput(departmentOrCourse) : undefined,
        contactNumber: sanitizeInput(contactNumber),
        address: sanitizeInput(address),
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('rate limit') || error.status === 429) {
          setErrorMessage('Too many sign up attempts. Email rate limit reached by authentication provider — please wait a moment or try signing in.');
        } else if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user_already_exists')) {
          setErrorMessage('This email address is already registered. Please click "Sign In" below.');
        } else {
          setErrorMessage(error.message || 'Registration failed. Please try again.');
        }
      } else {
        setSubmittedSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during account registration.';
      if (msg.toLowerCase().includes('rate limit')) {
        setErrorMessage('Too many sign up attempts. Email rate limit reached — please try again in a few minutes.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (submittedSuccess) {
    return (
      <div className="text-center py-4 px-1 space-y-6 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">
        {/* Animated Radiant Glow Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-teal-500/30 via-emerald-400/40 to-teal-600/30 blur-xl opacity-80 animate-pulse" />
          
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-teal-500/25">
            <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-in zoom-in duration-300" />
            </div>
          </div>
        </div>

        {/* Title & Status Pill */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-300 text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Account Active & Ready</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Account Created Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
            Welcome to the Campus & Community Health Platform. Your patient account is active and ready to use.
          </p>
        </div>

        {/* Polished Detail Summary Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 text-left text-xs space-y-3 font-medium max-w-md mx-auto shadow-xs backdrop-blur-xs">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Registered Patient</span>
            </div>
            <strong className="text-slate-900 dark:text-slate-100 font-black text-xs sm:text-sm">{fullName}</strong>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
              <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Account Email</span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200/50 dark:border-teal-800/50">{email}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
              {categoryMode === 'campus' ? (
                <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-amber-500" />
              )}
              <span>Affiliation Category</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-black text-[11px] uppercase tracking-wider">
              {categoryMode === 'campus' ? `Campus ${patientType}` : 'Community Outpatient'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/portal')}
            className="w-full sm:flex-1 py-3 px-5 text-sm font-extrabold tracking-wide bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-teal-600/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Proceed to Patient Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/login')}
            className="w-full sm:flex-1 py-3 px-5 text-sm font-bold tracking-wide bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Sign In to Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Create Patient Account
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
          Register for medical consultations & queue tracking
        </p>
      </div>

      {/* Visual Category Selection Cards (Campus vs Community Outpatient) */}
      <div>
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
          Select Patient Category:
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleModeToggle('campus')}
            className={`p-3 rounded-2xl border text-left transition duration-200 cursor-pointer flex items-center gap-3 ${
              categoryMode === 'campus'
                ? 'bg-teal-50 dark:bg-teal-500/15 border-teal-500 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500/30 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${categoryMode === 'campus' ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs font-black">Campus Member</strong>
              <span className="text-[10px] opacity-80 font-medium">Student / Faculty</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleModeToggle('external')}
            className={`p-3 rounded-2xl border text-left transition duration-200 cursor-pointer flex items-center gap-3 ${
              categoryMode === 'external'
                ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/30 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${categoryMode === 'external' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs font-black">Outpatient</strong>
              <span className="text-[10px] opacity-80 font-medium">Community Guest</span>
            </div>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-900 dark:text-rose-300 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Account Info */}
        <div className="space-y-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
            1. Basic Information
          </h4>

          <Input
            label="Full Name"
            type="text"
            required
            placeholder="John Doe"
            leftIcon={<User className="w-4 h-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="yourname@domain.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password.length > 0 && (
              <div className="mt-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Strength:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-white font-black ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Identity / Contact Details */}
        <div className="space-y-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
            2. {categoryMode === 'campus' ? 'Campus Credentials' : 'Contact & Address'}
          </h4>

          {categoryMode === 'campus' ? (
            <>
              <Select
                label="Partner Institution"
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                required
                options={institutions.map((inst) => ({
                  value: inst.id,
                  label: `${inst.name} (${inst.code})`,
                }))}
              />
              <Select
                label="Campus Role"
                value={patientType}
                onChange={(e) => setPatientType(e.target.value as PatientCategory)}
                options={[
                  { value: 'student', label: 'Enrolled Student' },
                  { value: 'faculty_staff', label: 'Faculty / Staff Member' },
                ]}
              />
              <Input
                label="School ID Number"
                type="text"
                required
                placeholder="e.g. 2024-0012"
                leftIcon={<IdCard className="w-4 h-4" />}
                value={schoolIdNumber}
                onChange={(e) => setSchoolIdNumber(e.target.value)}
              />
              <Input
                label="Department / Course"
                type="text"
                required
                placeholder="e.g. BS Information Technology"
                leftIcon={<Building2 className="w-4 h-4" />}
                value={departmentOrCourse}
                onChange={(e) => setDepartmentOrCourse(e.target.value)}
              />
            </>
          ) : (
            <>
              <Input
                label="Contact Phone Number"
                type="tel"
                placeholder="e.g. +63 912 345 6789"
                leftIcon={<Phone className="w-4 h-4" />}
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
              <Input
                label="Home Address"
                type="text"
                placeholder="Street, Barangay, City"
                leftIcon={<MapPin className="w-4 h-4" />}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={<UserPlus className="w-4 h-4" />}
          className="mt-2 w-full shadow-md"
        >
          Create Patient Account
        </Button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center flex flex-col gap-2">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
          Already registered?{' '}
          <Link to="/login" className="text-teal-700 dark:text-teal-400 hover:underline font-black">
            Sign In
          </Link>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Medical Doctor or Nurse?{' '}
          <Link to="/staff/register" className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center justify-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" /> Staff Self-Registration →
          </Link>
        </p>
      </div>
    </div>
  );
};
