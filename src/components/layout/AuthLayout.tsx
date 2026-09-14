import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Theme Switcher Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-2 text-xs font-bold shadow-sm"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-purple-600" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">CLINIC CARE</h1>
          <p className="text-xs text-teal-600 dark:text-teal-400 font-extrabold tracking-wider uppercase">
            School & Community Clinic Management
          </p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 relative z-10">
        <Outlet />
      </div>

      <p className="mt-8 text-xs text-slate-500 text-center font-medium">
        Secured by Supabase Auth & Role-Based Access Control (RBAC)
      </p>
    </div>
  );
};
