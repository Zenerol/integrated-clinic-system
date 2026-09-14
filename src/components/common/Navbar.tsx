import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { getPatientTypeBadgeStyle } from '../../utils/formatters';
import { Activity, LogOut, Bell, User, ShieldCheck, HeartPulse, Sun, Moon } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (!profile) return null;
    switch (profile.role) {
      case 'doctor':
        return <Badge variant="purple" icon={<ShieldCheck className="w-3.5 h-3.5" />}>MD Doctor</Badge>;
      case 'nurse':
        return <Badge variant="success" icon={<HeartPulse className="w-3.5 h-3.5" />}>Clinical Nurse</Badge>;
      case 'client':
      default:
        const style = getPatientTypeBadgeStyle(profile.patient_type);
        return <Badge variant={profile.patient_type === 'external_client' ? 'warning' : 'info'}>{style.label}</Badge>;
    }
  };

  const getPortalLink = () => {
    if (!profile) return '/login';
    switch (profile.role) {
      case 'doctor':
        return '/doctor';
      case 'nurse':
        return '/nurse';
      case 'client':
      default:
        return '/portal';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={getPortalLink()} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition duration-200">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
              CLINIC CARE
            </h1>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">
              School & Outpatient System
            </p>
          </div>
        </Link>

        {/* User Controls & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`px-3.5 py-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-black cursor-pointer shadow-sm active:scale-95 ${
              theme === 'light'
                ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
                : 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100'
            }`}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="hidden sm:inline">Switch to Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Switch to Light Mode</span>
              </>
            )}
          </button>

          {profile && (
            <>
              {/* Role Badge */}
              <div className="hidden md:flex items-center gap-2">
                {getRoleBadge()}
              </div>

              {/* Profile Info */}
              <div className="flex items-center gap-3 border-l border-slate-300 dark:border-slate-800 pl-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-slate-800 border border-teal-300 dark:border-slate-700 flex items-center justify-center text-teal-800 dark:text-teal-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-slate-900 dark:text-slate-100">{profile.full_name}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 capitalize font-bold">{profile.role}</p>
                </div>
              </div>

              {/* Notifications Button */}
              <div className="relative">
                <button
                  className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-teal-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition border border-transparent hover:border-rose-300 dark:hover:border-rose-500/20"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
