import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { getPasswordStrength, passwordSchema, staffRegistrationSchema } from '../../utils/validationSchemas';
import { sanitizeInput } from '../../utils/security';
import { Mail, Lock, User, Stethoscope, IdCard, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export const StaffRegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'nurse'>('doctor');
  const [professionalLicenseNo, setProfessionalLicenseNo] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // OWASP A03 & Zod Schema Validation
    const validationResult = staffRegistrationSchema.safeParse({
      full_name: fullName,
      email,
      password,
      confirmPassword,
      role,
      professional_license_no: professionalLicenseNo,
    });

    if (!validationResult.success) {
      setErrorMessage(validationResult.error.errors[0].message);
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email: email.trim().toLowerCase(),
      password,
      fullName: sanitizeInput(fullName),
      role,
      professionalLicenseNo: sanitizeInput(professionalLicenseNo),
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Staff registration failed.');
    } else {
      setSubmittedSuccess(true);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="text-center py-4 space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <ShieldCheck className="w-8 h-8 animate-bounce" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Application Submitted!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Your application has been submitted and is pending verification by Clinic Administration.
          </p>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Applicant:</span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">{fullName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Applied Role:</span>
            <strong className="text-teal-700 dark:text-teal-400 font-bold uppercase">{role}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">PRC License No:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{professionalLicenseNo}</strong>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/login')}
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full"
        >
          Proceed to Login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Medical Staff Portal</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
          Self-registration for Doctors & Clinical Nurses
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-900 dark:text-rose-400 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Full Name (with Title)"
          type="text"
          required
          placeholder="e.g. Dr. Jane Doe, MD or Nurse Mark Rivera, RN"
          leftIcon={<User className="w-4 h-4" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Work / Professional Email"
          type="email"
          required
          placeholder="staff.name@clinic.com"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Clinical Role Selection */}
        <Select
          label="Medical Staff Designation"
          value={role}
          onChange={(e) => setRole(e.target.value as 'doctor' | 'nurse')}
          options={[
            { value: 'doctor', label: 'Medical Doctor (MD)' },
            { value: 'nurse', label: 'Clinical Nurse (RN)' },
          ]}
        />

        <Input
          label="Professional License / PRC ID Number"
          type="text"
          required
          placeholder="e.g. PRC-0123456"
          leftIcon={<IdCard className="w-4 h-4" />}
          value={professionalLicenseNo}
          onChange={(e) => setProfessionalLicenseNo(e.target.value)}
          helperText="Required for administration verification against medical registry"
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
            <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-bold">
                <span className="text-slate-600 dark:text-slate-400">Password Strength:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-white font-black ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          required
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={<Stethoscope className="w-4 h-4" />}
          className="mt-2 w-full"
        >
          Submit Application for Approval
        </Button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-300 dark:border-slate-800 text-center flex flex-col gap-2">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
          Patient or Student account?{' '}
          <Link to="/register" className="text-teal-700 dark:text-teal-400 hover:underline font-black">
            Patient Registration
          </Link>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already registered staff?{' '}
          <Link to="/login" className="text-slate-700 dark:text-slate-200 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
