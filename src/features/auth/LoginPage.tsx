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
    setLoading(true);

    const { error } = await signIn({ email, password });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid login credentials.');
    } else {
      // Navigation is handled dynamically based on user role
      if (profile?.role === 'doctor') navigate('/doctor');
      else if (profile?.role === 'nurse') navigate('/nurse');
      else navigate('/portal');
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">Sign in to access your clinical dashboard</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
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

      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
          QA Quick Demo Logins:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setEmail('doctor@clinic.test');
              setPassword('Password123!');
            }}
            className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-left transition"
          >
            <strong>MD Doctor:</strong>
            <br />
            doctor@clinic.test
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('nurse@clinic.test');
              setPassword('Password123!');
            }}
            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-left transition"
          >
            <strong>Clinical Nurse:</strong>
            <br />
            nurse@clinic.test
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('student@clinic.test');
              setPassword('Password123!');
            }}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-left transition"
          >
            <strong>Student:</strong>
            <br />
            student@clinic.test
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('external@clinic.test');
              setPassword('Password123!');
            }}
            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-left transition"
          >
            <strong>Outpatient:</strong>
            <br />
            external@clinic.test
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-4">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
