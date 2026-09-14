import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPatientTypeBadgeStyle } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import {
  Activity,
  User,
  HeartPulse,
  Stethoscope,
  Clock,
  Pill,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  X,
  FileText,
  Calendar,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (!profile) return null;
    switch (profile.role) {
      case 'doctor':
        return <Badge variant="purple" icon={<ShieldCheck className="w-3.5 h-3.5" />}>MD Physician</Badge>;
      case 'nurse':
        return <Badge variant="success" icon={<HeartPulse className="w-3.5 h-3.5" />}>Clinical Nurse</Badge>;
      case 'client':
      default:
        const style = getPatientTypeBadgeStyle(profile.patient_type);
        return <Badge variant={profile.patient_type === 'external_client' ? 'warning' : 'info'}>{style.label}</Badge>;
    }
  };

  const renderNavLinks = () => {
    if (!profile) return null;

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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  CLINIC CARE
                </h1>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 uppercase tracking-widest font-extrabold mt-1">
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
          <nav className="space-y-4">{renderNavLinks()}</nav>
        </div>

        {/* Bottom User Card & Theme Switcher */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {profile && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-slate-700 border border-teal-300 dark:border-slate-600 flex items-center justify-center text-teal-800 dark:text-teal-300 font-black shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {profile.full_name}
                </p>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>
            </div>
          )}

          {/* Controls: Theme & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              type="button"
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Light</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              type="button"
              className="flex-1 py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
