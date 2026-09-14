import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleToggleTheme = () => {
    toggleTheme();
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300 bg-grid-pattern">
      {/* Background Texture & Ambient Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-teal-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Switcher Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={handleToggleTheme}
          type="button"
          className={`px-4 py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 text-xs font-black shadow-sm cursor-pointer active:scale-95 ${
            theme === 'light'
              ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
              : 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100'
          }`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Light Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Header Brand Logo */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-700/25 border border-teal-600/30">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            CLINIC CARE
          </h1>
          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-extrabold tracking-wider uppercase mt-1">
            Campus & Community Health System
          </p>
        </div>
      </div>

      {/* Auth Glassmorphism Card Container */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/80 relative z-10">
        <Outlet />
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center font-semibold relative z-10">
        <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
        <span>Role-Based Access Control (RBAC) & Secure Supabase Auth</span>
      </div>
    </div>
  );
};
