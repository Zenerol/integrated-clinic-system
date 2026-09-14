import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, profile } = useAuth();
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

    const { error } = await signIn({ email, password });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid login credentials.');
    } else {
      if (profile?.role === 'doctor') navigate('/doctor');
      else if (profile?.role === 'nurse') navigate('/nurse');
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
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-bold">
          Sign in to access your clinical dashboard
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
          className="mt-2 w-full"
        >
          Sign In to Portal
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-300 dark:border-slate-800">
        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5 text-center">
          QA Quick Demo Logins (Click to Autofill):
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillCredentials('doctor@clinic.test')}
            className="p-3 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40 rounded-xl text-left transition font-extrabold cursor-pointer shadow-sm active:scale-95"
          >
            <strong className="text-purple-900 dark:text-purple-300">MD Doctor:</strong>
            <br />
            <span className="text-[11px] font-mono opacity-90">doctor@clinic.test</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('nurse@clinic.test')}
            className="p-3 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-left transition font-extrabold cursor-pointer shadow-sm active:scale-95"
          >
            <strong className="text-emerald-900 dark:text-emerald-300">Clinical Nurse:</strong>
            <br />
            <span className="text-[11px] font-mono opacity-90">nurse@clinic.test</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('student@clinic.test')}
            className="p-3 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-500/40 rounded-xl text-left transition font-extrabold cursor-pointer shadow-sm active:scale-95"
          >
            <strong className="text-blue-900 dark:text-blue-300">Student:</strong>
            <br />
            <span className="text-[11px] font-mono opacity-90">student@clinic.test</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('external@clinic.test')}
            className="p-3 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 rounded-xl text-left transition font-extrabold cursor-pointer shadow-sm active:scale-95"
          >
            <strong className="text-amber-900 dark:text-amber-300">Outpatient:</strong>
            <br />
            <span className="text-[11px] font-mono opacity-90">external@clinic.test</span>
          </button>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-300 dark:border-slate-800 text-center">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-700 dark:text-teal-400 hover:underline font-black">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
