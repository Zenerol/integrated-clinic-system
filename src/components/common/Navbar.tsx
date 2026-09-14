import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { getPatientTypeBadgeStyle } from '../../utils/formatters';
import { Activity, LogOut, Bell, User, ShieldCheck, HeartPulse, Sun, Moon, Menu } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Section: Mobile Sidebar Toggle & Brand Logo (Hidden on Desktop to avoid duplicate logo) */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              type="button"
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Show Brand Logo on Mobile / Small screens only */}
          <Link to={getPortalLink()} className="flex items-center gap-3 group lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                CLINIC CARE
              </h1>
            </div>
          </Link>
        </div>

        {/* Right Section: Theme Toggle, Notifications, User Profile & Logout */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`px-3 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-extrabold cursor-pointer shadow-sm active:scale-95 ${
              theme === 'light'
                ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
                : 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100'
            }`}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          {profile && (
            <>
              {/* Role Badge */}
              <div className="hidden md:flex items-center gap-2">
                {getRoleBadge()}
              </div>

              {/* User Profile Info */}
              <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-slate-800 border border-teal-300 dark:border-slate-700 flex items-center justify-center text-teal-800 dark:text-teal-400 font-bold shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-black text-slate-900 dark:text-slate-100">{profile.full_name}</p>
                </div>
              </div>

              {/* Notifications Interactive Button & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  type="button"
                  className={`p-2 rounded-xl border transition relative cursor-pointer ${
                    isNotificationsOpen
                      ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-500/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
                  }`}
                  title="View Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Mini Modal Dropdown */}
                <NotificationDropdown
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 rounded-xl transition border border-rose-300 dark:border-rose-500/40 cursor-pointer"
                title="Sign Out of System"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
