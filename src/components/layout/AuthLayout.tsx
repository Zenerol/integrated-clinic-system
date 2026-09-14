import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-teal-500/30">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">CLINIC CARE</h1>
          <p className="text-xs text-teal-400 font-semibold tracking-wider uppercase">
            School & Community Clinic Management
          </p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800 relative z-10">
        <Outlet />
      </div>

      <p className="mt-8 text-xs text-slate-500 text-center">
        Secured by Supabase Auth & Role-Based Access Control (RBAC)
      </p>
    </div>
  );
};
