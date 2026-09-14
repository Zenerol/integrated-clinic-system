import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070c17] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Dot Texture Mesh Overlay */}
      <div className="absolute inset-0 bg-dot-pattern pointer-events-none opacity-60" />

      {/* Floating Ambient Glowing Lighting Orbs */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-teal-500/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-cyan-500/15 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.15),transparent_70%)] pointer-events-none" />

      {/* Theme Switcher Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          className={`px-3.5 py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 text-xs font-black shadow-sm cursor-pointer active:scale-95 ${
            theme === 'light'
              ? 'bg-white/90 text-slate-900 border-slate-200 hover:bg-slate-100'
              : 'bg-slate-900/90 text-teal-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Light Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Header Brand Logo */}
      <div className="flex items-center gap-3.5 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-xl shadow-teal-700/25 border border-teal-600/40">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            CLINIC CARE
          </h1>
          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-extrabold tracking-widest uppercase mt-1">
            Campus & Community Health System
          </p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-7 sm:p-9 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 relative z-10">
        <Outlet />
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 text-center font-bold relative z-10">
        <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
        <span>Role-Based Access Control (RBAC) & Secure Supabase Auth</span>
      </div>
    </div>
  );
};
