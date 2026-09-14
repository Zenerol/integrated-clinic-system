import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, LogIn, AlertCircle, Stethoscope, HeartPulse, GraduationCap, UserCheck } from 'lucide-react';

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
      if (userProfile?.role === 'doctor') navigate('/doctor');
      else if (userProfile?.role === 'nurse') navigate('/nurse');
      else navigate('/portal');
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
        <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">
          Test Accounts (Click to Autofill):
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillCredentials('doctor@clinic.test', 'Doctor')}
            className="p-2.5 bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-100 dark:hover:bg-purple-500/25 text-purple-950 dark:text-purple-200 border border-purple-200 dark:border-purple-500/30 rounded-xl text-left transition font-extrabold cursor-pointer shadow-xs active:scale-95 flex items-start gap-2"
          >
            <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <strong className="text-purple-900 dark:text-purple-300 block text-xs">MD Doctor</strong>
              <span className="text-[10px] font-mono opacity-80 block truncate">doctor@clinic.test</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('nurse@clinic.test', 'Nurse')}
            className="p-2.5 bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-left transition font-extrabold cursor-pointer shadow-xs active:scale-95 flex items-start gap-2"
          >
            <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <strong className="text-emerald-900 dark:text-emerald-300 block text-xs">Clinical Nurse</strong>
              <span className="text-[10px] font-mono opacity-80 block truncate">nurse@clinic.test</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('student@clinic.test', 'Student')}
            className="p-2.5 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 dark:hover:bg-blue-500/25 text-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30 rounded-xl text-left transition font-extrabold cursor-pointer shadow-xs active:scale-95 flex items-start gap-2"
          >
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <strong className="text-blue-900 dark:text-blue-300 block text-xs">Student</strong>
              <span className="text-[10px] font-mono opacity-80 block truncate">student@clinic.test</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('external@clinic.test', 'Outpatient')}
            className="p-2.5 bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30 rounded-xl text-left transition font-extrabold cursor-pointer shadow-xs active:scale-95 flex items-start gap-2"
          >
            <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <strong className="text-amber-900 dark:text-amber-300 block text-xs">Outpatient</strong>
              <span className="text-[10px] font-mono opacity-80 block truncate">external@clinic.test</span>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-700 dark:text-teal-400 hover:underline font-black">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
