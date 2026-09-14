import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, LogIn, AlertCircle, Stethoscope, HeartPulse, GraduationCap, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    const { error, profile: userProfile } = await signIn({ email, password });
    setLoading(false);

    if (error) {
      const msg = error.message || 'Invalid login credentials.';
      setErrorMessage(msg);
      showToast(msg, 'error', 'Login Failed');
    } else {
      showToast(`Welcome back, ${userProfile?.full_name || 'User'}!`, 'success', 'Signed In');
      if (userProfile?.account_status === 'pending_approval' || userProfile?.account_status === 'rejected') {
        navigate('/awaiting-approval');
      } else if (userProfile?.role === 'admin') {
        navigate('/admin/staff-approvals');
      } else if (userProfile?.role === 'doctor') {
        navigate('/doctor');
      } else if (userProfile?.role === 'nurse') {
        navigate('/nurse');
      } else {
        navigate('/portal');
      }
    }
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
          Sign in to access your clinic portal
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-900 dark:text-rose-300 text-xs sm:text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="doctor@clinic.test or student@clinic.test"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={<LogIn className="w-4 h-4" />}
          className="mt-2 w-full shadow-md"
        >
          Sign In to Portal
        </Button>
      </form>

      {/* QA Quick Demo Logins Section */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5 text-center">
          Quick Demo Accounts (Autofill):
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => fillCredentials('admin@clinic.test')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('doctor@clinic.test')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Stethoscope className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('nurse@clinic.test')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Nurse</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('student@clinic.test')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('external@clinic.test')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Outpatient</span>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center flex flex-col gap-2">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-700 dark:text-teal-400 hover:underline font-black">
            Create Patient Account
          </Link>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Medical Doctor or Nurse?{' '}
          <Link to="/staff/register" className="text-purple-600 dark:text-purple-400 hover:underline font-bold">
            Staff Self-Registration →
          </Link>
        </p>
      </div>
    </div>
  );
};
