import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  User,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const location = useLocation();

  const renderNavLinks = () => {
    if (!profile) return null;

    if (profile.role === 'admin') {
      return (
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Administration
          </p>
          <NavLink
            to="/admin/staff-approvals"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
                isActive
                  ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Staff Approvals</span>
          </NavLink>

          <NavLink
            to="/admin/members"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
                isActive
                  ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Manage Members</span>
          </NavLink>
        </div>
      );
    }

    if (profile.role === 'doctor') {
      return (
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Doctor Menu
          </p>
          <NavLink
            to="/doctor"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
                isActive
                  ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <Stethoscope className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
            <span>Doctor Patient Queue</span>
          </NavLink>
        </div>
      );
    }

    if (profile.role === 'nurse') {
      return (
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Nurse Menu
          </p>
          <NavLink
            to="/nurse"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
                isActive && !location.search.includes('tab=')
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <HeartPulse className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Nurse Check-In Desk</span>
          </NavLink>
        </div>
      );
    }

    // Patient / Client Role
    return (
      <div className="space-y-1.5">
        <p className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
          Patient Menu
        </p>
        <NavLink
          to="/portal"
          end
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 ${
              isActive && !location.search.includes('tab=')
                ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          }
        >
          <User className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>My Appointments</span>
        </NavLink>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      {/* Sidebar Main Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Top Header & Brand (Exact h-16 height to align with Navbar border-b line) */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="h-16 px-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  CLINIC CARE
                </h1>
                <p className="text-[9px] text-teal-700 dark:text-teal-400 uppercase tracking-widest font-extrabold mt-0.5">
                  Health System
                </p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-4 flex-1 overflow-y-auto">{renderNavLinks()}</nav>
        </div>

        {/* Sidebar Footer Notice */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
          <p>© 2026 Clinic Care System</p>
        </div>
      </aside>
    </>
  );
};
