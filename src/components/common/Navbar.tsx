import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Activity, Bell, Sun, Moon, Menu } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getPortalLink = () => {
    if (!profile) return '/login';
    switch (profile.role) {
      case 'admin':
        return '/admin/staff-approvals';
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
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                CLINIC CARE
              </h1>
            </div>
          </Link>
        </div>

        {/* Right Section: 1. Notification Bell -> 2. Dark Mode Toggle -> 3. User Profile Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
          {profile && (
            <>
              {/* 1. Notification Bell with unread counter/pulse & Dropdown */}
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

              {/* 2. Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                type="button"
                className={`px-3 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-extrabold cursor-pointer shadow-xs active:scale-95 ${
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

              {/* 3. Unified User Profile Dropdown Menu */}
              <UserProfileDropdown />
            </>
          )}
        </div>
      </div>
    </header>
  );
};
